import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { ActionDialog } from './ActionDialog';
import { formatCurrency } from '@/lib/format';
import { event } from '@/lib/analytics';
import { 
  FileText, 
  Mail, 
  Phone, 
  ArrowRight, 
  AlertTriangle, 
  Heart, 
  Shield, 
  CheckCircle,
  Clock
} from 'lucide-react';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface SimulationResultProps {
  result: SimulationResultMT;
  onContinue: () => void;
  isLoading?: boolean;
}

export function SimulationResult({
  result,
  onContinue,
  isLoading = false
}: SimulationResultProps) {
  const navigate = useNavigate();
  const [dialogType, setDialogType] = useState<'email' | 'callback' | null>(null);

  const handleEmailQuote = async (data: any) => {
    try {
      // Track email quote request
      event({
        action: 'quote_email_requested',
        category: 'conversion',
        label: data.email
      });

      // Close dialog
      setDialogType(null);
    } catch (error) {
      console.error('Error sending quote:', error);
    }
  };

  const handleCallback = async (data: any) => {
    try {
      // Track callback request
      event({
        action: 'callback_requested',
        category: 'conversion',
        label: data.phone
      });

      // Close dialog
      setDialogType(null);
    } catch (error) {
      console.error('Error requesting callback:', error);
    }
  };

  const handleContinue = () => {
    // Track online subscription start
    event({
      action: 'subscription_started',
      category: 'conversion'
    });

    onContinue();
  };

  return (
    <div className="space-y-8">
      {/* Monthly Premium */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Votre tarif mensuel</h2>
          <p className="text-5xl font-bold text-primary">
            {formatCurrency(result.Primes[0].Montant)}
            <span className="text-base font-normal text-gray-600 ml-2">/ mois</span>
          </p>
        </div>

        {/* Guarantees Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {result.Primes.map((prime, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center"
            >
              <Shield className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-gray-600 mb-1">{prime.Garantie}</p>
              <p className="font-semibold">{formatCurrency(prime.Montant)}</p>
            </div>
          ))}
        </div>

        {/* Total Cost */}
        <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Coût total de l'assurance</p>
            <p className="text-2xl font-semibold">{formatCurrency(result.TotalPrimes)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frais de dossier</p>
            <p className="text-2xl font-semibold">{formatCurrency(result.FraisDossier)}</p>
          </div>
        </div>
      </div>

      {/* Medical Requirements */}
      {result.FormalitesMedicales && result.FormalitesMedicales.length > 0 && (
        <AlertWithIcon
          variant="warning"
          icon={Heart}
          title="Formalités médicales requises"
          description={
            <ul className="list-disc pl-4 mt-2">
              {result.FormalitesMedicales.map((formality, index) => (
                <li key={index} className="text-sm">
                  {formality}
                </li>
              ))}
            </ul>
          }
        />
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <CheckCircle className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold">100% en ligne</h3>
            <p className="text-sm text-gray-600">Souscription digitale de A à Z</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <Clock className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Attestation immédiate</h3>
            <p className="text-sm text-gray-600">Après signature électronique</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 flex items-start space-x-4">
          <Shield className="h-6 w-6 text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Garanties premium</h3>
            <p className="text-sm text-gray-600">Protection optimale</p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <AlertWithIcon
        variant="info"
        icon={AlertTriangle}
        title="Important"
        description="Ce tarif est valable 30 jours sous réserve d'acceptation de votre dossier."
      />

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={() => setDialogType('email')}
          disabled={isLoading}
          className="w-full"
        >
          <Mail className="h-4 w-4 mr-2" />
          Recevoir par email
        </Button>

        <Button
          variant="outline"
          onClick={() => setDialogType('callback')}
          disabled={isLoading}
          className="w-full"
        >
          <Phone className="h-4 w-4 mr-2" />
          Être rappelé
        </Button>

        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          Souscrire en ligne
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Action Dialogs */}
      <ActionDialog
        type={dialogType || 'email'}
        isOpen={dialogType !== null}
        onClose={() => setDialogType(null)}
        onSubmit={dialogType === 'email' ? handleEmailQuote : handleCallback}
        isLoading={isLoading}
      />
    </div>
  );
}