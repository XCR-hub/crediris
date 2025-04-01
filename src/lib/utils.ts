import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSafeOrigin(): string {
  try {
    // Only access origin in top-level window
    if (window === window.top) {
      return window.location.origin;
    }
    // Return default origin for iframes
    return import.meta.env.VITE_APP_URL || 'http://localhost:3000';
  } catch (error) {
    console.warn("Unable to access window.location.origin");
    return import.meta.env.VITE_APP_URL || 'http://localhost:3000';
  }
}

export function getSafePath(): string {
  try {
    // Only access pathname in top-level window
    if (window === window.top) {
      return window.location.pathname;
    }
    // Return root path for iframes
    return '/';
  } catch (error) {
    console.warn("Unable to access window.location.pathname");
    return '/';
  }
}

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

export function getStoredSimulationData(): any | null {
  try {
    const data = localStorage.getItem('simulationData');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to parse simulation data from storage:", error);
    }
    return null;
  }
}

export function setStoredSimulationData(data: any): void {
  try {
    localStorage.setItem('simulationData', JSON.stringify(data));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to save simulation data to storage:", error);
    }
  }
}

export function clearStoredSimulationData(): void {
  try {
    localStorage.removeItem('simulationData');
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to clear simulation data from storage:", error);
    }
  }
}