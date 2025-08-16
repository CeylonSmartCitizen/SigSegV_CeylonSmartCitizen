import React, { useState, useEffect } from 'react';
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import CalendarView from './CalendarView';
import TimeSlotGrid from './TimeSlotGrid';
import SmartScheduler from './SmartScheduler';
import WaitListManager from './WaitListManager';
import '../../styles/BookingIntegration.css';

const BookingIntegration = ({ 
  serviceId,
  serviceName,
  servicePrice,
  serviceDuration,
  onBookingComplete,
  onBookingCancel,
  userId 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    specialRequests: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    billingAddress: ''
  });
  const [conflicts, setConflicts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [showWaitList, setShowWaitList] = useState(false);

  const steps = [
    { number: 1, title: 'Select Date', icon: CalendarDaysIcon },
    { number: 2, title: 'Choose Time', icon: ClockIcon },
    { number: 3, title: 'Review & Resolve', icon: ExclamationTriangleIcon },
    { number: 4, title: 'Customer Details', icon: UserIcon },
    { number: 5, title: 'Payment', icon: CreditCardIcon },
    { number: 6, title: 'Confirmation', icon: CheckCircleIcon }
  ];

  // Calculate total price
  const calculateTotalPrice = () => {
    const basePrice = servicePrice || 0;
    const slotsCount = selectedTimeSlots.length;
    const subtotal = basePrice * slotsCount;
    const tax = subtotal * 0.08; // 8% tax
    const serviceFee = subtotal * 0.02; // 2% service fee
    return {
      subtotal,
      tax,
      serviceFee,
      total: subtotal + tax + serviceFee
    };
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlots([]); // Reset time slots when date changes
    if (date) {
      setCurrentStep(2);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlots) => {
    setSelectedTimeSlots(timeSlots);
    if (timeSlots.length > 0) {
      setCurrentStep(3);
    }
  };

  // Handle conflict resolution
  const handleConflictResolution = (conflict, resolution) => {
    switch (resolution) {
      case 'reschedule':
        setCurrentStep(1); // Go back to date selection
        break;
      case 'find_alternative':
        setCurrentStep(2); // Go back to time selection
        break;
      case 'join_waitlist':
        setShowWaitList(true);
        break;
    }
  };

  // Handle schedule updates from smart scheduler
  const handleScheduleUpdate = (newTimeSlots, newDate = null) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
    setSelectedTimeSlots(newTimeSlots);
  };

  // Handle wait list actions
  const handleWaitListUpdate = (entry, action) => {
    if (action === 'auto_booked' || action === 'manual_booked') {
      // Booking was successful from wait list
      setBookingConfirmed(true);
      setBookingId(`WL-${entry.id}`);
      setCurrentStep(6);
    }
  };

  // Proceed to next step
  const proceedToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle customer info form submission
  const handleCustomerInfoSubmit = (e) => {
    e.preventDefault();
    proceedToNextStep();
  };

  // Process booking
  const processBooking = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call for booking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate booking ID
      const generatedBookingId = `BK-${Date.now()}`;
      setBookingId(generatedBookingId);
      setBookingConfirmed(true);
      
      // Call completion callback
      const bookingData = {
        id: generatedBookingId,
        serviceId,
        serviceName,
        date: selectedDate,
        timeSlots: selectedTimeSlots,
        customerInfo,
        paymentInfo,
        pricing: calculateTotalPrice(),
        status: 'confirmed'
      };
      
      onBookingComplete?.(bookingData);
      setCurrentStep(6);
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate current step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return selectedDate !== null;
      case 2:
        return selectedTimeSlots.length > 0;
      case 3:
        return conflicts.length === 0;
      case 4:
        return customerInfo.firstName && customerInfo.lastName && 
               customerInfo.email && customerInfo.phone;
      case 5:
        return paymentInfo.cardNumber && paymentInfo.expiryDate && paymentInfo.cvv;
      default:
        return true;
    }
  };

  if (showWaitList) {
    return (
      <div className="booking-integration">
        <div className="booking-header">
          <button 
            className="back-btn"
            onClick={() => setShowWaitList(false)}
          >
            <ArrowLeftIcon className="back-icon" />
            Back to Booking
          </button>
          <h2>Wait List Management</h2>
        </div>
        <WaitListManager 
          userId={userId}
          serviceId={serviceId}
          onWaitListUpdate={handleWaitListUpdate}
        />
      </div>
    );
  }

  return (
    <div className="booking-integration">
      {/* Header */}
      <div className="booking-header">
        <div className="service-info">
          <h2>{serviceName}</h2>
          <div className="service-details">
            <span className="price">${servicePrice}</span>
            <span className="duration">{serviceDuration} min</span>
          </div>
        </div>
        {!bookingConfirmed && (
          <button 
            className="cancel-btn"
            onClick={onBookingCancel}
          >
            Cancel Booking
          </button>
        )}
      </div>

      {/* Progress Steps */}
      {!bookingConfirmed && (
        <div className="progress-steps">
          {steps.map((step) => (
            <div 
              key={step.number}
              className={`step ${currentStep >= step.number ? 'completed' : ''} ${currentStep === step.number ? 'active' : ''}`}
            >
              <div className="step-icon">
                {currentStep > step.number ? (
                  <CheckCircleIcon className="check-icon" />
                ) : (
                  <step.icon className="step-icon-svg" />
                )}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Step Content */}
      <div className="step-content">
        {/* Step 1: Date Selection */}
        {currentStep === 1 && (
          <div className="step-panel">
            <h3>Select Your Preferred Date</h3>
            <CalendarView 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              serviceId={serviceId}
            />
          </div>
        )}

        {/* Step 2: Time Selection */}
        {currentStep === 2 && (
          <div className="step-panel">
            <h3>Choose Available Time Slots</h3>
            <TimeSlotGrid 
              selectedDate={selectedDate}
              selectedTimeSlots={selectedTimeSlots}
              onTimeSlotSelect={handleTimeSlotSelect}
              serviceId={serviceId}
              multiSelect={true}
            />
          </div>
        )}

        {/* Step 3: Smart Scheduling & Conflict Resolution */}
        {currentStep === 3 && (
          <div className="step-panel">
            <h3>Review & Resolve Any Issues</h3>
            <SmartScheduler 
              selectedDate={selectedDate}
              selectedTimeSlots={selectedTimeSlots}
              serviceId={serviceId}
              userId={userId}
              onScheduleUpdate={handleScheduleUpdate}
              onConflictResolution={handleConflictResolution}
              onWaitListJoin={() => setShowWaitList(true)}
            />
          </div>
        )}

        {/* Step 4: Customer Information */}
        {currentStep === 4 && (
          <div className="step-panel">
            <h3>Customer Information</h3>
            <form className="customer-form" onSubmit={handleCustomerInfoSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input 
                    type="text"
                    value={customerInfo.firstName}
                    onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input 
                    type="text"
                    value={customerInfo.lastName}
                    onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input 
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Special Requests or Notes</label>
                <textarea 
                  value={customerInfo.specialRequests}
                  onChange={(e) => setCustomerInfo({...customerInfo, specialRequests: e.target.value})}
                  rows={3}
                  placeholder="Any special requirements or notes for your appointment..."
                />
              </div>
            </form>
          </div>
        )}

        {/* Step 5: Payment */}
        {currentStep === 5 && (
          <div className="step-panel">
            <h3>Payment Information</h3>
            
            {/* Booking Summary */}
            <div className="booking-summary">
              <h4>Booking Summary</h4>
              <div className="summary-details">
                <div className="summary-item">
                  <MapPinIcon className="summary-icon" />
                  <span>{serviceName}</span>
                </div>
                <div className="summary-item">
                  <CalendarDaysIcon className="summary-icon" />
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <ClockIcon className="summary-icon" />
                  <span>{selectedTimeSlots.map(slot => slot.displayTime).join(', ')}</span>
                </div>
                <div className="summary-item">
                  <UserIcon className="summary-icon" />
                  <span>{customerInfo.firstName} {customerInfo.lastName}</span>
                </div>
              </div>

              <div className="pricing-breakdown">
                <div className="price-row">
                  <span>Subtotal ({selectedTimeSlots.length} slots)</span>
                  <span>${calculateTotalPrice().subtotal.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Tax (8%)</span>
                  <span>${calculateTotalPrice().tax.toFixed(2)}</span>
                </div>
                <div className="price-row">
                  <span>Service Fee (2%)</span>
                  <span>${calculateTotalPrice().serviceFee.toFixed(2)}</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span>${calculateTotalPrice().total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="payment-form">
              <div className="payment-methods">
                <label className="payment-method">
                  <input 
                    type="radio"
                    value="card"
                    checked={paymentInfo.method === 'card'}
                    onChange={(e) => setPaymentInfo({...paymentInfo, method: e.target.value})}
                  />
                  <CreditCardIcon className="payment-icon" />
                  <span>Credit/Debit Card</span>
                </label>
              </div>

              {paymentInfo.method === 'card' && (
                <div className="card-form">
                  <div className="form-group">
                    <label>Card Number *</label>
                    <input 
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date *</label>
                      <input 
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input 
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Confirmation */}
        {currentStep === 6 && bookingConfirmed && (
          <div className="step-panel confirmation">
            <div className="confirmation-content">
              <CheckCircleIcon className="success-icon" />
              <h3>Booking Confirmed!</h3>
              <p>Your appointment has been successfully booked.</p>
              
              <div className="confirmation-details">
                <div className="detail-item">
                  <strong>Booking ID:</strong> {bookingId}
                </div>
                <div className="detail-item">
                  <strong>Service:</strong> {serviceName}
                </div>
                <div className="detail-item">
                  <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
                </div>
                <div className="detail-item">
                  <strong>Time:</strong> {selectedTimeSlots.map(slot => slot.displayTime).join(', ')}
                </div>
                <div className="detail-item">
                  <strong>Total Paid:</strong> ${calculateTotalPrice().total.toFixed(2)}
                </div>
              </div>

              <div className="confirmation-actions">
                <button className="action-btn primary">
                  <EnvelopeIcon className="action-icon" />
                  Email Confirmation
                </button>
                <button className="action-btn secondary">
                  <PhoneIcon className="action-icon" />
                  Add to Calendar
                </button>
                <button className="action-btn secondary">
                  <DocumentTextIcon className="action-icon" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {!bookingConfirmed && currentStep > 1 && currentStep < 6 && (
        <div className="navigation-buttons">
          <button 
            className="nav-btn secondary"
            onClick={goToPreviousStep}
          >
            <ArrowLeftIcon className="nav-icon" />
            Previous
          </button>
          
          {currentStep < 5 && (
            <button 
              className="nav-btn primary"
              onClick={proceedToNextStep}
              disabled={!isStepValid()}
            >
              Next
              <ArrowRightIcon className="nav-icon" />
            </button>
          )}
          
          {currentStep === 5 && (
            <button 
              className="nav-btn primary"
              onClick={processBooking}
              disabled={!isStepValid() || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Complete Booking'}
              {!isProcessing && <CreditCardIcon className="nav-icon" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingIntegration;
