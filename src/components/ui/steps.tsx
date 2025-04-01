import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface StepProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  isCompleted?: boolean;
  onClick?: () => void;
}

export function Step({
  title,
  description,
  icon: Icon,
  isActive,
  isCompleted,
  onClick,
}: StepProps) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-start gap-4 p-4 transition-colors',
        isActive && 'bg-primary/5 rounded-lg',
        !isActive && 'hover:bg-gray-50'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
          isCompleted && 'border-primary bg-primary text-white',
          isActive && !isCompleted && 'border-primary',
          !isActive && !isCompleted && 'border-gray-300'
        )}
      >
        {isCompleted ? (
          <CheckCircle className="h-6 w-6" />
        ) : Icon ? (
          <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-gray-500')} />
        ) : null}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-sm font-medium',
            isActive ? 'text-primary' : 'text-gray-900'
          )}
        >
          {title}
        </span>
        {description && (
          <span className="mt-1 text-sm text-gray-500">{description}</span>
        )}
      </div>
    </div>
  );
}

interface StepsProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Steps({
  children,
  orientation = 'vertical',
  className,
}: StepsProps) {
  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col' : 'flex-row justify-between',
        className
      )}
    >
      {children}
    </div>
  );
}