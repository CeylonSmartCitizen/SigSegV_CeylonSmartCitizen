import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Clock,
  DollarSign,
  Download,
  Print,
  Mail,
  Phone,
  Shield,
  Star,
  ArrowLeft,
  Send,
  Edit,
  Eye,
  Lock,
  Globe,
  Bookmark,
  Package,
  Target,
  Award,
  Zap
} from 'lucide-react';
import './FinalReview.css';

const FinalReview = ({ 
  serviceData = {
    serviceType: "Passport Application",
    processingType: "standard",
    paymentMethod: "card",
    totalAmount: 4150,
    selectedBundle: null,
    documents: ["National ID", "Address Proof", "Birth Certificate", "Passport Photos"],
    additionalServices: ["SMS Updates"]
  },
  onConfirm, 
  onBack,
  onEdit 
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [reviewStep, setReviewStep] = useState('review'); // 'review', 'confirming', 'confirmed'

  // Summary data compilation
  const summaryData = {
    service: {
      name: serviceData.serviceType,
      processing: serviceData.processingType,
      timeline: getProcessingTimeline(serviceData.processingType),
      priority: serviceData.processingType === 'express' ? 'High' : 
                serviceData.processingType === 'urgent' ? 'Medium' : 'Standard'
    },
    payment: {
      method: getPaymentMethodName(serviceData.paymentMethod),
      amount: serviceData.totalAmount,
      breakdown: getPaymentBreakdown(serviceData),
      currency: 'LKR'
    },
    documents: {
      required: serviceData.documents || [],
      optional: serviceData.optionalDocuments || [],
      status: 'Ready for verification'
    },
    appointment: {
      required: true,
      type: 'Biometric data collection & document verification',
      duration: '30 minutes',
      location: 'Department of Immigration & Emigration'
    }
  };

  function getProcessingTimeline(type) {
    const timelines = {
      'standard': '10-15 working days',
      'urgent': '3-5 working days',
      'express': '1-2 working days'
    };
    return timelines[type] || '10-15 working days';
  }

  function getPaymentMethodName(method) {
    const methods = {
      'card': 'Credit/Debit Card',
      'bank': 'Bank Transfer',
      'mobile': 'Mobile Payment',
      'cash': 'Cash Payment'
    };
    return methods[method] || 'Credit/Debit Card';
  }

  function getPaymentBreakdown(data) {
    // This would normally come from the fee calculator
    return {
      baseService: 3000,
      additionalServices: 200,
      taxes: 750,
      paymentFee: 0,
      total: data.totalAmount
    };
  }

  const completionChecklist = [
    { 
      id: 1, 
      item: 'Service type selected and configured', 
      completed: true,
      description: `${summaryData.service.name} with ${summaryData.service.processing} processing`
    },
    { 
      id: 2, 
      item: 'Required documents identified and ready', 
      completed: summaryData.documents.required.length > 0,
      description: `${summaryData.documents.required.length} required documents prepared`
    },
    { 
      id: 3, 
      item: 'Payment method selected and verified', 
      completed: !!serviceData.paymentMethod,
      description: `${summaryData.payment.method} selected for ${summaryData.payment.currency} ${summaryData.payment.amount.toLocaleString()}`
    },
    { 
      id: 4, 
      item: 'Terms and conditions reviewed', 
      completed: agreedToTerms,
      description: 'Service terms, privacy policy, and refund conditions'
    }
  ];

  const nextSteps = [
    {
      step: 1,
      title: 'Payment Processing',
      description: 'Complete secure payment using your selected method',
      timeline: 'Immediate',
      icon: CreditCard
    },
    {
      step: 2,
      title: 'Document Submission',
      description: 'Upload or bring required documents for verification',
      timeline: 'Within 24 hours',
      icon: FileText
    },
    {
      step: 3,
      title: 'Appointment Scheduling',
      description: 'Book your biometric data collection appointment',
      timeline: '1-2 working days',
      icon: Calendar
    },
    {
      step: 4,
      title: 'Processing & Review',
      description: 'Your application will be processed and reviewed',
      timeline: summaryData.service.timeline,
      icon: Clock
    },
    {
      step: 5,
      title: 'Collection/Delivery',
      description: 'Receive your completed documents',
      timeline: 'Upon completion',
      icon: Package
    }
  ];

  const handleConfirm = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions to continue');
      return;
    }
    
    setReviewStep('confirming');
    
    // Simulate processing
    setTimeout(() => {
      setReviewStep('confirmed');
      onConfirm?.({
        ...serviceData,
        agreedToTerms,
        newsletterOptIn,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    console.log('Downloading application summary...');
  };

  const handleEdit = (section) => {
    onEdit?.(section);
  };

  if (reviewStep === 'confirmed') {
    return (
      <div className="final-review confirmed">
        <div className="confirmation-content">
          <div className="success-icon-container">
            <CheckCircle className="success-icon" />
          </div>
          
          <h2>Application Submitted Successfully!</h2>
          <p>Your {summaryData.service.name} application has been received and is being processed.</p>
          
          <div className="confirmation-details">
            <div className="detail-item">
              <strong>Reference Number:</strong>
              <span className="reference-number">APP-2025-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <strong>Processing Timeline:</strong>
              <span>{summaryData.service.timeline}</span>
            </div>
            <div className="detail-item">
              <strong>Payment Status:</strong>
              <span className="status-paid">Paid - {summaryData.payment.currency} {summaryData.payment.amount.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <button className="btn-primary" onClick={handleDownload}>
              <Download className="btn-icon" />
              Download Receipt
            </button>
            <button className="btn-secondary" onClick={handlePrint}>
              <Print className="btn-icon" />
              Print Summary
            </button>
          </div>
          
          <div className="next-steps-summary">
            <h3>What happens next?</h3>
            <ul>
              <li>You'll receive a confirmation email within 5 minutes</li>
              <li>SMS updates will be sent to your registered number</li>
              <li>Appointment scheduling link will be sent within 24 hours</li>
              <li>Track your application status online anytime</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (reviewStep === 'confirming') {
    return (
      <div className="final-review confirming">
        <div className="confirming-content">
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
          <h2>Processing Your Application...</h2>
          <p>Please wait while we process your payment and submit your application.</p>
          <div className="processing-steps">
            <div className="process-step active">
              <CheckCircle className="step-icon" />
              <span>Validating information</span>
            </div>
            <div className="process-step active">
              <CreditCard className="step-icon" />
              <span>Processing payment</span>
            </div>
            <div className="process-step">
              <Send className="step-icon" />
              <span>Submitting application</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="final-review">
      <div className="review-header">
        <Target className="review-icon" />
        <div className="review-title">
          <h2>Final Review & Summary</h2>
          <p>Review your application details before submission</p>
        </div>
        <div className="review-status">
          <Award className="status-icon" />
          <span>Ready to Submit</span>
        </div>
      </div>

      {/* Application Summary */}
      <div className="section summary-section">
        <h3>
          <FileText className="section-icon" />
          Application Summary
        </h3>
        
        <div className="summary-grid">
          <div className="summary-card service-summary">
            <div className="card-header">
              <Shield className="card-icon" />
              <h4>Service Details</h4>
              <button className="edit-button" onClick={() => handleEdit('service')}>
                <Edit className="edit-icon" />
              </button>
            </div>
            <div className="card-content">
              <div className="summary-item">
                <span className="label">Service Type:</span>
                <span className="value">{summaryData.service.name}</span>
              </div>
              <div className="summary-item">
                <span className="label">Processing:</span>
                <span className={`value priority-${summaryData.service.priority.toLowerCase()}`}>
                  {summaryData.service.processing} ({summaryData.service.timeline})
                </span>
              </div>
              <div className="summary-item">
                <span className="label">Priority Level:</span>
                <span className="value">{summaryData.service.priority}</span>
              </div>
            </div>
          </div>

          <div className="summary-card documents-summary">
            <div className="card-header">
              <FileText className="card-icon" />
              <h4>Documents</h4>
              <button className="edit-button" onClick={() => handleEdit('documents')}>
                <Edit className="edit-icon" />
              </button>
            </div>
            <div className="card-content">
              <div className="summary-item">
                <span className="label">Required Documents:</span>
                <span className="value">{summaryData.documents.required.length} items</span>
              </div>
              <div className="document-list">
                {summaryData.documents.required.map(doc => (
                  <div key={doc} className="document-item">
                    <CheckCircle className="doc-check" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
              <div className="summary-item">
                <span className="label">Status:</span>
                <span className="value status-ready">{summaryData.documents.status}</span>
              </div>
            </div>
          </div>

          <div className="summary-card payment-summary">
            <div className="card-header">
              <CreditCard className="card-icon" />
              <h4>Payment Details</h4>
              <button className="edit-button" onClick={() => handleEdit('payment')}>
                <Edit className="edit-icon" />
              </button>
            </div>
            <div className="card-content">
              <div className="summary-item">
                <span className="label">Payment Method:</span>
                <span className="value">{summaryData.payment.method}</span>
              </div>
              <div className="payment-breakdown">
                <div className="breakdown-item">
                  <span>Base Service:</span>
                  <span>{summaryData.payment.currency} {summaryData.payment.breakdown.baseService.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Additional Services:</span>
                  <span>{summaryData.payment.currency} {summaryData.payment.breakdown.additionalServices.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Taxes & Fees:</span>
                  <span>{summaryData.payment.currency} {summaryData.payment.breakdown.taxes.toLocaleString()}</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total Amount:</span>
                  <span>{summaryData.payment.currency} {summaryData.payment.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-card appointment-summary">
            <div className="card-header">
              <Calendar className="card-icon" />
              <h4>Appointment</h4>
            </div>
            <div className="card-content">
              <div className="summary-item">
                <span className="label">Required:</span>
                <span className="value">{summaryData.appointment.required ? 'Yes' : 'No'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Purpose:</span>
                <span className="value">{summaryData.appointment.type}</span>
              </div>
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{summaryData.appointment.duration}</span>
              </div>
              <div className="summary-item">
                <span className="label">Location:</span>
                <span className="value">{summaryData.appointment.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Checklist */}
      <div className="section checklist-section">
        <h3>
          <CheckCircle className="section-icon" />
          Pre-Submission Checklist
        </h3>
        
        <div className="checklist">
          {completionChecklist.map(item => (
            <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : 'pending'}`}>
              <div className="check-indicator">
                {item.completed ? 
                  <CheckCircle className="check-icon completed" /> : 
                  <AlertTriangle className="check-icon pending" />
                }
              </div>
              <div className="check-content">
                <h4>{item.item}</h4>
                <p>{item.description}</p>
              </div>
              <div className="check-status">
                {item.completed ? 
                  <span className="status-badge completed">Complete</span> : 
                  <span className="status-badge pending">Pending</span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="section next-steps-section">
        <h3>
          <Zap className="section-icon" />
          What Happens Next
        </h3>
        
        <div className="steps-timeline">
          {nextSteps.map(step => {
            const IconComponent = step.icon;
            return (
              <div key={step.step} className="timeline-step">
                <div className="step-indicator">
                  <span className="step-number">{step.step}</span>
                  <IconComponent className="step-icon" />
                </div>
                <div className="step-content">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  <span className="step-timeline">{step.timeline}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="section terms-section">
        <h3>
          <Lock className="section-icon" />
          Terms & Conditions
        </h3>
        
        <div className="terms-content">
          <div className="terms-agreement">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              <span className="checkmark"></span>
              <span className="agreement-text">
                I agree to the <button className="terms-link" onClick={() => setShowTermsModal(true)}>Terms of Service</button>, 
                <button className="terms-link">Privacy Policy</button>, and 
                <button className="terms-link">Refund Policy</button>
              </span>
            </label>
          </div>
          
          <div className="newsletter-option">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={newsletterOptIn}
                onChange={(e) => setNewsletterOptIn(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="agreement-text">
                Send me updates about my application and other government services
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="review-actions">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowLeft className="btn-icon" />
          Back to FAQ
        </button>
        
        <div className="action-group">
          <button className="btn-download" onClick={handleDownload}>
            <Download className="btn-icon" />
            Save Summary
          </button>
          
          <button 
            className={`btn-primary ${!agreedToTerms ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!agreedToTerms}
          >
            <Send className="btn-icon" />
            Submit Application
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="security-notice">
        <Shield className="security-icon" />
        <div className="security-content">
          <h4>Secure Processing</h4>
          <p>
            Your application and payment information are protected with bank-level encryption. 
            All personal data is handled according to government privacy standards.
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Terms of Service</h3>
              <button className="close-modal" onClick={() => setShowTermsModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="terms-text">
                <h4>Service Agreement</h4>
                <p>By using this service, you agree to provide accurate information and comply with all government regulations...</p>
                
                <h4>Payment Terms</h4>
                <p>All payments are processed securely. Refunds are subject to the stated refund policy...</p>
                
                <h4>Data Protection</h4>
                <p>Your personal information is protected according to government privacy standards...</p>
                
                <h4>Service Availability</h4>
                <p>We strive to maintain service availability but cannot guarantee uninterrupted access...</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={() => {
                setAgreedToTerms(true);
                setShowTermsModal(false);
              }}>
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalReview;
