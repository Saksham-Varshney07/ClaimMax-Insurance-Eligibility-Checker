/**
 * ai/track-a/ocr/extract-fields.js
 * Extract structured fields from raw OCR text of hospital bills.
 */

// ─── Known hospital name patterns ────────────────────────────────────────────
const HOSPITAL_PATTERNS = [
  { regex: /govt\.?\s+general\s+hospital/i,   name: 'Govt General Hospital' },
  { regex: /government\s+hospital/i,           name: 'Government Hospital' },
  { regex: /esic\s+hospital/i,                 name: 'ESIC Hospital' },
  { regex: /civil\s+hospital/i,                name: 'Civil Hospital' },
  { regex: /district\s+hospital/i,             name: 'District Hospital' },
  { regex: /primary\s+health\s+centre/i,       name: 'Primary Health Centre' },
  { regex: /phc/i,                             name: 'PHC' },
  { regex: /community\s+health\s+centre/i,     name: 'Community Health Centre' },
  { regex: /medical\s+college/i,               name: 'Medical College Hospital' },
  { regex: /ayush\s+hospital/i,                name: 'AYUSH Hospital' },
];

// ─── Known treatment/procedure patterns ──────────────────────────────────────
const TREATMENT_PATTERNS = [
  /fracture\s+fixation[\s\+&]*plaster/i,
  /fracture\s+treatment/i,
  /plaster\s+of\s+paris/i,
  /orthopaedic\s+surgery/i,
  /emergency\s+treatment/i,
  /casualty\s+treatment/i,
  /general\s+surgery/i,
  /consultation\s+charges/i,
  /OPD\s+charges/i,
];

/**
 * Extract all structured fields from raw OCR text.
 * @param {string} text - Raw OCR output
 * @returns {Object} Extracted bill fields
 */
export function extractFields(text) {
  return {
    hospital: extractHospital(text),
    amount:   extractAmount(text),
    date:     extractDate(text),
    patient:  extractPatientName(text),
    treatment: extractTreatment(text),
    rawText:  text,
  };
}

/**
 * Extract INR amount: "₹25,981" | "Rs. 25,981" | "Total: 25981"
 */
export function extractAmount(text) {
  // Match explicit ₹ / Rs sign before number
  const patterns = [
    /(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/gi,
    /(?:Total|Grand\s+Total|Net\s+Amount|Amount\s+Payable|Bill\s+Amount|Paid)\s*[:\-]?\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\.\d{1,2})?)/gi,
  ];

  const candidates = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const value = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(value) && value >= 10) candidates.push(value);
    }
  }

  if (candidates.length === 0) return null;

  // Heuristic: prefer the largest amount that looks like a bill total
  candidates.sort((a, b) => b - a);
  return candidates[0];
}

/**
 * Parse date in Indian formats: DD/MM/YYYY | DD-MM-YYYY | DD.MM.YYYY
 * Returns ISO format YYYY-MM-DD.
 */
export function extractDate(text) {
  const regex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\b/g;
  const today = new Date();
  let best = null;

  let match;
  while ((match = regex.exec(text)) !== null) {
    const [, day, month, year] = match;
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 2000 || y > today.getFullYear() + 1) continue;

    const dateObj = new Date(y, m - 1, d);
    if (dateObj <= new Date(today.getFullYear() + 1, 11, 31)) {
      best = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      break; // take first valid date (usually at the top of the bill)
    }
  }
  return best;
}

/**
 * Extract hospital name using known patterns or heuristic (first proper noun).
 */
export function extractHospital(text) {
  for (const { regex, name } of HOSPITAL_PATTERNS) {
    if (regex.test(text)) return name;
  }

  // Heuristic: look for "Hospital" anywhere
  const hospitalLine = text.split('\n').find(line =>
    /hospital|clinic|centre|dispensary/i.test(line)
  );
  if (hospitalLine) return hospitalLine.trim().substring(0, 60);

  return 'Unknown Hospital';
}

/**
 * Extract patient name: "Patient Name: XYZ" | "Name: XYZ"
 */
export function extractPatientName(text) {
  const match = text.match(/(?:patient\s+name|patient|name)\s*[:\-]\s*([A-Z][a-zA-Z\s\.]{2,40})/i);
  if (match) return match[1].trim();
  return null;
}

/**
 * Extract treatment description from bill text.
 */
export function extractTreatment(text) {
  for (const pattern of TREATMENT_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }

  // Fallback: look for keywords in context
  const lines = text.split('\n');
  for (const line of lines) {
    if (/procedure|treatment|diagnosis|operation|surgery|OPD|charged\s+for/i.test(line)) {
      return line.replace(/[:\-]/g, '').trim().substring(0, 80);
    }
  }
  return 'Medical Treatment';
}
