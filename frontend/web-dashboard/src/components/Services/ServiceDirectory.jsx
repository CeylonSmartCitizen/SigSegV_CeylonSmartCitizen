import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  PhoneIcon,
  GlobeAltIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function ServiceDirectory() {
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')

  const locations = [
    'All Locations',
    'Colombo',
    'Gampaha',
    'Kalutara',
    'Kandy',
    'Matale',
    'Nuwara Eliya',
    'Galle',
    'Matara',
    'Hambantota',
    'Jaffna',
    'Kilinochchi',
    'Mannar',
    'Vavuniya',
    'Mullaitivu',
    'Batticaloa',
    'Ampara',
    'Trincomalee',
    'Kurunegala',
    'Puttalam',
    'Anuradhapura',
    'Polonnaruwa',
    'Badulla',
    'Moneragala',
    'Ratnapura',
    'Kegalle'
  ]

  useEffect(() => {
    loadServicesAndCategories()
  }, [])

  const loadServicesAndCategories = async () => {
    try {
      setLoading(true)
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        supportAPI.getServices(),
        supportAPI.getServiceCategories()
      ])
      
      if (servicesResponse.data.success) {
        setServices(servicesResponse.data.data)
      }
      
      if (categoriesResponse.data.success) {
        setCategories([
          { id: '', name: 'All Categories', icon: 'all' },
          ...categoriesResponse.data.data
        ])
      }
    } catch (error) {
      console.error('Error loading services:', error)
      showToast({
        type: 'error',
        message: 'Failed to load services'
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'government':
        return <BuildingOfficeIcon className="w-6 h-6" />
      case 'health':
        return <UserGroupIcon className="w-6 h-6" />
      case 'education':
        return <BuildingOfficeIcon className="w-6 h-6" />
      case 'transport':
        return <BuildingOfficeIcon className="w-6 h-6" />
      case 'legal':
        return <BuildingOfficeIcon className="w-6 h-6" />
      case 'social':
        return <UserGroupIcon className="w-6 h-6" />
      default:
        return <BuildingOfficeIcon className="w-6 h-6" />
    }
  }

  const renderRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-4 h-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      )
    }

    return stars
  }

  const formatHours = (hours) => {
    if (!hours) return 'Hours not available'
    return hours
  }

  const getServiceStatus = (service) => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentTime = now.getHours() * 100 + now.getMinutes() // HHMM format

    // This is a simplified implementation
    // In a real application, you'd parse the actual hours data
    if (service.hours && service.hours.includes('24/7')) {
      return { status: 'open', text: 'Open 24/7' }
    }

    // Default business hours assumption
    if (currentDay >= 1 && currentDay <= 5 && currentTime >= 800 && currentTime <= 1700) {
      return { status: 'open', text: 'Open Now' }
    }

    return { status: 'closed', text: 'Closed Now' }
  }

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || service.category_id === selectedCategory
    const matchesLocation = !selectedLocation || selectedLocation === 'All Locations' || 
                          service.location?.includes(selectedLocation)
    
    return matchesSearch && matchesCategory && matchesLocation
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('services.directory')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Discover government services and offices in your area
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      {!searchTerm && !selectedCategory && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(1).map(category => { // Skip "All Categories"
              const serviceCount = services.filter(s => s.category_id === category.id).length
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="text-blue-600 mb-2">
                    {getCategoryIcon(category.icon)}
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {serviceCount} services
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Services List */}
      <div className="bg-white shadow rounded-lg">
        {filteredServices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredServices.map((service) => {
              const status = getServiceStatus(service)
              
              return (
                <div key={service.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Service Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        </div>
                        
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status.status === 'open' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status.text}
                          </span>
                        </div>
                      </div>

                      {/* Service Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {service.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{service.location}</span>
                          </div>
                        )}

                        {service.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <a href={`tel:${service.phone}`} className="hover:text-blue-600">
                              {service.phone}
                            </a>
                          </div>
                        )}

                        {service.hours && (
                          <div className="flex items-center text-sm text-gray-600">
                            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <span>{formatHours(service.hours)}</span>
                          </div>
                        )}

                        {service.website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                            <a 
                              href={service.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 truncate"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Rating and Reviews */}
                      {service.rating && (
                        <div className="flex items-center mt-3">
                          <div className="flex items-center">
                            {renderRating(service.rating)}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {service.rating.toFixed(1)} ({service.review_count || 0} reviews)
                          </span>
                        </div>
                      )}

                      {/* Services Offered */}
                      {service.services_offered && service.services_offered.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {service.services_offered.slice(0, 3).map((offering, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {offering}
                              </span>
                            ))}
                            {service.services_offered.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                +{service.services_offered.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => {
                          // Navigate to service details
                          window.location.href = `/services/${service.id}`
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        View Details
                        <ChevronRightIcon className="ml-1 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory || (selectedLocation && selectedLocation !== 'All Locations')
                ? 'Try adjusting your search or filters.'
                : 'No services are currently available.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {services.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredServices.length}
              </div>
              <div className="text-sm text-gray-500">
                {searchTerm || selectedCategory || selectedLocation ? 'Filtered' : 'Total'} Services
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredServices.filter(s => getServiceStatus(s).status === 'open').length}
              </div>
              <div className="text-sm text-gray-500">Open Now</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {categories.length - 1}
              </div>
              <div className="text-sm text-gray-500">Categories</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(services.map(s => s.location)).size}
              </div>
              <div className="text-sm text-gray-500">Locations</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
