import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download,
  ExternalLink
} from 'lucide-react';
import '../../styles/RequiredDocuments.css';

const RequiredDocuments = ({ documents = [] }) => {
  const [expandedDoc, setExpandedDoc] = useState(null);

  if (documents.length === 0) {
    return (
      <div className="documents-empty">
        <FileText size={48} className="empty-icon" />
        <h3>No documents required</h3>
        <p>This service can be processed without additional documentation.</p>
      </div>
    );
  }

  const requiredDocs = documents.filter(doc => doc.required);
  const optionalDocs = documents.filter(doc => !doc.required);

  const toggleExpanded = (index) => {
    setExpandedDoc(expandedDoc === index ? null : index);
  };

  const DocumentItem = ({ document, index, isRequired }) => (
    <div className="document-item">
      <div className="document-header">
        <div className="document-info">
          <div className="document-icon">
            {isRequired ? (
              <CheckCircle2 className="required-icon" size={20} />
            ) : (
              <AlertCircle className="optional-icon" size={20} />
            )}
          </div>
          
          <div className="document-details">
            <h4 className="document-name">{document.name}</h4>
            <span className={`document-status ${isRequired ? 'required' : 'optional'}`}>
              {isRequired ? 'Required' : 'Optional'}
            </span>
          </div>
        </div>

        <button 
          className="expand-button"
          onClick={() => toggleExpanded(index)}
          aria-label={`${expandedDoc === index ? 'Hide' : 'Show'} details for ${document.name}`}
        >
          <Eye size={16} />
        </button>
      </div>

      {expandedDoc === index && (
        <div className="document-expanded">
          <div className="document-example">
            <h5>Document Example:</h5>
            <p>{document.example}</p>
          </div>
          
          <div className="document-actions">
            <button className="action-button sample-button">
              <Download size={16} />
              Download Sample
            </button>
            <button className="action-button guide-button">
              <ExternalLink size={16} />
              View Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="required-documents">
      <div className="documents-header">
        <h2>Required Documents</h2>
        <p>Please prepare the following documents before booking your appointment</p>
      </div>

      <div className="documents-summary">
        <div className="summary-item">
          <div className="summary-number required">{requiredDocs.length}</div>
          <span className="summary-label">Required Documents</span>
        </div>
        <div className="summary-item">
          <div className="summary-number optional">{optionalDocs.length}</div>
          <span className="summary-label">Optional Documents</span>
        </div>
      </div>

      {/* Required Documents Section */}
      {requiredDocs.length > 0 && (
        <div className="documents-section">
          <div className="section-header">
            <CheckCircle2 className="section-icon required-icon" size={20} />
            <h3>Required Documents ({requiredDocs.length})</h3>
          </div>
          
          <div className="documents-list">
            {requiredDocs.map((document, index) => (
              <DocumentItem 
                key={`required-${index}`}
                document={document}
                index={`required-${index}`}
                isRequired={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents Section */}
      {optionalDocs.length > 0 && (
        <div className="documents-section">
          <div className="section-header">
            <AlertCircle className="section-icon optional-icon" size={20} />
            <h3>Optional Documents ({optionalDocs.length})</h3>
          </div>
          
          <div className="documents-list">
            {optionalDocs.map((document, index) => (
              <DocumentItem 
                key={`optional-${index}`}
                document={document}
                index={`optional-${index}`}
                isRequired={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* Important Notes */}
      <div className="documents-notes">
        <h4>Important Notes:</h4>
        <ul>
          <li>All documents must be original or certified copies</li>
          <li>Documents in languages other than Sinhala or English must be translated</li>
          <li>Photocopies should be clear and legible</li>
          <li>Expired documents will not be accepted</li>
        </ul>
      </div>
    </div>
  );
};

export default RequiredDocuments;
