import { useState } from 'react';
import { saveDossier } from '../soap/client';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';
import type { DossierSimulationMT } from '../soap/types';

export function useSaveSimulation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveSimulation = async (applicationId: string, simulationData: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get user data
      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          users (
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            postal_code
          )
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Format data for AFI ESCA
      const dossierData: DossierSimulationMT = {
        SimulationId: simulationData.simulationId,
        Souscripteur: {
          EstAssure: true,
          Civilite: application.users.gender || 'M',
          Nom: application.users.last_name.toUpperCase(),
          Prenom: application.users.first_name,
          Email: application.users.email,
          Telephone: formatPhone(application.users.phone),
          Adresse: {
            Numero: application.users.address_number || '',
            TypeVoie: application.users.address_type || '',
            NomVoie: application.users.address || '',
            CodePostal: application.users.postal_code || '',
            Ville: application.users.city || '',
            Pays: 'FRANCE'
          }
        },
        Beneficiaire: {
          Type: 'ORGANISME',
          NomOrganisme: 'CREDIRIS',
          Adresse: {
            Numero: '1',
            TypeVoie: 'RUE',
            NomVoie: 'DE LA PAIX',
            CodePostal: '75001',
            Ville: 'PARIS',
            Pays: 'FRANCE'
          }
        },
        ReferencesBancaires: {
          IBAN: '',
          BIC: '',
          CompteJoint: false
        }
      };

      // Save to AFI ESCA
      const subscriptionUrl = await saveDossier(dossierData);

      // Update application with AFI ESCA URL
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          afi_esca_url: subscriptionUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: "Simulation sauvegardée",
        description: "Votre simulation a été enregistrée avec succès"
      });

      return subscriptionUrl;
    } catch (err) {
      console.error('Error saving simulation:', err);
      const error = err as Error;
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder la simulation"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveSimulation,
    isLoading,
    error
  };
}

function formatPhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.startsWith('0') ? `+33${phone.slice(1)}` : phone;
}