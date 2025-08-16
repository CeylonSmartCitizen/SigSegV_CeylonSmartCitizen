import React, { useState, useMemo, useEffect } from 'react';
import ServiceDirectoryHeader from './ServiceDirectoryHeader';
import FilterBar from './FilterBar';
import SortDropdown from './SortDropdown';
import ServiceList from './ServiceList';
import ServiceDetails from './ServiceDetails';
import BookingSuccessNotification from '../booking/BookingSuccessNotification';
import ErrorBoundary, { withErrorBoundary } from '../common/ErrorBoundary';
import { LoadingSpinner, ServiceListSkeleton } from '../common/LoadingStates';
import { useNotifications } from '../common/NotificationSystem';
import { useBooking } from '../../api/booking';
import { ServiceDataManager } from '../../api/serviceDataManager';
import { DataSyncManager } from '../../api/dataSyncManager';
import { ErrorHandler } from '../../api/errorHandling';
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
  const [selectedService, setSelectedService] = useState(null);
  const [completedBooking, setCompletedBooking] = useState(null);
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

  // API Integration State
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Hooks
  const { showSuccess, showError, showNetworkError } = useNotifications();
  const { submitBooking } = useBooking();

  // Initialize API managers
  const serviceDataManager = useMemo(() => new ServiceDataManager(), []);
  const dataSyncManager = useMemo(() => new DataSyncManager(), []);
  const errorHandler = useMemo(() => new ErrorHandler(), []);

  // Load services on component mount
  useEffect(() => {
    loadServices();
    setupDataSync();
    
    // Subscribe to error notifications
    const unsubscribe = errorHandler.subscribe((error) => {
      if (error.category === 'network') {
        showNetworkError(error, {
          onRetry: () => loadServices()
        });
      } else {
        showError(error.userMessage || error.message, {
          title: 'Service Error',
          onRetry: error.retryable ? () => loadServices() : undefined
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Load services from API with fallback to mock data
  const loadServices = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      // Try to load from API first
      let loadedServices = [];
      try {
        const apiServices = await serviceDataManager.getServiceDirectory();
        loadedServices = apiServices;
      } catch (apiError) {
        console.warn('API service loading failed, using mock data:', apiError);
        // Fallback to mock data for development
        loadedServices = mockServices;
      }

      setServices(loadedServices);
      setLastSync(new Date());
      
      if (!showLoadingState) {
        showSuccess('Services updated successfully', {
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      setError(error);
      errorHandler.handleError(error, { context: 'loadServices' });
      
      // Fallback to mock data on error
      setServices(mockServices);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Setup data synchronization
  const setupDataSync = async () => {
    try {
      await dataSyncManager.initialize();
      
      // Listen for sync updates
      dataSyncManager.subscribe('services', (updatedServices) => {
        setServices(updatedServices);
        setLastSync(new Date());
        showSuccess('Services synchronized', { duration: 2000 });
      });

      // Start periodic sync
      dataSyncManager.startPeriodicSync('services', 5 * 60 * 1000); // 5 minutes
    } catch (error) {
      console.warn('Data sync setup failed:', error);
      // Continue without sync if it fails
    }
  };

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

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleBackToDirectory = () => {
    setSelectedService(null);
  };

  const handleBookingComplete = async (bookingData) => {
    try {
      console.log('Processing booking completion:', bookingData);
      
      // Submit booking through API
      const bookingResult = await submitBooking({
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        ...bookingData
      });

      // Show success notification with actions
      showSuccess(
        `Your appointment has been successfully booked for ${bookingData.date} at ${bookingData.time}`,
        {
          title: 'Booking Confirmed',
          actions: [
            {
              label: 'View Details',
              onClick: () => console.log('View booking details:', bookingResult)
            },
            {
              label: 'Add to Calendar',
              onClick: () => {
                // Create calendar event
                const event = {
                  title: `${selectedService?.name} Appointment`,
                  start: new Date(`${bookingData.date}T${bookingData.time}`),
                  description: `Appointment for ${selectedService?.name}\nReference: ${bookingResult.referenceNumber}`
                };
                console.log('Add to calendar:', event);
              }
            }
          ],
          duration: 8000
        }
      );

      setCompletedBooking({
        ...bookingData,
        service: selectedService,
        referenceNumber: bookingResult.referenceNumber
      });
      setSelectedService(null);

      // Refresh service availability
      if (selectedService?.id) {
        try {
          await serviceDataManager.refreshServiceAvailability(selectedService.id);
        } catch (error) {
          console.warn('Failed to refresh service availability:', error);
        }
      }
    } catch (error) {
      console.error('Booking completion failed:', error);
      errorHandler.handleError(error, { 
        context: 'booking',
        serviceId: selectedService?.id 
      });
    }
  };

  const handleCloseSuccessNotification = () => {
    setCompletedBooking(null);
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
    let filtered = services; // Use API services instead of mockServices

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
  }, [services, searchTerm, selectedCategory, advancedFilters, sortConfig]);

  // Calculate service counts for each category
  const serviceCounts = useMemo(() => {
    const counts = { all: services.length }; // Use API services instead of mockServices
    
    serviceCategories.forEach(category => {
      if (category.id !== 'all') {
        counts[category.id] = services.filter(service => 
          service.category.toLowerCase() === category.id
        ).length;
      }
    });

    return counts;
  }, [services]); // Update dependency

  // Handle refresh action
  const handleRefresh = () => {
    loadServices(false); // Don't show full loading state, just refresh
  };

  // Show loading skeleton while services are loading
  if (isLoading) {
    return (
      <div className="service-directory">
        <div className="service-directory-header">
          <LoadingSpinner size="large" />
          <p>Loading services...</p>
        </div>
        <ServiceListSkeleton count={12} />
      </div>
    );
  }

  // Show error state if services failed to load
  if (error && services.length === 0) {
    return (
      <ErrorBoundary
        componentName="ServiceDirectory"
        fallbackMessage="Unable to load services. Please check your connection and try again."
      >
        <div>Service loading failed</div>
      </ErrorBoundary>
    );
  }

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

  // Conditional rendering based on selected service
  if (selectedService) {
    return (
      <ErrorBoundary componentName="ServiceDetails">
        <ServiceDetails
          service={selectedService}
          onBack={handleBackToDirectory}
          onBookAppointment={handleBookingComplete}
        />
      </ErrorBoundary>
    );
  }

  return (
    <div className="service-directory">
      <ServiceDirectoryHeader 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        totalServices={services.length}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        lastSync={lastSync}
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
              onServiceSelect={handleServiceSelect}
            />
          )}

          {/* Popular Services Section - only show if no filters active */}
          <ServiceList 
            services={sortServices(mockServices.filter(s => s.popular))}
            viewMode={viewMode}
            title="Popular Services"
            maxItems={4}
            onServiceSelect={handleServiceSelect}
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
          onServiceSelect={handleServiceSelect}
        />
      )}

      {hasActiveFilters && filteredPopularServices.length > 0 && (
        <ServiceList 
          services={filteredPopularServices}
          viewMode={viewMode}
          title="Popular Services (Filtered)"
          maxItems={4}
          onServiceSelect={handleServiceSelect}
        />
      )}

      {/* All Services Section - always show filtered and sorted results */}
      <ServiceList 
        services={filteredAndSortedServices}
        viewMode={viewMode}
        title={hasActiveFilters ? "Filtered Results" : "All Services"}
        showAll={true}
        onServiceSelect={handleServiceSelect}
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

      {/* Success Notification */}
      {completedBooking && (
        <BookingSuccessNotification
          bookingData={completedBooking}
          onClose={handleCloseSuccessNotification}
        />
      )}
    </div>
  );
};

export default withErrorBoundary(ServiceDirectory, {
  componentName: 'ServiceDirectory',
  fallbackMessage: 'The service directory encountered an error. Please refresh the page to continue.',
  onError: (error, errorInfo) => {
    console.error('ServiceDirectory Error:', error, errorInfo);
    // In production, you would send this to an error tracking service
  }
});
