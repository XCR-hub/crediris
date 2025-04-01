import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { saveDossier } from '@/lib/afi-esca/soap/client';
import { toast } from './useToast';
import type { Application } from '@/types/database';

export function useApplicationSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submitApplication = async (applicationId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get application data
      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          health_questionnaires (*),
          insurance_documents (*)
        `)
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;

      // Save dossier to AFI ESCA
      const subscriptionUrl = await saveDossier({
        SimulationId: application.simulation_id,
        Souscripteur: {
          EstAssure: true,
          Civilite: application.health_data?.gender || 'M',
          Nom: application.user_data?.last_name || '',
          Prenom: application.user_data?.first_name || '',
          Email: application.user_data?.email || '',
          Telephone: application.user_data?.phone || '',
          Adresse: {
            Numero: '',
            TypeVoie: '',
            NomVoie: '',
            CodePostal: '',
            Ville: '',
            Pays: 'FRANCE'
          }
        },
        Beneficiaire: {
          Type: 'ORGANISME',
          NomOrganisme: '',
          Adresse: {
            Numero: '',
            TypeVoie: '',
            NomVoie: '',
            CodePostal: '',
            Ville: '',
            Pays: 'FRANCE'
          }
        },
        ReferencesBancaires: {
          IBAN: '',
          BIC: '',
          CompteJoint: false
        }
      });

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          afi_esca_url: subscriptionUrl
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: "Dossier soumis",
        description: "Votre dossier a été envoyé avec succès"
      });

      return subscriptionUrl;
    } catch (err) {
      console.error('Error submitting application:', err);
      const error = err as Error;
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitApplication,
    isLoading,
    error
  };
}