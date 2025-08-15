import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import '../../styles/SortDropdown.css';

const SortDropdown = ({ 
  currentSort = { field: 'name', direction: 'asc' },
  onSortChange,
  totalResults = 0
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sortOptions = [
    { 
      field: 'name', 
      direction: 'asc', 
      label: 'Name (A-Z)',
      icon: ArrowUp
    },
    { 
      field: 'name', 
      direction: 'desc', 
      label: 'Name (Z-A)',
      icon: ArrowDown
    },
    { 
      field: 'fee', 
      direction: 'asc', 
      label: 'Fee (Low to High)',
      icon: ArrowUp
    },
    { 
      field: 'fee', 
      direction: 'desc', 
      label: 'Fee (High to Low)',
      icon: ArrowDown
    },
    { 
      field: 'duration', 
      direction: 'asc', 
      label: 'Duration (Shortest First)',
      icon: ArrowUp
    },
    { 
      field: 'duration', 
      direction: 'desc', 
      label: 'Duration (Longest First)',
      icon: ArrowDown
    },
    { 
      field: 'rating', 
      direction: 'desc', 
      label: 'Rating (Highest First)',
      icon: ArrowDown
    },
    { 
      field: 'rating', 
      direction: 'asc', 
      label: 'Rating (Lowest First)',
      icon: ArrowUp
    },
    { 
      field: 'popular', 
      direction: 'desc', 
      label: 'Popular First',
      icon: ArrowDown
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current sort label
  const getCurrentSortLabel = () => {
    const currentOption = sortOptions.find(option => 
      option.field === currentSort.field && option.direction === currentSort.direction
    );
    return currentOption ? currentOption.label : 'Name (A-Z)';
  };

  // Handle sort selection
  const handleSortSelect = (option) => {
    onSortChange({
      field: option.field,
      direction: option.direction
    });
    setIsOpen(false);
  };

  // Convert duration string to minutes for comparison
  const parseDuration = (durationStr) => {
    const parts = durationStr.toLowerCase();
    if (parts.includes('day')) {
      const days = parseInt(parts.match(/\d+/)?.[0] || '0');
      return days * 24 * 60; // Convert to minutes
    }
    if (parts.includes('week')) {
      const weeks = parseInt(parts.match(/\d+/)?.[0] || '0');
      return weeks * 7 * 24 * 60; // Convert to minutes
    }
    if (parts.includes('month')) {
      const months = parseInt(parts.match(/\d+/)?.[0] || '0');
      return months * 30 * 24 * 60; // Convert to minutes (approximate)
    }
    if (parts.includes('hour')) {
      const hours = parseInt(parts.match(/\d+/)?.[0] || '0');
      return hours * 60; // Convert to minutes
    }
    if (parts.includes('minute')) {
      const minutes = parseInt(parts.match(/\d+/)?.[0] || '0');
      return minutes;
    }
    // Default: assume it's days if just a number
    return parseInt(parts.match(/\d+/)?.[0] || '1') * 24 * 60;
  };

  return (
    <div className="sort-dropdown" ref={dropdownRef}>
      <div className="sort-info">
        <span className="sort-results-count">
          {totalResults} result{totalResults !== 1 ? 's' : ''}
        </span>
        <span className="sort-separator">•</span>
        <span className="sort-label">Sort by:</span>
      </div>
      
      <div className="sort-dropdown-container">
        <button 
          className={`sort-dropdown-trigger ${isOpen ? 'sort-dropdown-trigger-open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <ArrowUpDown className="sort-icon" size={16} />
          <span className="sort-current-label">{getCurrentSortLabel()}</span>
          <ChevronDown 
            className={`sort-chevron ${isOpen ? 'sort-chevron-open' : ''}`} 
            size={16} 
          />
        </button>

        {isOpen && (
          <div className="sort-dropdown-menu" role="listbox">
            {sortOptions.map((option, index) => {
              const IconComponent = option.icon;
              const isSelected = currentSort.field === option.field && 
                               currentSort.direction === option.direction;
              
              return (
                <button
                  key={`${option.field}-${option.direction}`}
                  className={`sort-dropdown-item ${isSelected ? 'sort-dropdown-item-selected' : ''}`}
                  onClick={() => handleSortSelect(option)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <IconComponent className="sort-option-icon" size={14} />
                  <span className="sort-option-label">{option.label}</span>
                  {isSelected && (
                    <div className="sort-selected-indicator">✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown;
