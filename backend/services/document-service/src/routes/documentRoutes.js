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
const { prisma } = require('../app');
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
router.post('/documents', async (req, res) => {
  try {
    const data = req.body;
    const doc = await prisma.document.create({ data });
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
router.get('/documents/:id', async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
    });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Update verification status
router.patch('/documents/:id/verify', async (req, res) => {
  try {
    const { verified_by, verification_status } = req.body;
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: { verified_by, verification_status, verified_at: new Date() },
    });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update verification' });
  }
});

module.exports = router;
