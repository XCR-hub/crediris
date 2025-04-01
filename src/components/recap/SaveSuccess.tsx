import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import type { Application } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface SaveSuccessProps {
  application: Application;
  simulationResult: SimulationResultMT;
  subscriptionUrl: string;
  onDownloadQuote: () => void;
  isGenerating?: boolean;
}

export function SaveSuccess({
  application,
  simulationResult,
  subscriptionUrl,
  onDownloadQuote,
  isGenerating = false
}: SaveSuccessProps) {
  return (
    <div className="space-y-6">
      <AlertWithIcon
        variant="success"
        icon={CheckCircle}
        title="Dossier enregistré avec succès"
        description="Votre dossier a été sauvegardé. Vous pouvez maintenant télécharger votre devis et accéder à votre espace AFI ESCA."
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Récapitulatif de votre dossier</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Numéro de dossier</p>
              <p className="font-medium">{application.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de création</p>
              <p className="font-medium">
                {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Montant du prêt</p>
                <p className="font-medium">{formatCurrency(application.loan_amount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prime mensuelle</p>
                <p className="font-medium">{formatCurrency(simulationResult.Primes[0].Montant)}</p>
              </div>
            </div>
          </div>

          {simulationResult.FormalitesMedicales && simulationResult.FormalitesMedicales.length > 0 && (
            <div className="pt-4 border-t">
              <AlertWithIcon
                variant="warning"
                icon={AlertTriangle}
                title="Formalités médicales requises"
                description={
                  <ul className="list-disc pl-4 mt-2">
                    {simulationResult.FormalitesMedicales.map((formality, index) => (
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

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Button
            variant="outline"
            onClick={onDownloadQuote}
            disabled={isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Télécharger le devis'}
          </Button>

          <Button
            onClick={() => window.open(subscriptionUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Accéder à mon espace AFI ESCA
          </Button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Prochaines étapes</h4>
        <ol className="list-decimal pl-4 text-sm text-blue-700 space-y-2">
          <li>Téléchargez et conservez votre devis</li>
          <li>Connectez-vous à votre espace AFI ESCA pour finaliser votre souscription</li>
          <li>Complétez les formalités médicales requises</li>
          <li>Signez électroniquement vos documents</li>
        </ol>
      </div>
    </div>
  );
}