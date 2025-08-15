import React from 'react';
import ServiceCard from './ServiceCard';
import '../../styles/ServiceList.css';

const ServiceList = ({ services, viewMode, title, showAll = false, maxItems = null }) => {
  const displayServices = maxItems && !showAll ? services.slice(0, maxItems) : services;
  
  return (
    <div className="service-list-section">
      {title && (
        <div className="service-list-header">
          <h2 className="service-list-title">{title}</h2>
          {maxItems && services.length > maxItems && !showAll && (
            <button className="view-all-btn">
              View All ({services.length})
            </button>
          )}
        </div>
      )}
      
      <div className={`service-container ${viewMode}`}>
        {displayServices.map(service => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            viewMode={viewMode} 
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceList;
