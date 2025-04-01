import { describe, it, expect, vi } from 'vitest';
import { createSimulation, getSimulationResults } from '../soap/client';
import { validateSimulationData } from '../validation';
import { AFIESCAError } from '../errors';
import type { SimulationFormData } from '../hooks/useAFISimulation';

// Mock API client
vi.mock('../soap/client', () => ({
  createSimulation: vi.fn(),
  getSimulationResults: vi.fn()
}));

describe('AFI ESCA Simulation', () => {
  const validFormData: SimulationFormData = {
    loan: {
      amount: 100000,
      duration: 240,
      rate: 3.5,
      type: 'MORTGAGE'
    },
    insured: {
      gender: 'HOMME',
      birthDate: '1990-01-01',
      profession: 'Développeur',
      professionalCategory: 'EMPLOYEE',
      smoker: false
    },
    coverage: {
      death: true,
      ptia: false,
      ipt: false,
      itt: false,
      ipp: false,
      quotity: 100
    }
  };

  it('validates simulation data correctly', async () => {
    const result = await validateSimulationData(validFormData);
    expect(result).toBeDefined();
    expect(result.Pret.Montant).toBe(100000);
    expect(result.Garanties).toHaveLength(5);
  });

  it('throws error for invalid loan amount', async () => {
    const invalidData = {
      ...validFormData,
      loan: { ...validFormData.loan, amount: 5000 }
    };

    await expect(validateSimulationData(invalidData)).rejects.toThrow(AFIESCAError);
  });

  it('normalizes guarantees based on dependencies', async () => {
    const dataWithIPT = {
      ...validFormData,
      coverage: {
        ...validFormData.coverage,
        ipt: true
      }
    };

    const result = await validateSimulationData(dataWithIPT);
    expect(result.Garanties.find(g => g.Code === 'DC')?.Selected).toBe(true);
    expect(result.Garanties.find(g => g.Code === 'PTIA')?.Selected).toBe(true);
  });

  it('handles API errors correctly', async () => {
    const apiError = new AFIESCAError('API Error', 'SERVICE_UNAVAILABLE');
    (createSimulation as any).mockRejectedValue(apiError);

    await expect(createSimulation(validFormData)).rejects.toThrow(AFIESCAError);
  });

  it('processes simulation results correctly', async () => {
    const mockResult = {
      SimulationId: '123',
      Primes: [{ Montant: 50 }],
      TotalPrimes: 12000
    };

    (getSimulationResults as any).mockResolvedValue(mockResult);
    const result = await getSimulationResults('123');
    
    expect(result.SimulationId).toBe('123');
    expect(result.Primes[0].Montant).toBe(50);
  });
});