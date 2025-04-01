import { useState } from 'react';
import { generateQuotePDF } from '@/lib/pdf/quoteGenerator';
import { supabase } from '@/lib/supabase';
import { toast } from './useToast';
import type { Application } from '@/types/database';

export function useQuoteGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuote = async (applicationId: string) => {
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
        userData: {
          firstName: application.users.first_name,
          lastName: application.users.last_name,
          email: application.users.email,
          phone: application.users.phone,
          address: application.users.address,
          city: application.users.city,
          postalCode: application.users.postal_code
        }
      });

      // Convert data URI to Blob
      const pdfBlob = await fetch(pdfData).then(res => res.blob());

      // Save to Supabase Storage
      const filePath = `quotes/${applicationId}/${Date.now()}_quote.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Update application with quote URL
      const { error: updateError } = await supabase
        .from('applications')
        .update({ quote_url: publicUrl })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // Trigger download
      const link = document.createElement('a');
      link.href = pdfData;
      link.download = `devis_assurance_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      link.click();

      toast({
        variant: "success",
        title: "Devis généré",
        description: "Votre devis a été généré et téléchargé avec succès"
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

  return {
    generateQuote,
    isGenerating
  };
}