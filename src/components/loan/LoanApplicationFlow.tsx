import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SimulationForm } from '@/components/simulation/SimulationForm';
import { SimulationResult } from '@/components/simulation/SimulationResult';
import { HealthQuestionnaireForm } from '@/components/health/HealthQuestionnaire';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { ApplicationSummary } from '@/components/forms/ApplicationSummary';
import { Steps, Step } from '@/components/ui/steps';
import { useSimulationFlow } from '@/lib/afi-esca/hooks/useSimulationFlow';
import { Calculator, Heart, FileText, CheckCircle } from 'lucide-react';

export default function LoanApplicationFlow() {
  const navigate = useNavigate();
  const {
    currentStep,
    simulationData,
    isLoading,
    handleSimulation,
    handleHealthSubmit,
    handleDocumentUpload,
    handleSubmit,
    goToNextStep,
    goToPreviousStep
  } = useSimulationFlow();

  const handleContinue = () => {
    navigate('/loan/health');
    goToNextStep();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Steps orientation="vertical" className="mb-8">
        <Step
          title="Simulation"
          description="Calculez votre assurance"
          icon={Calculator}
          isActive={currentStep === 'SIMULATION'}
          isCompleted={currentStep !== 'SIMULATION'}
        />
        <Step
          title="Santé"
          description="Questionnaire médical"
          icon={Heart}
          isActive={currentStep === 'HEALTH'}
          isCompleted={currentStep === 'DOCUMENTS' || currentStep === 'RECAP'}
        />
        <Step
          title="Documents"
          description="Pièces justificatives"
          icon={FileText}
          isActive={currentStep === 'DOCUMENTS'}
          isCompleted={currentStep === 'RECAP'}
        />
        <Step
          title="Récapitulatif"
          description="Validation finale"
          icon={CheckCircle}
          isActive={currentStep === 'RECAP'}
          isCompleted={false}
        />
      </Steps>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {currentStep === 'SIMULATION' && !simulationData?.result && (
          <SimulationForm
            onSimulate={handleSimulation}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'SIMULATION' && simulationData?.result && (
          <SimulationResult
            result={simulationData.result}
            onContinue={handleContinue}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'HEALTH' && (
          <HealthQuestionnaireForm
            onSubmit={handleHealthSubmit}
            onBack={goToPreviousStep}
            initialData={simulationData?.healthData}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'DOCUMENTS' && (
          <DocumentUpload
            applicationId={simulationData?.id}
            onComplete={goToNextStep}
            onBack={goToPreviousStep}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'RECAP' && simulationData && (
          <ApplicationSummary
            application={simulationData}
            simulationResult={simulationData.result}
            healthData={simulationData.healthData}
            documents={simulationData.documents}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}