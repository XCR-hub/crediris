import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { FileText, Heart, Calculator } from 'lucide-react';

export type ApplicationStep = 'LOAN_INFO' | 'HEALTH_INFO' | 'DOCUMENTS';

interface ApplicationProgressProps {
  currentStep: ApplicationStep;
}

interface Step {
  id: ApplicationStep;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 'LOAN_INFO', label: 'Simulation', icon: Calculator },
  { id: 'HEALTH_INFO', label: 'Santé', icon: Heart },
  { id: 'DOCUMENTS', label: 'Documents', icon: FileText },
];

export function ApplicationProgress({ currentStep }: ApplicationProgressProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-8">
      <Progress value={progress} className="mb-4" />

      <div className="grid grid-cols-3 gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCurrent = index === currentIndex;
          const isComplete = index < currentIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center text-center transition-colors duration-200',
                isComplete || isCurrent ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center mb-2 border',
                  isCurrent && 'bg-primary/10 border-primary',
                  isComplete && 'bg-primary/5 border-primary/30'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
