import { createSoapClient, callSoapMethod } from './client';
import type { 
  SimulationDataMT, 
  SimulationResultMT, 
  DossierSimulationMT,
  AssureData,
  PretData,
  GarantieData,
  AdresseData
} from './types';

/**
 * Creates a new simulation in AFI ESCA system
 * @param data Simulation data
 * @returns Simulation result with ID and pricing
 */
export async function createSimulationData(data: SimulationDataMT): Promise<SimulationResultMT> {
  try {
    const client = await createSoapClient();
    const result = await callSoapMethod(client, 'CreateSimulationData', { simulationData: data });
    return result;
  } catch (error) {
    console.error('Failed to create simulation:', error);
    throw new Error('Failed to create AFI ESCA simulation');
  }
}

/**
 * Retrieves simulation results and pricing
 * @param simulationId Simulation ID from createSimulationData
 * @returns Detailed simulation results
 */
export async function simulate(simulationId: string): Promise<SimulationResultMT> {
  try {
    const client = await createSoapClient();
    const result = await callSoapMethod(client, 'Simulate', { simulationId });
    return result;
  } catch (error) {
    console.error('Failed to retrieve simulation results:', error);
    throw new Error('Failed to get AFI ESCA simulation results');
  }
}

/**
 * Saves simulation and generates subscription URL
 * @param data Simulation dossier data
 * @returns URL for subscription portal
 */
export async function saveDossierSimulation(data: DossierSimulationMT): Promise<string> {
  try {
    const client = await createSoapClient();
    const result = await callSoapMethod(client, 'SaveDossierSimulation', { dossierSimulation: data });
    
    if (!result.URL) {
      throw new Error('No subscription URL returned from AFI ESCA');
    }
    
    return result.URL;
  } catch (error) {
    console.error('Failed to save simulation dossier:', error);
    throw new Error('Failed to save AFI ESCA simulation dossier');
  }
}

/**
 * Maps form data to AFI ESCA simulation request format
 */
export function mapSimulationRequest(formData: any): SimulationDataMT {
  const assure: AssureData = {
    Civilite: formData.insuredPerson.civility,
    Nom: formData.insuredPerson.lastName.toUpperCase(),
    Prenom: formData.insuredPerson.firstName,
    DateNaissance: formData.insuredPerson.birthDate,
    LieuNaissance: formData.insuredPerson.birthPlace,
    Nationalite: 'FR',
    PaysResidence: 'FR',
    Email: formData.insuredPerson.email,
    Telephone: formatPhone(formData.insuredPerson.phone),
    Adresse: mapAddress(formData.insuredPerson.address),
    Profession: formData.insuredPerson.profession,
    CategoriePro: mapProfessionalCategory(formData.insuredPerson.professionalCategory),
    TravailManuel: formData.health.manualWork,
    ActivitesRisquees: formData.health.dangerousActivities,
    ActivitesRisqueesDetail: formData.health.dangerousActivitiesDetails,
    Fumeur: formData.health.smoker,
    NbCigarettes: formData.health.cigarettesPerDay,
    Taille: formData.health.height,
    Poids: formData.health.weight
  };

  const pret: PretData = {
    Montant: formData.loan.amount,
    Duree: formData.loan.duration,
    Taux: formData.loan.rate
  };

  const garanties: GarantieData[] = [
    { Code: 'DC', Selected: formData.coverage.death },
    { Code: 'PTIA', Selected: formData.coverage.ptia },
    { Code: 'IPT', Selected: formData.coverage.ipt },
    { Code: 'ITT', Selected: formData.coverage.itt },
    { Code: 'IPP', Selected: formData.coverage.ipp }
  ];

  return {
    Assure: assure,
    Pret: pret,
    Quotite: formData.coverage.quotity,
    DateEffet: new Date().toISOString().split('T')[0],
    TypeOperation: 'NOUVEAU',
    TypePret: mapLoanType(formData.loan.type),
    ObjetPret: mapLoanPurpose(formData.loan.purpose),
    TypeRemboursement: formData.loan.repaymentType === 'WITH_INTEREST' ? 'AMORT' : 'INFINE',
    TypeCotisation: 'VARIABLE',
    JourPrelevement: 5,
    Garanties: garanties,
    Franchise: mapFranchise(formData.coverage.franchise)
  };
}

/**
 * Maps form data to AFI ESCA dossier format
 */
export function mapDossierSimulation(formData: any, simulationId: string): DossierSimulationMT {
  return {
    SimulationId: simulationId,
    Souscripteur: {
      EstAssure: formData.insuredPerson.isBorrower,
      Civilite: formData.insuredPerson.civility,
      Nom: formData.insuredPerson.lastName.toUpperCase(),
      Prenom: formData.insuredPerson.firstName,
      Email: formData.insuredPerson.email,
      Telephone: formatPhone(formData.insuredPerson.phone),
      Adresse: mapAddress(formData.insuredPerson.address)
    },
    Beneficiaire: {
      Type: 'ORGANISME',
      NomOrganisme: formData.bank.name.toUpperCase(),
      Adresse: mapAddress(formData.bank.address),
      Contact: {
        Nom: formData.bank.contact?.name,
        Telephone: formatPhone(formData.bank.contact?.phone),
        Email: formData.bank.contact?.email
      }
    },
    ReferencesBancaires: {
      IBAN: formData.insuredPerson.bankInformation?.iban || '',
      BIC: formData.insuredPerson.bankInformation?.bic || '',
      CompteJoint: formData.insuredPerson.bankInformation?.isJointAccount || false
    }
  };
}

// Helper functions for data mapping
function mapAddress(address: any): AdresseData {
  return {
    Numero: address.number,
    TypeVoie: address.streetType.toUpperCase(),
    NomVoie: address.street.toUpperCase(),
    Complement: address.complement?.toUpperCase(),
    CodePostal: address.postalCode,
    Ville: address.city.toUpperCase(),
    Pays: 'FRANCE'
  };
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  // Convert to international format
  return phone.startsWith('0') ? `+33${phone.slice(1)}` : phone;
}

function mapProfessionalCategory(category: string): string {
  const categories: Record<string, string> = {
    'EMPLOYEE': 'SALARIE',
    'EXECUTIVE': 'CADRE',
    'SELF_EMPLOYED': 'TNS',
    'CIVIL_SERVANT': 'FONCTIONNAIRE',
    'RETIRED': 'RETRAITE',
    'OTHER': 'AUTRE'
  };
  return categories[category] || 'AUTRE';
}

function mapLoanType(type: string): string {
  const types: Record<string, string> = {
    'MORTGAGE': 'AMORT',
    'CONSUMER': 'RELAIS',
    'PROFESSIONAL': 'INFINE'
  };
  return types[type] || 'AMORT';
}

function mapLoanPurpose(purpose: string): string {
  const purposes: Record<string, string> = {
    'MAIN_RESIDENCE': 'RP',
    'SECONDARY_RESIDENCE': 'RS',
    'RENTAL_INVESTMENT': 'LOCATIF',
    'WORKS': 'TRAVAUX',
    'OTHER': 'AUTRE'
  };
  return purposes[purpose] || 'AUTRE';
}

function mapFranchise(franchise: string): string {
  const franchises: Record<string, string> = {
    '30_DAYS': '30',
    '90_DAYS': '90',
    '180_DAYS': '180'
  };
  return franchises[franchise] || '90';
}