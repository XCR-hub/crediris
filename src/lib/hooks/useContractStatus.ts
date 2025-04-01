import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './useToast';
import type { Application } from '@/types/database';

export function useContractStatus(applicationId: string) {
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let subscription: any;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('applications')
          .select('status, afi_esca_status, afi_esca_url')
          .eq('id', applicationId)
          .single();

        if (fetchError) throw fetchError;

        if (mounted) {
          setStatus(data.afi_esca_status || data.status);
        }
      } catch (err) {
        console.error('Error fetching contract status:', err);
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Subscribe to changes
    subscription = supabase
      .channel(`application-${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `id=eq.${applicationId}`
        },
        (payload) => {
          if (mounted) {
            const newStatus = payload.new.afi_esca_status || payload.new.status;
            setStatus(newStatus);

            // Show notification for status changes
            if (newStatus === 'signed') {
              toast({
                variant: "success",
                title: "Contrat signé",
                description: "Votre contrat a été signé avec succès"
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [applicationId]);

  return { status, isLoading, error };
}