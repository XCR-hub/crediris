import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export { getSafeOrigin, getSafePath, checkForCrossOriginIssues } from './origin';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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