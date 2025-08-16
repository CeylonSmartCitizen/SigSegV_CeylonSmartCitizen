import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useBooking } from '../../contexts/BookingContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function AppointmentBooking() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  const {
    services,
    createAppointment,
    getAvailableSlots,
    updateBookingData,
    bookingData,
    loading
  } = useBooking()

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm({
    defaultValues: bookingData
  })

  const watchedDate = watch('date')

  useEffect(() => {
    if (serviceId) {
      const service = services.find(s => s.id === serviceId)
      if (service) {
        setSelectedService(service)
        setValue('serviceId', serviceId)
        updateBookingData({ serviceId })
      }
    }
  }, [serviceId, services])

  useEffect(() => {
    if (selectedService && watchedDate) {
      loadAvailableSlots()
    }
  }, [selectedService, watchedDate])

  const loadAvailableSlots = async () => {
    if (!selectedService || !watchedDate) return

    setLoadingSlots(true)
    try {
      const slots = await getAvailableSlots(selectedService.id, watchedDate)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Error loading slots:', error)
      showToast({
        type: 'error',
        message: 'Failed to load available time slots'
      })
    } finally {
      setLoadingSlots(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      const result = await createAppointment(data)
      
      if (result.success) {
        showToast({
          type: 'success',
          message: t('success.appointmentBooked')
        })
        navigate('/appointments')
      } else {
        showToast({
          type: 'error',
          message: result.error
        })
      }
    } catch (error) {
      console.error('Booking error:', error)
      showToast({
        type: 'error',
        message: 'Failed to book appointment'
      })
    }
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const steps = [
    { number: 1, title: 'Select Service', icon: DocumentTextIcon },
    { number: 2, title: 'Choose Date & Time', icon: CalendarDaysIcon },
    { number: 3, title: 'Confirm Details', icon: UserIcon }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex items-center justify-center">
            <ol className="flex items-center space-x-5">
              {steps.map((step, index) => {
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                
                return (
                  <li key={step.number} className="flex items-center">
                    {index > 0 && (
                      <div className={`flex-auto border-t-2 transition duration-200 ease-in-out ${
                        isCompleted ? 'border-blue-600' : 'border-gray-300'
                      }`} />
                    )}
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition duration-200 ease-in-out ${
                      isActive ? 'bg-blue-600 text-white' :
                      isCompleted ? 'bg-blue-600 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-blue-600' :
                      isCompleted ? 'text-blue-600' :
                      'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Service
                </h3>
                
                {!serviceId ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          selectedService?.id === service.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => {
                          setSelectedService(service)
                          setValue('serviceId', service.id)
                          updateBookingData({ serviceId: service.id })
                        }}
                      >
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-blue-600">Fee: Rs. {service.fee}</span>
                          <span className="text-sm text-gray-500">{service.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                    <h4 className="font-medium text-gray-900">{selectedService?.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedService?.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-blue-600">Fee: Rs. {selectedService?.fee}</span>
                      <span className="text-sm text-gray-500">{selectedService?.duration}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!selectedService}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Choose Date & Time
                </h3>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Date
                  </label>
                  <input
                    {...register('date', { required: 'Date is required' })}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                {/* Time Selection */}
                {watchedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Time
                    </label>
                    {loadingSlots ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {availableSlots.map((slot) => (
                          <label
                            key={slot.time}
                            className="relative flex cursor-pointer rounded-lg border p-3 focus:outline-none"
                          >
                            <input
                              {...register('time', { required: 'Time is required' })}
                              type="radio"
                              value={slot.time}
                              className="sr-only"
                              aria-labelledby={`time-${slot.time}`}
                            />
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <span
                                  id={`time-${slot.time}`}
                                  className="block text-sm font-medium text-gray-900"
                                >
                                  {slot.time}
                                </span>
                                <span className="mt-1 flex items-center text-sm text-gray-500">
                                  Available
                                </span>
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No available slots for this date
                      </p>
                    )}
                    {errors.time && (
                      <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!watchedDate || !watch('time')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Confirm Your Appointment
                </h3>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Service</h4>
                    <p className="text-gray-600">{selectedService?.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Date & Time</h4>
                    <p className="text-gray-600">
                      {watchedDate && new Date(watchedDate).toLocaleDateString()} at {watch('time')}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Fee</h4>
                    <p className="text-gray-600">Rs. {selectedService?.fee}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any special requirements or notes..."
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Previous
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <LoadingSpinner size="small" color="white" /> : 'Book Appointment'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
