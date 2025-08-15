import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import AdvancedFilters from './AdvancedFilters';
import '../../styles/FilterBar.css';

const FilterBar = ({ 
  searchTerm,
  onSearch,
  searchSuggestions,
  categories,
  selectedCategory,
  onCategoryChange,
  serviceCounts,
  // Advanced filters props
  departments,
  locations,
  advancedFilters,
  onAdvancedFiltersChange,
  layout = 'default' // 'default', 'compact'
}) => {
  return (
    <div className={`filter-bar ${layout}`}>
      <div className="filter-section search-section">
        <SearchBar
          onSearch={onSearch}
          suggestions={searchSuggestions}
          placeholder="Search services, departments, or keywords..."
        />
      </div>
      
      <div className="filter-section category-section">
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          serviceCounts={serviceCounts}
          showCounts={true}
        />
      </div>

      <div className="filter-section advanced-section">
        <AdvancedFilters
          departments={departments}
          locations={locations}
          onFiltersChange={onAdvancedFiltersChange}
          initialFilters={advancedFilters}
        />
      </div>
    </div>
  );
};

export default FilterBar;
