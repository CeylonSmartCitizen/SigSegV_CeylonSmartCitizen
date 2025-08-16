import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  GlobeAltIcon,
  StarIcon,
  CalendarIcon,
  DocumentTextIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

export default function ServiceDetails() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState([])
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (serviceId) {
      loadServiceDetails()
    }
  }, [serviceId])

  const loadServiceDetails = async () => {
    try {
      setLoading(true)
      
      const [serviceResponse, reviewsResponse] = await Promise.all([
        supportAPI.getServiceDetails(serviceId),
        supportAPI.getServiceReviews(serviceId)
      ])
      
      if (serviceResponse.data.success) {
        setService(serviceResponse.data.data)
      } else {
        showToast({
          type: 'error',
          message: 'Service not found'
        })
        navigate('/services')
      }
      
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data)
      }
    } catch (error) {
      console.error('Error loading service details:', error)
      showToast({
        type: 'error',
        message: 'Failed to load service details'
      })
      navigate('/services')
    } finally {
      setLoading(false)
    }
  }

  const renderRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <StarIcon className="w-5 h-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <StarIconSolid className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      )
    }

    return stars
  }

  const getServiceStatus = () => {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes()

    if (service?.hours?.includes('24/7')) {
      return { status: 'open', text: 'Open 24/7', color: 'text-green-600' }
    }

    if (currentDay >= 1 && currentDay <= 5 && currentTime >= 800 && currentTime <= 1700) {
      return { status: 'open', text: 'Open Now', color: 'text-green-600' }
    }

    return { status: 'closed', text: 'Closed Now', color: 'text-red-600' }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const bookAppointment = () => {
    navigate('/appointments/book', { 
      state: { 
        serviceId: service.id, 
        serviceName: service.name 
      } 
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Service not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The service you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  const status = getServiceStatus()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/services')}
          className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
          <p className="mt-1 text-sm text-gray-500">{service.category_name}</p>
        </div>
      </div>

      {/* Service Overview Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            {/* Status */}
            <div className="flex items-center mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                status.status === 'open' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.text}
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-6">{service.description}</p>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {service.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{service.location}</span>
                </div>
              )}

              {service.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <a href={`tel:${service.phone}`} className="hover:text-blue-600">
                    {service.phone}
                  </a>
                </div>
              )}

              {service.hours && (
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <span>{service.hours}</span>
                </div>
              )}

              {service.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <GlobeAltIcon className="w-5 h-5 mr-2 text-gray-400" />
                  <a 
                    href={service.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {/* Rating */}
            {service.rating && (
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {renderRating(service.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {service.rating.toFixed(1)} out of 5 ({service.review_count || 0} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="lg:ml-8 mt-6 lg:mt-0">
            <div className="space-y-3">
              <button
                onClick={bookAppointment}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Book Appointment
              </button>
              
              {service.phone && (
                <button
                  onClick={() => window.open(`tel:${service.phone}`)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  Call Now
                </button>
              )}
              
              {service.website && (
                <button
                  onClick={() => window.open(service.website, '_blank')}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <GlobeAltIcon className="w-4 h-4 mr-2" />
                  Visit Website
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BuildingOfficeIcon },
              { id: 'services', name: 'Services', icon: DocumentTextIcon },
              { id: 'requirements', name: 'Requirements', icon: CheckCircleIcon },
              { id: 'reviews', name: 'Reviews', icon: StarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {service.detailed_description && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About This Service</h3>
                  <p className="text-gray-700">{service.detailed_description}</p>
                </div>
              )}

              {service.office_hours && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Office Hours</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {service.office_hours}
                    </pre>
                  </div>
                </div>
              )}

              {service.contact_person && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Person</h3>
                  <div className="flex items-center">
                    <UsersIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">{service.contact_person}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Services Offered</h3>
              {service.services_offered && service.services_offered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.services_offered.map((offering, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="text-gray-900">{offering}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific services listed.</p>
              )}
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements & Documents</h3>
              {service.requirements && service.requirements.length > 0 ? (
                <div className="space-y-3">
                  {service.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                      <span className="text-gray-900">{requirement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No specific requirements listed. Please contact the office for details.</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                {service.rating && (
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {renderRating(service.rating)}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {service.rating.toFixed(1)} average
                    </span>
                  </div>
                )}
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{review.user_name}</span>
                            <div className="ml-2 flex items-center">
                              {renderRating(review.rating)}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}

                  {reviews.length > 5 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review this service!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
