import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/format';
import type { Application, HealthQuestionnaire } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface QuoteData {
  application: Application;
  simulationResult: SimulationResultMT;
  healthData: HealthQuestionnaire;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
}

export function generateQuotePDF(data: QuoteData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(20);
  doc.text('CREDIRIS', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Devis Assurance Emprunteur', pageWidth / 2, 30, { align: 'center' });
  
  // Reference and Date
  doc.setFontSize(10);
  doc.text([
    `Référence : ${data.application.id}`,
    `Date : ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`,
    `Valable jusqu'au : ${format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'dd/MM/yyyy')}`
  ], 20, 45);

  // Insured Person
  doc.setFontSize(14);
  doc.text('Assuré', 20, 70);
  doc.setFontSize(10);
  doc.text([
    `${data.userData.firstName} ${data.userData.lastName}`,
    data.userData.email,
    data.userData.phone || '',
    data.userData.address ? [
      data.userData.address,
      `${data.userData.postalCode} ${data.userData.city}`
    ].join('\n') : ''
  ].filter(Boolean), 20, 80);

  // Loan Details
  doc.setFontSize(14);
  doc.text('Caractéristiques du prêt', 20, 120);
  doc.setFontSize(10);
  doc.text([
    `Montant : ${formatCurrency(data.application.loan_amount)}`,
    `Durée : ${data.application.loan_duration} mois`,
    `Taux : ${data.application.loan_rate}%`,
    `Mensualité : ${formatCurrency(data.application.monthly_payment || 0)}`
  ], 20, 130);

  // Insurance Coverage
  doc.setFontSize(14);
  doc.text('Garanties d\'assurance', 20, 170);
  doc.setFontSize(10);

  // Coverage details
  const coverageType = data.application.coverage_type === 'DEATH' ? 'Décès' :
    data.application.coverage_type === 'DISABILITY' ? 'Invalidité' :
    'Décès + Invalidité';

  doc.text([
    `Type de couverture : ${coverageType}`,
    `Prime mensuelle : ${formatCurrency(data.simulationResult.Primes[0].Montant)}`,
    `Coût total : ${formatCurrency(data.simulationResult.TotalPrimes)}`,
    `Frais de dossier : ${formatCurrency(data.simulationResult.FraisDossier)}`
  ], 20, 180);

  // Medical Requirements
  if (data.simulationResult.FormalitesMedicales?.length) {
    doc.setFontSize(12);
    doc.text('Formalités médicales requises :', 20, 210);
    doc.setFontSize(10);
    data.simulationResult.FormalitesMedicales.forEach((formality, index) => {
      doc.text(`• ${formality}`, 25, 220 + (index * 7));
    });
  }

  // Legal Notice
  doc.setFontSize(8);
  const legalNotice = [
    'Ce devis est établi sur la base des informations fournies et sous réserve de l\'acceptation du dossier.',
    'Les garanties définitives seront celles indiquées dans les conditions particulières du contrat.',
    'Devis non contractuel valable 30 jours à compter de sa date d\'émission.',
    '',
    'CREDIRIS - Courtier en assurance',
    'ORIAS n°XX XXX XXX',
    'contact@crediris.fr - 01 23 45 67 89'
  ];
  doc.text(legalNotice, 20, 260);

  // Footer with page number
  doc.setFontSize(8);
  doc.text(`Page 1/1`, pageWidth / 2, 290, { align: 'center' });

  return doc.output('datauristring');
}