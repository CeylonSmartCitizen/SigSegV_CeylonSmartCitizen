import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import '../../styles/SmartScheduler.css';

const SmartScheduler = ({ 
  selectedDate,
  selectedTimeSlots,
  serviceId,
  userId,
  onScheduleUpdate,
  onConflictResolution,
  onWaitListJoin
}) => {
  const [conflicts, setConflicts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [waitListOptions, setWaitListOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Analyze scheduling conflicts and generate suggestions
  const analyzeScheduling = async () => {
    if (!selectedDate || selectedTimeSlots.length === 0) {
      setConflicts([]);
      setSuggestions([]);
      setWaitListOptions([]);
      setAnalysisComplete(false);
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API calls - in real app, these would be actual backend calls
      const conflictAnalysis = await detectConflicts(selectedDate, selectedTimeSlots, userId);
      const schedulingSuggestions = await generateSuggestions(selectedDate, selectedTimeSlots, serviceId);
      const waitListData = await getWaitListOptions(selectedDate, selectedTimeSlots, serviceId);
      
      setConflicts(conflictAnalysis);
      setSuggestions(schedulingSuggestions);
      setWaitListOptions(waitListData);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Scheduling analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Detect scheduling conflicts
  const detectConflicts = async (date, timeSlots, userId) => {
    // Mock conflict detection logic
    const conflicts = [];
    
    // Check for existing appointments
    const existingAppointments = getExistingAppointments(userId, date);
    
    timeSlots.forEach(slot => {
      // Check for time overlap
      const overlapping = existingAppointments.filter(apt => 
        isTimeOverlapping(slot, apt)
      );
      
      if (overlapping.length > 0) {
        conflicts.push({
          id: `conflict-${slot.id}`,
          type: 'time_conflict',
          severity: 'high',
          timeSlot: slot,
          conflictingAppointments: overlapping,
          message: `Time slot conflicts with existing appointment: ${overlapping[0].title}`,
          resolution: 'reschedule_or_cancel'
        });
      }
      
      // Check for service availability
      if (slot.remainingSlots === 0) {
        conflicts.push({
          id: `availability-${slot.id}`,
          type: 'no_availability',
          severity: 'high',
          timeSlot: slot,
          message: `No available slots for ${slot.displayTime}`,
          resolution: 'alternative_time'
        });
      }
      
      // Check for low availability
      if (slot.remainingSlots > 0 && slot.remainingSlots <= 2) {
        conflicts.push({
          id: `low-availability-${slot.id}`,
          type: 'low_availability',
          severity: 'medium',
          timeSlot: slot,
          message: `Only ${slot.remainingSlots} slot(s) remaining for ${slot.displayTime}`,
          resolution: 'book_quickly'
        });
      }
    });
    
    return conflicts;
  };

  // Generate smart scheduling suggestions
  const generateSuggestions = async (date, timeSlots, serviceId) => {
    const suggestions = [];
    
    // Alternative time suggestions
    const alternativeTimes = findAlternativeTimeSlots(date, timeSlots);
    if (alternativeTimes.length > 0) {
      suggestions.push({
        id: 'alternative-times',
        type: 'alternative_times',
        priority: 'high',
        title: 'Alternative Time Slots',
        description: 'Similar time slots with better availability',
        options: alternativeTimes,
        action: 'replace_selection'
      });
    }
    
    // Alternative date suggestions
    const alternativeDates = findAlternativeDates(date, timeSlots);
    if (alternativeDates.length > 0) {
      suggestions.push({
        id: 'alternative-dates',
        type: 'alternative_dates',
        priority: 'medium',
        title: 'Alternative Dates',
        description: 'Same time slots on different dates with good availability',
        options: alternativeDates,
        action: 'change_date'
      });
    }
    
    // Bundle suggestions for multiple appointments
    if (timeSlots.length > 1) {
      const bundleOptions = findBundleOpportunities(date, timeSlots);
      if (bundleOptions.length > 0) {
        suggestions.push({
          id: 'bundle-appointments',
          type: 'bundle',
          priority: 'low',
          title: 'Bundle Appointments',
          description: 'Combine appointments for better efficiency',
          options: bundleOptions,
          action: 'bundle_slots'
        });
      }
    }
    
    // Off-peak suggestions
    const offPeakSlots = findOffPeakAlternatives(date, timeSlots);
    if (offPeakSlots.length > 0) {
      suggestions.push({
        id: 'off-peak',
        type: 'off_peak',
        priority: 'low',
        title: 'Off-Peak Options',
        description: 'Less busy time slots with potential discounts',
        options: offPeakSlots,
        action: 'consider_off_peak'
      });
    }
    
    return suggestions;
  };

  // Get wait list options
  const getWaitListOptions = async (date, timeSlots, serviceId) => {
    const waitListOptions = [];
    
    timeSlots.forEach(slot => {
      if (slot.remainingSlots === 0) {
        waitListOptions.push({
          id: `waitlist-${slot.id}`,
          timeSlot: slot,
          estimatedWaitTime: getEstimatedWaitTime(slot),
          position: getWaitListPosition(slot),
          notificationPreferences: ['email', 'sms', 'push'],
          autoBook: true
        });
      }
    });
    
    return waitListOptions;
  };

  // Helper functions (mock implementations)
  const getExistingAppointments = (userId, date) => {
    // Mock existing appointments
    return [
      {
        id: 'apt-1',
        title: 'Doctor Appointment',
        startTime: '10:00',
        endTime: '11:00',
        date: date
      }
    ];
  };

  const isTimeOverlapping = (slot, appointment) => {
    const slotTime = parseInt(slot.time.split(':')[0]);
    const aptStartTime = parseInt(appointment.startTime.split(':')[0]);
    const aptEndTime = parseInt(appointment.endTime.split(':')[0]);
    
    return slotTime >= aptStartTime && slotTime < aptEndTime;
  };

  const findAlternativeTimeSlots = (date, timeSlots) => {
    // Mock alternative time generation
    return [
      {
        time: '14:30',
        displayTime: '2:30 PM',
        availabilityLevel: 'high',
        remainingSlots: 8
      },
      {
        time: '15:00',
        displayTime: '3:00 PM',
        availabilityLevel: 'high',
        remainingSlots: 7
      }
    ];
  };

  const findAlternativeDates = (date, timeSlots) => {
    // Mock alternative date generation
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return [
      {
        date: tomorrow.toISOString().split('T')[0],
        displayDate: tomorrow.toLocaleDateString(),
        sameTimeSlots: timeSlots,
        averageAvailability: 'high'
      }
    ];
  };

  const findBundleOpportunities = (date, timeSlots) => {
    if (timeSlots.length < 2) return [];
    
    return [
      {
        bundledSlots: timeSlots.slice(0, 2),
        discount: '10%',
        consecutiveSlots: true,
        estimatedDuration: '60 minutes'
      }
    ];
  };

  const findOffPeakAlternatives = (date, timeSlots) => {
    return [
      {
        time: '09:00',
        displayTime: '9:00 AM',
        discount: '15%',
        availabilityLevel: 'high',
        peakType: 'early_morning'
      }
    ];
  };

  const getEstimatedWaitTime = (slot) => {
    return Math.floor(Math.random() * 7) + 1; // 1-7 days
  };

  const getWaitListPosition = (slot) => {
    return Math.floor(Math.random() * 5) + 1; // 1-5 position
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion, option) => {
    switch (suggestion.action) {
      case 'replace_selection':
        onScheduleUpdate([option]);
        break;
      case 'change_date':
        onScheduleUpdate(option.sameTimeSlots, option.date);
        break;
      case 'bundle_slots':
        onScheduleUpdate(option.bundledSlots);
        break;
      case 'consider_off_peak':
        onScheduleUpdate([option]);
        break;
    }
  };

  // Handle conflict resolution
  const handleConflictResolve = (conflict, resolution) => {
    onConflictResolution(conflict, resolution);
  };

  // Handle wait list join
  const handleWaitListJoin = (waitListOption) => {
    onWaitListJoin(waitListOption);
  };

  // Run analysis when selection changes
  useEffect(() => {
    analyzeScheduling();
  }, [selectedDate, selectedTimeSlots, serviceId, userId]);

  if (loading) {
    return (
      <div className="smart-scheduler loading">
        <div className="loading-spinner"></div>
        <p>Analyzing scheduling options...</p>
      </div>
    );
  }

  if (!analysisComplete && selectedTimeSlots.length === 0) {
    return (
      <div className="smart-scheduler empty">
        <LightBulbIcon className="empty-icon" />
        <p>Select time slots to see smart scheduling suggestions</p>
      </div>
    );
  }

  return (
    <div className="smart-scheduler">
      {/* Conflicts Section */}
      {conflicts.length > 0 && (
        <div className="scheduler-section conflicts">
          <div className="section-header">
            <ExclamationTriangleIcon className="section-icon warning" />
            <h3>Scheduling Conflicts ({conflicts.length})</h3>
          </div>
          
          <div className="conflicts-list">
            {conflicts.map(conflict => (
              <div key={conflict.id} className={`conflict-item ${conflict.severity}`}>
                <div className="conflict-content">
                  <div className="conflict-message">
                    {conflict.severity === 'high' ? (
                      <XCircleIcon className="conflict-icon high" />
                    ) : (
                      <ExclamationTriangleIcon className="conflict-icon medium" />
                    )}
                    <span>{conflict.message}</span>
                  </div>
                  <div className="conflict-actions">
                    {conflict.type === 'time_conflict' && (
                      <button 
                        className="action-btn secondary"
                        onClick={() => handleConflictResolve(conflict, 'reschedule')}
                      >
                        Reschedule
                      </button>
                    )}
                    {conflict.type === 'no_availability' && (
                      <button 
                        className="action-btn secondary"
                        onClick={() => handleConflictResolve(conflict, 'find_alternative')}
                      >
                        Find Alternative
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="scheduler-section suggestions">
          <div className="section-header">
            <LightBulbIcon className="section-icon suggestion" />
            <h3>Smart Suggestions ({suggestions.length})</h3>
          </div>
          
          <div className="suggestions-list">
            {suggestions.map(suggestion => (
              <div key={suggestion.id} className={`suggestion-item ${suggestion.priority}`}>
                <div className="suggestion-header">
                  <h4>{suggestion.title}</h4>
                  <span className={`priority-badge ${suggestion.priority}`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="suggestion-description">{suggestion.description}</p>
                
                <div className="suggestion-options">
                  {suggestion.options.map((option, index) => (
                    <button
                      key={index}
                      className="suggestion-option"
                      onClick={() => handleSuggestionSelect(suggestion, option)}
                    >
                      {suggestion.type === 'alternative_times' && (
                        <div className="option-content">
                          <ClockIcon className="option-icon" />
                          <span>{option.displayTime}</span>
                          <span className="availability-indicator">{option.remainingSlots} slots</span>
                        </div>
                      )}
                      {suggestion.type === 'alternative_dates' && (
                        <div className="option-content">
                          <CalendarDaysIcon className="option-icon" />
                          <span>{option.displayDate}</span>
                          <span className="availability-indicator">Good availability</span>
                        </div>
                      )}
                      {suggestion.type === 'off_peak' && (
                        <div className="option-content">
                          <ClockIcon className="option-icon" />
                          <span>{option.displayTime}</span>
                          <span className="discount-indicator">{option.discount} off</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wait List Section */}
      {waitListOptions.length > 0 && (
        <div className="scheduler-section waitlist">
          <div className="section-header">
            <UserPlusIcon className="section-icon waitlist" />
            <h3>Wait List Options ({waitListOptions.length})</h3>
          </div>
          
          <div className="waitlist-list">
            {waitListOptions.map(option => (
              <div key={option.id} className="waitlist-item">
                <div className="waitlist-content">
                  <div className="waitlist-info">
                    <span className="time-slot">{option.timeSlot.displayTime}</span>
                    <span className="wait-details">
                      Position #{option.position} • ~{option.estimatedWaitTime} days
                    </span>
                  </div>
                  <button 
                    className="action-btn primary"
                    onClick={() => handleWaitListJoin(option)}
                  >
                    Join Wait List
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {conflicts.length === 0 && selectedTimeSlots.length > 0 && (
        <div className="scheduler-section success">
          <div className="success-content">
            <CheckCircleIcon className="success-icon" />
            <div className="success-text">
              <h3>Perfect Schedule!</h3>
              <p>No conflicts detected. Your selected time slots are available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartScheduler;
