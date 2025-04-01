import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/format';
import type { Application, HealthQuestionnaire } from '@/types/database';
import type { SimulationResultMT } from '@/lib/afi-esca/soap/types';

interface ContractData {
  application: Application;
  simulationResult: SimulationResultMT;
  healthData: HealthQuestionnaire;
  signature: string;
  signatureDate: Date;
  signatureIp: string;
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

export function generateContractPDF(data: ContractData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(20);
  doc.text('CREDIRIS', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Contrat d\'Assurance Emprunteur', pageWidth / 2, 30, { align: 'center' });
  
  // Contract reference
  doc.setFontSize(10);
  doc.text([
    `Référence : ${data.application.id}`,
    `Date : ${format(data.signatureDate, 'dd MMMM yyyy', { locale: fr })}`,
    `IP : ${data.signatureIp}`
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

  // Health Data
  doc.setFontSize(14);
  doc.text('Informations de santé', 20, 250);
  doc.setFontSize(10);
  doc.text([
    `Taille : ${data.healthData.height} cm`,
    `Poids : ${data.healthData.weight} kg`,
    `Fumeur : ${data.healthData.smoker ? 'Oui' : 'Non'}`,
    `Activité physique : ${
      data.healthData.exercise_frequency === 'NEVER' ? 'Jamais' :
      data.healthData.exercise_frequency === 'OCCASIONAL' ? 'Occasionnelle' :
      'Régulière'
    }`
  ], 20, 260);

  // Signature
  if (data.signature) {
    doc.addImage(data.signature, 'PNG', 20, 290, 50, 20);
    doc.setFontSize(8);
    doc.text(`Signé électroniquement le ${format(data.signatureDate, 'dd/MM/yyyy à HH:mm', { locale: fr })}`, 20, 315);
  }

  // Legal Notice
  doc.setFontSize(8);
  const legalNotice = [
    'En signant ce contrat, je certifie l\'exactitude des informations fournies.',
    'Je reconnais avoir pris connaissance des conditions générales et particulières du contrat.',
    'Toute fausse déclaration peut entraîner la nullité du contrat (Art. L.113-8 du Code des assurances).',
    '',
    'CREDIRIS - Courtier en assurance - ORIAS n°XX XXX XXX',
    'contact@crediris.fr - 01 23 45 67 89'
  ];
  doc.text(legalNotice, 20, 330);

  // Footer with page number
  doc.setFontSize(8);
  doc.text(`Page 1/1`, pageWidth / 2, 290, { align: 'center' });

  return doc.output('datauristring');
}