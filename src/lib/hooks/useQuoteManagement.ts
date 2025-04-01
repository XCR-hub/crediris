import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateQuotePDF } from '@/lib/pdf/quoteGenerator';
import { format } from 'date-fns';
import { toast } from './useToast';
import type { Application } from '@/types/database';

export function useQuoteManagement(applicationId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const generateQuote = async () => {
    try {
      setIsGenerating(true);

      // Get application data with related information
      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select(`
          *,
          health_questionnaires (*),
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

      // Generate PDF
      const pdfData = generateQuotePDF({
        application,
        simulationResult: JSON.parse(application.simulation_data),
        healthData: application.health_questionnaires,
        userData: application.users
      });

      // Convert data URI to Blob
      const pdfBlob = await fetch(pdfData).then(res => res.blob());

      // Upload to Supabase Storage
      const filePath = `quotes/${applicationId}/${Date.now()}_quote.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('quotes')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('quotes')
        .getPublicUrl(filePath);

      // Update application
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          quote_url: publicUrl,
          quote_generated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: "Devis généré",
        description: "Votre devis a été généré avec succès"
      });

      return publicUrl;
    } catch (error) {
      console.error('Error generating quote:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de générer le devis"
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQuote = async () => {
    try {
      setIsDownloading(true);

      const { data: application, error: fetchError } = await supabase
        .from('applications')
        .select('quote_url')
        .eq('id', applicationId)
        .single();

      if (fetchError) throw fetchError;
      if (!application.quote_url) throw new Error('Quote not found');

      // Create download link
      const link = document.createElement('a');
      link.href = application.quote_url;
      link.download = `devis_assurance_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      link.click();

      // Track download
      await supabase
        .from('insurance_documents')
        .insert({
          application_id: applicationId,
          type: 'QUOTE',
          file_path: application.quote_url,
          file_name: link.download,
          file_size: 0, // Size unknown for external URL
          mime_type: 'application/pdf',
          status: 'downloaded'
        });

      toast({
        variant: "success",
        title: "Téléchargement",
        description: "Le devis a été téléchargé avec succès"
      });
    } catch (error) {
      console.error('Error downloading quote:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de télécharger le devis"
      });
      throw error;
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    generateQuote,
    downloadQuote,
    isGenerating,
    isDownloading
  };
}