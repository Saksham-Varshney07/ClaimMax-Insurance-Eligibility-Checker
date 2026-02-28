/**
 * ai/track-a/ocr/bill-parser.js
 * MAIN EXPORT — Complete hospital bill OCR pipeline
 * 
 * Usage:
 *   import { processBillPhoto } from './ocr/bill-parser.js';
 *   const result = await processBillPhoto(fileInput.files[0]);
 */

import Tesseract from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';

// Internal modules (loaded via relative import when used as module bundle)
import { preprocessBill } from './preprocess.js';
import { extractFields } from './extract-fields.js';
import { classifyTreatment, getEligibilityHint } from '../classifier/treatment-cat.js';
import { validateBillData, computeOCRConfidence, needsFallback, poorQualityMessage } from './postprocess.js';

// ─── Tesseract worker (singleton) ────────────────────────────────────────────
let _worker = null;

async function getWorker() {
  if (_worker) return _worker;

  _worker = await Tesseract.createWorker('eng+hin', 1, {
    // Suppress noisy logs in demo
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
      }
    },
  });

  await _worker.setParameters({
    // Whitelist: numbers, INR symbols, English uppercase, Devanagari common chars
    tessedit_char_whitelist:
      '0123456789₹.,/-():ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' +
      ' \nअआइईउऊएऐओऔकखगघचछजझटठडढतथदधनपफबभमयरलवशषसहक्ष',
    tessedit_pageseg_mode: '6',   // 6 = Assume uniform block of text
    preserve_interword_spaces: '1',
  });

  return _worker;
}

// ─── Main pipeline ────────────────────────────────────────────────────────────

/**
 * Process a hospital bill photo and extract structured data.
 * 
 * @param {File} imageFile - File object from <input type="file">
 * @param {{ onProgress?: function }} [options]
 * @returns {Promise<{
 *   success: boolean,
 *   data?: {
 *     hospital: string,
 *     treatment: string,
 *     amount: number,
 *     date: string,
 *     patient: string|null,
 *     category: string,
 *     confidence: number,
 *     eligibility: string,
 *   },
 *   error?: string,
 *   fallback?: boolean,
 *   processingMs?: number,
 * }>}
 */
export async function processBillPhoto(imageFile, { onProgress } = {}) {
  const startMs = Date.now();

  try {
    console.log(`[ClaimMax OCR] Processing: ${imageFile.name} (${(imageFile.size / 1024).toFixed(1)} KB)`);
    onProgress?.('preprocessing');

    // ── Step 1: Preprocess image ──────────────────────────────────────────
    const processedCanvas = await preprocessBill(imageFile);
    const processedDataUrl = processedCanvas.toDataURL('image/png');
    onProgress?.('ocr_running');

    // ── Step 2: Tesseract OCR ─────────────────────────────────────────────
    const worker = await getWorker();
    const { data } = await worker.recognize(processedDataUrl);
    const rawText = data.text;
    const tesseractConf = data.confidence; // 0-100

    console.log(`[OCR] Raw text length: ${rawText.length} chars | Tesseract conf: ${tesseractConf}%`);
    onProgress?.('extracting');

    // ── Step 3: Extract fields ────────────────────────────────────────────
    const extracted = extractFields(rawText);

    // ── Step 4: Classify treatment ────────────────────────────────────────
    const { category, confidence: catConf, matchedTerms } = classifyTreatment(rawText);

    // ── Step 5: Validate + confidence ─────────────────────────────────────
    const validation = validateBillData(extracted);
    const finalConf = computeOCRConfidence(tesseractConf, validation);

    // ── Step 6: Fallback if poor quality ──────────────────────────────────
    if (needsFallback(finalConf) || !validation.valid) {
      console.warn('[OCR] Low confidence — triggering fallback', validation.errors);
      return {
        success: false,
        error: poorQualityMessage(validation.errors),
        reason: 'poor_ocr_quality',
        rawConfidence: finalConf,
        fallback: true,
        processingMs: Date.now() - startMs,
      };
    }

    // ── Step 7: Build final result ─────────────────────────────────────────
    const result = {
      success: true,
      data: {
        hospital:    extracted.hospital,
        treatment:   extracted.treatment || 'Medical Treatment',
        amount:      extracted.amount,
        date:        extracted.date,
        patient:     extracted.patient,
        category,
        confidence:  finalConf,
        eligibility: getEligibilityHint(category, extracted.amount),
      },
      meta: {
        matchedTerms,
        warnings: validation.warnings,
        processingMs: Date.now() - startMs,
      },
    };

    console.log('[ClaimMax OCR] ✅ Success:', result.data);
    return result;

  } catch (err) {
    console.error('[ClaimMax OCR] ❌ Fatal error:', err);
    return {
      success: false,
      error: `Processing failed: ${err.message}`,
      reason: 'pipeline_error',
      fallback: true,
      processingMs: Date.now() - startMs,
    };
  }
}

/**
 * Terminate the Tesseract worker (call when done).
 */
export async function terminateOCR() {
  if (_worker) {
    await _worker.terminate();
    _worker = null;
  }
}
