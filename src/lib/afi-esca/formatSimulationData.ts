import { SIMULATION_CONFIG } from './config';
import { AFIESCAError } from './errors';
import { COVERAGE_TYPES, PROFESSIONAL_CATEGORIES, LOAN_TYPES } from './soap/config';
import type { SimulationDataMT } from './soap/types';

/**
 * Validates and formats form data into AFI ESCA simulation format
 */
export function mapToSimulationData(formData: any): SimulationDataMT {
  try {
    // Validate required data
    if (!formData || typeof formData !== 'object') {
      throw new AFIESCAError(
        'Les données de simulation sont invalides',
        'VALIDATION_ERROR'
      );
    }

    // Validate insured person data
    if (!formData.insured || typeof formData.insured !== 'object') {
      throw new AFIESCAError(
        "Les données de l'assuré sont manquantes",
        'VALIDATION_ERROR'
      );
    }

    // Validate civility
    if (!formData.insured.civility || !['M', 'MME'].includes(formData.insured.civility)) {
      throw new AFIESCAError(
        'La civilité est invalide ou manquante',
        'VALIDATION_ERROR'
      );
    }

    const {
      civility,
      firstName,
      lastName,
      birthDate,
      profession,
      professionalCategory,
      smoker,
      cigarettesPerDay
    } = formData.insured;

    if (!firstName || !lastName || !birthDate || !profession || !professionalCategory) {
      throw new AFIESCAError(
        "Des informations obligatoires de l'assuré sont manquantes",
        'VALIDATION_ERROR'
      );
    }

    // Validate loan data
    if (!formData.loan || typeof formData.loan !== 'object') {
      throw new AFIESCAError(
        'Les données du prêt sont manquantes',
        'VALIDATION_ERROR'
      );
    }

    const { amount, duration, rate, type } = formData.loan;

    if (!amount || !duration || !rate || !type) {
      throw new AFIESCAError(
        'Des informations obligatoires du prêt sont manquantes',
        'VALIDATION_ERROR'
      );
    }

    // Validate coverage data
    if (!formData.coverage || typeof formData.coverage !== 'object') {
      throw new AFIESCAError(
        'Les données des garanties sont manquantes',
        'VALIDATION_ERROR'
      );
    }

    const { quotity } = formData.coverage;

    if (typeof quotity !== 'number' || 
        quotity < SIMULATION_CONFIG.QUOTITY_MIN || 
        quotity > SIMULATION_CONFIG.QUOTITY_MAX) {
      throw new AFIESCAError(
        `La quotité doit être comprise entre ${SIMULATION_CONFIG.QUOTITY_MIN}% et ${SIMULATION_CONFIG.QUOTITY_MAX}%`,
        'VALIDATION_ERROR'
      );
    }

    // Map guarantees
    const guarantees = Object.entries(formData.coverage)
      .filter(([key, enabled]) => enabled && key in COVERAGE_TYPES)
      .map(([code]) => COVERAGE_TYPES[code as keyof typeof COVERAGE_TYPES])
      .filter(Boolean);

    if (guarantees.length === 0) {
      throw new AFIESCAError(
        'Au moins une garantie doit être sélectionnée',
        'VALIDATION_ERROR'
      );
    }

    // Format data for AFI ESCA
    return {
      Assures: [{
        Civilite: civility,
        Nom: lastName.toUpperCase(),
        Prenom: firstName,
        DateNaissance: birthDate,
        Fumeur: smoker,
        NbCigarettes: cigarettesPerDay ?? 0,
        Garanties: guarantees,
        Quotite: quotity,
        ProfessionID: 1, // Default value for testing
        TauxCommission: 0,
        Profession: profession,
        CategoriePro: PROFESSIONAL_CATEGORIES[professionalCategory] || 'AUTRE'
      }],
      CodeLangue: 'FR',
      CotisationType: SIMULATION_CONFIG.TYPE_COTISATION,
      DateEffet: new Date().toISOString().split('T')[0],
      Periodicite: 'MENSUELLE',
      Prets: [{
        Differe: 0,
        Duree: duration,
        Montant: amount,
        Numero: 1,
        Taux: rate,
        Type: LOAN_TYPES[type],
        ValeurResiduelle: 0
      }],
      JourPrelevement: SIMULATION_CONFIG.JOUR_PRELEVEMENT,
      Franchise: SIMULATION_CONFIG.FRANCHISE
    };
  } catch (error) {
    if (error instanceof AFIESCAError) {
      throw error;
    }
    throw new AFIESCAError(
      'Erreur lors du formatage des données de simulation',
      'FORMAT_ERROR',
      error
    );
  }
}