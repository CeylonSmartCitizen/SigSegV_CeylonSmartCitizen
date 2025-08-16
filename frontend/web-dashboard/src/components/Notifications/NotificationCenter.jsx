import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'

export default function NotificationCenter() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [markingAsRead, setMarkingAsRead] = useState(new Set())

  const notificationTypes = [
    { value: '', label: 'All Types' },
    { value: 'appointment', label: 'Appointments' },
    { value: 'queue', label: 'Queue Updates' },
    { value: 'document', label: 'Documents' },
    { value: 'system', label: 'System' },
    { value: 'service', label: 'Services' }
  ]

  const statusTypes = [
    { value: '', label: 'All Status' },
    { value: 'unread', label: 'Unread' },
    { value: 'read', label: 'Read' }
  ]

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const response = await supportAPI.getUserNotifications({
        userId: user.id
      })
      
      if (response.data.success) {
        setNotifications(response.data.data)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      showToast({
        type: 'error',
        message: 'Failed to load notifications'
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      setMarkingAsRead(prev => new Set([...prev, notificationId]))
      
      const response = await supportAPI.markNotificationAsRead(notificationId)
      
      if (response.data.success) {
        setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        ))
      } else {
        showToast({
          type: 'error',
          message: 'Failed to mark notification as read'
        })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      showToast({
        type: 'error',
        message: 'Failed to mark notification as read'
      })
    } finally {
      setMarkingAsRead(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      if (unreadNotifications.length === 0) return

      const response = await supportAPI.markAllNotificationsAsRead({
        userId: user.id
      })
      
      if (response.data.success) {
        setNotifications(prev => prev.map(notification => ({
          ...notification,
          read: true,
          read_at: notification.read_at || new Date().toISOString()
        })))
        
        showToast({
          type: 'success',
          message: 'All notifications marked as read'
        })
      } else {
        showToast({
          type: 'error',
          message: 'Failed to mark all notifications as read'
        })
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      showToast({
        type: 'error',
        message: 'Failed to mark all notifications as read'
      })
    }
  }

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return
    }

    try {
      const response = await supportAPI.deleteNotification(notificationId)
      
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        showToast({
          type: 'success',
          message: 'Notification deleted'
        })
      } else {
        showToast({
          type: 'error',
          message: 'Failed to delete notification'
        })
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
      showToast({
        type: 'error',
        message: 'Failed to delete notification'
      })
    }
  }

  const getNotificationIcon = (type, priority) => {
    const iconClass = "w-6 h-6"
    
    switch (type) {
      case 'appointment':
        return <CheckCircleIcon className={`${iconClass} text-blue-500`} />
      case 'queue':
        return <BellIconSolid className={`${iconClass} text-purple-500`} />
      case 'document':
        return <InformationCircleIcon className={`${iconClass} text-green-500`} />
      case 'system':
        if (priority === 'high') {
          return <ExclamationTriangleIcon className={`${iconClass} text-red-500`} />
        }
        return <InformationCircleIcon className={`${iconClass} text-blue-500`} />
      case 'service':
        return <CheckCircleIcon className={`${iconClass} text-indigo-500`} />
      default:
        return <BellIcon className={`${iconClass} text-gray-500`} />
    }
  }

  const getNotificationBgColor = (read, priority) => {
    if (read) {
      return 'bg-white'
    }
    
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-4 border-red-500'
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      default:
        return 'bg-blue-50 border-l-4 border-blue-500'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Today'
    } else if (diffDays === 2) {
      return 'Yesterday'
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || notification.type === selectedType
    const matchesStatus = !selectedStatus || 
                         (selectedStatus === 'read' && notification.read) ||
                         (selectedStatus === 'unread' && !notification.read)
    
    return matchesSearch && matchesType && matchesStatus
  })

  const unreadCount = notifications.filter(n => !n.read).length

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BellIcon className="w-8 h-8 mr-2" />
            {t('notifications.title')}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your government service activities
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <CheckIcon className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {statusTypes.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        {filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${getNotificationBgColor(notification.read, notification.priority)}`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-gray-900 font-semibold'}`}>
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="mt-1 text-sm text-gray-600">
                            {notification.message}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(notification.created_at)}</span>
                          <span className="capitalize">{notification.type}</span>
                          {notification.priority && notification.priority !== 'low' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              notification.priority === 'high' 
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {notification.priority} priority
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={markingAsRead.has(notification.id)}
                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Mark as read"
                          >
                            {markingAsRead.has(notification.id) ? (
                              <LoadingSpinner size="small" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete notification"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Button */}
                    {notification.action_url && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id)
                            }
                            window.location.href = notification.action_url
                          }}
                          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                          {notification.action_text || 'View Details'} →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType || selectedStatus
                ? 'Try adjusting your search or filters.'
                : 'You\'re all caught up! No new notifications.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {notifications.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Summary</h3>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-500">Unread</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.read).length}
              </div>
              <div className="text-sm text-gray-500">Read</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
