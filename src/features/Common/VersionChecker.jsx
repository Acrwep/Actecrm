import React, { useState, useEffect } from 'react';
import './versionChecker.css';

/**
 * VersionChecker Component
 * Checks for frontend version updates at regular intervals.
 * Displays a premium glassmorphism banner when a new version is detected.
 */
const VersionChecker = () => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  const fetchVersion = async () => {
    try {
      // Fetch version.json with cache busting
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-cache',
      });
      
      if (!response.ok) return;

      const data = await response.json();
      const latestVersion = data.version;

      if (!currentVersion) {
        // First load: store the initial version
        setCurrentVersion(latestVersion);
      } else if (latestVersion !== currentVersion) {
        // Version mismatch detected
        setIsUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for version update:', error);
    }
  };

  useEffect(() => {
    // Initial check on mount
    fetchVersion();

    // Check every 30 seconds (30000ms) for better responsiveness
    const interval = setInterval(fetchVersion, 30000);

    return () => clearInterval(interval);
  }, [currentVersion]);

  const handleUpdate = () => {
    // Force reload from server to get latest assets
    window.location.reload(true);
  };

  if (!isUpdateAvailable) return null;

  return (
    <div className="version-update-toast">
      <div className="version-update-content">
        <div className="update-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </div>
        <div className="update-text">
          <p className="update-title">New Version Available</p>
          <p className="update-desc">A fresh update is ready with new features and fixes.</p>
        </div>
        <button className="update-refresh-btn" onClick={handleUpdate}>
          Update Now
        </button>
      </div>
    </div>
  );
};

export default VersionChecker;
