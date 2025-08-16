import React from 'react';
import './LoadingStates.css';

// Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  message = 'Loading...', 
  overlay = false 
}) => {
  const sizeClasses = {
    small: 'loading-spinner--small',
    medium: 'loading-spinner--medium',
    large: 'loading-spinner--large'
  };

  const colorClasses = {
    primary: 'loading-spinner--primary',
    secondary: 'loading-spinner--secondary',
    white: 'loading-spinner--white'
  };

  return (
    <div className={`loading-container ${overlay ? 'loading-container--overlay' : ''}`}>
      <div className="loading-content">
        <div className={`loading-spinner ${sizeClasses[size]} ${colorClasses[color]}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ 
  progress = 0, 
  label = '', 
  showPercentage = true,
  color = 'primary',
  animated = true 
}) => {
  return (
    <div className="progress-container">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-fill--${color} ${animated ? 'progress-fill--animated' : ''}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="progress-percentage">{Math.round(progress)}%</div>
      )}
    </div>
  );
};

// Step Progress Component
export const StepProgress = ({ 
  steps = [], 
  currentStep = 0, 
  completedSteps = [],
  variant = 'horizontal' 
}) => {
  return (
    <div className={`step-progress step-progress--${variant}`}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        const isPending = index > currentStep;

        return (
          <div 
            key={index}
            className={`step-item ${
              isCompleted ? 'step-item--completed' : 
              isCurrent ? 'step-item--current' : 
              'step-item--pending'
            }`}
          >
            <div className="step-indicator">
              {isCompleted ? (
                <svg className="step-check" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="step-number">{index + 1}</span>
              )}
            </div>
            <div className="step-content">
              <div className="step-title">{step.title}</div>
              {step.description && (
                <div className="step-description">{step.description}</div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="step-connector"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Skeleton Components
export const SkeletonText = ({ 
  lines = 1, 
  width = '100%', 
  height = '1rem',
  animated = true 
}) => {
  return (
    <div className="skeleton-text">
      {Array.from({ length: lines }, (_, index) => (
        <div 
          key={index}
          className={`skeleton-line ${animated ? 'skeleton-animated' : ''}`}
          style={{ 
            width: Array.isArray(width) ? width[index] || width[0] : width,
            height 
          }}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonCard = ({ 
  showImage = true, 
  showTitle = true, 
  showDescription = true,
  showActions = true,
  animated = true 
}) => {
  return (
    <div className={`skeleton-card ${animated ? 'skeleton-animated' : ''}`}>
      {showImage && (
        <div className="skeleton-image"></div>
      )}
      <div className="skeleton-content">
        {showTitle && (
          <div className="skeleton-title"></div>
        )}
        {showDescription && (
          <div className="skeleton-description">
            <div className="skeleton-line" style={{ width: '100%' }}></div>
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '60%' }}></div>
          </div>
        )}
        {showActions && (
          <div className="skeleton-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-button skeleton-button--secondary"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export const SkeletonTable = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  animated = true 
}) => {
  return (
    <div className={`skeleton-table ${animated ? 'skeleton-animated' : ''}`}>
      {showHeader && (
        <div className="skeleton-table-header">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} className="skeleton-table-cell skeleton-table-cell--header"></div>
          ))}
        </div>
      )}
      <div className="skeleton-table-body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="skeleton-table-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="skeleton-table-cell"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonList = ({ 
  items = 5, 
  showAvatar = true, 
  showMeta = true,
  animated = true 
}) => {
  return (
    <div className={`skeleton-list ${animated ? 'skeleton-animated' : ''}`}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="skeleton-list-item">
          {showAvatar && (
            <div className="skeleton-avatar"></div>
          )}
          <div className="skeleton-list-content">
            <div className="skeleton-list-title"></div>
            <div className="skeleton-list-subtitle"></div>
            {showMeta && (
              <div className="skeleton-list-meta"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading states for specific components
export const ServiceCardSkeleton = () => (
  <SkeletonCard 
    showImage={true}
    showTitle={true}
    showDescription={true}
    showActions={true}
  />
);

export const ServiceListSkeleton = ({ count = 6 }) => (
  <div className="service-grid-skeleton">
    {Array.from({ length: count }, (_, index) => (
      <ServiceCardSkeleton key={index} />
    ))}
  </div>
);

export const BookingFormSkeleton = () => (
  <div className="booking-form-skeleton">
    <SkeletonText lines={1} width="200px" height="2rem" />
    <div className="form-row-skeleton">
      <div className="form-field-skeleton">
        <SkeletonText lines={1} width="120px" height="1rem" />
        <div className="skeleton-input"></div>
      </div>
      <div className="form-field-skeleton">
        <SkeletonText lines={1} width="120px" height="1rem" />
        <div className="skeleton-input"></div>
      </div>
    </div>
    <div className="form-field-skeleton">
      <SkeletonText lines={1} width="150px" height="1rem" />
      <div className="skeleton-textarea"></div>
    </div>
    <div className="form-actions-skeleton">
      <div className="skeleton-button skeleton-button--primary"></div>
      <div className="skeleton-button skeleton-button--secondary"></div>
    </div>
  </div>
);

export const AppointmentListSkeleton = () => (
  <div className="appointment-list-skeleton">
    <SkeletonText lines={1} width="200px" height="2rem" />
    <SkeletonList items={4} showAvatar={false} showMeta={true} />
  </div>
);

// Loading overlay component
export const LoadingOverlay = ({ 
  isVisible = false, 
  message = 'Loading...', 
  progress = null,
  onCancel = null 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <LoadingSpinner size="large" color="white" message={message} />
        {progress !== null && (
          <ProgressBar 
            progress={progress} 
            color="white" 
            showPercentage={true}
          />
        )}
        {onCancel && (
          <button 
            className="loading-overlay-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// Inline loading component
export const InlineLoading = ({ 
  size = 'small', 
  message = 'Loading...', 
  className = '' 
}) => (
  <div className={`inline-loading ${className}`}>
    <LoadingSpinner size={size} message={message} />
  </div>
);

// Button loading state
export const LoadingButton = ({ 
  loading = false, 
  children, 
  onClick,
  disabled = false,
  className = '',
  ...props 
}) => (
  <button 
    className={`loading-button ${className} ${loading ? 'loading-button--loading' : ''}`}
    onClick={onClick}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <LoadingSpinner size="small" color="white" />
    )}
    <span className={loading ? 'loading-button-text--hidden' : ''}>
      {children}
    </span>
  </button>
);

export default {
  LoadingSpinner,
  ProgressBar,
  StepProgress,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
  ServiceCardSkeleton,
  ServiceListSkeleton,
  BookingFormSkeleton,
  AppointmentListSkeleton,
  LoadingOverlay,
  InlineLoading,
  LoadingButton
};
