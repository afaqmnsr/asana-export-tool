import React from 'react';

const ErrorSection = ({ error }) => {
  return (
    <section className="error-section">
      <h3>Error</h3>
      <p className="error-message">{error}</p>
    </section>
  );
};

export default ErrorSection;
