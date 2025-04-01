import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './useToast';

interface Subscription {
  id: string;
  user_id: string;
  dossier_id: string;
  status: 'pending' | 'signed' | 'error';
  afi_esca_url?: string;
  created_at: string;
  updated_at: string;
}

export function useSubscription() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSubscription = async (dossierId: string, afiEscaUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: subscription, error: createError } = await supabase
        .from('subscriptions')
        .insert({
          dossier_id: dossierId,
          status: 'pending',
          afi_esca_url: afiEscaUrl
        })
        .select()
        .single();

      if (createError) throw createError;

      toast({
        variant: "success",
        title: "Souscription créée",
        description: "Votre souscription a été initiée avec succès"
      });

      return subscription;
    } catch (err) {
      console.error('Error creating subscription:', err);
      const error = err as Error;
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de créer la souscription"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscriptionStatus = async (id: string, status: Subscription['status']) => {
    try {
      setIsLoading(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: "Statut mis à jour",
        description: "Le statut de votre souscription a été mis à jour"
      });
    } catch (err) {
      console.error('Error updating subscription:', err);
      const error = err as Error;
      setError(error);
      
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscription = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return subscription;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSubscription,
    updateSubscriptionStatus,
    getSubscription,
    isLoading,
    error
  };
}