import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { useContractStatus } from '@/lib/hooks/useContractStatus';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface ContractStatusProps {
  applicationId: string;
  onDownloadContract?: () => void;
  afiEscaUrl?: string;
}

export function ContractStatus({
  applicationId,
  onDownloadContract,
  afiEscaUrl
}: ContractStatusProps) {
  const { status, isLoading, error } = useContractStatus(applicationId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        <span>Vérification du statut...</span>
      </div>
    );
  }

  if (error) {
    return (
      <AlertWithIcon
        variant="error"
        icon={AlertTriangle}
        title="Erreur"
        description="Impossible de vérifier le statut du contrat"
      />
    );
  }

  if (status === 'signed') {
    return (
      <div className="space-y-6">
        <AlertWithIcon
          variant="success"
          icon={CheckCircle}
          title="Contrat signé"
          description="Votre contrat a été signé avec succès"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          {onDownloadContract && (
            <Button
              variant="outline"
              onClick={onDownloadContract}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              Télécharger le contrat
            </Button>
          )}

          {afiEscaUrl && (
            <Button
              onClick={() => window.open(afiEscaUrl, '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Accéder à mon espace AFI ESCA
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <AlertWithIcon
      variant="info"
      icon={Clock}
      title="En attente de signature"
      description="Votre contrat est en cours de traitement"
    />
  );
}