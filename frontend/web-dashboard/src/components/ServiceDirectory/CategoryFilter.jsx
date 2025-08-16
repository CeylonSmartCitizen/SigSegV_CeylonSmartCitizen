import React from 'react';
import { 
  Grid3x3, 
  FileText, 
  Building2, 
  Car, 
  Map, 
  Plane, 
  Receipt,
  Check
} from 'lucide-react';
import '../../styles/CategoryFilter.css';

const iconMap = {
  Grid3x3,
  FileText,
  Building2,
  Car,
  Map,
  Plane,
  Receipt
};

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  showCounts = true,
  serviceCounts = {}
}) => {
  return (
    <div className="category-filter">
      <h3 className="category-filter-title">Categories</h3>
      
      <div className="category-list">
        {categories.map((category) => {
          const IconComponent = iconMap[category.icon] || Grid3x3;
          const isSelected = selectedCategory === category.id;
          const count = serviceCounts[category.id] || 0;
          
          return (
            <button
              key={category.id}
              className={`category-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onCategoryChange(category.id)}
            >
              <div className="category-icon">
                <IconComponent size={20} />
              </div>
              
              <div className="category-content">
                <span className="category-name">{category.name}</span>
                {showCounts && (
                  <span className="category-count">({count})</span>
                )}
              </div>
              
              {isSelected && (
                <div className="category-selected-indicator">
                  <Check size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
