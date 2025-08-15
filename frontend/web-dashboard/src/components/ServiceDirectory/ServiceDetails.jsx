import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  MapPin, 
  Star,
  Calendar,
  FileText,
  Users,
  MessageCircle
} from 'lucide-react';
import RequiredDocuments from './RequiredDocuments';
import FeeBreakdown from './FeeBreakdown';
import OfficerProfiles from './OfficerProfiles';
import ServiceReviews from './ServiceReviews';
import BookingWizard from '../booking/BookingWizard';
import '../../styles/ServiceDetails.css';

const ServiceDetails = ({ service, onBack, onBookAppointment }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingWizard, setShowBookingWizard] = useState(false);

  if (!service) {
    return <div className="service-details-error">Service not found</div>;
  }

  const iconMap = {
    FileText: FileText,
    Building2: Users,
    Car: Calendar,
    Shield: FileText,
    Map: MapPin,
    Heart: FileText,
    Plane: FileText,
    Receipt: FileText
  };

  const IconComponent = iconMap[service.icon] || FileText;

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return '#22c55e';
      case 'limited': return '#f59e0b';
      case 'unavailable': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAvailabilityText = (availability) => {
    switch (availability) {
      case 'available': return 'Available Now';
      case 'limited': return 'Limited Availability';
      case 'unavailable': return 'Currently Unavailable';
      default: return 'Unknown Status';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'officers', label: 'Officers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: MessageCircle }
  ];

  return (
    <div className="service-details">
      {/* Header Section */}
      <div className="service-details-header">
        <button 
          className="back-button"
          onClick={onBack}
          aria-label="Go back to service directory"
        >
          <ArrowLeft size={20} />
          <span>Back to Services</span>
        </button>

        <div className="service-header-content">
          <div className="service-header-main">
            <div className="service-icon-wrapper">
              <IconComponent className="service-icon" size={48} />
            </div>
            
            <div className="service-header-info">
              <h1 className="service-title">{service.name}</h1>
              <p className="service-department">{service.department}</p>
              <p className="service-description">{service.detailedDescription || service.description}</p>
              
              <div className="service-meta">
                <div className="service-meta-item">
                  <Clock size={16} />
                  <span>{service.duration}</span>
                </div>
                <div className="service-meta-item">
                  <DollarSign size={16} />
                  <span>Rs. {service.fee.toLocaleString()}</span>
                </div>
                <div className="service-meta-item">
                  <MapPin size={16} />
                  <span>{service.location}</span>
                </div>
                <div className="service-meta-item">
                  <Star size={16} className="star-icon" />
                  <span>{service.rating}/5</span>
                </div>
              </div>

              <div className="service-availability">
                <div 
                  className="availability-indicator"
                  style={{ backgroundColor: getAvailabilityColor(service.availability) }}
                ></div>
                <span className="availability-text">
                  {getAvailabilityText(service.availability)}
                </span>
              </div>
            </div>
          </div>

          <div className="service-header-actions">
            <button 
              className="appointment-button"
              onClick={() => setShowBookingWizard(true)}
              disabled={service.availability === 'unavailable'}
            >
              <Calendar size={20} />
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="service-details-tabs">
        <div className="tabs-container">
          {tabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <TabIcon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="service-details-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-section">
              <h3>Service Description</h3>
              <p>{service.detailedDescription || service.description}</p>
            </div>
            
            <div className="overview-stats">
              <div className="stat-card">
                <Clock className="stat-icon" />
                <div>
                  <span className="stat-label">Processing Time</span>
                  <span className="stat-value">{service.duration}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <DollarSign className="stat-icon" />
                <div>
                  <span className="stat-label">Service Fee</span>
                  <span className="stat-value">Rs. {service.fee.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="stat-card">
                <Star className="stat-icon" />
                <div>
                  <span className="stat-label">User Rating</span>
                  <span className="stat-value">{service.rating}/5</span>
                </div>
              </div>
              
              <div className="stat-card">
                <MapPin className="stat-icon" />
                <div>
                  <span className="stat-label">Location</span>
                  <span className="stat-value">{service.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <RequiredDocuments documents={service.requiredDocuments || []} />
        )}

        {activeTab === 'fees' && (
          <FeeBreakdown feeBreakdown={service.feeBreakdown} totalFee={service.fee} />
        )}

        {activeTab === 'officers' && (
          <OfficerProfiles officers={service.officers || []} />
        )}

        {activeTab === 'reviews' && (
          <ServiceReviews 
            reviews={service.reviews || []} 
            averageRating={service.rating}
            totalReviews={service.reviews?.length || 0}
          />
        )}
      </div>

      {/* Booking Wizard Modal */}
      {showBookingWizard && (
        <BookingWizard
          service={service}
          onClose={() => setShowBookingWizard(false)}
          onComplete={(bookingData) => {
            console.log('Booking completed:', bookingData);
            setShowBookingWizard(false);
            // Here you would typically send the booking data to your backend
            alert(`Booking confirmed! Booking ID: ${bookingData.bookingId}`);
            if (onBookAppointment) {
              onBookAppointment(bookingData);
            }
          }}
        />
      )}
    </div>
  );
};

export default ServiceDetails;
