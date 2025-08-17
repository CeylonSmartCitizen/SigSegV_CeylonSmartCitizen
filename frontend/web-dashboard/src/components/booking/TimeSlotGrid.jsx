import React, { useState, useEffect } from 'react';
import { ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import '../../styles/TimeSlotGrid.css';

const TimeSlotGrid = ({ 
  selectedDate, 
  onTimeSlotSelect, 
  selectedTimeSlots = [],
  serviceId,
  intervalMinutes = 30,
  businessHours = { start: 9, end: 17 },
  multiSelect = false 
}) => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate time slots based on business hours and interval
  const generateTimeSlots = () => {
    const slots = [];
    const { start, end } = businessHours;
    
    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatDisplayTime(hour, minute);
        
        // Simulate availability data - in real app, this would come from API
        const availability = getSlotAvailability(hour, minute);
        
        slots.push({
          id: `${selectedDate}-${timeString}`,
          time: timeString,
          displayTime,
          hour,
          minute,
          available: availability.available,
          totalSlots: availability.totalSlots,
          bookedSlots: availability.bookedSlots,
          remainingSlots: availability.remainingSlots,
          isBreak: isBreakTime(hour, minute),
          isPeak: isPeakTime(hour, minute)
        });
      }
    }
    
    return slots;
  };

  // Format time for display (12-hour format)
  const formatDisplayTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  // Simulate slot availability (replace with actual API call)
  const getSlotAvailability = (hour, minute) => {
    // Mock logic - in real app, fetch from backend
    const totalSlots = 10;
    const isLunchTime = hour === 12 || hour === 13;
    const isPeakHour = hour >= 10 && hour <= 11 || hour >= 14 && hour <= 16;
    
    let bookedSlots;
    if (isLunchTime) {
      bookedSlots = totalSlots; // Lunch break - no availability
    } else if (isPeakHour) {
      bookedSlots = Math.floor(Math.random() * 8) + 2; // High demand
    } else {
      bookedSlots = Math.floor(Math.random() * 5); // Normal demand
    }
    
    const remainingSlots = Math.max(0, totalSlots - bookedSlots);
    
    return {
      available: remainingSlots > 0 && !isLunchTime,
      totalSlots,
      bookedSlots,
      remainingSlots
    };
  };

  // Check if time slot is during break period
  const isBreakTime = (hour, minute) => {
    return (hour === 12 && minute >= 0) || (hour === 13 && minute < 30); // 12:00 PM - 1:30 PM
  };

  // Check if time slot is during peak hours
  const isPeakTime = (hour, minute) => {
    return (hour >= 10 && hour <= 11) || (hour >= 14 && hour <= 16);
  };

  // Get availability level for styling
  const getAvailabilityLevel = (slot) => {
    if (!slot.available || slot.isBreak) return 'unavailable';
    
    const ratio = slot.remainingSlots / slot.totalSlots;
    if (ratio > 0.7) return 'high';
    if (ratio > 0.3) return 'medium';
    return 'low';
  };

  // Handle time slot selection
  const handleSlotClick = (slot) => {
    if (!slot.available || slot.isBreak) return;
    
    let newSelection;
    const isSelected = selectedTimeSlots.some(s => s.id === slot.id);
    
    if (multiSelect) {
      if (isSelected) {
        newSelection = selectedTimeSlots.filter(s => s.id !== slot.id);
      } else {
        newSelection = [...selectedTimeSlots, slot];
      }
    } else {
      newSelection = isSelected ? [] : [slot];
    }
    
    onTimeSlotSelect(newSelection);
  };

  // Check if slot is selected
  const isSlotSelected = (slot) => {
    return selectedTimeSlots.some(s => s.id === slot.id);
  };

  // Generate slots when date or service changes
  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      const slots = generateTimeSlots();
      setTimeSlots(slots);
      setLoading(false);
    }
  }, [selectedDate, serviceId, intervalMinutes]);

  if (!selectedDate) {
    return (
      <div className="time-slot-grid-empty">
        <ClockIcon className="empty-icon" />
        <p className="empty-text">Select a date to view available time slots</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="time-slot-grid-loading">
        <div className="loading-spinner"></div>
        <p>Loading available time slots...</p>
      </div>
    );
  }

  const morningSlots = timeSlots.filter(slot => slot.hour < 12);
  const afternoonSlots = timeSlots.filter(slot => slot.hour >= 12);

  return (
    <div className="time-slot-grid">
      <div className="time-slot-header">
        <h3 className="time-slot-title">
          Available Time Slots
        </h3>
        <p className="selected-date">
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Morning Slots */}
      <div className="time-period">
        <h4 className="period-title">Morning</h4>
        <div className="slots-grid">
          {morningSlots.map(slot => (
            <button
              key={slot.id}
              className={`time-slot ${getAvailabilityLevel(slot)} ${isSlotSelected(slot) ? 'selected' : ''} ${slot.isPeak ? 'peak' : ''}`}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.available || slot.isBreak}
              title={slot.isBreak ? 'Break time' : `${slot.remainingSlots} slots remaining`}
            >
              <div className="slot-time">
                {slot.displayTime}
              </div>
              {slot.available && !slot.isBreak && (
                <div className="slot-availability">
                  <UserGroupIcon className="availability-icon" />
                  <span className="availability-count">
                    {slot.remainingSlots}/{slot.totalSlots}
                  </span>
                </div>
              )}
              {slot.isPeak && slot.available && (
                <div className="peak-indicator">Peak</div>
              )}
              {slot.isBreak && (
                <div className="break-indicator">Break</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Afternoon Slots */}
      <div className="time-period">
        <h4 className="period-title">Afternoon</h4>
        <div className="slots-grid">
          {afternoonSlots.map(slot => (
            <button
              key={slot.id}
              className={`time-slot ${getAvailabilityLevel(slot)} ${isSlotSelected(slot) ? 'selected' : ''} ${slot.isPeak ? 'peak' : ''}`}
              onClick={() => handleSlotClick(slot)}
              disabled={!slot.available || slot.isBreak}
              title={slot.isBreak ? 'Break time' : `${slot.remainingSlots} slots remaining`}
            >
              <div className="slot-time">
                {slot.displayTime}
              </div>
              {slot.available && !slot.isBreak && (
                <div className="slot-availability">
                  <UserGroupIcon className="availability-icon" />
                  <span className="availability-count">
                    {slot.remainingSlots}/{slot.totalSlots}
                  </span>
                </div>
              )}
              {slot.isPeak && slot.available && (
                <div className="peak-indicator">Peak</div>
              )}
              {slot.isBreak && (
                <div className="break-indicator">Break</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="time-slot-legend">
        <div className="legend-title">Availability Legend</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color high"></div>
            <span>High Availability (70%+)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color medium"></div>
            <span>Medium Availability (30-70%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color low"></div>
            <span>Low Availability (&lt;30%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>Unavailable</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedTimeSlots.length > 0 && (
        <div className="selection-summary">
          <h4>Selected Time Slots ({selectedTimeSlots.length})</h4>
          <div className="selected-slots">
            {selectedTimeSlots.map(slot => (
              <span key={slot.id} className="selected-slot-tag">
                {slot.displayTime}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGrid;
