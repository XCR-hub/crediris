import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/marketing/Layout';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { ArrowLeft, FileText, AlertTriangle, Shield, User, Heart } from 'lucide-react';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';
import type { SimulationFormData } from '@/lib/afi-esca/hooks/useAFISimulation';

// Type definition for stored simulation data
interface SimulationStorage {
  formData: SimulationFormData;
  simulationResponse: SimulationResultMT;
}

// Reusable components
const InfoSection = ({ title, children, icon: Icon }: { 
  title: string;
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div>
    <h3 className="font-medium text-gray-900 mb-2 flex items-center">
      <Icon className="h-4 w-4 mr-2 text-primary" />
      {title}
    </h3>
    <div className="space-y-1 text-sm">
      {children}
    </div>
  </div>
);

export default function LoanResults() {
  const navigate = useNavigate();

  // Get stored simulation data with type safety
  const storedData = localStorage.getItem('simulationData');
  let simulationData: SimulationStorage | null = null;

  try {
    simulationData = storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Error parsing simulation data:', error);
  }

  // Redirect if no valid data
  if (!simulationData?.simulationResponse || !simulationData?.formData) {
    navigate('/simulation', { replace: true });
    return null;
  }

  const { simulationResponse, formData } = simulationData;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/simulation')}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la simulation
        </Button>

        <div className="space-y-8">
          {/* Synthèse */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-primary px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Synthèse de votre simulation</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Souscripteur */}
                <InfoSection title="Souscripteur" icon={User}>
                  <p>{formData.insured.gender === 'HOMME' ? 'M.' : 'Mme.'}</p>
                  <p>Né(e) le {new Date(formData.insured.birthDate).toLocaleDateString('fr-FR')}</p>
                  <p>{formData.insured.profession}</p>
                  <p>{formData.insured.smoker ? 'Fumeur' : 'Non-fumeur'}</p>
                </InfoSection>

                {/* Prêt */}
                <InfoSection title="Caractéristiques du prêt" icon={FileText}>
                  <p>Montant : {formatCurrency(formData.loan.amount)}</p>
                  <p>Durée : {formData.loan.duration} mois</p>
                  <p>Taux : {formData.loan.rate}%</p>
                  <p>Type : {
                    formData.loan.type === 'MORTGAGE' ? 'Immobilier' :
                    formData.loan.type === 'CONSUMER' ? 'Consommation' :
                    'Professionnel'
                  }</p>
                </InfoSection>

                {/* Garanties */}
                <InfoSection title="Garanties choisies" icon={Shield}>
                  {formData.coverage.death && <p>Décès</p>}
                  {formData.coverage.ptia && <p>PTIA</p>}
                  {formData.coverage.ipt && <p>IPT</p>}
                  {formData.coverage.itt && <p>ITT</p>}
                  {formData.coverage.ipp && <p>IPP</p>}
                  <p>Quotité : {formData.coverage.quotity}%</p>
                </InfoSection>
              </div>

              {/* Coût */}
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Prime mensuelle</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(simulationResponse.Primes[0].Montant)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Coût total de l'assurance</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(simulationResponse.TotalPrimes)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formalités médicales */}
              {simulationResponse.FormalitesMedicales && simulationResponse.FormalitesMedicales.length > 0 && (
                <div className="mt-6">
                  <AlertWithIcon
                    variant="warning"
                    icon={Heart}
                    title="Formalités médicales requises"
                    description={
                      <ul className="list-disc pl-4 mt-2">
                        {simulationResponse.FormalitesMedicales.map((formality, index) => (
                          <li key={index} className="text-sm">
                            {formality}
                          </li>
                        ))}
                      </ul>
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button variant="outline" onClick={() => navigate('/simulation')}>
              <FileText className="h-4 w-4 mr-2" />
              Nouvelle simulation
            </Button>
            <Button onClick={() => navigate('/signin')}>
              Continuer la souscription
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}