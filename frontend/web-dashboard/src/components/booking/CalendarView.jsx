import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CalendarView = ({ 
  selectedDates = [], 
  onDateSelect, 
  availabilityData = {},
  businessHours = { start: 9, end: 17 },
  holidays = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Business configuration
  const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
  
  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, availabilityData, holidays]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = currentDate.toDateString() === new Date().toDateString();
      const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
      const isWorkingDay = workingDays.includes(currentDate.getDay());
      const isHoliday = holidays.includes(dateKey);
      const availability = availabilityData[dateKey] || { available: false, slots: 0 };
      
      days.push({
        date: new Date(currentDate),
        dateKey,
        day: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isPast,
        isWorkingDay,
        isHoliday,
        isAvailable: isCurrentMonth && !isPast && isWorkingDay && !isHoliday && availability.available,
        availableSlots: availability.slots || 0,
        isSelected: selectedDates.includes(dateKey)
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (dayInfo) => {
    if (dayInfo.isAvailable) {
      onDateSelect && onDateSelect(dayInfo.dateKey, dayInfo);
    }
  };

  const getDateClassName = (dayInfo) => {
    let baseClass = "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all duration-200";
    
    if (!dayInfo.isCurrentMonth) {
      return `${baseClass} text-gray-300 cursor-not-allowed`;
    }
    
    if (dayInfo.isPast) {
      return `${baseClass} text-gray-400 cursor-not-allowed`;
    }
    
    if (dayInfo.isHoliday) {
      return `${baseClass} text-red-400 cursor-not-allowed bg-red-50`;
    }
    
    if (!dayInfo.isWorkingDay) {
      return `${baseClass} text-gray-400 cursor-not-allowed`;
    }
    
    if (dayInfo.isSelected) {
      return `${baseClass} bg-blue-600 text-white shadow-lg`;
    }
    
    if (dayInfo.isAvailable) {
      if (dayInfo.availableSlots > 5) {
        return `${baseClass} text-green-700 bg-green-100 hover:bg-green-200 border border-green-300`;
      } else if (dayInfo.availableSlots > 0) {
        return `${baseClass} text-yellow-700 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300`;
      }
    }
    
    if (dayInfo.isToday) {
      return `${baseClass} text-blue-600 bg-blue-50 border border-blue-300`;
    }
    
    return `${baseClass} text-gray-500 cursor-not-allowed`;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => (
          <div
            key={index}
            className={getDateClassName(dayInfo)}
            onClick={() => handleDateClick(dayInfo)}
            title={
              dayInfo.isHoliday ? 'Holiday' :
              !dayInfo.isWorkingDay ? 'Weekend' :
              dayInfo.isPast ? 'Past date' :
              dayInfo.isAvailable ? `${dayInfo.availableSlots} slots available` :
              'No slots available'
            }
          >
            <span>{dayInfo.day}</span>
            {dayInfo.isAvailable && dayInfo.availableSlots > 0 && (
              <div className="absolute mt-6 ml-6 h-1 w-1 bg-current rounded-full opacity-75"></div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-gray-600">Many slots available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-yellow-100 border border-yellow-300 rounded"></div>
          <span className="text-gray-600">Few slots available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-red-50 border border-red-300 rounded"></div>
          <span className="text-gray-600">Holiday</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
