import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  QueueListIcon,
  UsersIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

export default function QueueManagement() {
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  const [queues, setQueues] = useState([])
  const [loading, setLoading] = useState(true)
  const [userQueues, setUserQueues] = useState([])

  useEffect(() => {
    loadQueues()
  }, [])

  const loadQueues = async () => {
    try {
      setLoading(true)
      const response = await supportAPI.getQueues()
      
      if (response.data.success) {
        setQueues(response.data.data)
        
        // Filter user's active queues
        const activeUserQueues = response.data.data.filter(queue => 
          queue.userPosition && queue.userPosition > 0
        )
        setUserQueues(activeUserQueues)
      }
    } catch (error) {
      console.error('Error loading queues:', error)
      showToast({
        type: 'error',
        message: 'Failed to load queue information'
      })
    } finally {
      setLoading(false)
    }
  }

  const joinQueue = async (queueId) => {
    try {
      const response = await supportAPI.joinQueue(queueId, {
        timestamp: new Date().toISOString()
      })
      
      if (response.data.success) {
        showToast({
          type: 'success',
          message: 'Successfully joined the queue'
        })
        loadQueues() // Refresh queue data
      } else {
        showToast({
          type: 'error',
          message: response.data.message || 'Failed to join queue'
        })
      }
    } catch (error) {
      console.error('Error joining queue:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to join queue'
      })
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
        loadQueues() // Refresh queue data
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

  const getQueueStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const estimateWaitTime = (position, averageServiceTime = 10) => {
    if (position <= 0) return 'No wait'
    const minutes = position * averageServiceTime
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

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
        <h1 className="text-2xl font-bold text-gray-900">{t('queue.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Join queues for government services and track your position
        </p>
      </div>

      {/* User's Active Queues */}
      {userQueues.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <QueueListIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-900">Your Active Queues</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {userQueues.map((queue) => (
              <div key={queue.id} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{queue.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQueueStatusColor(queue.status)}`}>
                    {queue.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    Position: #{queue.userPosition}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2" />
                    Wait: {estimateWaitTime(queue.userPosition - 1)}
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    {queue.location}
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => leaveQueue(queue.id)}
                    className="w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Leave Queue
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Queues */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Available Queues</h2>
        </div>
        
        <div className="p-6">
          {queues.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {queues.map((queue) => {
                const isUserInQueue = queue.userPosition && queue.userPosition > 0
                
                return (
                  <div key={queue.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQueueStatusColor(queue.status)}`}>
                        {queue.status}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {queue.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <UsersIcon className="w-4 h-4 mr-2 text-gray-400" />
                        {queue.currentCount || 0} people in queue
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Est. wait: {estimateWaitTime(queue.currentCount || 0)}
                      </div>
                      
                      {queue.description && (
                        <p className="text-sm text-gray-500">{queue.description}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {queue.status === 'active' ? (
                        <>
                          {!isUserInQueue ? (
                            <button
                              onClick={() => joinQueue(queue.id)}
                              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <QueueListIcon className="w-4 h-4 mr-2" />
                              {t('queue.joinQueue')}
                            </button>
                          ) : (
                            <div className="text-center py-2">
                              <span className="text-sm text-green-600 font-medium">
                                ✓ You're in this queue (Position #{queue.userPosition})
                              </span>
                            </div>
                          )}
                        </>
                      ) : queue.status === 'paused' ? (
                        <div className="flex items-center justify-center py-2 text-sm text-yellow-600">
                          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                          Queue is temporarily paused
                        </div>
                      ) : (
                        <div className="text-center py-2 text-sm text-red-600">
                          Queue is closed
                        </div>
                      )}
                    </div>

                    {queue.hours && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          <strong>Hours:</strong> {queue.hours}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <QueueListIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No queues available</h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for available service queues.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
