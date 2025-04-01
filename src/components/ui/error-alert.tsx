import React from 'react';
import { AlertWithIcon } from './alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { AFIESCAError, translateAFIError } from '@/lib/afi-esca/errors';

interface ErrorAlertProps {
  error: Error | AFIESCAError;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorAlert({ error, onRetry, onBack }: ErrorAlertProps) {
  const message = error instanceof AFIESCAError
    ? translateAFIError(error)
    : error.message;

  const details = error instanceof AFIESCAError && error.details
    ? JSON.stringify(error.details, null, 2)
    : null;

  return (
    <AlertWithIcon
      variant="error"
      icon={AlertTriangle}
      title="Erreur"
      description={
        <div className="space-y-2">
          <p>{message}</p>
          
          {details && process.env.NODE_ENV === 'development' && (
            <pre className="mt-2 p-2 bg-red-50 rounded text-xs overflow-auto">
              {details}
            </pre>
          )}

          <div className="flex gap-2 mt-4">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
              >
                Retour
              </Button>
            )}
            
            {onRetry && (
              <Button
                variant="default"
                size="sm"
                onClick={onRetry}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            )}
          </div>
        </div>
      }
    />
  );
}