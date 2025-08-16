// Utility to store OCR results in the documents table
const pool = require('../config/database');

/**
 * Update a document record with OCR results
 * @param {string} documentId - UUID of the document
 * @param {string} text - Extracted OCR text
 * @param {number} confidence - OCR confidence score (0.0 - 1.0)
 * @returns {Promise}
 */
async function storeOcrResult(documentId, text, confidence) {
  const query = `
    UPDATE documents
    SET ocr_text = $1,
        ocr_confidence = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, ocr_text, ocr_confidence;
  `;
  const values = [text, confidence, documentId];
  const result = await pool.query(query, values);
  return result.rows[0];
}

module.exports = { storeOcrResult };
