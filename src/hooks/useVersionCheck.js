import { useState, useEffect } from "react";

/**
 * Custom hook to detect frontend version changes
 * @param {number} interval - Polling interval in milliseconds (default 10s)
 * @returns {object} { version, latestVersion, isNewVersionAvailable }
 */
export const useVersionCheck = (interval = 10000) => {
  const [currentVersion, setCurrentVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  // Skip version check in localhost
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const fetchVersion = async () => {
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch version.json");
      }

      const data = await response.json();
      const newVersion = data.version;

      if (!currentVersion) {
        setCurrentVersion(newVersion);
        setLatestVersion(newVersion);
      } else if (newVersion !== currentVersion) {
        setLatestVersion(newVersion);
        setIsNewVersionAvailable(true);
      }
    } catch (error) {
      console.error("Error checking version:", error);
    }
  };

  useEffect(() => {
    // Don't check version in local
    if (isLocalhost) return;

    fetchVersion();

    const timer = setInterval(() => {
      fetchVersion();
    }, interval);

    return () => clearInterval(timer);
  }, [currentVersion, interval, isLocalhost]);

  return { currentVersion, latestVersion, isNewVersionAvailable };
};
