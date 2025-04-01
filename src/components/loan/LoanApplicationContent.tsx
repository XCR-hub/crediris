import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { LoanCalculator } from '@/components/forms/LoanCalculator';
import { HealthQuestionnaire } from '@/components/forms/HealthQuestionnaire';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { ApplicationProgress } from '@/components/forms/ApplicationProgress';
import { ApplicationSummary } from '@/components/forms/ApplicationSummary';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { safeNavigate } from '@/lib/navigation';
import { toast } from '@/lib/hooks/useToast';
import type { ApplicationStep } from '@/components/forms/ApplicationProgress';

export function LoanApplicationContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('LOAN_INFO');
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [loanData, setLoanData] = useState({
    amount: 100000,
    duration: 240,
    rate: 3.5,
    monthlyPayment: 0,
    coverageType: 'BOTH' as const
  });

  const handleLoanCalculation = async (data: any) => {
    try {
      setIsLoading(true);
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user?.id) {
        console.error('User error:', userError?.message);
        safeNavigate(navigate, '/signin');
        return;
      }

      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert([
          {
            user_id: user.id,
            loan_amount: data.loan_amount,
            loan_duration: data.loan_duration,
            loan_rate: data.loan_rate,
            monthly_payment: data.monthly_payment,
            status: 'draft',
            coverage_type: data.coverage_type,
          },
        ])
        .select()
        .single();

      if (applicationError) {
        console.error('Application error:', applicationError.message);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Erreur lors de l'enregistrement de la simulation"
        });
        return;
      }

      setApplicationId(application.id);
      setLoanData({
        amount: data.loan_amount,
        duration: data.loan_duration,
        rate: data.loan_rate,
        monthlyPayment: data.monthly_payment,
        coverageType: data.coverage_type
      });
      setCurrentStep('HEALTH_INFO');
      
      toast({
        variant: "success",
        title: "Simulation enregistrée",
        description: "Vous pouvez maintenant continuer avec le questionnaire de santé"
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHealthQuestionnaireSubmit = async (healthData: any) => {
    try {
      setIsLoading(true);
      if (!applicationId) return;

      const { error } = await supabase
        .from('applications')
        .update({
          health_data: healthData,
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Health data error:', error);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Erreur lors de la mise à jour du questionnaire"
        });
        return;
      }

      setCurrentStep('DOCUMENTS');
      toast({
        variant: "success",
        title: "Questionnaire enregistré",
        description: "Vous pouvez maintenant télécharger les documents requis"
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentUploadComplete = () => {
    toast({
      variant: "success",
      title: "Documents téléchargés",
      description: "Votre dossier est complet"
    });
    safeNavigate(navigate, '/');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {currentStep === 'LOAN_INFO' && 'Simulation de prêt'}
          {currentStep === 'HEALTH_INFO' && 'Questionnaire de santé'}
          {currentStep === 'DOCUMENTS' && 'Documents requis'}
        </h1>

        <ApplicationProgress currentStep={currentStep} />

        {currentStep === 'LOAN_INFO' && (
          <LoanCalculator
            onCalculate={handleLoanCalculation}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'HEALTH_INFO' && (
          <HealthQuestionnaire
            onSubmit={handleHealthQuestionnaireSubmit}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'DOCUMENTS' && applicationId && (
          <DocumentUpload
            applicationId={applicationId}
            onUploadComplete={handleDocumentUploadComplete}
            onUploadError={(error) => {
              console.error('Upload error:', error);
              toast({
                variant: "error",
                title: "Erreur",
                description: "Erreur lors du téléchargement du document"
              });
            }}
          />
        )}

        {currentStep !== 'LOAN_INFO' && (
          <ApplicationSummary
            loanAmount={loanData.amount}
            loanDuration={loanData.duration}
            loanRate={loanData.rate}
            monthlyPayment={loanData.monthlyPayment}
            coverageType={loanData.coverageType}
            onSubmit={() => {}}
            isLoading={isLoading}
          />
        )}
      </div>
    </Layout>
  );
}