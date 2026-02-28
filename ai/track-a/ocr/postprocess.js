/**
 * ai/track-a/ocr/postprocess.js
 * Validate and clean extracted bill data. Flags bad OCR results.
 */

/** Known good hospital identifier fragments */
const KNOWN_HOSPITAL_FRAGMENTS = [
  'Govt', 'Government', 'ESIC', 'Civil', 'General', 'District',
  'Primary', 'PHC', 'CHC', 'Medical College', 'AYUSH', 'Community'
];

/**
 * Validate extracted bill data and flag errors.
 * @param {Object} data - Extracted bill fields
 * @returns {{ valid: boolean, errors: string[], warnings: string[], cleaned: Object }}
 */
export function validateBillData(data) {
  const errors = [];
  const warnings = [];
  const cleaned = { ...data };

  // ── Amount validation ────────────────────────────────────────────────────
  if (data.amount === null || data.amount === undefined) {
    errors.push('amount_not_found');
  } else if (data.amount < 100) {
    errors.push('amount_too_low');          // < ₹100 is likely OCR noise
  } else if (data.amount > 1_000_000) {
    warnings.push('amount_unusually_high'); // > ₹10L — flag but don't block
  }

  // ── Date validation ──────────────────────────────────────────────────────
  if (!data.date) {
    warnings.push('date_not_found');
    cleaned.date = new Date().toISOString().slice(0, 10); // default to today
  } else {
    const parsed = new Date(data.date);
    if (isNaN(parsed.getTime())) {
      errors.push('invalid_date_format');
    } else if (parsed > new Date()) {
      warnings.push('date_in_future');       // unusual — could be OCR flip
    }
  }

  // ── Hospital validation ──────────────────────────────────────────────────
  if (!data.hospital || data.hospital === 'Unknown Hospital') {
    warnings.push('hospital_not_recognized');
  } else {
    const isKnown = KNOWN_HOSPITAL_FRAGMENTS.some(frag =>
      data.hospital.toLowerCase().includes(frag.toLowerCase())
    );
    if (!isKnown) {
      warnings.push('hospital_pattern_unknown');
    }
  }

  // ── Treatment validation ─────────────────────────────────────────────────
  if (!data.treatment || data.treatment === 'Medical Treatment') {
    warnings.push('treatment_description_generic');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    cleaned,
  };
}

/**
 * Compute a composite OCR reliability score from Tesseract confidence + validation.
 * @param {number} tesseractConf - Raw Tesseract confidence (0-100)
 * @param {Object} validationResult - Output of validateBillData()
 * @returns {number} Normalised confidence 0.0 – 1.0
 */
export function computeOCRConfidence(tesseractConf, validationResult) {
  let base = tesseractConf / 100;

  // Penalise for each error (−0.15) or warning (−0.05)
  base -= validationResult.errors.length * 0.15;
  base -= validationResult.warnings.length * 0.05;

  return parseFloat(Math.max(0, Math.min(1, base)).toFixed(2));
}

/**
 * Decide if we should trigger manual entry fallback.
 */
export function needsFallback(confidence) {
  return confidence < 0.70;
}

/**
 * Build user-facing message for poor OCR quality.
 */
export function poorQualityMessage(errors) {
  const messages = {
    amount_not_found:    'Could not read the bill amount.',
    amount_too_low:      'Amount seems too small — may be a partial read.',
    invalid_date_format: 'Could not read the date clearly.',
  };

  const detail = errors
    .map(e => messages[e] || e)
    .join(' ');

  return `OCR quality too low. ${detail} Please retake the photo in better light with the full bill visible.`;
}
