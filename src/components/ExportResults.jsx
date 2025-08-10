import React from 'react';

const ExportResults = ({ exportData, onDownloadJSON, onDownloadCSV }) => {
  const totalApiCalls = exportData.api_calls_made ? exportData.api_calls_made.total : 'N/A';
  
  return (
    <section className="export-results">
      <h2>Export Results</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Workspaces</h3>
          <p className="stat-number">{exportData.workspaces.length}</p>
        </div>
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-number">{exportData.projects.length}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p className="stat-number">{exportData.tasks.length}</p>
        </div>
        <div className="stat-card">
          <h3>Subtasks</h3>
          <p className="stat-number">{exportData.subtasks.length}</p>
        </div>
        <div className="stat-card">
          <h3>Comments</h3>
          <p className="stat-number">{exportData.stories.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Items</h3>
          <p className="stat-number">
            {exportData.tasks.length + exportData.subtasks.length}
          </p>
        </div>
        <div className="stat-card api-calls">
          <h3>API Calls</h3>
          <p className="stat-number">{totalApiCalls}</p>
          <small>Optimized for efficiency</small>
        </div>
      </div>

      <div className="download-section">
        <h3>Download Export Data</h3>
        <div className="download-buttons">
          <button onClick={onDownloadJSON} className="download-btn json">
            Download JSON (Full Data)
          </button>
          <button onClick={onDownloadCSV} className="download-btn csv">
            Download CSV (Flat View)
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExportResults;
