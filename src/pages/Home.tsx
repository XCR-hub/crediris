import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/ui/layout';
import { Loading } from '@/components/ui/loading';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { safeNavigate } from '@/lib/navigation';
import { PlusCircle, Calculator, Clock, CheckCircle2, XCircle, Send } from 'lucide-react';
import type { Application } from '@/types/database';

const STATUS_BADGES = {
  draft: { label: 'Brouillon', className: 'bg-gray-100 text-gray-800' },
  pending_review: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
  submitted: { label: 'Soumis', className: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approuvé', className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejeté', className: 'bg-red-100 text-red-800' },
} as const;

const STATUS_ICONS = {
  draft: Clock,
  pending_review: Send,
  submitted: Calculator,
  approved: CheckCircle2,
  rejected: XCircle,
} as const;

function Home() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        
        if (userError || !user) {
          if (mounted) {
            safeNavigate(navigate, '/signin');
          }
          return;
        }

        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (mounted) {
          setApplications(data || []);
        }
      } catch (err) {
        console.error('Error loading applications:', err);
        if (mounted) {
          setError('Erreur lors du chargement des données');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Assurance Emprunteur 100% digitale
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos simulations d'assurance emprunteur en toute simplicité
            </p>
          </div>
          <Button
            onClick={() => safeNavigate(navigate, '/loan')}
            className="inline-flex items-center"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Nouvelle simulation
          </Button>
        </div>

        {applications.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => {
                const StatusIcon = STATUS_ICONS[application.status];
                const statusInfo = STATUS_BADGES[application.status];

                return (
                  <li
                    key={application.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(application.loan_amount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.loan_duration} mois - Taux : {application.loan_rate}%
                          </p>
                          {application.monthly_payment && (
                            <p className="text-sm text-gray-500">
                              Mensualité : {formatCurrency(application.monthly_payment)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.created_at)}
                        </span>
                      </div>
                    </div>
                    {application.notes && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p className="font-medium">Notes :</p>
                        <p className="mt-1">{application.notes}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <Calculator className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-gray-900 font-medium">
                  Aucune simulation enregistrée
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Commencez par créer une nouvelle simulation de prêt
                </p>
              </div>
              <Button
                onClick={() => safeNavigate(navigate, '/loan')}
                className="inline-flex items-center"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Nouvelle simulation
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Home;