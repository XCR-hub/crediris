import { useState } from 'react';
import { createSimulation, getSimulationResults } from '../soap/client';
import { validateSimulationData } from '../validation';
import { AFIESCAError } from '../errors';
import { setStoredSimulationData } from '@/lib/utils';
import { toast } from '@/lib/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { SimulationFormData } from '../types';
import type { SimulationResultMT } from '../soap/types';

export function useAfiEsca() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AFIESCAError | null>(null);

  const simulate = async (formData: SimulationFormData): Promise<SimulationResultMT> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required data
      if (!formData?.insuredPerson) {
        throw new AFIESCAError(
          "Les données de l'assuré sont manquantes.",
          'VALIDATION_ERROR'
        );
      }

      // Validate and normalize data
      const validatedData = await validateSimulationData(formData);

      // Create simulation with retry logic
      const simulationResponse = await createSimulation(validatedData);
      
      if (import.meta.env.DEV) {
        console.debug('Simulation ID:', simulationResponse.SimulationId);
      }
      
      // Get simulation results
      const simulationResults = await getSimulationResults(simulationResponse.SimulationId);

      // Save to database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { error: dbError } = await supabase
          .from('loan_simulations')
          .insert({
            afi_esca_id: simulationResponse.SimulationId,
            simulation_data: validatedData,
            result_data: simulationResults,
            monthly_premium: simulationResults.Primes[0].Montant,
            total_premium: simulationResults.TotalPrimes
          });

        if (dbError) {
          console.error('Error saving simulation:', dbError);
        }
      }

      // Store simulation data
      setStoredSimulationData({ formData, simulationResponse: simulationResults });
      
      toast({
        variant: "success",
        title: "Simulation réussie",
        description: "Le calcul de votre assurance a été effectué avec succès"
      });

      return simulationResults;
    } catch (err) {
      console.error('Simulation error:', err);
      const error = err instanceof AFIESCAError ? err : new AFIESCAError(
        'Une erreur est survenue lors de la simulation',
        'SIMULATION_FAILED',
        err
      );
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: error.message
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveDossierSimulation = async (formData: SimulationFormData): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate required data
      if (!formData?.insuredPerson) {
        throw new AFIESCAError(
          "Les données de l'assuré sont manquantes.",
          'VALIDATION_ERROR'
        );
      }

      // Validate and normalize data
      const validatedData = await validateSimulationData(formData);

      // Create simulation
      const simulationResponse = await createSimulation(validatedData);
      
      if (import.meta.env.DEV) {
        console.debug('Simulation ID:', simulationResponse.SimulationId);
      }

      // Save dossier and get subscription URL
      const subscriptionUrl = await saveDossier({
        SimulationId: simulationResponse.SimulationId,
        ...validatedData
      });

      toast({
        variant: "success",
        title: "Dossier enregistré",
        description: "Votre dossier a été sauvegardé avec succès"
      });

      return subscriptionUrl;
    } catch (err) {
      console.error('Save dossier error:', err);
      const error = err instanceof AFIESCAError ? err : new AFIESCAError(
        'Une erreur est survenue lors de la sauvegarde',
        'SAVE_FAILED',
        err
      );
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: error.message
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    simulate,
    saveDossierSimulation,
    isLoading,
    error
  };
}