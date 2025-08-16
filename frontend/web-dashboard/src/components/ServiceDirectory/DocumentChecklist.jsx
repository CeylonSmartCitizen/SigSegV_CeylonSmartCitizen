import React, { useState } from 'react';
import './DocumentChecklist.css';

function DocumentChecklist({ requirements }) {
  const [checked, setChecked] = useState(() => requirements.map(() => false));

  const handleCheck = (idx) => {
    setChecked((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  const completedCount = checked.filter(Boolean).length;

  return (
    <div className="document-checklist">
      <h3>Document Checklist</h3>
      <ul>
        {requirements.map((doc, idx) => (
          <li key={doc.name} className={checked[idx] ? 'completed' : ''}>
            <label>
              <input
                type="checkbox"
                checked={checked[idx]}
                onChange={() => handleCheck(idx)}
              />
              {doc.name}
              {doc.sampleImage && (
                <img src={doc.sampleImage} alt={doc.name + ' sample'} style={{ maxWidth: '60px', marginLeft: '1rem' }} />
              )}
            </label>
          </li>
        ))}
      </ul>
      <div className="checklist-progress">
        Completed: {completedCount} / {requirements.length}
      </div>
    </div>
  );
}

export default DocumentChecklist;
