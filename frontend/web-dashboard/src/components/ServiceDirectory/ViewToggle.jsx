import React from 'react';
import { Grid3x3, List } from 'lucide-react';
import '../../styles/ViewToggle.css';

const ViewToggle = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="view-toggle">
      <button 
        className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
        onClick={() => onViewModeChange('grid')}
        title="Grid View"
      >
        <Grid3x3 size={20} />
        <span>Grid</span>
      </button>
      <button 
        className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
        onClick={() => onViewModeChange('list')}
        title="List View"
      >
        <List size={20} />
        <span>List</span>
      </button>
    </div>
  );
};

export default ViewToggle;
