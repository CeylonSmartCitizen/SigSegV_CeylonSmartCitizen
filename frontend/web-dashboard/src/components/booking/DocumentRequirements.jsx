import React, { useState } from 'react';
import { 
  FileTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UploadIcon,
  EyeIcon,
  InfoIcon,
  AlertTriangleIcon,
  CheckIcon,
  DownloadIcon,
  ArrowRightIcon
} from 'lucide-react';
import '../../styles/DocumentRequirements.css';

const DocumentRequirements = ({ serviceData, onProceed }) => {
  const [checkedDocuments, setCheckedDocuments] = useState({});
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [viewingSample, setViewingSample] = useState(null);

  // Mock document requirements data
  const documentRequirements = {
    required: [
      {
        id: 'national_id',
        name: 'National Identity Card',
        description: 'Original and photocopy of valid National ID card',
        format: 'Original + Photocopy',
        sampleImage: '/samples/national-id-sample.jpg',
        fileSize: 'Max 2MB',
        requirements: [
          'Must be clear and readable',
          'Both sides required',
          'Valid and not expired',
          'Original document for verification'
        ]
      },
      {
        id: 'address_proof',
        name: 'Proof of Address',
        description: 'Recent utility bill or bank statement (within 3 months)',
        format: 'Original + Photocopy',
        sampleImage: '/samples/address-proof-sample.jpg',
        fileSize: 'Max 2MB',
        requirements: [
          'Issued within last 3 months',
          'Clear name and address visible',
          'Official letterhead required',
          'Acceptable: Utility bills, bank statements, lease agreements'
        ]
      },
      {
        id: 'birth_certificate',
        name: 'Birth Certificate',
        description: 'Original birth certificate issued by registrar',
        format: 'Original + Photocopy',
        sampleImage: '/samples/birth-certificate-sample.jpg',
        fileSize: 'Max 2MB',
        requirements: [
          'Official government issued',
          'Clear and legible text',
          'Official seal/stamp visible',
          'No alterations or corrections'
        ]
      },
      {
        id: 'passport_photos',
        name: 'Passport Size Photographs',
        description: '2 recent passport size color photographs',
        format: '2 Photos (35mm x 45mm)',
        sampleImage: '/samples/passport-photo-sample.jpg',
        fileSize: 'Not applicable',
        requirements: [
          'White background only',
          'Taken within last 6 months',
          'Face clearly visible',
          'No headwear (except religious purposes)'
        ]
      }
    ],
    optional: [
      {
        id: 'marriage_certificate',
        name: 'Marriage Certificate',
        description: 'Required if name change after marriage',
        format: 'Original + Photocopy',
        sampleImage: '/samples/marriage-certificate-sample.jpg',
        fileSize: 'Max 2MB',
        requirements: [
          'Official government issued',
          'Clear and readable',
          'Required only for name changes'
        ]
      },
      {
        id: 'employment_letter',
        name: 'Employment Verification',
        description: 'Letter from employer (if employed)',
        format: 'Original Letter',
        sampleImage: '/samples/employment-letter-sample.jpg',
        fileSize: 'Max 2MB',
        requirements: [
          'Company letterhead required',
          'Signed by authorized person',
          'Include employment duration'
        ]
      }
    ]
  };

  // Handle document checklist
  const handleDocumentCheck = (documentId, checked) => {
    setCheckedDocuments(prev => ({
      ...prev,
      [documentId]: checked
    }));
  };

  // Handle file upload simulation
  const handleFileUpload = (documentId, files) => {
    if (files && files.length > 0) {
      setUploadedDocuments(prev => ({
        ...prev,
        [documentId]: {
          fileName: files[0].name,
          fileSize: files[0].size,
          uploadTime: new Date(),
          status: 'uploaded'
        }
      }));
    }
  };

  // Check if all required documents are checked
  const allRequiredChecked = documentRequirements.required.every(
    doc => checkedDocuments[doc.id]
  );

  // Calculate completion percentage
  const totalRequired = documentRequirements.required.length;
  const completedRequired = documentRequirements.required.filter(
    doc => checkedDocuments[doc.id]
  ).length;
  const completionPercentage = Math.round((completedRequired / totalRequired) * 100);

  // Handle proceed to next step
  const handleProceed = () => {
    const documentData = {
      checkedDocuments,
      uploadedDocuments,
      completionPercentage,
      allRequiredCompleted: allRequiredChecked
    };
    onProceed({ ...serviceData, documents: documentData });
  };

  // Sample image modal
  const SampleImageModal = ({ document, onClose }) => (
    <div className="sample-modal-overlay" onClick={onClose}>
      <div className="sample-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Sample: {document.name}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <div className="sample-image-placeholder">
            <FileTextIcon className="placeholder-icon" />
            <p>Sample {document.name}</p>
            <span className="sample-note">
              This is a sample format. Your document should follow this structure.
            </span>
          </div>
          <div className="sample-requirements">
            <h4>Key Requirements:</h4>
            <ul>
              {document.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="document-requirements">
      {/* Header Section */}
      <div className="requirements-header">
        <div className="header-content">
          <h2>Document Requirements</h2>
          <p>Please review and prepare the following documents for your appointment</p>
        </div>
        
        {/* Progress Indicator */}
        <div className="completion-indicator">
          <div className="completion-circle">
            <div className="progress-ring">
              <svg className="progress-svg" viewBox="0 0 36 36">
                <circle 
                  className="progress-bg" 
                  cx="18" 
                  cy="18" 
                  r="16"
                />
                <circle 
                  className="progress-fill" 
                  cx="18" 
                  cy="18" 
                  r="16"
                  strokeDasharray={`${completionPercentage} 100`}
                />
              </svg>
              <div className="progress-text">
                <span className="percentage">{completionPercentage}%</span>
                <span className="label">Complete</span>
              </div>
            </div>
          </div>
          <div className="completion-stats">
            <span className="stat">
              {completedRequired} of {totalRequired} required documents
            </span>
          </div>
        </div>
      </div>

      {/* Required Documents Section */}
      <div className="documents-section">
        <div className="section-header required">
          <AlertTriangleIcon className="section-icon" />
          <h3>Required Documents</h3>
          <span className="requirement-badge required">Mandatory</span>
        </div>

        <div className="documents-grid">
          {documentRequirements.required.map((document) => (
            <div key={document.id} className={`document-card ${checkedDocuments[document.id] ? 'checked' : ''}`}>
              <div className="document-header">
                <div className="document-info">
                  <h4>{document.name}</h4>
                  <p>{document.description}</p>
                </div>
                <div className="document-actions">
                  <button 
                    className="sample-btn"
                    onClick={() => setViewingSample(document)}
                    title="View Sample"
                  >
                    <EyeIcon className="action-icon" />
                  </button>
                </div>
              </div>

              <div className="document-details">
                <div className="detail-item">
                  <span className="detail-label">Format:</span>
                  <span className="detail-value">{document.format}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">File Size:</span>
                  <span className="detail-value">{document.fileSize}</span>
                </div>
              </div>

              <div className="document-requirements">
                <h5>Requirements:</h5>
                <ul>
                  {document.requirements.slice(0, 2).map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                  {document.requirements.length > 2 && (
                    <li className="more-requirements">
                      +{document.requirements.length - 2} more requirements
                    </li>
                  )}
                </ul>
              </div>

              {/* Upload Section */}
              <div className="upload-section">
                <input
                  type="file"
                  id={`upload-${document.id}`}
                  className="upload-input"
                  onChange={(e) => handleFileUpload(document.id, e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                <label htmlFor={`upload-${document.id}`} className="upload-label">
                  <UploadIcon className="upload-icon" />
                  <span>Upload Document</span>
                </label>
                
                {uploadedDocuments[document.id] && (
                  <div className="uploaded-file">
                    <CheckCircleIcon className="uploaded-icon" />
                    <span className="file-name">
                      {uploadedDocuments[document.id].fileName}
                    </span>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="document-checklist">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkedDocuments[document.id] || false}
                    onChange={(e) => handleDocumentCheck(document.id, e.target.checked)}
                  />
                  <div className="checkbox-custom">
                    {checkedDocuments[document.id] && <CheckIcon className="check-icon" />}
                  </div>
                  <span>I have this document ready</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Documents Section */}
      <div className="documents-section">
        <div className="section-header optional">
          <InfoIcon className="section-icon" />
          <h3>Optional Documents</h3>
          <span className="requirement-badge optional">If Applicable</span>
        </div>

        <div className="documents-grid">
          {documentRequirements.optional.map((document) => (
            <div key={document.id} className={`document-card optional ${checkedDocuments[document.id] ? 'checked' : ''}`}>
              <div className="document-header">
                <div className="document-info">
                  <h4>{document.name}</h4>
                  <p>{document.description}</p>
                </div>
                <div className="document-actions">
                  <button 
                    className="sample-btn"
                    onClick={() => setViewingSample(document)}
                    title="View Sample"
                  >
                    <EyeIcon className="action-icon" />
                  </button>
                </div>
              </div>

              <div className="document-details">
                <div className="detail-item">
                  <span className="detail-label">Format:</span>
                  <span className="detail-value">{document.format}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">File Size:</span>
                  <span className="detail-value">{document.fileSize}</span>
                </div>
              </div>

              <div className="document-requirements">
                <h5>Requirements:</h5>
                <ul>
                  {document.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Upload Section */}
              <div className="upload-section">
                <input
                  type="file"
                  id={`upload-${document.id}`}
                  className="upload-input"
                  onChange={(e) => handleFileUpload(document.id, e.target.files)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                />
                <label htmlFor={`upload-${document.id}`} className="upload-label">
                  <UploadIcon className="upload-icon" />
                  <span>Upload Document</span>
                </label>
                
                {uploadedDocuments[document.id] && (
                  <div className="uploaded-file">
                    <CheckCircleIcon className="uploaded-icon" />
                    <span className="file-name">
                      {uploadedDocuments[document.id].fileName}
                    </span>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="document-checklist">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={checkedDocuments[document.id] || false}
                    onChange={(e) => handleDocumentCheck(document.id, e.target.checked)}
                  />
                  <div className="checkbox-custom">
                    {checkedDocuments[document.id] && <CheckIcon className="check-icon" />}
                  </div>
                  <span>I have this document (if applicable)</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div className="important-notes">
        <div className="notes-header">
          <AlertTriangleIcon className="notes-icon" />
          <h3>Important Notes</h3>
        </div>
        <div className="notes-content">
          <ul>
            <li>All documents must be original for verification purposes</li>
            <li>Photocopies will be taken and returned with originals</li>
            <li>Documents in languages other than English/Sinhala must be translated</li>
            <li>Damaged or illegible documents will not be accepted</li>
            <li>Processing may be delayed if documents are incomplete</li>
          </ul>
        </div>
      </div>

      {/* Download Checklist */}
      <div className="download-section">
        <button className="download-btn">
          <DownloadIcon className="download-icon" />
          Download Document Checklist
        </button>
        <span className="download-note">
          Print this checklist to ensure you have all required documents
        </span>
      </div>

      {/* Action Buttons */}
      <div className="requirements-actions">
        <div className="completion-summary">
          {allRequiredChecked ? (
            <div className="completion-message success">
              <CheckCircleIcon className="success-icon" />
              <span>All required documents checked! You're ready to proceed.</span>
            </div>
          ) : (
            <div className="completion-message incomplete">
              <XCircleIcon className="incomplete-icon" />
              <span>Please check all required documents before proceeding.</span>
            </div>
          )}
        </div>
        
        <button 
          className={`proceed-btn ${allRequiredChecked ? 'enabled' : 'disabled'}`}
          onClick={handleProceed}
          disabled={!allRequiredChecked}
        >
          Proceed to Fee Structure
          <ArrowRightIcon className="btn-icon" />
        </button>
      </div>

      {/* Sample Image Modal */}
      {viewingSample && (
        <SampleImageModal 
          document={viewingSample} 
          onClose={() => setViewingSample(null)} 
        />
      )}
    </div>
  );
};

export default DocumentRequirements;
