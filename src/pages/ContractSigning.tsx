import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';
import { SignaturePad } from '@/components/ui/signature-pad';
import { ContractStatus } from '@/components/contract/ContractStatus';
import { AlertWithIcon } from '@/components/ui/alert';
import { generateContractPDF } from '@/lib/pdf';
import { base64ToBlob } from '@/lib/files';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';
import { getCurrentUser } from '@/lib/auth';
import { useContractStatus } from '@/lib/hooks/useContractStatus';
import { event } from '@/lib/analytics';
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import type { Application, User } from '@/types/database';

// Schema.org structured data for contract signing
const schema = {
  "@context": "https://schema.org",
  "@type": "SignAction",
  "name": "Signature électronique du contrat d'assurance",
  "description": "Signez votre contrat d'assurance emprunteur de manière électronique",
  "provider": {
    "@type": "Organization",
    "name": "Crediris",
    "url": "https://www.crediris.fr"
  }
};

interface ApplicationRecord extends Application {
  users: User;
  health_questionnaires: any;
  insurance_documents: any[];
}

function ContractSigning() {
  const navigate = useNavigate();
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationRecord | null>(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const { status, isLoading: isLoadingStatus } = useContractStatus(applicationData?.id);

  useEffect(() => {
    const loadApplicationData = async () => {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          navigate('/signin');
          return;
        }

        // Get latest pending application
        const { data: application, error } = await supabase
          .from('applications')
          .select(`
            *,
            health_questionnaires (*),
            insurance_documents (*),
            users (
              first_name,
              last_name,
              email,
              phone,
              address,
              city,
              postal_code
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'pending_review')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        setApplicationData(application);
      } catch (error) {
        console.error('Error loading application:', error);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Impossible de charger les données de votre dossier"
        });
      }
    };

    loadApplicationData();
  }, [navigate]);

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      if (!signature || !hasAcceptedTerms) {
        toast({
          variant: "error",
          title: "Données manquantes",
          description: "Veuillez signer le contrat et accepter les conditions"
        });
        return;
      }

      // Get client IP for audit
      let ipAddress = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const { ip } = await ipResponse.json();
        ipAddress = ip;
      } catch (error) {
        console.warn('Could not fetch IP address:', error);
        ipAddress = 'unknown';
      }

      // Generate contract PDF
      const pdfData = generateContractPDF({
        applicationId: applicationData.id,
        insuredPerson: {
          civility: applicationData.users.civility || 'M',
          firstName: applicationData.users.first_name,
          lastName: applicationData.users.last_name,
          birthDate: applicationData.health_questionnaires.birth_date,
          address: applicationData.users.address,
          postalCode: applicationData.users.postal_code,
          city: applicationData.users.city
        },
        loan: {
          amount: applicationData.loan_amount,
          duration: applicationData.loan_duration,
          rate: applicationData.loan_rate,
          monthlyPayment: applicationData.monthly_payment
        },
        coverage: {
          type: applicationData.coverage_type,
          premium: applicationData.monthly_premium
        },
        signature
      });

      // Upload to Supabase Storage
      const filePath = `contracts/${applicationData.id}/contract_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, base64ToBlob(pdfData), {
          contentType: 'application/pdf',
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      // Track contract signing
      event({
        action: 'contract_signed',
        category: 'conversion',
        label: applicationData.id
      });

      // Update application
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          signature_date: new Date().toISOString(),
          signature_ip: ipAddress,
          signature_data: signature,
          contract_url: publicUrl
        })
        .eq('id', applicationData.id);

      if (updateError) throw updateError;

      toast({
        variant: "success",
        title: "Contrat signé",
        description: "Votre contrat a été signé et enregistré avec succès"
      });

      // Redirect to success page
      navigate('/success');
    } catch (error) {
      console.error('Error submitting contract:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de la signature du contrat"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <AuthGuard>
        <Layout>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
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
              <h1 className="text-2xl font-bold mb-4">Aucun dossier en attente</h1>
              <Button onClick={() => navigate('/loan')}>
                Démarrer une nouvelle demande
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
          <title>Signature électronique - Crediris</title>
          <meta 
            name="description" 
            content="Signez votre contrat d'assurance emprunteur de manière électronique et sécurisée." 
          />
          <meta name="robots" content="noindex,nofollow" />
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Signature du contrat</h1>

          <div className="space-y-8">
            {/* Contract Status */}
            <ContractStatus
              applicationId={applicationData.id}
              afiEscaUrl={applicationData.afi_esca_url}
            />

            {/* Contract Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif du contrat</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Prêt</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Montant</dt>
                      <dd className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(applicationData.loan_amount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Durée</dt>
                      <dd className="font-medium">{applicationData.loan_duration} mois</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Taux</dt>
                      <dd className="font-medium">{applicationData.loan_rate}%</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Garanties</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Type</dt>
                      <dd className="font-medium">
                        {applicationData.coverage_type === 'DEATH' ? 'Décès' :
                         applicationData.coverage_type === 'DISABILITY' ? 'Invalidité' :
                         'Décès + Invalidité'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Prime mensuelle</dt>
                      <dd className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(applicationData.monthly_premium)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Signature électronique</h2>

              <AlertWithIcon
                variant="info"
                icon={CheckCircle}
                title="Signature électronique sécurisée"
                description="Votre signature électronique a la même valeur juridique qu'une signature manuscrite."
              />

              <div className="mt-6">
                <SignaturePad onSave={handleSignature} />
              </div>

              <div className="mt-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={hasAcceptedTerms}
                    onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600">
                    J'accepte les conditions générales et je confirme l'exactitude des informations fournies
                  </span>
                </label>
              </div>
            </div>

            <AlertWithIcon
              variant="warning"
              icon={AlertTriangle}
              title="Important"
              description="En signant ce contrat, vous vous engagez sur l'exactitude des informations fournies. Toute fausse déclaration peut entraîner la nullité du contrat."
            />

            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isLoading}
              >
                Retour
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={!signature || !hasAcceptedTerms || isLoading}
              >
                {isLoading ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Signer et envoyer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    </AuthGuard>
  );
}

export default ContractSigning;