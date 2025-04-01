import axios from 'axios';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { API_CONFIG } from './config';
import { AFIESCAError } from '../errors';
import type { SimulationDataMT, SimulationResultMT, DossierSimulationMT } from './types';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true
});

const builder = new XMLBuilder({
  attributeNamePrefix: "@_",
  ignoreAttributes: false
});

const apiClient = axios.create({
  baseURL: API_CONFIG.WSDL_URL,
  headers: {
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  }
});

/**
 * Creates a new simulation
 */
export async function createSimulation(data: SimulationDataMT): Promise<SimulationResultMT> {
  try {
    // For now, return mock data since we can't access the real API
    return {
      SimulationId: 'mock-' + Date.now(),
      Primes: [
        {
          Garantie: 'DC',
          Montant: 50.00
        }
      ],
      TotalPrimes: 12000.00,
      FraisDossier: 100.00,
      FormalitesMedicales: [
        'Questionnaire médical',
        'Rapport médical'
      ]
    } as SimulationResultMT;
  } catch (error) {
    console.error('Error creating simulation:', error);
    throw new AFIESCAError('Failed to create AFI ESCA simulation');
  }
}

/**
 * Gets simulation results
 */
export async function getSimulationResults(simulationId: string): Promise<SimulationResultMT> {
  try {
    // For now, return mock data since we can't access the real API
    return {
      SimulationId: simulationId,
      Primes: [
        {
          Garantie: 'DC',
          Montant: 50.00
        }
      ],
      TotalPrimes: 12000.00,
      FraisDossier: 100.00,
      FormalitesMedicales: [
        'Questionnaire médical',
        'Rapport médical'
      ]
    } as SimulationResultMT;
  } catch (error) {
    console.error('Error getting simulation results:', error);
    throw new AFIESCAError('Failed to get AFI ESCA simulation results');
  }
}

/**
 * Saves a dossier and returns the subscription URL
 */
export async function saveDossier(data: DossierSimulationMT): Promise<string> {
  try {
    // For now, return mock data since we can't access the real API
    return `https://subscription.afi-esca.com/mock-${Date.now()}`;
  } catch (error) {
    console.error('Error saving dossier:', error);
    throw new AFIESCAError('Failed to save AFI ESCA dossier');
  }
}

/**
 * Retries a failed API call with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof AFIESCAError && error.code === 'AUTH_ERROR') {
        throw error;
      }
      
      if (i === maxRetries - 1) break;
      
      // Calculate delay with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, i) + Math.random() * 1000,
        maxDelay
      );
      
      console.warn(`Retry attempt ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}