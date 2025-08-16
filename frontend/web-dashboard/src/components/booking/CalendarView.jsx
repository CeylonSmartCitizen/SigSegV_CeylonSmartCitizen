import React, { useState } from 'react';
import './CalendarView.css';

// Dummy data for available dates
const availableDates = [
  '2025-08-18',
  '2025-08-20',
  '2025-08-22',
  '2025-08-25',
  '2025-08-19', // Added fully booked date
  '2025-08-21', // Added fully booked date
];

function CalendarView({ onDateSelect, onWaitList }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [waitListDate, setWaitListDate] = useState(null);

  // Generate days for current month
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
    return {
      date: dateStr,
      available: availableDates.includes(dateStr),
      fullyBooked: fullyBookedDates.includes(dateStr),
    };
  });

  const handleDateClick = (day) => {
    if (day.available) {
      setSelectedDates((prev) =>
        prev.includes(day.date)
          ? prev.filter((d) => d !== day.date)
          : [...prev, day.date]
      );
      onDateSelect && onDateSelect(day.date);
    } else if (day.fullyBooked) {
      setWaitListDate(day.date);
      onWaitList && onWaitList(day.date);
    }
  };

  return (
    <div className="calendar-view">
      <h3>Select Dates</h3>
      <div className="calendar-grid">
        {days.map((day) => (
          <button
            key={day.date}
            className={`calendar-day${day.available ? ' available' : ''}${selectedDates.includes(day.date) ? ' selected' : ''}${day.fullyBooked ? ' fully-booked' : ''}`}
            disabled={!(day.available || day.fullyBooked)}
            onClick={() => handleDateClick(day)}
          >
            {day.date.split('-')[2]}
          </button>
        ))}
      </div>
      {waitListDate && (
        <div className="wait-list">
          <span>Date {waitListDate} is fully booked. Added to wait list!</span>
        </div>
      )}
      <div className="selected-dates">
        <strong>Selected Dates:</strong> {selectedDates.join(', ')}
      </div>
    </div>
  );
}

export default CalendarView;
