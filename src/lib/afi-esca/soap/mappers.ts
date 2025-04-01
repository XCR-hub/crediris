import { COVERAGE_TYPES, PROFESSIONAL_CATEGORIES, LOAN_TYPES } from './config';
import { AFIESCAError } from '../errors';
import type { SimulationDataMT, DossierSimulationMT } from './types';

export function mapToSimulationData(formData: any): SimulationDataMT {
  try {
    if (!formData) throw new AFIESCAError('Form data is undefined', 'VALIDATION_ERROR');
    if (!formData.insured || typeof formData.insured !== 'object') {
      throw new AFIESCAError('Insured person data is missing', 'VALIDATION_ERROR');
    }
    if (!formData.insured.civility || !['M', 'MME'].includes(formData.insured.civility)) {
      throw new AFIESCAError('Invalid or missing civility', 'VALIDATION_ERROR');
    }

    return {
      Assures: [{
        Civilite: formData.insured.civility,
        Nom: formData.insured.lastName?.toUpperCase() || '',
        Prenom: formData.insured.firstName || '',
        DateNaissance: formData.insured.birthDate || '',
        Fumeur: formData.insured.smoker || false,
        NbCigarettes: formData.insured.cigarettesPerDay || 0,
        Profession: formData.insured.profession || '',
        CategoriePro: PROFESSIONAL_CATEGORIES[formData.insured.professionalCategory] || 'AUTRE',
        Garanties: Object.entries(formData.coverage || {})
          .filter(([key, value]) => value && key in COVERAGE_TYPES)
          .map(([key]) => COVERAGE_TYPES[key as keyof typeof COVERAGE_TYPES]),
        Quotite: formData.coverage?.quotity || 100,
        ProfessionID: 1,
        TauxCommission: 0
      }],
      CodeLangue: 'FR',
      CotisationType: 'VARIABLE',
      DateEffet: new Date().toISOString().split('T')[0],
      Periodicite: 'MENSUELLE',
      Prets: [{
        Differe: 0,
        Duree: formData.loan?.duration || 240,
        Montant: formData.loan?.amount || 100000,
        Numero: 1,
        Taux: formData.loan?.rate || 3.5,
        Type: LOAN_TYPES[formData.loan?.type || 'MORTGAGE'],
        ValeurResiduelle: 0
      }],
      JourPrelevement: 5,
      Franchise: '90'
    };
  } catch (error) {
    if (error instanceof AFIESCAError) throw error;
    throw new AFIESCAError('Error mapping simulation data', 'MAPPING_ERROR', error);
  }
}

export function mapToDossierData(formData: any, simulationId: string): DossierSimulationMT {
  try {
    if (!formData || !simulationId) {
      throw new AFIESCAError('Missing required data', 'VALIDATION_ERROR');
    }

    return {
      SimulationId: simulationId,
      Souscripteur: {
        EstAssure: true,
        Civilite: formData.insured?.civility || 'M',
        Nom: formData.insured?.lastName?.toUpperCase() || '',
        Prenom: formData.insured?.firstName || '',
        Email: formData.insured?.email || '',
        Telephone: formatPhone(formData.insured?.phone),
        Adresse: mapAddress(formData.insured?.address)
      },
      Beneficiaire: {
        Type: 'ORGANISME',
        NomOrganisme: formData.bank?.name?.toUpperCase() || 'CREDIRIS',
        Adresse: mapAddress(formData.bank?.address),
        Contact: {
          Nom: formData.bank?.contact?.name,
          Telephone: formatPhone(formData.bank?.contact?.phone),
          Email: formData.bank?.contact?.email
        }
      },
      ReferencesBancaires: {
        IBAN: formData.bankInfo?.iban || '',
        BIC: formData.bankInfo?.bic || '',
        CompteJoint: formData.bankInfo?.isJointAccount || false
      }
    };
  } catch (error) {
    if (error instanceof AFIESCAError) throw error;
    throw new AFIESCAError('Error mapping dossier data', 'MAPPING_ERROR', error);
  }
}

function formatPhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.startsWith('0') ? `+33${phone.slice(1)}` : phone;
}

function mapAddress(address: any) {
  return {
    Numero: address?.number || '',
    TypeVoie: address?.streetType?.toUpperCase() || '',
    NomVoie: address?.street?.toUpperCase() || '',
    Complement: address?.complement?.toUpperCase(),
    CodePostal: address?.postalCode || '',
    Ville: address?.city?.toUpperCase() || '',
    Pays: 'FRANCE'
  };
}
