import React from 'react';
import './TimeSlotGrid.css';

// Dummy business hours and holidays
const businessHours = { start: 9, end: 17 }; // 9 AM to 5 PM
const holidays = ['2025-08-19', '2025-08-21'];

// Dummy time slot availability
const timeSlots = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];
const slotAvailability = {
  '2025-08-18': ['09:00', '10:00', '13:00', '15:00'],
  '2025-08-20': ['11:00', '12:00', '14:00', '16:00'],
  '2025-08-22': ['09:00', '10:00', '11:00', '17:00'],
  '2025-08-25': ['12:00', '13:00', '14:00', '15:00'],
};

function TimeSlotGrid({ selectedDate, onSlotSelect }) {
  if (!selectedDate) return <div>Please select a date.</div>;
  if (holidays.includes(selectedDate)) return <div>This date is a holiday. No slots available.</div>;

  const availableSlots = slotAvailability[selectedDate] || [];

  return (
    <div className="time-slot-grid">
      <h4>Available Time Slots</h4>
      <div className="slot-grid">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            className={`slot-btn${availableSlots.includes(slot) ? ' available' : ''}`}
            disabled={!availableSlots.includes(slot)}
            onClick={() => onSlotSelect && onSlotSelect(slot)}
          >
            {slot}
          </button>
        ))}
      </div>
      <div className="business-hours">
        <small>Business Hours: {businessHours.start}:00 - {businessHours.end}:00</small>
      </div>
    </div>
  );
}

export default TimeSlotGrid;
