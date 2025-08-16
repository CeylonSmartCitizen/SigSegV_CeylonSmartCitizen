import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/DateTimeSelection.css';

const DateTimeSelection = ({ service, bookingData, onUpdate }) => {
  const [selectedDate, setSelectedDate] = useState(bookingData.selectedDate);
  const [selectedTime, setSelectedTime] = useState(bookingData.selectedTime);
  const [selectedOfficer, setSelectedOfficer] = useState(bookingData.selectedOfficer);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState({});

  // Generate calendar days
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
      
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isPast,
        isWeekend,
        isAvailable: !isPast && !isWeekend
      });
    }
    
    return days;
  };

  // Generate time slots based on selected date and officer
  const getAvailableTimeSlots = (date, officerId) => {
    if (!date) return [];
    
    const slots = [];
    const startHour = 9;
    const endHour = 16;
    const slotDuration = 30; // minutes
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const isAvailable = Math.random() > 0.3; // Mock availability
        
        if (isAvailable) {
          slots.push({
            time,
            display: `${time}`,
            available: true
          });
        }
      }
    }
    
    return slots;
  };

  const handleDateSelect = (day) => {
    if (!day.isAvailable) return;
    
    setSelectedDate(day.date);
    setSelectedTime(null); // Reset time when date changes
    onUpdate({
      selectedDate: day.date,
      selectedTime: null
    });
  };

  const handleTimeSelect = (slot) => {
    setSelectedTime(slot.time);
    onUpdate({
      selectedDate,
      selectedTime: slot.time
    });
  };

  const handleOfficerSelect = (officer) => {
    setSelectedOfficer(officer);
    setSelectedTime(null); // Reset time when officer changes
    onUpdate({
      selectedDate,
      selectedTime: null,
      selectedOfficer: officer
    });
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const timeSlots = selectedDate ? getAvailableTimeSlots(selectedDate, selectedOfficer?.id) : [];
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="datetime-selection">
      <div className="selection-header">
        <h3>Select Date & Time</h3>
        <p>Choose your preferred appointment date, time, and officer</p>
      </div>

      {/* Officer Selection */}
      <div className="officer-selection">
        <h4>
          <User size={20} />
          Select Officer (Optional)
        </h4>
        <div className="officers-grid">
          <div
            className={`officer-card ${!selectedOfficer ? 'selected' : ''}`}
            onClick={() => handleOfficerSelect(null)}
          >
            <div className="officer-avatar">
              <User size={24} />
            </div>
            <div className="officer-info">
              <h5>Any Available Officer</h5>
              <p>System will assign the best available officer</p>
            </div>
          </div>
          
          {service.officers?.map(officer => (
            <div
              key={officer.id}
              className={`officer-card ${selectedOfficer?.id === officer.id ? 'selected' : ''}`}
              onClick={() => handleOfficerSelect(officer)}
            >
              <div className="officer-avatar">
                <img src={officer.avatar} alt={officer.name} />
              </div>
              <div className="officer-info">
                <h5>{officer.name}</h5>
                <p>{officer.title}</p>
                <div className="officer-rating">
                  {'★'.repeat(Math.floor(officer.rating))} {officer.rating}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-section">
        <h4>
          <Calendar size={20} />
          Select Date
        </h4>
        
        <div className="calendar">
          <div className="calendar-header">
            <button className="nav-btn" onClick={() => navigateMonth(-1)}>
              <ChevronLeft size={16} />
            </button>
            <h5>{monthYear}</h5>
            <button className="nav-btn" onClick={() => navigateMonth(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {days.map((day, index) => (
              <button
                key={index}
                className={`calendar-day ${
                  !day.isCurrentMonth ? 'other-month' : ''
                } ${
                  day.isToday ? 'today' : ''
                } ${
                  !day.isAvailable ? 'unavailable' : ''
                } ${
                  selectedDate && selectedDate.toDateString() === day.date.toDateString() ? 'selected' : ''
                }`}
                onClick={() => handleDateSelect(day)}
                disabled={!day.isAvailable}
              >
                {day.date.getDate()}
              </button>
            ))}
          </div>
        </div>
        
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            Available
          </div>
          <div className="legend-item">
            <span className="legend-dot selected"></span>
            Selected
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable"></span>
            Unavailable
          </div>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="time-section">
          <h4>
            <Clock size={20} />
            Select Time
          </h4>
          <p className="selected-date">
            Selected Date: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          {timeSlots.length > 0 ? (
            <div className="time-slots">
              {timeSlots.map(slot => (
                <button
                  key={slot.time}
                  className={`time-slot ${selectedTime === slot.time ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(slot)}
                >
                  {slot.display}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-slots">
              <p>No available time slots for this date. Please select another date.</p>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {selectedDate && selectedTime && (
        <div className="selection-summary">
          <h4>Appointment Summary</h4>
          <div className="summary-details">
            <div className="summary-item">
              <Calendar size={16} />
              <span>{selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="summary-item">
              <Clock size={16} />
              <span>{selectedTime}</span>
            </div>
            {selectedOfficer && (
              <div className="summary-item">
                <User size={16} />
                <span>{selectedOfficer.name}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelection;
