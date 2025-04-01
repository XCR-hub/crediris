import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { generateContractPDF } from '@/lib/pdf/contractGenerator';
import { generateContractConfirmationEmail, generateInternalNotificationEmail } from '@/lib/email/templates';
import { base64ToBlob } from '@/lib/files';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';
import type { Application, HealthQuestionnaire } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface ContractSubmissionData {
  application: Application;
  simulationResult: SimulationResultMT;
  healthData: HealthQuestionnaire;
  signature: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
}

export function useContractSubmission() {
  const [isLoading, setIsLoading] = useState(false);

  const submitContract = async (data: ContractSubmissionData) => {
    try {
      setIsLoading(true);

      // Get client IP for audit
      let ipAddress = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        ipAddress = ip;
      } catch (error) {
        console.warn('Could not fetch IP address:', error);
        ipAddress = 'unknown';
      }

      // Generate contract PDF
      const pdfData = generateContractPDF({
        ...data,
        signatureDate: new Date(),
        signatureIp: ipAddress
      });

      // Convert data URI to Blob
      const pdfBlob = base64ToBlob(pdfData);

      // Upload to Supabase Storage
      const filePath = `contracts/${data.application.id}/contract_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'signed',
          signature_date: new Date().toISOString(),
          signature_ip: ipAddress,
          signature_data: data.signature,
          contract_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.application.id);

      if (updateError) throw updateError;

      // Send confirmation email to user
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.userData.email,
          subject: 'Votre contrat d\'assurance emprunteur Crediris',
          html: generateContractConfirmationEmail({
            firstName: data.userData.firstName,
            lastName: data.userData.lastName,
            applicationId: data.application.id,
            contractUrl: publicUrl,
            loanAmount: data.application.loan_amount,
            monthlyPayment: data.application.monthly_payment || 0,
            coverageType: data.application.coverage_type || 'BOTH'
          })
        }
      });

      if (emailError) {
        console.error('Error sending confirmation email:', emailError);
      }

      // Send internal notification
      const { error: notificationError } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'contact@crediris.fr',
          subject: `Nouveau contrat signé - ${data.application.id}`,
          html: generateInternalNotificationEmail({
            applicationId: data.application.id,
            firstName: data.userData.firstName,
            lastName: data.userData.lastName,
            email: data.userData.email,
            loanAmount: data.application.loan_amount,
            coverageType: data.application.coverage_type || 'BOTH'
          })
        }
      });

      if (notificationError) {
        console.error('Error sending internal notification:', notificationError);
      }

      // Track conversion
      event({
        action: 'contract_signed',
        category: 'conversion',
        label: data.application.id,
        value: Math.round(data.application.loan_amount)
      });

      toast({
        variant: "success",
        title: "Contrat signé",
        description: "Votre contrat a été signé et enregistré avec succès"
      });

      return publicUrl;
    } catch (error) {
      console.error('Error submitting contract:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la signature du contrat"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitContract,
    isLoading
  };
}