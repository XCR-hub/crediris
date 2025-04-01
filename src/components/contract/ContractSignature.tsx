import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/ui/signature-pad';
import { AlertWithIcon } from '@/components/ui/alert';
import { AlertTriangle, Send } from 'lucide-react';

interface ContractSignatureProps {
  onSign: (signature: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ContractSignature({
  onSign,
  onBack,
  isLoading = false
}: ContractSignatureProps) {
  const [signature, setSignature] = useState<string | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const handleSubmit = () => {
    if (!signature || !hasAcceptedTerms) {
      return;
    }
    onSign(signature);
  };

  return (
    <div className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={AlertTriangle}
        title="Signature électronique"
        description="Votre signature électronique a la même valeur juridique qu'une signature manuscrite."
      />

      <div className="bg-white rounded-lg shadow-sm p-6">
        <SignaturePad
          onSave={setSignature}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={hasAcceptedTerms}
          onChange={(e) => setHasAcceptedTerms(e.target.checked)}
          disabled={isLoading}
          className="mt-1 h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          Je certifie l'exactitude des informations fournies et j'accepte les{' '}
          <a href="/cgu" target="_blank" className="text-primary hover:underline">
            conditions générales
          </a>
          {' '}et la{' '}
          <a href="/privacy" target="_blank" className="text-primary hover:underline">
            politique de confidentialité
          </a>
          .
        </label>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Retour
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !signature || !hasAcceptedTerms}
        >
          {isLoading ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-spin" />
              Signature en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Signer le contrat
            </>
          )}
        </Button>
      </div>
    </div>
  );
}