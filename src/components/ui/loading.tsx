import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
}

export function Loading({ 
  text = 'Chargement en cours...', 
  size = 'md',
  center = true,
  className,
  ...props 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 text-sm',
    md: 'h-5 w-5 text-lg',
    lg: 'h-6 w-6 text-xl',
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-2',
        center && 'justify-center min-h-[50vh]',
        className
      )}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span>{text}</span>
    </div>
  );
}