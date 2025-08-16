import React from 'react';
import { 
  User, 
  Star, 
  Clock, 
  Award,
  Mail,
  Phone
} from 'lucide-react';
import '../../styles/OfficerProfiles.css';

const OfficerProfiles = ({ officers = [] }) => {
  if (officers.length === 0) {
    return (
      <div className="officers-empty">
        <User size={48} className="empty-icon" />
        <h3>No officer information available</h3>
        <p>Officer details will be assigned when you book an appointment.</p>
      </div>
    );
  }

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star filled" size={14} />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="star half" size={14} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star empty" size={14} />);
    }

    return stars;
  };

  const getExperienceLevel = (experience) => {
    const years = parseInt(experience);
    if (years < 2) return { level: 'Junior', color: '#3b82f6' };
    if (years < 5) return { level: 'Mid-level', color: '#10b981' };
    if (years < 10) return { level: 'Senior', color: '#f59e0b' };
    return { level: 'Expert', color: '#8b5cf6' };
  };

  return (
    <div className="officer-profiles">
      <div className="officers-header">
        <h2>Assigned Officers</h2>
        <p>Meet the qualified officers who will handle your service request</p>
      </div>

      <div className="officers-stats">
        <div className="stat-item">
          <User className="stat-icon" size={20} />
          <div>
            <span className="stat-number">{officers.length}</span>
            <span className="stat-label">Available Officers</span>
          </div>
        </div>
        
        <div className="stat-item">
          <Star className="stat-icon" size={20} />
          <div>
            <span className="stat-number">
              {(officers.reduce((sum, officer) => sum + officer.rating, 0) / officers.length).toFixed(1)}
            </span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>

        <div className="stat-item">
          <Clock className="stat-icon" size={20} />
          <div>
            <span className="stat-number">
              {Math.round(officers.reduce((sum, officer) => sum + parseInt(officer.experience), 0) / officers.length)}
            </span>
            <span className="stat-label">Avg. Experience (years)</span>
          </div>
        </div>
      </div>

      <div className="officers-grid">
        {officers.map(officer => {
          const experienceInfo = getExperienceLevel(officer.experience);
          
          return (
            <div key={officer.id} className="officer-card">
              <div className="officer-header">
                <div className="officer-avatar">
                  <span className="avatar-text">{officer.avatar}</span>
                </div>
                
                <div className="officer-info">
                  <h3 className="officer-name">{officer.name}</h3>
                  <p className="officer-designation">{officer.designation}</p>
                  
                  <div className="officer-rating">
                    <div className="rating-stars">
                      {renderStars(officer.rating)}
                    </div>
                    <span className="rating-value">{officer.rating}/5</span>
                  </div>
                </div>
              </div>

              <div className="officer-details">
                <div className="detail-item">
                  <Clock className="detail-icon" size={16} />
                  <span className="detail-label">Experience:</span>
                  <span className="detail-value">{officer.experience}</span>
                </div>

                <div className="detail-item">
                  <Award className="detail-icon" size={16} />
                  <span className="detail-label">Level:</span>
                  <span 
                    className="experience-level"
                    style={{ color: experienceInfo.color }}
                  >
                    {experienceInfo.level}
                  </span>
                </div>
              </div>

              <div className="officer-actions">
                <button className="action-button contact-button">
                  <Mail size={16} />
                  Contact
                </button>
                <button className="action-button profile-button">
                  <User size={16} />
                  View Profile
                </button>
              </div>

              <div className="officer-availability">
                <div className="availability-indicator available"></div>
                <span className="availability-text">Available for appointments</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="officers-info">
        <h4>Officer Assignment Process</h4>
        <div className="info-content">
          <ul>
            <li>Officers are assigned based on availability and expertise</li>
            <li>You can request a specific officer when booking</li>
            <li>Officer contact details will be shared after booking confirmation</li>
            <li>All officers are trained and certified for this service</li>
          </ul>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics">
        <h4>Officer Performance Metrics</h4>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">98%</div>
            <div className="metric-label">Success Rate</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">4.2</div>
            <div className="metric-label">Avg Response Time (hrs)</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">95%</div>
            <div className="metric-label">Customer Satisfaction</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfiles;
