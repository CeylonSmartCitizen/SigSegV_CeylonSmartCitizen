/**
 * Delete document by ID
 * DELETE /documents/:id
 */
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    await prisma.documents.delete({ where: { id: documentId } });
    res.json({ message: 'Document deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete document.' });
  }
};

/**
 * Expire document by ID (set expiry_date to now)
 * PATCH /documents/:id/expire
 */
exports.expireDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    const doc = await prisma.documents.update({
      where: { id: documentId },
      data: { expiry_date: new Date() }
    });
    res.json({ message: 'Document expired.', document: doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to expire document.' });
  }
};
/**
 * Update document verification status
 * PUT /documents/:id/status
 */
exports.updateVerificationStatus = async (req, res) => {
  try {
    const documentId = req.params.id;
    const { verification_status, verified_by } = req.body;
    if (!verification_status) {
      return res.status(400).json({ error: 'verification_status is required.' });
    }
    const doc = await prisma.documents.update({
      where: { id: documentId },
      data: {
        verification_status,
        verified_by,
        verified_at: new Date()
      }
    });
    res.json({ message: 'Verification status updated.', document: doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update verification status.' });
  }
};
/**
 * Download document by ID (with authentication)
 * GET /documents/:id/download
 */
exports.downloadDocument = async (req, res) => {
  try {
    // Example: authentication middleware should set req.user.id
    const documentId = req.params.id;
    const userId = req.user?.id || req.query.user_id; // fallback for demo
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const doc = await prisma.documents.findUnique({
      where: { id: documentId }
    });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    if (doc.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.download(doc.file_path, doc.original_filename);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to download document.' });
  }
};
/**
 * List user's uploaded documents with status
 * GET /documents?user_id=...
 */
exports.listUserDocuments = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    const docs = await prisma.documents.findMany({
      where: { user_id },
      select: {
        id: true,
        document_type: true,
        original_filename: true,
        file_path: true,
        file_size: true,
        mime_type: true,
        verification_status: true,
        expiry_date: true,
        created_at: true
      }
    });
    res.json({ documents: docs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};
const path = require('path');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Extract metadata from request and file
    const {
      user_id,
      appointment_id,
      document_type,
      expiry_date
    } = req.body;

    const file = req.file;

    // Save metadata to DB
    const doc = await prisma.documents.create({
      data: {
        user_id,
        appointment_id,
        document_type,
        original_filename: file.originalname,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        expiry_date: expiry_date ? new Date(expiry_date) : null
        // ocr_text, ocr_confidence, verification_status, verified_by, verified_at handled elsewhere
      }
    });

    res.status(201).json({
      message: 'File uploaded and metadata saved.',
      documentId: doc.id,
      document: doc
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'File upload or DB save failed.' });
  }
};
