import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/marketing/Layout';
import { UnifiedSimulationForm } from '@/components/simulation/UnifiedSimulationForm';
import { useAfiEsca } from '@/lib/hooks/useAfiEsca';
import { event } from '@/lib/analytics';

// Schema.org structured data
const schema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Simulateur Assurance Emprunteur Crediris",
  "applicationCategory": "Insurance",
  "description": "Simulez et souscrivez votre assurance emprunteur en ligne en quelques minutes",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
};

export default function Simulation() {
  const navigate = useNavigate();
  const { simulate, isLoading } = useAfiEsca();

  const handleSubmit = async (data: any) => {
    try {
      const result = await simulate(data);

      if (!result || !result.SimulationId) {
        throw new Error("Résultat de simulation invalide.");
      }

      // Track simulation event
      event({
        action: 'simulation_completed',
        category: 'conversion',
        label: result.SimulationId
      });

      // Stockage local
      localStorage.setItem('simulationData', JSON.stringify({
        formData: data,
        simulationResponse: result
      }));

      // Redirection
      navigate('/loan/results');
    } catch (error: any) {
      console.error("Erreur lors de la simulation :", error.message || error);
      alert("Une erreur est survenue pendant la simulation. Veuillez vérifier vos informations ou réessayer.");
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Simulation assurance emprunteur - Crediris</title>
        <meta 
          name="description" 
          content="Simulez votre assurance de prêt en quelques minutes. Obtenez une tarification immédiate et souscrivez 100% en ligne." 
        />
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Simulez votre assurance de prêt
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Obtenez votre tarif en 2 minutes et souscrivez 100% en ligne
          </p>

          <UnifiedSimulationForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}
