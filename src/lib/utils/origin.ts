/**
 * Safely gets the window origin with fallback
 */
export function getSafeOrigin(): string {
  try {
    return import.meta.env.VITE_APP_URL || 'http://localhost:3000';
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Unable to access window.location.origin:", error);
    }
    return import.meta.env.VITE_APP_URL || 'http://localhost:3000';
  }
}

/**
 * Safely gets the current pathname with fallback
 */
export function getSafePath(): string {
  try {
    return window.location.pathname || '/';
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Unable to access window.location.pathname:", error);
    }
    return '/';
  }
}

/**
 * Checks for potential cross-origin issues
 */
export function checkForCrossOriginIssues(): void {
  try {
    // Check if running in iframe
    if (window !== window.top) {
      console.warn("Application is running in an iframe");
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'SecurityError') {
      console.warn("Cross-origin frame access blocked");
    }
  }
}