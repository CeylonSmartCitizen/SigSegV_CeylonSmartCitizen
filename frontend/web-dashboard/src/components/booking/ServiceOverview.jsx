import React, { useState } from 'react';
import { 
  InfoIcon, 
  ClockIcon, 
  PhoneIcon, 
  MailIcon, 
  MapPinIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserIcon,
  CalendarIcon,
  AlertCircleIcon
} from 'lucide-react';
import '../../styles/ServiceOverview.css';

const ServiceOverview = ({ service, onProceed }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Mock service data - in real app, this would come from props/API
  const serviceDetails = {
    id: service?.id || 'srv-001',
    name: service?.name || 'Document Verification Service',
    category: service?.category || 'Government Services',
    description: service?.description || 'Official document verification and authentication service for various government and legal purposes.',
    
    // Process steps
    processSteps: [
      {
        step: 1,
        title: 'Document Submission',
        description: 'Submit required documents for initial review',
        duration: '5-10 minutes',
        location: 'Service Counter'
      },
      {
        step: 2,
        title: 'Document Verification',
        description: 'Official verification process by authorized personnel',
        duration: '15-30 minutes',
        location: 'Verification Department'
      },
      {
        step: 3,
        title: 'Quality Check',
        description: 'Final quality assessment and approval',
        duration: '5-10 minutes',
        location: 'Quality Assurance'
      },
      {
        step: 4,
        title: 'Document Collection',
        description: 'Collect verified documents and certificates',
        duration: '5 minutes',
        location: 'Collection Counter'
      }
    ],

    // Processing information
    processingInfo: {
      estimatedTime: '2-3 business days',
      urgentProcessing: 'Same day (additional fees apply)',
      workingHours: 'Monday - Friday: 9:00 AM - 5:00 PM',
      holidays: 'Closed on public holidays and weekends'
    },

    // Follow-up procedures
    followUp: [
      {
        title: 'Status Tracking',
        description: 'Track your application status online or via SMS notifications',
        method: 'Online Portal / SMS'
      },
      {
        title: 'Collection Notification',
        description: 'Receive notification when documents are ready for collection',
        method: 'Email / Phone Call'
      },
      {
        title: 'Quality Feedback',
        description: 'Provide feedback on service quality and experience',
        method: 'Online Survey'
      }
    ],

    // Contact information
    contactInfo: {
      primaryContact: {
        name: 'Document Services Department',
        phone: '+94 11 234 5678',
        email: 'documents@smartcitizen.lk',
        hours: 'Monday - Friday: 8:30 AM - 4:30 PM'
      },
      emergencyContact: {
        name: 'Emergency Services',
        phone: '+94 11 234 5679',
        email: 'emergency@smartcitizen.lk',
        hours: '24/7 Available'
      },
      location: {
        address: '123 Government Building, Colombo 01, Sri Lanka',
        directions: 'Near Central Bus Station, 2nd Floor',
        parking: 'Available - First 2 hours free'
      }
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleProceed = () => {
    onProceed({
      serviceId: serviceDetails.id,
      serviceName: serviceDetails.name,
      category: serviceDetails.category,
      estimatedTime: serviceDetails.processingInfo.estimatedTime
    });
  };

  return (
    <div className="service-overview">
      {/* Service Header */}
      <div className="service-header">
        <div className="service-title-section">
          <h1 className="service-title">{serviceDetails.name}</h1>
          <span className="service-category">{serviceDetails.category}</span>
        </div>
        <div className="service-status">
          <CheckCircleIcon className="status-icon available" />
          <span className="status-text">Available</span>
        </div>
      </div>

      {/* Service Description */}
      <div className="service-description">
        <InfoIcon className="description-icon" />
        <p>{serviceDetails.description}</p>
      </div>

      {/* Quick Info Cards */}
      <div className="quick-info-cards">
        <div className="info-card">
          <ClockIcon className="card-icon" />
          <div className="card-content">
            <h4>Processing Time</h4>
            <p>{serviceDetails.processingInfo.estimatedTime}</p>
          </div>
        </div>
        <div className="info-card">
          <UserIcon className="card-icon" />
          <div className="card-content">
            <h4>Service Type</h4>
            <p>In-Person Required</p>
          </div>
        </div>
        <div className="info-card">
          <CalendarIcon className="card-icon" />
          <div className="card-content">
            <h4>Working Hours</h4>
            <p>{serviceDetails.processingInfo.workingHours}</p>
          </div>
        </div>
      </div>

      {/* Process Steps Section */}
      <div className="section-container">
        <button 
          className={`section-header ${expandedSection === 'process' ? 'expanded' : ''}`}
          onClick={() => toggleSection('process')}
        >
          <h3>Step-by-Step Process</h3>
          <ArrowRightIcon className="expand-icon" />
        </button>
        
        {expandedSection === 'process' && (
          <div className="section-content">
            <div className="process-steps">
              {serviceDetails.processSteps.map((step) => (
                <div key={step.step} className="process-step">
                  <div className="step-number">{step.step}</div>
                  <div className="step-content">
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                    <div className="step-details">
                      <span className="duration">
                        <ClockIcon className="detail-icon" />
                        {step.duration}
                      </span>
                      <span className="location">
                        <MapPinIcon className="detail-icon" />
                        {step.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Processing Information Section */}
      <div className="section-container">
        <button 
          className={`section-header ${expandedSection === 'processing' ? 'expanded' : ''}`}
          onClick={() => toggleSection('processing')}
        >
          <h3>Processing Information</h3>
          <ArrowRightIcon className="expand-icon" />
        </button>
        
        {expandedSection === 'processing' && (
          <div className="section-content">
            <div className="processing-info">
              <div className="info-item">
                <h4>Standard Processing</h4>
                <p>{serviceDetails.processingInfo.estimatedTime}</p>
              </div>
              <div className="info-item urgent">
                <AlertCircleIcon className="urgent-icon" />
                <h4>Urgent Processing</h4>
                <p>{serviceDetails.processingInfo.urgentProcessing}</p>
              </div>
              <div className="info-item">
                <h4>Working Hours</h4>
                <p>{serviceDetails.processingInfo.workingHours}</p>
              </div>
              <div className="info-item">
                <h4>Holiday Schedule</h4>
                <p>{serviceDetails.processingInfo.holidays}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Follow-up Procedures Section */}
      <div className="section-container">
        <button 
          className={`section-header ${expandedSection === 'followup' ? 'expanded' : ''}`}
          onClick={() => toggleSection('followup')}
        >
          <h3>Follow-up Procedures</h3>
          <ArrowRightIcon className="expand-icon" />
        </button>
        
        {expandedSection === 'followup' && (
          <div className="section-content">
            <div className="followup-procedures">
              {serviceDetails.followUp.map((procedure, index) => (
                <div key={index} className="followup-item">
                  <CheckCircleIcon className="followup-icon" />
                  <div className="followup-content">
                    <h4>{procedure.title}</h4>
                    <p>{procedure.description}</p>
                    <span className="method">{procedure.method}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Information Section */}
      <div className="section-container">
        <button 
          className={`section-header ${expandedSection === 'contact' ? 'expanded' : ''}`}
          onClick={() => toggleSection('contact')}
        >
          <h3>Contact Information</h3>
          <ArrowRightIcon className="expand-icon" />
        </button>
        
        {expandedSection === 'contact' && (
          <div className="section-content">
            <div className="contact-info">
              {/* Primary Contact */}
              <div className="contact-section">
                <h4>Primary Contact</h4>
                <div className="contact-details">
                  <div className="contact-item">
                    <PhoneIcon className="contact-icon" />
                    <div>
                      <span className="contact-value">{serviceDetails.contactInfo.primaryContact.phone}</span>
                      <span className="contact-hours">{serviceDetails.contactInfo.primaryContact.hours}</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <MailIcon className="contact-icon" />
                    <span className="contact-value">{serviceDetails.contactInfo.primaryContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="contact-section">
                <h4>Emergency Support</h4>
                <div className="contact-details">
                  <div className="contact-item">
                    <PhoneIcon className="contact-icon emergency" />
                    <div>
                      <span className="contact-value">{serviceDetails.contactInfo.emergencyContact.phone}</span>
                      <span className="contact-hours emergency">{serviceDetails.contactInfo.emergencyContact.hours}</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <MailIcon className="contact-icon" />
                    <span className="contact-value">{serviceDetails.contactInfo.emergencyContact.email}</span>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="contact-section">
                <h4>Location & Directions</h4>
                <div className="location-info">
                  <div className="location-item">
                    <MapPinIcon className="location-icon" />
                    <div>
                      <span className="location-address">{serviceDetails.contactInfo.location.address}</span>
                      <span className="location-directions">{serviceDetails.contactInfo.location.directions}</span>
                      <span className="location-parking">{serviceDetails.contactInfo.location.parking}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="overview-actions">
        <button className="proceed-btn" onClick={handleProceed}>
          Proceed to Requirements
          <ArrowRightIcon className="btn-icon" />
        </button>
      </div>
    </div>
  );
};

export default ServiceOverview;
