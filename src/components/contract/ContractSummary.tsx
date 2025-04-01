import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Shield, 
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { Application, HealthQuestionnaire } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface ContractSummaryProps {
  application: Application;
  simulationResult: SimulationResultMT;
  healthData: HealthQuestionnaire;
  onContinue: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ContractSummary({
  application,
  simulationResult,
  healthData,
  onContinue,
  onBack,
  isLoading = false
}: ContractSummaryProps) {
  return (
    <div className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={FileText}
        title="Récapitulatif de votre contrat"
        description="Vérifiez les informations ci-dessous avant de signer votre contrat."
      />

      {/* Loan Information */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          Informations du prêt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Montant du prêt"
            value={formatCurrency(application.loan_amount)}
          />
          <InfoField
            label="Durée"
            value={`${application.loan_duration} mois`}
          />
          <InfoField
            label="Taux annuel"
            value={`${application.loan_rate}%`}
          />
          <InfoField
            label="Mensualité"
            value={formatCurrency(application.monthly_payment || 0)}
          />
        </div>
      </section>

      {/* Insurance Coverage */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          Garanties d'assurance
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Type de couverture"
              value={
                application.coverage_type === 'DEATH' ? 'Décès' :
                application.coverage_type === 'DISABILITY' ? 'Invalidité' :
                'Décès + Invalidité'
              }
            />
            <InfoField
              label="Prime mensuelle"
              value={formatCurrency(simulationResult.Primes[0].Montant)}
            />
          </div>
          
          {simulationResult.FormalitesMedicales && simulationResult.FormalitesMedicales.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="font-medium text-yellow-800 mb-2">
                Formalités médicales requises :
              </p>
              <ul className="list-disc pl-4 text-sm text-yellow-700">
                {simulationResult.FormalitesMedicales.map((formality, index) => (
                  <li key={index}>{formality}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Health Information */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-primary" />
          Informations de santé
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Taille"
            value={`${healthData.height} cm`}
          />
          <InfoField
            label="Poids"
            value={`${healthData.weight} kg`}
          />
          <InfoField
            label="Fumeur"
            value={healthData.smoker ? 'Oui' : 'Non'}
          />
          <InfoField
            label="Activité physique"
            value={
              healthData.exercise_frequency === 'NEVER' ? 'Jamais' :
              healthData.exercise_frequency === 'OCCASIONAL' ? 'Occasionnelle' :
              'Régulière'
            }
          />
        </div>
      </section>

      <AlertWithIcon
        variant="warning"
        icon={AlertTriangle}
        title="Important"
        description="En signant ce contrat, vous certifiez l'exactitude des informations fournies. Toute fausse déclaration peut entraîner la nullité du contrat (Article L.113-8 du Code des assurances)."
      />

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Retour
        </Button>
        <Button
          onClick={onContinue}
          disabled={isLoading}
        >
          {isLoading ? 'Chargement...' : 'Continuer vers la signature'}
          <CheckCircle className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}