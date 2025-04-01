import { useState } from 'react';
import { createSimulation, getSimulationResults, saveDossier } from '@/lib/afi-esca/soap/client';
import { mapToSimulationData, mapToDossierData } from '@/lib/afi-esca/soap/mappers';
import type { SimulationDataMT, SimulationResultMT } from '@/lib/afi-esca/soap/types';
import { toast } from './useToast';
import { trackConversion } from '@/lib/analytics';

export function useAfiEsca() {
  const [isLoading, setIsLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResultMT | null>(null);

  const simulate = async (formData: any) => {
    try {
      setIsLoading(true);

      // Map form data to AFI ESCA format
      const simulationData: SimulationDataMT = mapToSimulationData(formData);

      // Create simulation
      const createResult = await createSimulation(simulationData);
      
      // Get simulation results
      const results = await getSimulationResults(createResult.SimulationId);
      
      setSimulationResult(results);
      
      // Store simulation data for later use
      localStorage.setItem('simulationData', JSON.stringify({
        formData,
        simulationResponse: results
      }));

      // Track conversion
      trackConversion('SIMULATION', results.TotalPrimes);

      toast({
        variant: "success",
        title: "Simulation réussie",
        description: "Votre simulation a été calculée avec succès"
      });

      return results;
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'obtenir une simulation. Veuillez réessayer."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDossierSimulation = async (formData: any, simulationId: string) => {
    try {
      setIsLoading(true);
      
      // Map data and save dossier
      const dossierData = mapToDossierData(formData, simulationId);
      const result = await saveDossier(dossierData);

      // Track conversion
      trackConversion('SUBSCRIPTION');
      
      toast({
        variant: "success",
        title: "Dossier enregistré",
        description: "Votre dossier a été enregistré avec succès"
      });
      
      return result;
    } catch (error) {
      console.error('Save dossier error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder le dossier. Veuillez réessayer."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    simulationResult,
    simulate,
    saveDossierSimulation
  };
}