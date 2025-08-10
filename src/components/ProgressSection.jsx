import React from 'react';

const ProgressSection = ({ isLoading, progress, message }) => {
  if (!isLoading) return null;

  const percentage = Math.round((progress.current / progress.total) * 100);
  
  // Check if we're in a rate limiting situation
  const isRateLimiting = message && (
    message.includes('Rate limited') || 
    message.includes('retrying') || 
    message.includes('429')
  );

  return (
    <section className="progress-section">
      <div className="progress-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="progress-text">
          <span className="progress-percentage">{percentage}%</span>
          <span className="progress-message">
            {message}
            {isRateLimiting && (
              <span className="rate-limit-indicator">
                ⏳ Handling rate limits...
              </span>
            )}
          </span>
        </div>
      </div>
    </section>
  );
};

export default ProgressSection;
