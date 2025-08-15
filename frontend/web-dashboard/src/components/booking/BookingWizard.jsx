import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, FileText, CreditCard, CheckCircle } from 'lucide-react';
import '../../styles/BookingWizard.css';
import DateTimeSelection from './DateTimeSelection';
import DocumentVerification from './DocumentVerification';
import PersonalDetails from './PersonalDetails';
import PaymentConfirmation from './PaymentConfirmation';
import BookingConfirmation from './BookingConfirmation';

const BookingWizard = ({ service, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    serviceId: service.id,
    serviceName: service.name,
    selectedDate: null,
    selectedTime: null,
    selectedOfficer: null,
    documents: {},
    personalDetails: {
      fullName: '',
      nic: '',
      email: '',
      phone: '',
      address: ''
    },
    specialRequirements: '',
    paymentMethod: '',
    totalAmount: service.fees?.total || 0
  });

  const steps = [
    {
      id: 1,
      title: 'Date & Time',
      icon: Calendar,
      description: 'Select appointment date and time'
    },
    {
      id: 2,
      title: 'Documents',
      icon: FileText,
      description: 'Verify required documents'
    },
    {
      id: 3,
      title: 'Personal Details',
      icon: User,
      description: 'Provide your information'
    },
    {
      id: 4,
      title: 'Payment',
      icon: CreditCard,
      description: 'Confirm payment details'
    },
    {
      id: 5,
      title: 'Confirmation',
      icon: CheckCircle,
      description: 'Review and confirm booking'
    }
  ];

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.selectedDate && bookingData.selectedTime;
      case 2:
        return Object.keys(bookingData.documents).length > 0;
      case 3:
        return bookingData.personalDetails.fullName && 
               bookingData.personalDetails.nic && 
               bookingData.personalDetails.email;
      case 4:
        return bookingData.paymentMethod;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <DateTimeSelection
            service={service}
            bookingData={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 2:
        return (
          <DocumentVerification
            service={service}
            bookingData={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 3:
        return (
          <PersonalDetails
            bookingData={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 4:
        return (
          <PaymentConfirmation
            service={service}
            bookingData={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 5:
        return (
          <BookingConfirmation
            service={service}
            bookingData={bookingData}
            onConfirm={onComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="booking-wizard-overlay">
      <div className="booking-wizard">
        {/* Header */}
        <div className="booking-header">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
          <h2>Book Appointment</h2>
          <p className="service-name">{service.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div
                key={step.id}
                className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-indicator">
                  <Icon size={20} />
                  <span className="step-number">{step.id}</span>
                </div>
                <div className="step-info">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="step-content">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="wizard-navigation">
          <button
            className="nav-btn secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft size={16} />
            Previous
          </button>

          <div className="step-indicator-text">
            Step {currentStep} of {steps.length}
          </div>

          {currentStep < steps.length ? (
            <button
              className="nav-btn primary"
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              className="nav-btn primary"
              onClick={() => onComplete(bookingData)}
              disabled={!canProceed()}
            >
              Complete Booking
              <CheckCircle size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizard;
