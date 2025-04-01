import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useSaveSimulation } from '@/lib/afi-esca/hooks/useSaveSimulation';

interface SaveSimulationButtonProps {
  applicationId: string;
  simulationData: any;
  onSaveComplete?: (url: string) => void;
}

export function SaveSimulationButton({
  applicationId,
  simulationData,
  onSaveComplete
}: SaveSimulationButtonProps) {
  const { saveSimulation, isLoading } = useSaveSimulation();

  const handleSave = async () => {
    try {
      const url = await saveSimulation(applicationId, simulationData);
      onSaveComplete?.(url);
    } catch (error) {
      console.error('Error saving simulation:', error);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isLoading}
      variant="outline"
    >
      {isLoading ? (
        <>
          <Save className="h-4 w-4 mr-2 animate-spin" />
          Sauvegarde...
        </>
      ) : (
        <>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </>
      )}
    </Button>
  );
}