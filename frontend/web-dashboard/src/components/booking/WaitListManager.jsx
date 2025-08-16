import React, { useState, useEffect, useCallback } from 'react';
import { 
  BellIcon, 
  ClockIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhoneIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CogIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import '../../styles/WaitListManager.css';

const WaitListManager = ({ 
  userId,
  serviceId,
  onWaitListUpdate,
  onNotificationPreferenceUpdate 
}) => {
  const [waitListEntries, setWaitListEntries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    autoBook: true,
    advanceNotice: 24, // hours
    reminderEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active, history, preferences

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      updateWaitListStatus();
      checkForNotifications();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load initial data
  useEffect(() => {
    loadWaitListData();
    loadNotifications();
    loadUserPreferences();
  }, [userId]);

  const loadWaitListData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockWaitListData = [
        {
          id: 'wl-1',
          serviceId: 'srv-1',
          serviceName: 'Document Verification',
          requestedDate: '2025-08-18',
          requestedTime: '10:00',
          displayTime: '10:00 AM',
          position: 2,
          estimatedWaitTime: 3,
          status: 'active',
          priority: 'normal',
          joinedAt: '2025-08-16T14:30:00Z',
          notificationsSent: 1,
          autoBookEnabled: true
        },
        {
          id: 'wl-2',
          serviceId: 'srv-2',
          serviceName: 'License Application',
          requestedDate: '2025-08-19',
          requestedTime: '14:30',
          displayTime: '2:30 PM',
          position: 1,
          estimatedWaitTime: 1,
          status: 'active',
          priority: 'high',
          joinedAt: '2025-08-15T09:15:00Z',
          notificationsSent: 2,
          autoBookEnabled: true
        },
        {
          id: 'wl-3',
          serviceId: 'srv-3',
          serviceName: 'Tax Payment',
          requestedDate: '2025-08-17',
          requestedTime: '11:00',
          displayTime: '11:00 AM',
          position: 0,
          estimatedWaitTime: 0,
          status: 'available',
          priority: 'normal',
          joinedAt: '2025-08-14T16:45:00Z',
          notificationsSent: 3,
          autoBookEnabled: false,
          availableUntil: '2025-08-17T12:00:00Z'
        }
      ];
      
      setWaitListEntries(mockWaitListData);
    } catch (error) {
      console.error('Failed to load wait list data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    // Simulate notification history
    const mockNotifications = [
      {
        id: 'notif-1',
        waitListId: 'wl-3',
        type: 'slot_available',
        title: 'Slot Available!',
        message: 'Your requested time slot for Tax Payment is now available.',
        timestamp: '2025-08-16T15:30:00Z',
        read: false,
        urgent: true
      },
      {
        id: 'notif-2',
        waitListId: 'wl-1',
        type: 'position_update',
        title: 'Position Updated',
        message: 'You moved up to position #2 in the wait list.',
        timestamp: '2025-08-16T12:15:00Z',
        read: true,
        urgent: false
      },
      {
        id: 'notif-3',
        waitListId: 'wl-2',
        type: 'reminder',
        title: 'Wait List Reminder',
        message: 'You\'re still #1 in line for License Application tomorrow.',
        timestamp: '2025-08-16T08:00:00Z',
        read: true,
        urgent: false
      }
    ];
    
    setNotifications(mockNotifications);
  };

  const loadUserPreferences = async () => {
    // Load user preferences from localStorage or API
    const savedPrefs = localStorage.getItem(`waitlist_preferences_${userId}`);
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  };

  const updateWaitListStatus = useCallback(async () => {
    // Simulate real-time position updates
    setWaitListEntries(prev => prev.map(entry => {
      if (entry.status === 'active') {
        // Randomly update positions (in real app, this comes from server)
        const positionChange = Math.random() > 0.8 ? -1 : 0;
        const newPosition = Math.max(0, entry.position + positionChange);
        
        if (newPosition === 0) {
          return {
            ...entry,
            position: 0,
            status: 'available',
            estimatedWaitTime: 0,
            availableUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
          };
        }
        
        return {
          ...entry,
          position: newPosition,
          estimatedWaitTime: Math.max(1, entry.estimatedWaitTime - (positionChange < 0 ? 1 : 0))
        };
      }
      return entry;
    }));
  }, []);

  const checkForNotifications = useCallback(() => {
    // Check for new notifications
    waitListEntries.forEach(entry => {
      if (entry.status === 'available' && entry.autoBookEnabled) {
        // Auto-book if enabled
        handleAutoBook(entry);
      }
    });
  }, [waitListEntries]);

  const handleJoinWaitList = async (serviceId, date, timeSlot) => {
    const newEntry = {
      id: `wl-${Date.now()}`,
      serviceId,
      serviceName: 'New Service',
      requestedDate: date,
      requestedTime: timeSlot.time,
      displayTime: timeSlot.displayTime,
      position: Math.floor(Math.random() * 5) + 1,
      estimatedWaitTime: Math.floor(Math.random() * 7) + 1,
      status: 'active',
      priority: 'normal',
      joinedAt: new Date().toISOString(),
      notificationsSent: 0,
      autoBookEnabled: preferences.autoBook
    };
    
    setWaitListEntries(prev => [...prev, newEntry]);
    onWaitListUpdate?.(newEntry, 'joined');
    
    // Send confirmation notification
    addNotification({
      type: 'wait_list_joined',
      title: 'Wait List Joined',
      message: `You've been added to the wait list for ${timeSlot.displayTime}`,
      waitListId: newEntry.id
    });
  };

  const handleLeaveWaitList = async (entryId) => {
    setWaitListEntries(prev => prev.filter(entry => entry.id !== entryId));
    onWaitListUpdate?.(entryId, 'left');
    
    addNotification({
      type: 'wait_list_left',
      title: 'Wait List Left',
      message: 'You\'ve been removed from the wait list',
      waitListId: entryId
    });
  };

  const handleAutoBook = async (entry) => {
    if (!entry.autoBookEnabled) return;
    
    // Simulate automatic booking
    setWaitListEntries(prev => 
      prev.map(item => 
        item.id === entry.id 
          ? { ...item, status: 'booked', bookedAt: new Date().toISOString() }
          : item
      )
    );
    
    addNotification({
      type: 'auto_booked',
      title: 'Automatically Booked!',
      message: `Your slot for ${entry.serviceName} has been automatically booked`,
      waitListId: entry.id,
      urgent: true
    });
    
    onWaitListUpdate?.(entry, 'auto_booked');
  };

  const handleManualBook = async (entry) => {
    setWaitListEntries(prev => 
      prev.map(item => 
        item.id === entry.id 
          ? { ...item, status: 'booked', bookedAt: new Date().toISOString() }
          : item
      )
    );
    
    onWaitListUpdate?.(entry, 'manual_booked');
  };

  const handlePriorityChange = async (entryId, newPriority) => {
    setWaitListEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, priority: newPriority }
          : entry
      )
    );
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
      urgent: false,
      ...notification
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem(`waitlist_preferences_${userId}`, JSON.stringify(newPreferences));
    onNotificationPreferenceUpdate?.(newPreferences);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', class: 'active' },
      available: { text: 'Available', class: 'available' },
      booked: { text: 'Booked', class: 'booked' },
      expired: { text: 'Expired', class: 'expired' }
    };
    return badges[status] || badges.active;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <ArrowUpIcon className="priority-icon high" />;
      case 'low':
        return <ArrowDownIcon className="priority-icon low" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  const activeEntries = waitListEntries.filter(entry => entry.status === 'active');
  const availableEntries = waitListEntries.filter(entry => entry.status === 'available');
  const historyEntries = waitListEntries.filter(entry => ['booked', 'expired'].includes(entry.status));
  const unreadNotifications = notifications.filter(notif => !notif.read);

  if (loading) {
    return (
      <div className="waitlist-manager loading">
        <div className="loading-spinner"></div>
        <p>Loading wait list...</p>
      </div>
    );
  }

  return (
    <div className="waitlist-manager">
      <div className="waitlist-header">
        <h2>Wait List Management</h2>
        <div className="notification-indicator">
          <BellIcon className="bell-icon" />
          {unreadNotifications.length > 0 && (
            <span className="notification-badge">{unreadNotifications.length}</span>
          )}
        </div>
      </div>

      <div className="waitlist-tabs">
        <button 
          className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeEntries.length + availableEntries.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History ({historyEntries.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <CogIcon className="tab-icon" />
          Settings
        </button>
      </div>

      {activeTab === 'active' && (
        <div className="tab-content">
          {/* Available Slots */}
          {availableEntries.length > 0 && (
            <div className="waitlist-section available-slots">
              <h3 className="section-title">
                <CheckCircleIcon className="section-icon available" />
                Available Now ({availableEntries.length})
              </h3>
              <div className="entries-list">
                {availableEntries.map(entry => (
                  <div key={entry.id} className="waitlist-entry available">
                    <div className="entry-content">
                      <div className="entry-main">
                        <div className="service-info">
                          <h4>{entry.serviceName}</h4>
                          <p className="time-info">
                            {new Date(entry.requestedDate).toLocaleDateString()} at {entry.displayTime}
                          </p>
                        </div>
                        <div className="availability-info">
                          <div className="urgent-indicator">
                            <ExclamationCircleIcon className="urgent-icon" />
                            <span>Available until {new Date(entry.availableUntil).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="entry-actions">
                        <button 
                          className="action-btn primary"
                          onClick={() => handleManualBook(entry)}
                        >
                          Book Now
                        </button>
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleLeaveWaitList(entry.id)}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Wait List */}
          {activeEntries.length > 0 && (
            <div className="waitlist-section active-entries">
              <h3 className="section-title">
                <ClockIcon className="section-icon active" />
                Waiting ({activeEntries.length})
              </h3>
              <div className="entries-list">
                {activeEntries.map(entry => (
                  <div key={entry.id} className="waitlist-entry active">
                    <div className="entry-content">
                      <div className="entry-main">
                        <div className="service-info">
                          <div className="service-header">
                            <h4>{entry.serviceName}</h4>
                            {getPriorityIcon(entry.priority)}
                          </div>
                          <p className="time-info">
                            {new Date(entry.requestedDate).toLocaleDateString()} at {entry.displayTime}
                          </p>
                          <p className="join-info">
                            Joined {formatTimeAgo(entry.joinedAt)}
                          </p>
                        </div>
                        <div className="wait-info">
                          <div className="position-info">
                            <UserGroupIcon className="position-icon" />
                            <span className="position">#{entry.position}</span>
                            <span className="position-label">in line</span>
                          </div>
                          <div className="estimate-info">
                            <ClockIcon className="estimate-icon" />
                            <span className="estimate">~{entry.estimatedWaitTime} days</span>
                          </div>
                        </div>
                      </div>
                      <div className="entry-actions">
                        <button 
                          className="action-btn secondary"
                          onClick={() => handleLeaveWaitList(entry.id)}
                        >
                          <XMarkIcon className="action-icon" />
                          Leave
                        </button>
                      </div>
                    </div>
                    <div className="entry-footer">
                      <div className="auto-book-status">
                        {entry.autoBookEnabled ? (
                          <span className="auto-book enabled">Auto-booking enabled</span>
                        ) : (
                          <span className="auto-book disabled">Manual booking only</span>
                        )}
                      </div>
                      <div className="notifications-sent">
                        {entry.notificationsSent} notifications sent
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeEntries.length === 0 && availableEntries.length === 0 && (
            <div className="empty-state">
              <UserGroupIcon className="empty-icon" />
              <h3>No Active Wait Lists</h3>
              <p>You're not currently on any wait lists. Join one when your preferred time slots are full.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="tab-content">
          <div className="waitlist-section history-entries">
            <h3 className="section-title">
              <ClockIcon className="section-icon history" />
              Wait List History
            </h3>
            {historyEntries.length > 0 ? (
              <div className="entries-list">
                {historyEntries.map(entry => (
                  <div key={entry.id} className={`waitlist-entry history ${entry.status}`}>
                    <div className="entry-content">
                      <div className="entry-main">
                        <div className="service-info">
                          <h4>{entry.serviceName}</h4>
                          <p className="time-info">
                            {new Date(entry.requestedDate).toLocaleDateString()} at {entry.displayTime}
                          </p>
                        </div>
                        <div className="status-info">
                          <span className={`status-badge ${entry.status}`}>
                            {getStatusBadge(entry.status).text}
                          </span>
                          {entry.bookedAt && (
                            <p className="completion-time">
                              Booked {formatTimeAgo(entry.bookedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <ClockIcon className="empty-icon" />
                <p>No wait list history yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="tab-content">
          <div className="preferences-section">
            <h3 className="section-title">
              <CogIcon className="section-icon preferences" />
              Notification Preferences
            </h3>
            
            <div className="preference-groups">
              <div className="preference-group">
                <h4>Notification Methods</h4>
                <div className="preference-options">
                  <label className="preference-option">
                    <input 
                      type="checkbox" 
                      checked={preferences.email}
                      onChange={(e) => updatePreferences({...preferences, email: e.target.checked})}
                    />
                    <EnvelopeIcon className="preference-icon" />
                    <span>Email Notifications</span>
                  </label>
                  <label className="preference-option">
                    <input 
                      type="checkbox" 
                      checked={preferences.sms}
                      onChange={(e) => updatePreferences({...preferences, sms: e.target.checked})}
                    />
                    <PhoneIcon className="preference-icon" />
                    <span>SMS Notifications</span>
                  </label>
                  <label className="preference-option">
                    <input 
                      type="checkbox" 
                      checked={preferences.push}
                      onChange={(e) => updatePreferences({...preferences, push: e.target.checked})}
                    />
                    <DevicePhoneMobileIcon className="preference-icon" />
                    <span>Push Notifications</span>
                  </label>
                </div>
              </div>

              <div className="preference-group">
                <h4>Booking Preferences</h4>
                <div className="preference-options">
                  <label className="preference-option">
                    <input 
                      type="checkbox" 
                      checked={preferences.autoBook}
                      onChange={(e) => updatePreferences({...preferences, autoBook: e.target.checked})}
                    />
                    <CheckCircleIcon className="preference-icon" />
                    <span>Auto-book when slots become available</span>
                  </label>
                  <label className="preference-option">
                    <input 
                      type="checkbox" 
                      checked={preferences.reminderEnabled}
                      onChange={(e) => updatePreferences({...preferences, reminderEnabled: e.target.checked})}
                    />
                    <BellIcon className="preference-icon" />
                    <span>Send position reminder notifications</span>
                  </label>
                </div>
                <div className="preference-setting">
                  <label>
                    <span>Advance notice (hours before appointment):</span>
                    <select 
                      value={preferences.advanceNotice}
                      onChange={(e) => updatePreferences({...preferences, advanceNotice: parseInt(e.target.value)})}
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="notifications-section">
            <h3 className="section-title">
              <BellIcon className="section-icon notifications" />
              Recent Notifications ({notifications.length})
            </h3>
            <div className="notifications-list">
              {notifications.slice(0, 10).map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.urgent ? 'urgent' : ''}`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <span className="notification-time">{formatTimeAgo(notification.timestamp)}</span>
                  </div>
                  {!notification.read && <div className="unread-indicator"></div>}
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="empty-state">
                  <InformationCircleIcon className="empty-icon" />
                  <p>No notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitListManager;
