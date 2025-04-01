import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { AlertWithIcon } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';
import { event } from '@/lib/analytics';
import { 
  CheckCircle,
  FileText,
  Mail,
  Home,
  ExternalLink,
  Clock
} from 'lucide-react';
import type { Application, User } from '@/types/database';

// Schema.org structured data for success page
const schema = {
  "@context": "https://schema.org",
  "@type": "CompletedProcess",
  "name": "Souscription assurance emprunteur finalisée",
  "description": "Votre demande d'assurance emprunteur a été soumise avec succès",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  }
};

interface ApplicationRecord extends Application {
  users: User;
}

export default function Success() {
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState<ApplicationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        // Get latest submitted application
        const { data: application, error } = await supabase
          .from('applications')
          .select(`
            *,
            users (
              email,
              first_name,
              last_name
            )
          `)
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error loading application:', error);
          toast({
            variant: "error",
            title: "Erreur",
            description: "Impossible de charger les données de votre dossier"
          });
          navigate('/');
          return;
        }

        setApplicationData(application);

        // Track success page view
        event({
          action: 'success_viewed',
          category: 'conversion',
          label: application.id
        });
      } catch (error) {
        console.error('Error loading application:', error);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Une erreur est survenue lors du chargement"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationData();
  }, [navigate]);

  if (isLoading) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              Chargement...
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  if (!applicationData) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Aucun dossier trouvé</h1>
              <Button onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </Layout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Layout>
        <Helmet>
          <title>Souscription réussie - Crediris</title>
          <meta 
            name="description" 
            content="Votre demande d'assurance emprunteur a été soumise avec succès. Suivez les prochaines étapes pour finaliser votre dossier." 
          />
          <meta name="robots" content="noindex,nofollow" />
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>

        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Votre souscription est finalisée
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Merci pour votre confiance. Votre demande d'assurance emprunteur a bien été prise en compte et transmise à nos services.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Prochaines étapes</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email de confirmation</p>
                  <p className="text-sm text-gray-600">
                    Un email récapitulatif a été envoyé à {applicationData.users.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Traitement sous 48h</p>
                  <p className="text-sm text-gray-600">
                    Un conseiller étudiera votre dossier dans les prochaines 48h
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Accès à votre espace</p>
                  <p className="text-sm text-gray-600">
                    Suivez l'avancement de votre dossier dans votre espace client
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Number */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-700">
              Numéro de dossier : <span className="font-mono font-medium">{applicationData.id}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none"
            >
              <Home className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>

            {applicationData.afi_esca_url && (
              <Button
                onClick={() => window.open(applicationData.afi_esca_url, '_blank')}
                className="flex-1 sm:flex-none"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Accéder à mon espace AFI ESCA
              </Button>
            )}
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}