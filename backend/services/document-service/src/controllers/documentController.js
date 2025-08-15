/**
 * Delete document by ID
 * DELETE /documents/:id
 */
const db = require('../config/database');
exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;
    // Fetch document before deletion for audit
    const docResult = await db.query('SELECT * FROM documents WHERE id = $1', [documentId]);
    const oldDoc = docResult.rows[0];
    await db.query('DELETE FROM documents WHERE id = $1', [documentId]);
    // Audit log: document deletion
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: oldDoc ? oldDoc.user_id : null,
      action: 'document_deleted',
      entity_type: 'document',
      entity_id: documentId,
      old_values: oldDoc,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      success: true
    });
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
    const result = await db.query(
      'UPDATE documents SET expiry_date = NOW() WHERE id = $1 RETURNING *',
      [documentId]
    );
    res.json({ message: 'Document expired.', document: result.rows[0] });
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
    // Fetch old document for audit
    const oldDocResult = await db.query('SELECT * FROM documents WHERE id = $1', [documentId]);
    const oldDoc = oldDocResult.rows[0];
    const result = await db.query(
      'UPDATE documents SET verification_status = $1, verified_by = $2, verified_at = NOW() WHERE id = $3 RETURNING *',
      [verification_status, verified_by, documentId]
    );
    const newDoc = result.rows[0];
    // Audit log: verification status update
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: newDoc ? newDoc.user_id : null,
      action: 'document_verification_updated',
      entity_type: 'document',
      entity_id: documentId,
      old_values: oldDoc,
      new_values: newDoc,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      success: true
    });
    res.json({ message: 'Verification status updated.', document: newDoc });
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
    const result = await db.query('SELECT * FROM documents WHERE id = $1', [documentId]);
    const doc = result.rows[0];
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
    const query = `
      SELECT id, document_type, original_filename, file_path, file_size, mime_type, verification_status, expiry_date, created_at
      FROM documents
      WHERE user_id = $1
    `;
    const result = await db.query(query, [user_id]);
    res.json({ documents: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};
const path = require('path');


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
    const insertQuery = `
      INSERT INTO documents (
        user_id, appointment_id, document_type, original_filename, file_path, file_size, mime_type, expiry_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      user_id,
      appointment_id,
      document_type,
      file.originalname,
      file.path,
      file.size,
      file.mimetype,
      expiry_date ? expiry_date : null
    ];
    const result = await db.query(insertQuery, values);
    const doc = result.rows[0];
    // Audit log: document upload
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: user_id,
      action: 'document_uploaded',
      entity_type: 'document',
      entity_id: doc.id,
      new_values: doc,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      success: true
    });
    res.status(201).json({
      message: 'File uploaded and metadata saved.',
      documentId: doc.id,
      document: doc
    });
  } catch (error) {
    console.error(error);
    // Audit log: failed document upload
    const { logAuditEvent } = require('../../../audit-service/src/services/auditLogService');
    await logAuditEvent({
      user_id: req.body.user_id,
      action: 'document_upload_failed',
      entity_type: 'document',
      entity_id: null,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      success: false,
      error_message: error.message
    });
    res.status(500).json({ error: 'File upload or DB save failed.' });
  }
};
