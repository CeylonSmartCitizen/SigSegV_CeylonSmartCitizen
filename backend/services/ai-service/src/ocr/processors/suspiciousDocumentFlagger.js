// src/ocr/processors/suspiciousDocumentFlagger.js
// Flags suspicious or low-quality documents based on OCR results and document features

/**
 * Flags a document as suspicious or low-quality based on heuristics:
 * - Low OCR confidence
 * - Missing required fields
 * - Unusual text patterns (e.g., excessive noise, gibberish)
 * - Failed authenticity validation
 *
 * @param {Object} ocrResult - OCR result object { text, confidence, fields, authenticity }
 * @param {Object} options - Optional thresholds { minConfidence, requiredFields }
 * @returns {Object} { isSuspicious: boolean, reasons: string[] }
 */
function flagSuspiciousDocument(ocrResult, options = {}) {
  const reasons = [];
  const minConfidence = options.minConfidence || 0.6;
  const requiredFields = options.requiredFields || [];

  // Check OCR confidence
  if (typeof ocrResult.confidence === 'number' && ocrResult.confidence < minConfidence) {
    reasons.push(`Low OCR confidence: ${ocrResult.confidence}`);
  }

  // Check for missing required fields
  if (ocrResult.fields && requiredFields.length > 0) {
    requiredFields.forEach(field => {
      if (!ocrResult.fields[field]) {
        reasons.push(`Missing required field: ${field}`);
      }
    });
  }

  // Check for gibberish/noise (simple heuristic: too few valid words)
  if (ocrResult.text) {
    const words = ocrResult.text.split(/\s+/).filter(w => w.length > 2);
    const validWords = words.filter(w => /^[a-zA-Z]+$/.test(w));
    if (validWords.length / words.length < 0.5) {
      reasons.push('Text appears noisy or gibberish');
    }
  }

  // Check authenticity validation
  if (ocrResult.authenticity === false) {
    reasons.push('Failed authenticity validation');
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons
  };
}

module.exports = {
  flagSuspiciousDocument
};
