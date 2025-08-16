import React from 'react';
import './FeedbackMessage.css';

function FeedbackMessage({ type, message, action }) {
  return (
    <div className={`feedback-message ${type}`}>
      <span>{message}</span>
      {action && <button onClick={action.onClick}>{action.label}</button>}
    </div>
  );
}

export default FeedbackMessage;
