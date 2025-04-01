import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ContractData {
  applicationId: string;
  insuredPerson: {
    civility: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    address: string;
    postalCode: string;
    city: string;
  };
  loan: {
    amount: number;
    duration: number;
    rate: number;
    monthlyPayment: number;
  };
  coverage: {
    type: 'DEATH' | 'DISABILITY' | 'BOTH';
    premium: number;
  };
  signature?: string;
}

export function generateContractPDF(data: ContractData): string {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('CREDIRIS', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Contrat d\'Assurance Emprunteur', 105, 30, { align: 'center' });
  
  // Contract reference
  doc.setFontSize(12);
  doc.text(`Référence : ${data.applicationId}`, 20, 45);
  doc.text(`Date : ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}`, 20, 52);
  
  // Insured person
  doc.setFontSize(14);
  doc.text('Assuré', 20, 70);
  doc.setFontSize(12);
  doc.text([
    `${data.insuredPerson.civility} ${data.insuredPerson.firstName} ${data.insuredPerson.lastName}`,
    `Né(e) le ${format(new Date(data.insuredPerson.birthDate), 'dd/MM/yyyy')}`,
    data.insuredPerson.address,
    `${data.insuredPerson.postalCode} ${data.insuredPerson.city}`
  ], 20, 80);
  
  // Loan details
  doc.setFontSize(14);
  doc.text('Caractéristiques du prêt', 20, 120);
  doc.setFontSize(12);
  doc.text([
    `Montant : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.loan.amount)}`,
    `Durée : ${data.loan.duration} mois`,
    `Taux : ${data.loan.rate}%`,
    `Mensualité : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.loan.monthlyPayment)}`
  ], 20, 130);
  
  // Coverage
  doc.setFontSize(14);
  doc.text('Garanties', 20, 170);
  doc.setFontSize(12);
  doc.text([
    `Type de couverture : ${
      data.coverage.type === 'DEATH' ? 'Décès' :
      data.coverage.type === 'DISABILITY' ? 'Invalidité' :
      'Décès + Invalidité'
    }`,
    `Prime mensuelle : ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.coverage.premium)}`
  ], 20, 180);
  
  // Legal mentions
  doc.setFontSize(10);
  doc.text([
    'En signant ce document, je reconnais avoir pris connaissance des conditions générales et particulières du contrat.',
    'Je certifie l\'exactitude des informations fournies et je m\'engage à signaler tout changement de situation.'
  ], 20, 220, { maxWidth: 170 });
  
  // Signature
  if (data.signature) {
    doc.addImage(data.signature, 'PNG', 20, 240, 50, 20);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.text('CREDIRIS - Société de courtage en assurance - ORIAS n°XX XXX XXX', 105, 280, { align: 'center' });
  
  return doc.output('datauristring');
}