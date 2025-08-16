import React from 'react';
import { 
  FileText, 
  Building2, 
  Car, 
  Shield, 
  Map, 
  Heart, 
  Plane, 
  Receipt,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import '../../styles/ServiceCard.css';

const iconMap = {
  FileText,
  Building2,
  Car,
  Shield,
  Map,
  Heart,
  Plane,
  Receipt
};

const ServiceCard = ({ service, viewMode = 'grid', onViewDetails }) => {
  const IconComponent = iconMap[service.icon] || FileText;

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'available': return '#22c55e';
      case 'limited': return '#f59e0b';
      case 'unavailable': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatFee = (fee) => {
    return fee === 0 ? 'Free' : `LKR ${fee.toLocaleString()}`;
  };

  return (
    <div className={`service-card ${viewMode}`}>
      <div className="service-card-header">
        <div className="service-icon">
          <IconComponent size={viewMode === 'grid' ? 24 : 20} />
        </div>
        <div className="service-status">
          <div 
            className="availability-indicator"
            style={{ backgroundColor: getAvailabilityColor(service.availability) }}
          />
        </div>
      </div>

      <div className="service-content">
        <div className="service-main-info">
          <h3 className="service-name">{service.name}</h3>
          <p className="service-department">{service.department}</p>
          {viewMode === 'list' && (
            <p className="service-description">{service.description}</p>
          )}
        </div>

        <div className="service-details">
          <div className="service-meta">
            <div className="meta-item">
              <DollarSign size={16} />
              <span>{formatFee(service.fee)}</span>
            </div>
            <div className="meta-item">
              <Clock size={16} />
              <span>{service.duration}</span>
            </div>
            {service.rating && (
              <div className="meta-item rating">
                <Star size={16} fill="currentColor" />
                <span>{service.rating}</span>
              </div>
            )}
          </div>

          <div className="service-tags">
            <span className="category-tag">{service.category}</span>
            {service.popular && (
              <span className="popular-tag">Popular</span>
            )}
          </div>
        </div>
      </div>

      {viewMode === 'grid' && (
        <div className="service-footer">
          <button 
            className="service-action-btn secondary"
            onClick={() => onViewDetails?.(service)}
          >
            View Details
          </button>
          <button className="service-action-btn primary">
            Apply Now
          </button>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="service-list-actions">
          <button className="service-action-btn primary">
            Apply Now
          </button>
          <button 
            className="service-action-btn secondary"
            onClick={() => onViewDetails?.(service)}
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceCard;
