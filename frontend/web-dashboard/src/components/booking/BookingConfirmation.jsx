import React from 'react';
import { CheckCircle, Calendar, Clock, User, MapPin, Phone, Mail, CreditCard, FileText, Download, Share } from 'lucide-react';
import '../../styles/BookingConfirmation.css';

const BookingConfirmation = ({ service, bookingData, onConfirm }) => {
  const generateBookingId = () => {
    return 'BK' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  };

  const bookingId = generateBookingId();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleConfirmBooking = () => {
    const bookingConfirmation = {
      ...bookingData,
      bookingId,
      status: 'confirmed',
      confirmationDate: new Date(),
      estimatedDuration: service.duration || '30 minutes'
    };
    onConfirm(bookingConfirmation);
  };

  const paymentMethods = {
    'card': 'Credit/Debit Card',
    'mobile': 'Mobile Payment',
    'bank': 'Online Banking',
    'counter': 'Pay at Counter'
  };

  const total = service.fees?.total || 0;

  return (
    <div className="booking-confirmation">
      <div className="confirmation-header">
        <div className="success-icon">
          <CheckCircle size={48} />
        </div>
        <h3>Review Your Booking</h3>
        <p>Please review all details before confirming your appointment</p>
      </div>

      <div className="booking-details">
        {/* Service Information */}
        <div className="detail-section">
          <h4>Service Information</h4>
          <div className="detail-card">
            <div className="service-header">
              <div className="service-icon">
                {service.icon ? <service.icon size={24} /> : <FileText size={24} />}
              </div>
              <div className="service-info">
                <h5>{service.name}</h5>
                <p>{service.description}</p>
              </div>
            </div>
            <div className="service-details">
              <div className="detail-row">
                <span>Department:</span>
                <span>{service.department}</span>
              </div>
              <div className="detail-row">
                <span>Estimated Duration:</span>
                <span>{service.duration || '30 minutes'}</span>
              </div>
              <div className="detail-row">
                <span>Service Fee:</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="detail-section">
          <h4>Appointment Details</h4>
          <div className="detail-card">
            <div className="appointment-info">
              <div className="info-item">
                <Calendar size={20} />
                <div className="info-content">
                  <h6>Date</h6>
                  <p>{formatDate(bookingData.selectedDate)}</p>
                </div>
              </div>
              <div className="info-item">
                <Clock size={20} />
                <div className="info-content">
                  <h6>Time</h6>
                  <p>{bookingData.selectedTime}</p>
                </div>
              </div>
              {bookingData.selectedOfficer && (
                <div className="info-item">
                  <User size={20} />
                  <div className="info-content">
                    <h6>Assigned Officer</h6>
                    <p>{bookingData.selectedOfficer.name}</p>
                    <span>{bookingData.selectedOfficer.title}</span>
                  </div>
                </div>
              )}
              <div className="info-item">
                <MapPin size={20} />
                <div className="info-content">
                  <h6>Location</h6>
                  <p>{service.location || 'Main Office'}</p>
                  <span>Please arrive 15 minutes early</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="detail-section">
          <h4>Personal Information</h4>
          <div className="detail-card">
            <div className="personal-info">
              <div className="info-row">
                <User size={16} />
                <span>Full Name:</span>
                <span>{bookingData.personalDetails.fullName}</span>
              </div>
              <div className="info-row">
                <FileText size={16} />
                <span>NIC Number:</span>
                <span>{bookingData.personalDetails.nic}</span>
              </div>
              <div className="info-row">
                <Mail size={16} />
                <span>Email:</span>
                <span>{bookingData.personalDetails.email}</span>
              </div>
              <div className="info-row">
                <Phone size={16} />
                <span>Phone:</span>
                <span>{bookingData.personalDetails.phone}</span>
              </div>
              {bookingData.personalDetails.address && (
                <div className="info-row">
                  <MapPin size={16} />
                  <span>Address:</span>
                  <span>{bookingData.personalDetails.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Status */}
        <div className="detail-section">
          <h4>Documents Status</h4>
          <div className="detail-card">
            <div className="documents-status">
              {Object.keys(bookingData.documents).length > 0 ? (
                <div className="documents-list">
                  {Object.entries(bookingData.documents).map(([type, doc]) => (
                    <div key={type} className="document-status-item">
                      <CheckCircle size={16} />
                      <span>{doc.name}</span>
                      <span className="status-badge uploaded">Uploaded</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-documents">
                  <FileText size={20} />
                  <p>No documents uploaded - will be verified at appointment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="detail-section">
          <h4>Payment Information</h4>
          <div className="detail-card">
            <div className="payment-info">
              <div className="payment-method">
                <CreditCard size={20} />
                <div className="method-details">
                  <h6>Payment Method</h6>
                  <p>{paymentMethods[bookingData.paymentMethod] || 'Not Selected'}</p>
                </div>
              </div>
              <div className="payment-breakdown">
                <div className="breakdown-row">
                  <span>Service Fee:</span>
                  <span>Rs. {(service.fees?.serviceFee || 0).toLocaleString()}</span>
                </div>
                {service.fees?.processingFee && (
                  <div className="breakdown-row">
                    <span>Processing Fee:</span>
                    <span>Rs. {service.fees.processingFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="breakdown-row total">
                  <span>Total Amount:</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Special Requirements */}
        {bookingData.specialRequirements && (
          <div className="detail-section">
            <h4>Special Requirements</h4>
            <div className="detail-card">
              <div className="requirements-text">
                <p>{bookingData.specialRequirements}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Important Instructions */}
      <div className="important-instructions">
        <h4>Important Instructions</h4>
        <div className="instructions-grid">
          <div className="instruction-item">
            <Clock size={20} />
            <div className="instruction-content">
              <h6>Arrival Time</h6>
              <p>Please arrive 15 minutes before your scheduled appointment time</p>
            </div>
          </div>
          <div className="instruction-item">
            <FileText size={20} />
            <div className="instruction-content">
              <h6>Required Documents</h6>
              <p>Bring original documents and copies as specified in the requirements</p>
            </div>
          </div>
          <div className="instruction-item">
            <Phone size={20} />
            <div className="instruction-content">
              <h6>Contact Information</h6>
              <p>Keep your phone accessible for any updates or confirmations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Actions */}
      <div className="confirmation-actions">
        <div className="booking-id">
          <h5>Booking ID: {bookingId}</h5>
          <p>Keep this ID for future reference</p>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn secondary">
            <Download size={16} />
            Download Receipt
          </button>
          <button className="action-btn secondary">
            <Share size={16} />
            Share Details
          </button>
          <button 
            className="action-btn primary confirm-btn"
            onClick={handleConfirmBooking}
          >
            <CheckCircle size={16} />
            Confirm Booking
          </button>
        </div>
      </div>

      {/* Terms Notice */}
      <div className="terms-notice">
        <p>
          By confirming this booking, you agree to our{' '}
          <a href="/terms" target="_blank">Terms of Service</a>{' '}
          and{' '}
          <a href="/privacy" target="_blank">Privacy Policy</a>.
          You will receive a confirmation email shortly after booking.
        </p>
      </div>
    </div>
  );
};

export default BookingConfirmation;
