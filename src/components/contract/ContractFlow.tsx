import React, { useState } from 'react';
import { ContractSummary } from './ContractSummary';
import { ContractSignature } from './ContractSignature';
import { Steps, Step } from '@/components/ui/steps';
import { FileText, Pen } from 'lucide-react';
import type { Application, HealthQuestionnaire } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

type ContractStep = 'SUMMARY' | 'SIGNATURE';

interface ContractFlowProps {
  application: Application;
  simulationResult: SimulationResultMT;
  healthData: HealthQuestionnaire;
  onComplete: (signature: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ContractFlow({
  application,
  simulationResult,
  healthData,
  onComplete,
  onBack,
  isLoading = false
}: ContractFlowProps) {
  const [currentStep, setCurrentStep] = useState<ContractStep>('SUMMARY');

  const handleContinue = () => {
    setCurrentStep('SIGNATURE');
  };

  const handleBack = () => {
    if (currentStep === 'SIGNATURE') {
      setCurrentStep('SUMMARY');
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-8">
      <Steps orientation="horizontal" className="mb-8">
        <Step
          title="Récapitulatif"
          description="Vérification des informations"
          icon={FileText}
          isActive={currentStep === 'SUMMARY'}
          isCompleted={currentStep === 'SIGNATURE'}
        />
        <Step
          title="Signature"
          description="Signature électronique"
          icon={Pen}
          isActive={currentStep === 'SIGNATURE'}
          isCompleted={false}
        />
      </Steps>

      {currentStep === 'SUMMARY' ? (
        <ContractSummary
          application={application}
          simulationResult={simulationResult}
          healthData={healthData}
          onContinue={handleContinue}
          onBack={handleBack}
          isLoading={isLoading}
        />
      ) : (
        <ContractSignature
          onSign={onComplete}
          onBack={handleBack}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}