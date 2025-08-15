// Delete document
router.delete('/documents/:id', documentController.deleteDocument);

// Expire document (set expiry_date to now)
router.patch('/documents/:id/expire', documentController.expireDocument);
// Update document verification status
router.put('/documents/:id/status', documentController.updateVerificationStatus);
// Download document endpoint with authentication
router.get('/documents/:id/download', documentController.downloadDocument);

const express = require('express');
const multer = require('multer');
const path = require('path');
const documentController = require('../controllers/documentController');

const router = express.Router();

// Configure multer for file uploads with validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
  }
  cb(null, true);
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB size limit
});

// File upload endpoint
router.post('/documents/upload', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  next();
}, documentController.uploadDocument);

// Create document entry
const db = require('../config/database');
router.post('/documents', async (req, res) => {
  try {
    const {
      user_id,
      appointment_id,
      document_type,
      original_filename,
      file_path,
      file_size,
      mime_type,
      ocr_text,
      ocr_confidence,
      verification_status,
      verified_by,
      verified_at,
      expiry_date
    } = req.body;

    const insertQuery = `
      INSERT INTO documents (
        user_id, appointment_id, document_type, original_filename, file_path, file_size, mime_type, ocr_text, ocr_confidence, verification_status, verified_by, verified_at, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      user_id,
      appointment_id || null,
      document_type,
      original_filename,
      file_path,
      file_size,
      mime_type,
      ocr_text || null,
      ocr_confidence || null,
      verification_status || 'pending',
      verified_by || null,
      verified_at || null,
      expiry_date || null
    ];
    const result = await db.query(insertQuery, values);
    const doc = result.rows[0];
    res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// List user's uploaded documents with status
const documentController = require('../controllers/documentController');
router.get('/documents', documentController.listUserDocuments);

// Get a single document
const db = require('../config/database');
router.get('/documents/:id', async (req, res) => {
  try {
    const documentId = req.params.id;
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [documentId]);
    const doc = result.rows[0];
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update verification status
router.patch('/documents/:id/verify', async (req, res) => {
  try {
    const documentId = req.params.id;
    const { verified_by, verification_status } = req.body;
    if (!verification_status) {
      return res.status(400).json({ error: 'verification_status is required.' });
    }
    const result = await db.query(
      'UPDATE documents SET verification_status = $1, verified_by = $2, verified_at = NOW() WHERE id = $3 RETURNING *',
      [verification_status, verified_by, documentId]
    );
    const doc = result.rows[0];
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

module.exports = router;
