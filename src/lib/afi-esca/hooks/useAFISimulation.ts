import { useState } from 'react';
import { createSimulation, getSimulationResults } from '../soap/client';
import { validateSimulationData } from '../validation';
import { AFIESCAError } from '../errors';
import { toast } from '@/lib/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { SimulationDataMT, SimulationResultMT } from '../soap/types';

export interface SimulationFormData {
  loan: {
    amount: number;
    duration: number;
    rate: number;
    type: 'MORTGAGE' | 'CONSUMER' | 'PROFESSIONAL';
  };
  insured: {
    gender: 'HOMME' | 'FEMME';
    birthDate: string;
    profession: string;
    professionalCategory: string;
    smoker: boolean;
    cigarettesPerDay?: number;
  };
  coverage: {
    death: boolean;
    ptia: boolean;
    ipt: boolean;
    itt: boolean;
    ipp: boolean;
    quotity: number;
  };
}

export function useAFISimulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AFIESCAError | null>(null);

  const simulate = async (formData: SimulationFormData): Promise<SimulationResultMT> => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate and normalize data
      const validatedData = await validateSimulationData({
        loan: {
          amount: formData.loan.amount,
          duration: formData.loan.duration,
          rate: formData.loan.rate,
          type: formData.loan.type
        },
        insured: {
          gender: formData.insured.gender,
          birthDate: formData.insured.birthDate,
          profession: formData.insured.profession,
          professionalCategory: formData.insured.professionalCategory,
          smoker: formData.insured.smoker,
          cigarettesPerDay: formData.insured.cigarettesPerDay
        },
        coverage: {
          death: formData.coverage.death,
          ptia: formData.coverage.ptia,
          ipt: formData.coverage.ipt,
          itt: formData.coverage.itt,
          ipp: formData.coverage.ipp,
          quotity: formData.coverage.quotity
        }
      });

      // Create simulation
      const simulationResponse = await createSimulation(validatedData);
      
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

  return {
    simulate,
    isLoading,
    error
  };
}