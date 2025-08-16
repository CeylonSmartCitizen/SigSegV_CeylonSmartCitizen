import React, { useState, useEffect } from 'react';
import './SmartScheduler.css';

// Dummy slot data for demonstration
const slotData = [
  { date: '2025-08-18', slot: '09:00', wait: 5 },
  { date: '2025-08-18', slot: '10:00', wait: 2 },
  { date: '2025-08-18', slot: '13:00', wait: 10 },
  { date: '2025-08-20', slot: '11:00', wait: 3 },
  { date: '2025-08-20', slot: '12:00', wait: 1 },
  { date: '2025-08-22', slot: '09:00', wait: 7 },
  { date: '2025-08-22', slot: '17:00', wait: 4 },
];

function SmartScheduler({ selectedDates, onOptimalSelect }) {
  const [suggestedSlots, setSuggestedSlots] = useState([]);

  useEffect(() => {
    if (!selectedDates || selectedDates.length === 0) {
      setSuggestedSlots([]);
      return;
    }
    // Suggest slots with lowest wait times for selected dates
    const optimal = selectedDates.map(date => {
      const slots = slotData.filter(s => s.date === date);
      if (slots.length === 0) return null;
      const bestSlot = slots.reduce((a, b) => (a.wait < b.wait ? a : b));
      return bestSlot;
    }).filter(Boolean);
    setSuggestedSlots(optimal);
  }, [selectedDates]);

  return (
    <div className="smart-scheduler">
      <h4>Suggested Appointment Times</h4>
      {suggestedSlots.length === 0 ? (
        <div>No optimal slots found. Please select dates.</div>
      ) : (
        <ul>
          {suggestedSlots.map((slot, idx) => (
            <li key={idx}>
              {slot.date} - {slot.slot} (Estimated wait: {slot.wait} min)
              <button onClick={() => onOptimalSelect && onOptimalSelect(slot)}>
                Book This Slot
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SmartScheduler;
