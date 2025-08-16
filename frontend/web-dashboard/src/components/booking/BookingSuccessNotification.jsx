import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import '../../styles/BookingSuccessNotification.css';

const BookingSuccessNotification = ({ bookingData, onClose }) => {
  return (
    <div className="notification-overlay">
      <div className="notification-modal">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="success-content">
          <div className="success-icon">
            <CheckCircle size={48} />
          </div>
          
          <h2>Booking Confirmed!</h2>
          <p className="booking-id">Booking ID: <strong>{bookingData.bookingId}</strong></p>
          
          <div className="booking-summary">
            <h3>Appointment Details</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <label>Service:</label>
                <span>{bookingData.serviceName}</span>
              </div>
              <div className="summary-item">
                <label>Date:</label>
                <span>{new Date(bookingData.selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="summary-item">
                <label>Time:</label>
                <span>{bookingData.selectedTime}</span>
              </div>
              {bookingData.selectedOfficer && (
                <div className="summary-item">
                  <label>Officer:</label>
                  <span>{bookingData.selectedOfficer.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="notification-actions">
            <button className="action-btn secondary" onClick={onClose}>
              Close
            </button>
            <button className="action-btn primary">
              View My Bookings
            </button>
          </div>
          
          <div className="next-steps">
            <h4>What's Next?</h4>
            <ul>
              <li>You'll receive a confirmation email shortly</li>
              <li>Please arrive 15 minutes before your appointment</li>
              <li>Bring all required documents</li>
              <li>Contact us if you need to reschedule</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessNotification;
