import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/ui/layout';
import LoanApplicationFlow from '@/components/loan/LoanApplicationFlow';
import { ApplicationFlowProvider } from '@/lib/context/ApplicationFlowContext';
import { getStoredSimulationData } from '@/lib/utils';
import { toast } from '@/lib/hooks/useToast';

// Schema.org structured data for loan application
const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Souscription assurance emprunteur Crediris",
  "serviceType": "LoanInsurance",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  },
  "description": "Souscription d'assurance emprunteur 100% en ligne avec attestation immédiate",
  "areaServed": {
    "@type": "Country",
    "name": "FR"
  }
};

function LoanApplication() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check for simulation data
    const simulationData = getStoredSimulationData();
    if (!simulationData?.simulationResponse) {
      toast({
        variant: "warning",
        title: "Simulation requise",
        description: "Veuillez d'abord effectuer une simulation"
      });
      navigate('/simulation', { replace: true });
      return;
    }

    // Check for required data
    if (!simulationData.formData?.loan || !simulationData.formData?.insured) {
      toast({
        variant: "error",
        title: "Données manquantes",
        description: "Certaines informations sont manquantes. Veuillez recommencer la simulation."
      });
      navigate('/simulation', { replace: true });
      return;
    }
  }, [navigate]);

  return (
    <AuthGuard>
      <Layout>
        <Helmet>
          <title>Finaliser ma souscription - Crediris</title>
          <meta 
            name="description" 
            content="Finalisez votre souscription d'assurance emprunteur en ligne. Processus simple et rapide, attestation immédiate." 
          />
          <meta name="robots" content="noindex,nofollow" />
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="sr-only">Finaliser ma souscription d'assurance emprunteur</h1>

          <ApplicationFlowProvider>
            <LoanApplicationFlow />
          </ApplicationFlowProvider>
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default LoanApplication;