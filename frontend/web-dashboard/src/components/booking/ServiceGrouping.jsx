import React, { useState } from 'react';
import './ServiceGrouping.css';

// Dummy service data with dependencies
const services = [
  { id: 1, name: 'Passport Renewal', group: 'Identity', dependsOn: [] },
  { id: 2, name: 'National ID Update', group: 'Identity', dependsOn: [1] },
  { id: 3, name: 'Driving License', group: 'Transport', dependsOn: [] },
  { id: 4, name: 'Vehicle Registration', group: 'Transport', dependsOn: [3] },
];

function ServiceGrouping({ onSequenceSelect }) {
  const [selectedServices, setSelectedServices] = useState([]);

  // Group services by category
  const grouped = services.reduce((acc, svc) => {
    acc[svc.group] = acc[svc.group] || [];
    acc[svc.group].push(svc);
    return acc;
  }, {});

  // Handle selection and dependencies
  const handleSelect = (svc) => {
    let newSelection = [...selectedServices];
    if (!newSelection.includes(svc.id)) {
      // Add dependencies first
      svc.dependsOn.forEach(depId => {
        if (!newSelection.includes(depId)) newSelection.push(depId);
      });
      newSelection.push(svc.id);
    } else {
      newSelection = newSelection.filter(id => id !== svc.id);
    }
    setSelectedServices(newSelection);
    onSequenceSelect && onSequenceSelect(newSelection);
  };

  return (
    <div className="service-grouping">
      <h4>Group & Sequence Services</h4>
      {Object.keys(grouped).map(group => (
        <div key={group} className="service-group">
          <strong>{group}</strong>
          <ul>
            {grouped[group].map(svc => (
              <li key={svc.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(svc.id)}
                    onChange={() => handleSelect(svc)}
                  />
                  {svc.name}
                  {svc.dependsOn.length > 0 && (
                    <span className="dependency"> (Depends on: {svc.dependsOn.map(id => services.find(s => s.id === id).name).join(', ')})</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="selected-sequence">
        <strong>Selected Service Sequence:</strong> {selectedServices.map(id => services.find(s => s.id === id).name).join(' → ')}
      </div>
    </div>
  );
}

export default ServiceGrouping;
