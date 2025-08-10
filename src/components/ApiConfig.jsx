import React from 'react';

const ApiConfig = ({ 
  apiToken, 
  setApiToken, 
  isLoading, 
  onExport, 
  onDemo, 
  isDemoMode,
  exportScope,
  setExportScope
}) => {
  return (
    <section className="api-config">
      <h2>API Configuration</h2>
      <div className="input-group">
        <label htmlFor="apiToken">Asana Personal Access Token:</label>
        <input
          id="apiToken"
          type="password"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          placeholder="Enter your Asana PAT here"
          disabled={isLoading}
        />
        <small>
          Get your token from{' '}
          <a href="https://app.asana.com/0/developer-console" target="_blank" rel="noopener noreferrer">
            Asana Developer Console
          </a>
        </small>
      </div>
      
      <div className="export-scope">
        <label>Export Scope:</label>
        <div className="scope-options">
          <label className="scope-option">
            <input
              type="radio"
              name="exportScope"
              value="user-only"
              checked={exportScope === 'user-only'}
              onChange={(e) => setExportScope(e.target.value)}
              disabled={isLoading}
            />
            <span>My Tasks Only</span>
            <small>Tasks assigned to or created by you</small>
          </label>
          <label className="scope-option">
            <input
              type="radio"
              name="exportScope"
              value="assigned-only"
              checked={exportScope === 'assigned-only'}
              onChange={(e) => setExportScope(e.target.value)}
              disabled={isLoading}
            />
            <span>Assigned to Me Only</span>
            <small>Tasks assigned to you (excludes tasks you created but didn't assign to yourself)</small>
          </label>
          <label className="scope-option">
            <input
              type="radio"
              name="exportScope"
              value="all"
              checked={exportScope === 'all'}
              onChange={(e) => setExportScope(e.target.value)}
              disabled={isLoading}
            />
            <span>All Tasks</span>
            <small>Every task in projects you can access</small>
          </label>
          <label className="scope-option">
            <input
              type="radio"
              name="exportScope"
              value="completed-assigned"
              checked={exportScope === 'completed-assigned'}
              onChange={(e) => setExportScope(e.target.value)}
              disabled={isLoading}
            />
            <span>Completed Tasks Only</span>
            <small>Completed tasks and subtasks assigned to you</small>
          </label>
        </div>
      </div>
      
      <div className="button-group">
        <button 
          onClick={onExport} 
          disabled={isLoading || !apiToken.trim()}
          className="export-btn"
        >
          {isLoading ? 'Exporting...' : 'Start Export'}
        </button>
        
        <button 
          onClick={onDemo} 
          disabled={isLoading}
          className="demo-btn"
        >
          Try Demo Mode
        </button>
      </div>
      
      {isDemoMode && (
        <div className="demo-notice">
          <p><strong>Demo Mode Active!</strong> This shows sample data to demonstrate the export functionality.</p>
        </div>
      )}
    </section>
  );
};

export default ApiConfig;
