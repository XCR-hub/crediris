import React from 'react';
import { Layout } from '@/components/marketing/Layout';
import { SEO } from '@/components/marketing/SEO';
import { SimulationForm } from '@/components/simulation/SimulationForm';
import { useAFISimulation } from '@/lib/afi-esca/hooks/useAFISimulation';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/lib/hooks/useToast';

export default function Questionnaire() {
  const navigate = useNavigate();
  const { simulate, isLoading } = useAFISimulation();

  const handleSimulation = async (data: any) => {
    try {
      const result = await simulate(data);
      
      // Store result in localStorage for the results page
      localStorage.setItem('simulationData', JSON.stringify({
        formData: data,
        simulationResponse: result
      }));

      // Navigate to results page
      navigate('/loan/results');
    } catch (error) {
      console.error('Error during simulation:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la simulation. Veuillez réessayer."
      });
    }
  };

  return (
    <Layout>
      <SEO
        title="Questionnaire d'assurance emprunteur"
        description="Remplissez notre questionnaire en ligne pour obtenir une simulation personnalisée de votre assurance de prêt."
      />

      <div className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Questionnaire d'assurance
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Obtenez une estimation personnalisée en quelques minutes
          </p>

          <SimulationForm
            onSimulate={handleSimulation}
            isLoading={isLoading}
          />
        </div>
      </div>
    </Layout>
  );
}