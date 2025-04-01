import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateQuotePDF } from '@/lib/pdf';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';

export function useSimulationActions() {
  const [isLoading, setIsLoading] = useState(false);

  const sendQuoteByEmail = async (email: string, simulationData: any) => {
    try {
      setIsLoading(true);

      // Generate PDF
      const pdfData = generateQuotePDF(simulationData);

      // Save to Supabase Storage
      const filePath = `quotes/${Date.now()}_quote.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('quotes')
        .upload(filePath, pdfData, {
          contentType: 'application/pdf'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quotes')
        .getPublicUrl(filePath);

      // Save lead in database
      const { error: dbError } = await supabase
        .from('leads')
        .insert({
          email,
          simulation_id: simulationData.simulationId,
          quote_url: publicUrl,
          type: 'EMAIL_QUOTE'
        });

      if (dbError) throw dbError;

      // Track event
      event({
        action: 'quote_sent',
        category: 'email',
        label: email
      });

      toast({
        variant: "success",
        title: "Devis envoyé",
        description: "Votre devis a été envoyé par email"
      });
    } catch (error) {
      console.error('Error sending quote:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'envoyer le devis"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestCallback = async (data: any) => {
    try {
      setIsLoading(true);

      // Save callback request
      const { error: dbError } = await supabase
        .from('leads')
        .insert({
          ...data,
          type: 'CALLBACK_REQUEST',
          status: 'pending'
        });

      if (dbError) throw dbError;

      // Track event
      event({
        action: 'callback_requested',
        category: 'contact',
        label: data.phone
      });

      toast({
        variant: "success",
        title: "Demande envoyée",
        description: "Un conseiller vous rappellera bientôt"
      });
    } catch (error) {
      console.error('Error requesting callback:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'enregistrer votre demande"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendQuoteByEmail,
    requestCallback,
    isLoading
  };
}