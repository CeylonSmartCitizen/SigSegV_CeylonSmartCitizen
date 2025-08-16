import React, { useState } from 'react';
import { FileText, Upload, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import '../../styles/DocumentVerification.css';

const DocumentVerification = ({ service, bookingData, onUpdate }) => {
  const [uploadedDocs, setUploadedDocs] = useState(bookingData.documents || {});
  const [draggedOver, setDraggedOver] = useState(null);

  const requiredDocs = service.requirements?.documents || [];
  
  const handleFileUpload = (docType, files) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const newDocs = {
      ...uploadedDocs,
      [docType]: {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploaded',
        uploadDate: new Date()
      }
    };
    
    setUploadedDocs(newDocs);
    onUpdate({ documents: newDocs });
  };

  const handleDragOver = (e, docType) => {
    e.preventDefault();
    setDraggedOver(docType);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDraggedOver(null);
  };

  const handleDrop = (e, docType) => {
    e.preventDefault();
    setDraggedOver(null);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(docType, files);
  };

  const removeDocument = (docType) => {
    const newDocs = { ...uploadedDocs };
    delete newDocs[docType];
    setUploadedDocs(newDocs);
    onUpdate({ documents: newDocs });
  };

  const getDocumentStatus = (docType) => {
    const doc = uploadedDocs[docType];
    if (!doc) return 'missing';
    if (doc.status === 'uploaded') return 'uploaded';
    if (doc.status === 'verified') return 'verified';
    return 'error';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionPercentage = () => {
    const requiredCount = requiredDocs.filter(doc => doc.required).length;
    const uploadedCount = requiredDocs.filter(doc => 
      doc.required && uploadedDocs[doc.type]
    ).length;
    
    return requiredCount > 0 ? Math.round((uploadedCount / requiredCount) * 100) : 0;
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="document-verification">
      <div className="verification-header">
        <h3>Document Verification</h3>
        <p>Upload the required documents to proceed with your appointment</p>
        
        <div className="progress-bar">
          <div className="progress-text">
            <span>Completion Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="documents-list">
        {requiredDocs.map((doc, index) => {
          const status = getDocumentStatus(doc.type);
          const uploadedDoc = uploadedDocs[doc.type];
          
          return (
            <div key={index} className={`document-item ${status}`}>
              <div className="document-header">
                <div className="document-info">
                  <div className="document-title">
                    <FileText size={20} />
                    <span>{doc.name}</span>
                    {doc.required && <span className="required-badge">Required</span>}
                  </div>
                  <p className="document-description">{doc.description}</p>
                  
                  {doc.examples && (
                    <div className="document-examples">
                      <span>Accepted formats:</span>
                      {doc.examples.map((example, idx) => (
                        <button
                          key={idx}
                          className="example-btn"
                          onClick={() => window.open(example.url, '_blank')}
                        >
                          <Eye size={14} />
                          View {example.type} Sample
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="document-status">
                  {status === 'missing' && (
                    <div className="status-indicator missing">
                      <AlertCircle size={16} />
                      Not Uploaded
                    </div>
                  )}
                  {status === 'uploaded' && (
                    <div className="status-indicator uploaded">
                      <Upload size={16} />
                      Uploaded
                    </div>
                  )}
                  {status === 'verified' && (
                    <div className="status-indicator verified">
                      <CheckCircle size={16} />
                      Verified
                    </div>
                  )}
                </div>
              </div>
              
              {!uploadedDoc ? (
                <div 
                  className={`upload-zone ${draggedOver === doc.type ? 'dragged' : ''}`}
                  onDragOver={(e) => handleDragOver(e, doc.type)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, doc.type)}
                >
                  <Upload size={24} />
                  <div className="upload-text">
                    <p>Drag and drop your file here, or</p>
                    <label className="upload-btn">
                      <input
                        type="file"
                        accept={doc.acceptedFormats?.join(',') || '.pdf,.jpg,.png,.doc,.docx'}
                        onChange={(e) => handleFileUpload(doc.type, e.target.files)}
                        hidden
                      />
                      Choose File
                    </label>
                  </div>
                  <div className="upload-requirements">
                    <p>Max size: 10MB</p>
                    <p>Formats: {doc.acceptedFormats?.join(', ') || 'PDF, JPG, PNG, DOC'}</p>
                  </div>
                </div>
              ) : (
                <div className="uploaded-file">
                  <div className="file-info">
                    <div className="file-icon">
                      <FileText size={20} />
                    </div>
                    <div className="file-details">
                      <h5>{uploadedDoc.name}</h5>
                      <p>{formatFileSize(uploadedDoc.size)}</p>
                      <span className="upload-date">
                        Uploaded {uploadedDoc.uploadDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="action-btn view">
                      <Eye size={16} />
                      View
                    </button>
                    <button 
                      className="action-btn remove"
                      onClick={() => removeDocument(doc.type)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              
              {doc.notes && (
                <div className="document-notes">
                  <AlertCircle size={16} />
                  <span>{doc.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="verification-footer">
        <div className="important-notes">
          <h4>Important Notes:</h4>
          <ul>
            <li>All documents must be clear and readable</li>
            <li>Ensure all information is visible and not cropped</li>
            <li>Original documents may be required for verification</li>
            <li>Processing may take 1-2 business days</li>
          </ul>
        </div>
        
        {completionPercentage === 100 && (
          <div className="completion-message">
            <CheckCircle size={20} />
            <span>All required documents uploaded successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;
