import React from 'react';
import './SkeletonScreen.css';

function SkeletonScreen({ rows = 5 }) {
  return (
    <div className="skeleton-screen">
      {[...Array(rows)].map((_, idx) => (
        <div key={idx} className="skeleton-row" />
      ))}
    </div>
  );
}

export default SkeletonScreen;
