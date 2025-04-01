import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatCurrency } from '@/lib/format';

export function generateContractConfirmationEmail(data: {
  firstName: string;
  lastName: string;
  applicationId: string;
  contractUrl: string;
  loanAmount: number;
  monthlyPayment: number;
  coverageType: string;
}) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db;">Confirmation de souscription</h1>
      
      <p>Bonjour ${data.firstName} ${data.lastName},</p>
      
      <p>Nous vous confirmons la bonne réception de votre contrat d'assurance emprunteur signé électroniquement.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin-top: 0;">Récapitulatif de votre souscription</h2>
        <ul style="list-style: none; padding: 0;">
          <li>Référence : ${data.applicationId}</li>
          <li>Montant assuré : ${formatCurrency(data.loanAmount)}</li>
          <li>Mensualité : ${formatCurrency(data.monthlyPayment)}</li>
          <li>Garanties : ${data.coverageType}</li>
          <li>Date : ${format(new Date(), 'dd MMMM yyyy', { locale: fr })}</li>
        </ul>
      </div>

      <p>
        <a 
          href="${data.contractUrl}" 
          style="background: #1a56db; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; display: inline-block;"
        >
          Télécharger mon contrat
        </a>
      </p>

      <p>
        Un conseiller Crediris prendra contact avec vous dans les prochaines 48h pour finaliser votre dossier.
      </p>

      <p style="color: #6b7280; font-size: 14px; margin-top: 40px;">
        Pour toute question, n'hésitez pas à nous contacter :<br>
        Email : contact@crediris.fr<br>
        Téléphone : 01 23 45 67 89
      </p>
    </div>
  `;
}

export function generateInternalNotificationEmail(data: {
  applicationId: string;
  firstName: string;
  lastName: string;
  email: string;
  loanAmount: number;
  coverageType: string;
}) {
  return `
    <div style="font-family: sans-serif;">
      <h2>Nouvelle souscription</h2>
      
      <p>Un nouveau contrat a été signé :</p>
      
      <ul>
        <li>Référence : ${data.applicationId}</li>
        <li>Client : ${data.firstName} ${data.lastName}</li>
        <li>Email : ${data.email}</li>
        <li>Montant : ${formatCurrency(data.loanAmount)}</li>
        <li>Garanties : ${data.coverageType}</li>
        <li>Date : ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}</li>
      </ul>
      
      <p>Merci de traiter ce dossier dans les plus brefs délais.</p>
    </div>
  `;
}