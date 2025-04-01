import { z } from 'zod';
import { AFIESCAError } from '../errors';
import { COVERAGE_TYPES, PROFESSIONAL_CATEGORIES, LOAN_TYPES } from '../soap/config';
import type { SimulationDataMT } from '../soap/types';

// Validation schemas
const loanSchema = z.object({
  amount: z.number()
    .min(10000, 'Le montant minimum est de 10 000 €')
    .max(1000000, 'Le montant maximum est de 1 000 000 €'),
  duration: z.number()
    .min(12, 'Durée minimum : 12 mois')
    .max(360, 'Durée maximum : 360 mois'),
  rate: z.number()
    .min(0.1, 'Taux minimum : 0.1%')
    .max(20, 'Taux maximum : 20%'),
  type: z.enum(Object.keys(LOAN_TYPES) as [string, ...string[]])
});

const insuredSchema = z.object({
  civility: z.enum(['M', 'MME'], {
    required_error: 'Civilité requise'
  }),
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  profession: z.string().min(2, 'Profession requise'),
  professionalCategory: z.enum(Object.keys(PROFESSIONAL_CATEGORIES) as [string, ...string[]]),
  smoker: z.boolean(),
  cigarettesPerDay: z.number().optional()
});

const coverageSchema = z.object({
  death: z.boolean(),
  ptia: z.boolean(),
  ipt: z.boolean(),
  itt: z.boolean(),
  ipp: z.boolean(),
  quotity: z.number().min(1).max(100)
});

// Business rules validation
function validateGuarantees(coverage: any) {
  const errors: string[] = [];

  // Rule 1: PTIA requires Death coverage
  if (coverage.ptia && !coverage.death) {
    errors.push('La garantie PTIA nécessite la garantie Décès');
  }

  // Rule 2: IPT requires PTIA
  if (coverage.ipt && !coverage.ptia) {
    errors.push('La garantie IPT nécessite la garantie PTIA');
  }

  // Rule 3: ITT requires IPT
  if (coverage.itt && !coverage.ipt) {
    errors.push('La garantie ITT nécessite la garantie IPT');
  }

  // Rule 4: IPP requires ITT
  if (coverage.ipp && !coverage.itt) {
    errors.push('La garantie IPP nécessite la garantie ITT');
  }

  return errors;
}

// Normalize guarantees based on dependencies
function normalizeGuarantees(coverage: any) {
  const normalized = { ...coverage };

  // Add required parent guarantees
  if (normalized.ipp) {
    normalized.itt = true;
  }
  if (normalized.itt) {
    normalized.ipt = true;
  }
  if (normalized.ipt) {
    normalized.ptia = true;
  }
  if (normalized.ptia) {
    normalized.death = true;
  }

  return normalized;
}

// Main validation function
export async function validateSimulationData(data: any): Promise<SimulationDataMT> {
  try {
    // Validate basic data structure
    if (!data) {
      throw new AFIESCAError('Les données de simulation sont manquantes', 'VALIDATION_ERROR');
    }

    // Validate loan data
    const validatedLoan = await loanSchema.parseAsync(data.loan);

    // Validate insured person data
    if (!data.insured) {
      throw new AFIESCAError('Les données de l\'assuré sont manquantes', 'VALIDATION_ERROR');
    }

    const validatedInsured = await insuredSchema.parseAsync(data.insured);

    // Validate coverage data
    const validatedCoverage = await coverageSchema.parseAsync(data.coverage);

    // Build final simulation data
    return {
      Assure: {
        Civilite: validatedInsured.civility,
        Nom: validatedInsured.lastName.toUpperCase(),
        Prenom: validatedInsured.firstName,
        DateNaissance: validatedInsured.birthDate,
        Profession: validatedInsured.profession,
        CategoriePro: validatedInsured.professionalCategory,
        Fumeur: validatedInsured.smoker,
        NbCigarettes: validatedInsured.cigarettesPerDay,
        Taille: 170, // Default values for testing
        Poids: 70,
        MaladieChronique: false,
        AntecedentsChirurgicaux: false,
        SportsDangereux: false,
        RisquesSante: []
      },
      Pret: {
        Montant: validatedLoan.amount,
        Duree: validatedLoan.duration,
        Taux: validatedLoan.rate,
        Type: validatedLoan.type
      },
      Garanties: [
        { Code: 'DC', Selected: validatedCoverage.death },
        { Code: 'PTIA', Selected: validatedCoverage.ptia },
        { Code: 'IPT', Selected: validatedCoverage.ipt },
        { Code: 'ITT', Selected: validatedCoverage.itt },
        { Code: 'IPP', Selected: validatedCoverage.ipp }
      ],
      Quotite: validatedCoverage.quotity
    };
  } catch (error) {
    if (error instanceof AFIESCAError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message);
      throw new AFIESCAError(
        messages.join('\n'),
        'VALIDATION_ERROR',
        error
      );
    }
    throw new AFIESCAError(
      'Données de simulation invalides',
      'INVALID_DATA',
      error
    );
  }
}

export { validateGuarantees, normalizeGuarantees };