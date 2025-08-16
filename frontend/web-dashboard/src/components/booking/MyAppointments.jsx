import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBooking } from '../../contexts/BookingContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

export default function MyAppointments() {
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  const {
    appointments,
    cancelAppointment,
    getUpcomingAppointments,
    getAppointmentHistory,
    loading
  } = useBooking()

  const [activeTab, setActiveTab] = useState('upcoming')
  const [cancelling, setCancelling] = useState(null)

  const upcomingAppointments = getUpcomingAppointments()
  const appointmentHistory = getAppointmentHistory()

  const handleCancelAppointment = async (appointmentId) => {
    setCancelling(appointmentId)
    try {
      const result = await cancelAppointment(appointmentId)
      
      if (result.success) {
        showToast({
          type: 'success',
          message: t('success.appointmentCancelled')
        })
      } else {
        showToast({
          type: 'error',
          message: result.error
        })
      }
    } catch (error) {
      console.error('Cancel appointment error:', error)
      showToast({
        type: 'error',
        message: 'Failed to cancel appointment'
      })
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon className="w-4 h-4" />
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />
      default:
        return <ClockIcon className="w-4 h-4" />
    }
  }

  const tabs = [
    { id: 'upcoming', name: 'Upcoming', count: upcomingAppointments.length },
    { id: 'history', name: 'History', count: appointmentHistory.length }
  ]

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('appointments.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your government service appointments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/services"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CalendarDaysIcon className="w-4 h-4 mr-2" />
            Book New Appointment
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Upcoming Appointments */}
          {activeTab === 'upcoming' && (
            <div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.service?.name || 'Service'}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </span>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarDaysIcon className="w-4 h-4 mr-2" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="w-4 h-4 mr-2" />
                              {appointment.time}
                            </div>
                          </div>

                          {appointment.notes && (
                            <p className="mt-2 text-sm text-gray-600">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}

                          {appointment.appointmentToken && (
                            <p className="mt-2 text-sm text-blue-600 font-medium">
                              Token: {appointment.appointmentToken}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => {/* TODO: Implement reschedule */}}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" />
                            Reschedule
                          </button>
                          
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            disabled={cancelling === appointment.id}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling === appointment.id ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              <>
                                <XCircleIcon className="w-4 h-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming appointments</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Book your first appointment to get started with government services.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/services"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <CalendarDaysIcon className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Appointment History */}
          {activeTab === 'history' && (
            <div>
              {appointmentHistory.length > 0 ? (
                <div className="space-y-4">
                  {appointmentHistory.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                              {appointment.service?.name || 'Service'}
                            </h3>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {getStatusIcon(appointment.status)}
                              <span className="ml-1">{appointment.status}</span>
                            </span>
                          </div>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarDaysIcon className="w-4 h-4 mr-2" />
                              {new Date(appointment.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <ClockIcon className="w-4 h-4 mr-2" />
                              {appointment.time}
                            </div>
                          </div>

                          {appointment.notes && (
                            <p className="mt-2 text-sm text-gray-600">
                              <strong>Notes:</strong> {appointment.notes}
                            </p>
                          )}

                          {appointment.completedAt && (
                            <p className="mt-2 text-sm text-green-600">
                              <strong>Completed:</strong> {new Date(appointment.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        <div className="ml-4">
                          <button
                            onClick={() => {/* TODO: Implement view details */}}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No appointment history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your completed and cancelled appointments will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
