/**
 * ai/track-a/classifier/treatment-cat.js
 * Classify hospital bill treatment into insurance-relevant categories.
 */

import medicalDict from '../ocr/medical-dict.json' assert { type: 'json' };

/**
 * Classify a bill's treatment category from extracted text.
 * @param {string} text - Full OCR text or treatment description
 * @param {Object} [dict] - Optional override dictionary (defaults to medical-dict.json)
 * @returns {{ category: string, confidence: number, matchedTerms: string[] }}
 */
export function classifyTreatment(text, dict = medicalDict) {
  const lower = text.toLowerCase();
  const scores = {};
  const matched = {};

  for (const [category, terms] of Object.entries(dict)) {
    const hits = terms.filter(term => lower.includes(term.toLowerCase()));
    scores[category] = hits.length;
    matched[category] = hits;
  }

  // Sort by score descending
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [bestCategory, bestScore] = sorted[0];

  // Confidence: normalize by max possible (all terms matched)
  const maxTerms = dict[bestCategory]?.length || 10;
  const confidence = bestScore === 0
    ? 0.3   // fallback low confidence when nothing matched
    : Math.min(0.99, 0.5 + (bestScore / maxTerms) * 0.5);

  return {
    category: bestScore > 0 ? bestCategory : 'opd_general',
    confidence: parseFloat(confidence.toFixed(2)),
    matchedTerms: matched[bestScore > 0 ? bestCategory : 'opd_general'] || [],
  };
}

/**
 * Get human-readable category label for display in demo.
 */
export function categoryLabel(category) {
  const labels = {
    orthopedic_minor: 'Orthopaedic (Minor)',
    orthopedic_major: 'Orthopaedic (Major Surgery)',
    emergency:        'Emergency / Trauma',
    opd_general:      'OPD / General Consultation',
    specialist:       'Specialist Consultation',
  };
  return labels[category] || category;
}

/**
 * Get PMJAY + ESIC eligibility hint for demo pitch.
 */
export function getEligibilityHint(category, amount) {
  const hints = {
    orthopedic_minor: `PMJAY up to ₹15,000 + ESIC up to ₹7,000 eligible`,
    orthopedic_major: `PMJAY up to ₹1,50,000 eligible — file ESIC Form 10 + 14`,
    emergency:        `Emergency PMJAY pre-auth possible — contact TPA immediately`,
    opd_general:      `OPD reimbursement via ESIC Form 10 (up to ₹5,000)`,
    specialist:       `ESIC specialist referral reimbursement applicable`,
  };
  return hints[category] || 'Insurance eligibility check recommended';
}
