import React from 'react';
import { Users, FileText, Clock, Star } from 'lucide-react';
import ViewToggle from './ViewToggle';
import '../../styles/ServiceDirectoryHeader.css';

const ServiceDirectoryHeader = ({ 
  viewMode, 
  onViewModeChange, 
  totalServices, 
  showViewToggle = true 
}) => {
  const stats = [
    { icon: FileText, label: 'Services Available', value: totalServices },
    { icon: Users, label: 'Active Users', value: '12.5K' },
    { icon: Clock, label: 'Avg Processing', value: '7 days' },
    { icon: Star, label: 'User Rating', value: '4.3' }
  ];

  return (
    <div className="service-directory-header">
      <div className="header-content">
        <div className="header-text">
          <h1>Ceylon Smart Citizen Services</h1>
          <p>Access government services online with ease and transparency</p>
        </div>
        
        {showViewToggle && (
          <div className="header-controls">
            <ViewToggle 
              viewMode={viewMode} 
              onViewModeChange={onViewModeChange} 
            />
          </div>
        )}
      </div>
      
      <div className="service-stats">
        {stats.map((stat, index) => (
          <div key={index} className="stat-item">
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceDirectoryHeader;
