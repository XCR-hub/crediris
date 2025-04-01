import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/ui/layout';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { useApplicationFlow } from '@/lib/context/ApplicationFlowContext';
import { useDocumentManagement } from '@/lib/hooks/useDocumentManagement';
import { getStoredSimulationData } from '@/lib/utils';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';

// Schema.org structured data for document upload form
const schema = {
  "@context": "https://schema.org",
  "@type": "WebForm",
  "name": "Documents justificatifs assurance emprunteur",
  "description": "Téléchargez vos documents justificatifs pour votre assurance de prêt",
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

function Documents() {
  const navigate = useNavigate();
  const { 
    simulationData,
    uploadedDocuments,
    addUploadedDocument,
    goToNextStep,
    goToPreviousStep
  } = useApplicationFlow();

  const { uploadDocument, isLoading } = useDocumentManagement(
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

    // Check for required health data
    if (!simulationData.healthData) {
      toast({
        variant: "warning",
        title: "Questionnaire santé requis",
        description: "Veuillez d'abord remplir le questionnaire de santé"
      });
      navigate('/loan/health', { replace: true });
      return;
    }
  }, [simulationData?.id, simulationData?.healthData, navigate]);

  const handleUploadComplete = async () => {
    try {
      // Track successful document upload
      event({
        action: 'documents_uploaded',
        category: 'conversion',
        label: simulationData?.id
      });

      // Update flow state
      goToNextStep();
      
      // Navigate to recap page
      navigate('/loan/recap');
      
      toast({
        variant: "success",
        title: "Documents téléchargés",
        description: "Tous les documents requis ont été fournis"
      });
    } catch (error) {
      console.error('Error completing document upload:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la finalisation"
      });
    }
  };

  const handleBack = () => {
    goToPreviousStep();
    navigate('/loan/health');
  };

  return (
    <AuthGuard>
      <Layout>
        <Helmet>
          <title>Documents justificatifs - Crediris</title>
          <meta 
            name="description" 
            content="Téléchargez vos documents justificatifs pour finaliser votre souscription d'assurance emprunteur." 
          />
          <meta name="robots" content="noindex,nofollow" />
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">
            Documents requis
          </h1>

          <DocumentUpload
            applicationId={simulationData?.id}
            onComplete={handleUploadComplete}
            onBack={handleBack}
            isLoading={isLoading}
          />
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default Documents;