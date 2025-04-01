import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from './useToast';

interface AFIESCAStatus {
  status: string;
  url?: string;
  data?: any;
  lastUpdate?: string;
}

export function useAfiEscaStatus(applicationId: string) {
  const [status, setStatus] = useState<AFIESCAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('applications')
          .select('afi_esca_status, afi_esca_url, afi_esca_data, updated_at')
          .eq('id', applicationId)
          .single();

        if (fetchError) throw fetchError;

        if (mounted) {
          setStatus({
            status: data.afi_esca_status,
            url: data.afi_esca_url,
            data: data.afi_esca_data,
            lastUpdate: data.updated_at
          });
        }
      } catch (err) {
        console.error('Error fetching AFI ESCA status:', err);
        if (mounted) {
          setError(err as Error);
          toast({
            variant: "error",
            title: "Erreur",
            description: "Impossible de récupérer le statut de votre dossier"
          });
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
    const subscription = supabase
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
            setStatus({
              status: payload.new.afi_esca_status,
              url: payload.new.afi_esca_url,
              data: payload.new.afi_esca_data,
              lastUpdate: payload.new.updated_at
            });

            // Show notification for status changes
            if (payload.new.afi_esca_status !== payload.old.afi_esca_status) {
              toast({
                variant: "info",
                title: "Mise à jour du statut",
                description: `Votre dossier est maintenant ${payload.new.afi_esca_status.toLowerCase()}`
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applicationId]);

  return { status, isLoading, error };
}