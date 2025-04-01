import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/ui/layout';
import { HealthQuestionnaireForm } from '@/components/health/HealthQuestionnaire';
import { useApplicationFlow } from '@/lib/context/ApplicationFlowContext';
import { useHealthQuestionnaire } from '@/lib/hooks/useHealthQuestionnaire';
import { getStoredSimulationData } from '@/lib/utils';
import { toast } from '@/lib/hooks/useToast';
import type { HealthQuestionnaire } from '@/types/database';

// Schema.org structured data for health questionnaire
const schema = {
  "@context": "https://schema.org",
  "@type": "WebForm",
  "name": "Questionnaire de santé assurance emprunteur",
  "description": "Questionnaire médical confidentiel pour votre assurance de prêt",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  },
  "about": {
    "@type": "Service",
    "serviceType": "LoanInsurance"
  }
};

function Health() {
  const navigate = useNavigate();
  const { 
    simulationData,
    healthFormData,
    updateHealthFormData,
    goToNextStep,
    goToPreviousStep
  } = useApplicationFlow();

  const { saveQuestionnaire, isLoading } = useHealthQuestionnaire(
    simulationData?.id
  );

  useEffect(() => {
    // Check for required simulation data
    const storedData = getStoredSimulationData();
    if (!storedData?.simulationResponse || !simulationData?.id) {
      toast({
        variant: "warning",
        title: "Simulation requise",
        description: "Veuillez d'abord effectuer une simulation"
      });
      navigate('/loan/simulation', { replace: true });
      return;
    }
  }, [simulationData?.id, navigate]);

  const handleSubmit = async (data: HealthQuestionnaire) => {
    try {
      // Save to database
      await saveQuestionnaire(data);
      
      // Update context
      updateHealthFormData(data);
      
      // Proceed to next step
      goToNextStep();
      
      // Navigate to documents page
      navigate('/loan/documents');

      toast({
        variant: "success",
        title: "Questionnaire enregistré",
        description: "Vos informations de santé ont été sauvegardées"
      });
    } catch (error) {
      console.error('Error saving health questionnaire:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder le questionnaire"
      });
    }
  };

  const handleBack = () => {
    goToPreviousStep();
    navigate('/loan/simulation');
  };

  return (
    <AuthGuard>
      <Layout>
        <Helmet>
          <title>Questionnaire santé - Crediris</title>
          <meta 
            name="description" 
            content="Remplissez votre questionnaire de santé en toute confidentialité pour votre assurance emprunteur." 
          />
          <meta name="robots" content="noindex,nofollow" />
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">
            Questionnaire de santé
          </h1>

          <HealthQuestionnaireForm
            onSubmit={handleSubmit}
            onBack={handleBack}
            initialData={healthFormData}
            isLoading={isLoading}
          />
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default Health;