import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function QueueStatus() {
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  const [queueStatus, setQueueStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadQueueStatus()
    
    if (autoRefresh) {
      const interval = setInterval(loadQueueStatus, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const loadQueueStatus = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setRefreshing(true)
      
      const response = await supportAPI.getUserQueueStatus()
      
      if (response.data.success) {
        setQueueStatus(response.data.data)
      } else {
        setQueueStatus(null)
      }
    } catch (error) {
      console.error('Error loading queue status:', error)
      if (error.response?.status !== 404) {
        showToast({
          type: 'error',
          message: 'Failed to load queue status'
        })
      }
      setQueueStatus(null)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const leaveQueue = async (queueId) => {
    try {
      const response = await supportAPI.leaveQueue(queueId)
      
      if (response.data.success) {
        showToast({
          type: 'success',
          message: 'Successfully left the queue'
        })
        setQueueStatus(null)
      } else {
        showToast({
          type: 'error',
          message: response.data.message || 'Failed to leave queue'
        })
      }
    } catch (error) {
      console.error('Error leaving queue:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to leave queue'
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting':
        return <ClockIcon className="w-6 h-6 text-yellow-500" />
      case 'called':
        return <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
      case 'serving':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-blue-500" />
      case 'missed':
        return <XCircleIcon className="w-6 h-6 text-red-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'called':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'serving':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'completed':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'missed':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusMessage = (status, position) => {
    switch (status) {
      case 'waiting':
        return `You are #${position} in line`
      case 'called':
        return 'Your turn! Please proceed to the service counter'
      case 'serving':
        return 'You are currently being served'
      case 'completed':
        return 'Service completed successfully'
      case 'missed':
        return 'You missed your turn. Please rejoin the queue'
      default:
        return 'Queue status unknown'
    }
  }

  const estimateWaitTime = (position, averageServiceTime = 10) => {
    if (position <= 1) return 'Your turn is coming up!'
    const minutes = (position - 1) * averageServiceTime
    if (minutes < 60) return `Approximately ${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `Approximately ${hours}h ${remainingMinutes}m`
  }

  const formatTimeInQueue = (joinTime) => {
    const now = new Date()
    const joined = new Date(joinTime)
    const diffMinutes = Math.floor((now - joined) / (1000 * 60))
    
    if (diffMinutes < 60) return `${diffMinutes} minutes`
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}h ${minutes}m`
  }

  const handleRefresh = () => {
    loadQueueStatus(false)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!queueStatus) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Not in any queue</h3>
          <p className="mt-1 text-sm text-gray-500">
            You are not currently in any service queue. Visit the Queue Management page to join a queue.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('queue.status')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your position and status in the queue
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="ml-2 text-sm text-gray-700">
              Auto-refresh
            </label>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Queue Status Card */}
      <div className={`border-2 rounded-lg p-6 ${getStatusColor(queueStatus.status)}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {getStatusIcon(queueStatus.status)}
            <div className="ml-4">
              <h2 className="text-xl font-semibold">{queueStatus.queueName}</h2>
              <p className="text-lg font-medium mt-1">
                {getStatusMessage(queueStatus.status, queueStatus.position)}
              </p>
            </div>
          </div>
          
          {queueStatus.status === 'waiting' && (
            <div className="text-right">
              <div className="text-3xl font-bold">#{queueStatus.position}</div>
              <div className="text-sm opacity-75">Your position</div>
            </div>
          )}
        </div>

        {queueStatus.status === 'called' && (
          <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 mr-2" />
              <span className="font-medium">Important:</span>
            </div>
            <p className="mt-1 text-sm">
              Please proceed to {queueStatus.counterNumber ? `Counter ${queueStatus.counterNumber}` : 'the service counter'} immediately. 
              You have a limited time to respond.
            </p>
          </div>
        )}
      </div>

      {/* Queue Details */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Queue Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{queueStatus.position || 'N/A'}</div>
            <div className="text-sm text-gray-500">Current Position</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{queueStatus.totalInQueue || 0}</div>
            <div className="text-sm text-gray-500">People in Queue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {queueStatus.joinTime ? formatTimeInQueue(queueStatus.joinTime) : 'N/A'}
            </div>
            <div className="text-sm text-gray-500">Time in Queue</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {queueStatus.status === 'waiting' && queueStatus.position 
                ? estimateWaitTime(queueStatus.position).split(' ').slice(1, 3).join(' ')
                : 'N/A'
              }
            </div>
            <div className="text-sm text-gray-500">Est. Wait Time</div>
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
        
        <div className="space-y-3">
          {queueStatus.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span><strong>Location:</strong> {queueStatus.location}</span>
            </div>
          )}
          
          {queueStatus.serviceType && (
            <div className="flex items-center text-sm text-gray-600">
              <UsersIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span><strong>Service Type:</strong> {queueStatus.serviceType}</span>
            </div>
          )}
          
          {queueStatus.estimatedServiceTime && (
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span><strong>Service Duration:</strong> ~{queueStatus.estimatedServiceTime} minutes</span>
            </div>
          )}
          
          {queueStatus.counterNumber && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span><strong>Assigned Counter:</strong> Counter {queueStatus.counterNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {queueStatus.status === 'waiting' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
          
          <div className="flex space-x-4">
            <button
              onClick={() => leaveQueue(queueStatus.queueId)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="w-4 h-4 mr-2" />
              Leave Queue
            </button>
            
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Check Status
            </button>
          </div>
          
          <p className="mt-3 text-sm text-gray-500">
            You will be notified when it's your turn. Please stay nearby and keep your notifications enabled.
          </p>
        </div>
      )}
    </div>
  )
}
