import React, { useState, useMemo } from 'react';
import ServiceDirectoryHeader from './ServiceDirectoryHeader';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import ServiceList from './ServiceList';
import { 
  mockServices, 
  recentlyViewedServices, 
  serviceCategories,
  searchSuggestions,
  serviceDepartments,
  serviceLocations
} from '../../data/mockServices';
import '../../styles/ServiceDirectory.css';

const ServiceDirectory = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    field: 'name',
    direction: 'asc'
  });
  const [advancedFilters, setAdvancedFilters] = useState({
    departments: [],
    locations: [],
    feeRange: { min: 0, max: 10000 },
    availability: []
  });

  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleAdvancedFiltersChange = (newFilters) => {
    setAdvancedFilters(newFilters);
  };

  const handleSortChange = (newSortConfig) => {
    setSortConfig(newSortConfig);
  };

  // Parse duration string to minutes for comparison
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

  // Sort function
  const sortServices = (services) => {
    return [...services].sort((a, b) => {
      const { field, direction } = sortConfig;
      let comparison = 0;

      switch (field) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'fee':
          comparison = a.fee - b.fee;
          break;
        case 'duration':
          const aDuration = parseDuration(a.duration);
          const bDuration = parseDuration(b.duration);
          comparison = aDuration - bDuration;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'popular':
          // Sort popular items first (true > false)
          comparison = (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
          break;
        default:
          comparison = 0;
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Filter and sort services based on all criteria
  const filteredAndSortedServices = useMemo(() => {
    let filtered = mockServices;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower) ||
        service.department.toLowerCase().includes(searchLower) ||
        service.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => 
        service.category.toLowerCase() === selectedCategory
      );
    }

    // Apply department filter
    if (advancedFilters.departments.length > 0) {
      filtered = filtered.filter(service =>
        advancedFilters.departments.includes(service.department)
      );
    }

    // Apply location filter
    if (advancedFilters.locations.length > 0) {
      filtered = filtered.filter(service =>
        advancedFilters.locations.includes(service.location)
      );
    }

    // Apply availability filter
    if (advancedFilters.availability.length > 0) {
      filtered = filtered.filter(service =>
        advancedFilters.availability.includes(service.availability)
      );
    }

    // Apply fee range filter
    const { min, max } = advancedFilters.feeRange;
    if (min > 0 || max < 10000) {
      filtered = filtered.filter(service =>
        service.fee >= min && service.fee <= max
      );
    }

    // Apply sorting
    return sortServices(filtered);
  }, [searchTerm, selectedCategory, advancedFilters, sortConfig]);

  // Calculate service counts for each category
  const serviceCounts = useMemo(() => {
    const counts = { all: mockServices.length };
    
    serviceCategories.forEach(category => {
      if (category.id !== 'all') {
        counts[category.id] = mockServices.filter(service => 
          service.category.toLowerCase() === category.id
        ).length;
      }
    });

    return counts;
  }, []);

  // Filter popular services based on current filters
  const filteredPopularServices = useMemo(() => {
    return sortServices(filteredAndSortedServices.filter(service => service.popular));
  }, [filteredAndSortedServices]);

  // Filter recently viewed services based on current filters  
  const filteredRecentlyViewed = useMemo(() => {
    const filtered = recentlyViewedServices.filter(service => {
      // Apply same filters as main services
      let matches = true;
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        matches = matches && (
          service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.department.toLowerCase().includes(searchLower) ||
          service.category.toLowerCase().includes(searchLower)
        );
      }
      
      if (selectedCategory !== 'all') {
        matches = matches && (service.category.toLowerCase() === selectedCategory);
      }

      // Apply advanced filters
      if (advancedFilters.departments.length > 0) {
        matches = matches && advancedFilters.departments.includes(service.department);
      }

      if (advancedFilters.locations.length > 0) {
        matches = matches && advancedFilters.locations.includes(service.location);
      }

      if (advancedFilters.availability.length > 0) {
        matches = matches && advancedFilters.availability.includes(service.availability);
      }

      const { min, max } = advancedFilters.feeRange;
      if (min > 0 || max < 10000) {
        matches = matches && (service.fee >= min && service.fee <= max);
      }
      
      return matches;
    });

    return sortServices(filtered);
  }, [searchTerm, selectedCategory, advancedFilters, sortConfig]);

  const hasActiveFilters = searchTerm || 
                          selectedCategory !== 'all' ||
                          advancedFilters.departments.length > 0 ||
                          advancedFilters.locations.length > 0 ||
                          advancedFilters.availability.length > 0 ||
                          advancedFilters.feeRange.min > 0 ||
                          advancedFilters.feeRange.max < 10000;

  const totalResults = filteredAndSortedServices.length;

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortConfig({ field: 'name', direction: 'asc' });
    setAdvancedFilters({
      departments: [],
      locations: [],
      feeRange: { min: 0, max: 10000 },
      availability: []
    });
  };

  return (
    <div className="service-directory">
      <ServiceDirectoryHeader 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalServices={mockServices.length}
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
        categories={serviceCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        serviceCounts={serviceCounts}
        departments={serviceDepartments}
        locations={serviceLocations}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={handleAdvancedFiltersChange}
      />

      {/* Sort Dropdown - only show when there are results */}
      {totalResults > 0 && (
        <SortDropdown
          currentSort={sortConfig}
          onSortChange={handleSortChange}
          totalResults={totalResults}
        />
      )}

      {/* Filter Results Info */}
      {hasActiveFilters && (
        <div className="filter-results-info">
          <span className="filter-results-text">
            Showing <span className="filter-results-count">{totalResults}</span> service{totalResults !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== 'all' && ` in ${serviceCategories.find(c => c.id === selectedCategory)?.name}`}
          </span>
          <button 
            className="filter-clear-btn"
            onClick={clearAllFilters}
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Show sections based on active filters */}
      {!hasActiveFilters && (
        <>
          {/* Recently Viewed Section - only show if no filters active */}
          {recentlyViewedServices.length > 0 && (
            <ServiceList 
              services={sortServices(recentlyViewedServices)}
              viewMode={viewMode}
              title="Recently Viewed"
              maxItems={3}
            />
          )}

          {/* Popular Services Section - only show if no filters active */}
          <ServiceList 
            services={sortServices(mockServices.filter(s => s.popular))}
            viewMode={viewMode}
            title="Popular Services"
            maxItems={4}
          />
        </>
      )}

      {/* Filtered sections when filters are active */}
      {hasActiveFilters && filteredRecentlyViewed.length > 0 && (
        <ServiceList 
          services={filteredRecentlyViewed}
          viewMode={viewMode}
          title="Recently Viewed (Filtered)"
          maxItems={3}
        />
      )}

      {hasActiveFilters && filteredPopularServices.length > 0 && (
        <ServiceList 
          services={filteredPopularServices}
          viewMode={viewMode}
          title="Popular Services (Filtered)"
          maxItems={4}
        />
      )}

      {/* All Services Section - always show filtered and sorted results */}
      <ServiceList 
        services={filteredAndSortedServices}
        viewMode={viewMode}
        title={hasActiveFilters ? "Filtered Results" : "All Services"}
        showAll={true}
      />

      {/* No results message */}
      {totalResults === 0 && (
        <div className="no-results">
          <h3>No services found</h3>
          <p>Try adjusting your search terms or filter criteria.</p>
          <button className="reset-filters-btn" onClick={clearAllFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceDirectory;
