import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/marketing/Layout';
import { AlertWithIcon } from '@/components/ui/alert';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error500() {
  return (
    <Layout showNav={false}>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-lg w-full">
          <AlertWithIcon
            variant="error"
            icon={AlertTriangle}
            title="Erreur serveur"
            description="Une erreur inattendue s'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème."
          />

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>

            <Link to="/">
              <Button className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}