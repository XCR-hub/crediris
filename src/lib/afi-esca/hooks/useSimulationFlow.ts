import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAFISimulation } from './useAFISimulation';
import { useHealthQuestionnaire } from '@/lib/hooks/useHealthQuestionnaire';
import { useDocumentManagement } from '@/lib/hooks/useDocumentManagement';
import { useQuoteManagement } from '@/lib/hooks/useQuoteManagement';
import { useApplicationSubmission } from '@/lib/hooks/useApplicationSubmission';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';
import type { SimulationFormData } from '../types';

export type SimulationStep = 'SIMULATION' | 'HEALTH' | 'DOCUMENTS' | 'RECAP';

export function useSimulationFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SimulationStep>('SIMULATION');
  const [simulationData, setSimulationData] = useState<any>(null);
  
  const { simulate, isLoading: isSimulating } = useAFISimulation();
  const { saveQuestionnaire, isLoading: isSavingHealth } = useHealthQuestionnaire();
  const { uploadDocument, isLoading: isUploading } = useDocumentManagement();
  const { generateQuote, isLoading: isGenerating } = useQuoteManagement();
  const { submitApplication, isLoading: isSubmitting } = useApplicationSubmission();

  const handleSimulation = async (data: SimulationFormData) => {
    try {
      const result = await simulate(data);
      setSimulationData({ ...data, result });
      setCurrentStep('HEALTH');
      navigate('/loan/health');

      event({
        action: 'simulation_completed',
        category: 'funnel',
        label: 'simulation'
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de réaliser la simulation"
      });
    }
  };

  const handleHealthSubmit = async (data: any) => {
    try {
      await saveQuestionnaire(data);
      setCurrentStep('DOCUMENTS');
      navigate('/loan/documents');

      event({
        action: 'health_completed',
        category: 'funnel',
        label: 'health'
      });
    } catch (error) {
      console.error('Health questionnaire error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de sauvegarder le questionnaire"
      });
    }
  };

  const handleDocumentUpload = async (file: File, type: string) => {
    try {
      await uploadDocument(file, type);
      
      event({
        action: 'document_uploaded',
        category: 'funnel',
        label: type
      });
    } catch (error) {
      console.error('Document upload error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'envoyer le document"
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const subscriptionUrl = await submitApplication(simulationData.id);
      const quoteUrl = await generateQuote();
      
      event({
        action: 'application_submitted',
        category: 'funnel',
        label: 'complete'
      });

      navigate('/success');
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de soumettre la demande"
      });
    }
  };

  const goToNextStep = () => {
    const steps: SimulationStep[] = ['SIMULATION', 'HEALTH', 'DOCUMENTS', 'RECAP'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: SimulationStep[] = ['SIMULATION', 'HEALTH', 'DOCUMENTS', 'RECAP'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return {
    currentStep,
    simulationData,
    isLoading: isSimulating || isSavingHealth || isUploading || isGenerating || isSubmitting,
    handleSimulation,
    handleHealthSubmit,
    handleDocumentUpload,
    handleSubmit,
    goToNextStep,
    goToPreviousStep
  };
}