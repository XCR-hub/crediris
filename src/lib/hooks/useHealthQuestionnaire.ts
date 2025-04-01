import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';
import type { HealthQuestionnaire } from '@/types/database';

export function useHealthQuestionnaire(applicationId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<HealthQuestionnaire | null>(null);

  const saveQuestionnaire = async (formData: Partial<HealthQuestionnaire>) => {
    try {
      setIsLoading(true);

      // Log form data in development only
      if (import.meta.env.DEV) {
        console.debug('Health questionnaire data:', formData);
      }

      // Save to database
      const { data: questionnaire, error } = await supabase
        .from('health_questionnaires')
        .upsert({
          application_id: applicationId,
          ...formData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Track successful save
      event({
        action: 'health_saved',
        category: 'form',
        label: applicationId
      });

      // Update local state
      setData(questionnaire);
      
      toast({
        variant: "success",
        title: "Questionnaire enregistré",
        description: "Vos informations de santé ont été sauvegardées"
      });

      return questionnaire;
    } catch (error) {
      console.error('Error saving health questionnaire:', error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder le questionnaire"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestionnaire = async () => {
    try {
      setIsLoading(true);

      const { data: questionnaire, error } = await supabase
        .from('health_questionnaires')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Log loaded data in development only
      if (import.meta.env.DEV) {
        console.debug('Loaded health questionnaire:', questionnaire);
      }

      setData(questionnaire);
      return questionnaire;
    } catch (error) {
      console.error('Error loading health questionnaire:', error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de charger le questionnaire"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    data,
    saveQuestionnaire,
    loadQuestionnaire
  };
}