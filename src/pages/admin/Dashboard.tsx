import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { StatusBadge } from '@/components/application/StatusBadge';
import { StatusTimeline } from '@/components/application/StatusTimeline';
import { useAfiEscaStatus } from '@/lib/hooks/useAfiEscaStatus';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, 
  Mail, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const [applications, setApplications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          users (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible de charger les dossiers"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async (applicationId: string) => {
    try {
      // Call your email sending function here
      toast({
        variant: "success",
        title: "Email envoyé",
        description: "Le rappel a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Impossible d'envoyer l'email"
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
          <Button onClick={loadApplications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {app.users.first_name} {app.users.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {app.users.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(app.loan_amount)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {app.loan_duration} mois
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(app.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {app.contract_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(app.contract_url, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Contrat
                          </Button>
                        )}
                        {app.afi_esca_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(app.afi_esca_url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            AFI ESCA
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResendEmail(app.id)}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Relancer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}