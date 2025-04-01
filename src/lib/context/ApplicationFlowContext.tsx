import React, { createContext, useContext, useState } from 'react';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';
import type { HealthQuestionnaire, InsuranceDocument } from '@/types/database';

export type ApplicationStep = 'SIMULATION' | 'HEALTH' | 'DOCUMENTS' | 'RECAP';

interface ApplicationFlowContextType {
  currentStep: ApplicationStep;
  simulationData: any | null;
  simulationResult: SimulationResultMT | null;
  healthFormData: Partial<HealthQuestionnaire> | null;
  uploadedDocuments: InsuranceDocument[];
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  updateSimulationData: (data: any) => void;
  updateSimulationResult: (result: SimulationResultMT) => void;
  updateHealthFormData: (data: Partial<HealthQuestionnaire>) => void;
  addUploadedDocument: (document: InsuranceDocument) => void;
  removeUploadedDocument: (documentId: string) => void;
}

const ApplicationFlowContext = createContext<ApplicationFlowContextType | undefined>(undefined);

const STEPS: ApplicationStep[] = ['SIMULATION', 'HEALTH', 'DOCUMENTS', 'RECAP'];

export function ApplicationFlowProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('SIMULATION');
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResultMT | null>(null);
  const [healthFormData, setHealthFormData] = useState<Partial<HealthQuestionnaire> | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<InsuranceDocument[]>([]);

  const goToNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const updateSimulationData = (data: any) => {
    setSimulationData(data);
  };

  const updateSimulationResult = (result: SimulationResultMT) => {
    setSimulationResult(result);
  };

  const updateHealthFormData = (data: Partial<HealthQuestionnaire>) => {
    setHealthFormData(data);
  };

  const addUploadedDocument = (document: InsuranceDocument) => {
    setUploadedDocuments(prev => [...prev, document]);
  };

  const removeUploadedDocument = (documentId: string) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  return (
    <ApplicationFlowContext.Provider
      value={{
        currentStep,
        simulationData,
        simulationResult,
        healthFormData,
        uploadedDocuments,
        goToNextStep,
        goToPreviousStep,
        updateSimulationData,
        updateSimulationResult,
        updateHealthFormData,
        addUploadedDocument,
        removeUploadedDocument,
      }}
    >
      {children}
    </ApplicationFlowContext.Provider>
  );
}

export function useApplicationFlow() {
  const context = useContext(ApplicationFlowContext);
  if (context === undefined) {
    throw new Error('useApplicationFlow must be used within an ApplicationFlowProvider');
  }
  return context;
}