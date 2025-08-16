import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Clock, User, FileText, CreditCard, CheckCircle } from 'lucide-react';
import '../../styles/BookingWizard.css';
import CalendarView from './CalendarView';
import TimeSlotGrid from './TimeSlotGrid';
import SmartScheduler from './SmartScheduler';
import ServiceGrouping from './ServiceGrouping';

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
      title: 'Select Dates',
      icon: Calendar,
      description: 'Choose available dates and wait list if needed'
    },
    {
      id: 2,
      title: 'Time Slot & Business Hours',
      icon: Clock,
      description: 'Select time slot and view business hours/holidays'
    },
    {
      id: 3,
      title: 'Smart Scheduling',
      icon: Clock,
      description: 'Get optimal time suggestions and estimated wait times'
    },
    {
      id: 4,
      title: 'Service Grouping',
      icon: User,
      description: 'Group services and handle dependencies'
    },
    {
      id: 5,
      title: 'Confirmation',
      icon: CheckCircle,
      description: 'Review and confirm booking'
    }
  ];
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CalendarView
            onDateSelect={(date) => updateBookingData({ selectedDate: date })}
            onWaitList={(date) => updateBookingData({ waitListDate: date })}
          />
        );
      case 2:
        return (
          <TimeSlotGrid
            selectedDate={bookingData.selectedDate}
            onSlotSelect={(slot) => updateBookingData({ selectedTime: slot })}
          />
        );
      case 3:
        return (
          <SmartScheduler
            selectedDates={bookingData.selectedDate ? [bookingData.selectedDate] : []}
            onOptimalSelect={(slot) => updateBookingData({ selectedTime: slot.slot })}
          />
        );
      case 4:
        return (
          <ServiceGrouping
            onSequenceSelect={(services) => updateBookingData({ selectedServices: services })}
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

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.selectedDate;
      case 2:
        return bookingData.selectedTime;
      case 3:
        return bookingData.selectedTime;
      case 4:
        return bookingData.selectedServices && bookingData.selectedServices.length > 0;
      default:
        return true;
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
