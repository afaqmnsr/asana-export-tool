import React, { useState } from 'react';
import './App.css';

// Import components
import {
  Header,
  ApiConfig,
  ProgressSection,
  ErrorSection,
  ExportResults,
  Footer
} from './components';

// Import utilities
import { exportAsanaData, demoData, downloadJSON, downloadCSV } from './utils';

function App() {
  const [apiToken, setApiToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [exportScope, setExportScope] = useState('assigned-only'); // Default to assigned-only

  const handleProgress = (current, total, message) => {
    setProgress({ current, total, message });
  };

  const handleExport = async () => {
    if (!apiToken.trim()) return;
    
    setIsLoading(true);
    setError('');
    setProgress({ current: 0, total: 0, message: 'Starting export...' });
    
    try {
      const data = await exportAsanaData(apiToken, handleProgress, exportScope);
      setExportData(data);
      setIsDemoMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0, message: '' });
    }
  };

  const handleDemo = () => {
    setExportData(demoData);
    setIsDemoMode(true);
    setError('');
  };

  const handleDownloadJSON = () => {
    if (exportData) {
      downloadJSON(exportData);
    }
  };

  const handleDownloadCSV = () => {
    if (exportData) {
      downloadCSV(exportData);
    }
  };

  return (
    <div className="app">
      <Header />
      
      <main className="app-main">
        <ApiConfig
          apiToken={apiToken}
          setApiToken={setApiToken}
          isLoading={isLoading}
          onExport={handleExport}
          onDemo={handleDemo}
          isDemoMode={isDemoMode}
          exportScope={exportScope}
          setExportScope={setExportScope}
        />
        
        {isLoading && (
          <ProgressSection isLoading={isLoading} progress={progress} message={progress.message} />
        )}
        
        {error && (
          <ErrorSection error={error} />
        )}
        
        {exportData && (
          <ExportResults
            exportData={exportData}
            onDownloadJSON={handleDownloadJSON}
            onDownloadCSV={handleDownloadCSV}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
