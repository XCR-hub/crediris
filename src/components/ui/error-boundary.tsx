import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Button } from './button';
import { AlertWithIcon } from './alert';
import { event } from '@/lib/analytics';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  // Track error in analytics
  React.useEffect(() => {
    event({
      action: 'error_captured',
      category: 'crash',
      label: error.message
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 max-w-lg w-full">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <h2 className="text-xl font-semibold">Une erreur est survenue</h2>
        </div>
        
        <AlertWithIcon
          variant="error"
          icon={AlertTriangle}
          title="Erreur inattendue"
          description="Nous sommes désolés, mais une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème."
        />
        
        {/* Only show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto text-sm text-gray-700 font-mono">
            {error.message}
            {error.stack && (
              <div className="mt-2 text-xs text-gray-500">
                {error.stack}
              </div>
            )}
          </pre>
        )}
        
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser la page
          </Button>

          <Button
            onClick={resetErrorBoundary}
            className="flex items-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state of your app here
        window.location.href = '/';
      }}
      onError={(error) => {
        // Log error to your error reporting service
        console.error('Application error:', error);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}