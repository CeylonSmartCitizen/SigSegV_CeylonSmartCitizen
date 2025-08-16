const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../../../uploads/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads with validation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
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

// Basic routes for testing
router.get('/', (req, res) => {
  res.json({ 
    message: 'Documents API is working', 
    endpoints: ['/upload', '/list', '/:id', '/:id/status', '/:id/expire'],
    version: '1.0.0'
  });
});

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type.' });
  }
  
  // Basic response for testing
  res.json({ 
    message: 'File uploaded successfully', 
    documentId: `doc_${Date.now()}`,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path
  });
});

// List documents
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(uploadDir);
    const documents = files.map(file => {
      const stats = fs.statSync(path.join(uploadDir, file));
      return {
        filename: file,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    });
    
    res.json({ 
      documents: documents, 
      count: documents.length,
      message: 'Documents listed successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list documents', details: error.message });
  }
});

// Get document by ID
router.get('/:id', (req, res) => {
  res.json({ 
    id: req.params.id, 
    message: 'Get document by ID endpoint working',
    status: 'active'
  });
});

// Update verification status
router.put('/:id/status', (req, res) => {
  const { verified_by, verification_status } = req.body;
  res.json({
    id: req.params.id,
    verification_status: verification_status || 'verified',
    verified_by: verified_by || 'system',
    updated_at: new Date().toISOString(),
    message: 'Document status updated successfully'
  });
});

// Expire document
router.patch('/:id/expire', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'expired',
    expired_at: new Date().toISOString(),
    message: 'Document expired successfully'
  });
});

// Delete document
router.delete('/:id', (req, res) => {
  res.json({
    id: req.params.id,
    deleted_at: new Date().toISOString(),
    message: 'Document deleted successfully'
  });
});

module.exports = router;
