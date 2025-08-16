import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  X, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock,
  Check,
  Filter
} from 'lucide-react';
import '../../styles/AdvancedFilters.css';

const AdvancedFilters = ({
  departments,
  locations,
  onFiltersChange,
  initialFilters = {
    departments: [],
    locations: [],
    feeRange: { min: 0, max: 10000 },
    availability: []
  }
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const availabilityOptions = [
    { id: 'available', label: 'Available', color: '#22c55e' },
    { id: 'limited', label: 'Limited Availability', color: '#f59e0b' },
    { id: 'unavailable', label: 'Unavailable', color: '#ef4444' }
  ];

  const feeRanges = [
    { id: 'free', label: 'Free (LKR 0)', min: 0, max: 0 },
    { id: 'low', label: 'Low (LKR 1 - 1,000)', min: 1, max: 1000 },
    { id: 'medium', label: 'Medium (LKR 1,001 - 2,500)', min: 1001, max: 2500 },
    { id: 'high', label: 'High (LKR 2,501+)', min: 2501, max: 10000 }
  ];

  const handleDepartmentToggle = (department) => {
    const newDepartments = filters.departments.includes(department)
      ? filters.departments.filter(d => d !== department)
      : [...filters.departments, department];
    
    const newFilters = { ...filters, departments: newDepartments };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleLocationToggle = (location) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    
    const newFilters = { ...filters, locations: newLocations };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAvailabilityToggle = (availability) => {
    const newAvailability = filters.availability.includes(availability)
      ? filters.availability.filter(a => a !== availability)
      : [...filters.availability, availability];
    
    const newFilters = { ...filters, availability: newAvailability };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFeeRangeChange = (range) => {
    const newFilters = { ...filters, feeRange: range };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      departments: [],
      locations: [],
      feeRange: { min: 0, max: 10000 },
      availability: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return filters.departments.length + 
           filters.locations.length + 
           filters.availability.length +
           (filters.feeRange.min > 0 || filters.feeRange.max < 10000 ? 1 : 0);
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="advanced-filters">
      <button 
        className="advanced-filters-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Filter size={18} />
        <span>Advanced Filters</span>
        {activeCount > 0 && (
          <span className="filter-count-badge">{activeCount}</span>
        )}
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div className="advanced-filters-content">
          <div className="filters-header">
            <h3>Filter Services</h3>
            {activeCount > 0 && (
              <button className="clear-filters-btn" onClick={clearAllFilters}>
                <X size={16} />
                Clear All ({activeCount})
              </button>
            )}
          </div>

          <div className="filters-grid">
            {/* Department Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Building size={18} />
                <h4>Departments</h4>
              </div>
              <div className="filter-options">
                {departments.filter(dept => dept !== 'All Departments').map((department) => (
                  <label key={department} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.departments.includes(department)}
                      onChange={() => handleDepartmentToggle(department)}
                    />
                    <span className="checkbox-custom">
                      {filters.departments.includes(department) && <Check size={12} />}
                    </span>
                    <span className="filter-label">{department}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <MapPin size={18} />
                <h4>Locations</h4>
              </div>
              <div className="filter-options">
                {locations.filter(loc => loc !== 'All Locations').map((location) => (
                  <label key={location} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.locations.includes(location)}
                      onChange={() => handleLocationToggle(location)}
                    />
                    <span className="checkbox-custom">
                      {filters.locations.includes(location) && <Check size={12} />}
                    </span>
                    <span className="filter-label">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <Clock size={18} />
                <h4>Availability</h4>
              </div>
              <div className="filter-options">
                {availabilityOptions.map((option) => (
                  <label key={option.id} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.availability.includes(option.id)}
                      onChange={() => handleAvailabilityToggle(option.id)}
                    />
                    <span className="checkbox-custom">
                      {filters.availability.includes(option.id) && <Check size={12} />}
                    </span>
                    <div className="availability-option">
                      <div 
                        className="availability-dot" 
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="filter-label">{option.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Fee Range Filter */}
            <div className="filter-group">
              <div className="filter-group-header">
                <DollarSign size={18} />
                <h4>Fee Range</h4>
              </div>
              <div className="filter-options fee-ranges">
                {feeRanges.map((range) => (
                  <button
                    key={range.id}
                    className={`fee-range-btn ${
                      filters.feeRange.min === range.min && filters.feeRange.max === range.max 
                        ? 'selected' : ''
                    }`}
                    onClick={() => handleFeeRangeChange({ min: range.min, max: range.max })}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
