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

const healthSchema = z.object({
  height: z.number()
    .min(100, 'Taille minimum : 100 cm')
    .max(250, 'Taille maximum : 250 cm'),
  weight: z.number()
    .min(30, 'Poids minimum : 30 kg')
    .max(200, 'Poids maximum : 200 kg'),
  smoker: z.boolean(),
  cigarettesPerDay: z.number().optional(),
  hasChronicCondition: z.boolean(),
  chronicConditionDetails: z.string().optional(),
  hasSurgeryHistory: z.boolean(),
  surgeryHistoryDetails: z.string().optional(),
  practicesDangerousSports: z.boolean(),
  dangerousSportsDetails: z.string().optional()
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

  // Rule 5: Smoker validation
  if (coverage.smoker && !coverage.cigarettesPerDay) {
    errors.push('Le nombre de cigarettes par jour est requis pour les fumeurs');
  }

  // Rule 6: Dangerous sports validation
  if (coverage.practicesDangerousSports && !coverage.dangerousSportsDetails) {
    errors.push('Veuillez préciser les sports dangereux pratiqués');
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

// Health risk assessment
function assessHealthRisks(healthData: any) {
  const risks: string[] = [];
  const bmi = healthData.weight / Math.pow(healthData.height / 100, 2);

  // BMI checks
  if (bmi < 18.5) {
    risks.push('IMC inférieur à la normale');
  } else if (bmi > 30) {
    risks.push('IMC élevé');
  }

  // Smoking risks
  if (healthData.smoker) {
    if (healthData.cigarettesPerDay && healthData.cigarettesPerDay > 20) {
      risks.push('Consommation de tabac élevée');
    }
  }

  // Medical history risks
  if (healthData.hasChronicCondition) {
    risks.push('Présence de maladie chronique');
  }
  if (healthData.hasSurgeryHistory) {
    risks.push('Antécédents chirurgicaux');
  }

  return risks;
}

export async function validateSimulationData(data: any): Promise<SimulationDataMT> {
  try {
    // 1. Validate basic data structure
    const validatedLoan = await loanSchema.parseAsync(data.loan);
    const validatedHealth = await healthSchema.parseAsync(data.health);
    const validatedCoverage = await coverageSchema.parseAsync(data.coverage);

    // 2. Validate business rules
    const guaranteeErrors = validateGuarantees({
      ...data.coverage,
      ...data.health
    });

    if (guaranteeErrors.length > 0) {
      throw new AFIESCAError(
        guaranteeErrors.join('\n'),
        'COVERAGE_ERROR'
      );
    }

    // 3. Assess health risks
    const healthRisks = assessHealthRisks(validatedHealth);
    
    // 4. Normalize guarantees
    const normalizedCoverage = normalizeGuarantees(validatedCoverage);

    // 5. Build final simulation data
    return {
      Assure: {
        Civilite: data.insured.gender,
        Nom: data.insured.lastName.toUpperCase(),
        Prenom: data.insured.firstName,
        DateNaissance: data.insured.birthDate,
        Profession: data.insured.profession,
        CategoriePro: data.insured.professionalCategory,
        Fumeur: validatedHealth.smoker,
        NbCigarettes: validatedHealth.cigarettesPerDay,
        Taille: validatedHealth.height,
        Poids: validatedHealth.weight,
        MaladieChronique: validatedHealth.hasChronicCondition,
        AntecedentsChirurgicaux: validatedHealth.hasSurgeryHistory,
        SportsDangereux: validatedHealth.practicesDangerousSports,
        RisquesSante: healthRisks
      },
      Pret: {
        Montant: validatedLoan.amount,
        Duree: validatedLoan.duration,
        Taux: validatedLoan.rate,
        Type: validatedLoan.type
      },
      Garanties: [
        { Code: 'DC', Selected: normalizedCoverage.death },
        { Code: 'PTIA', Selected: normalizedCoverage.ptia },
        { Code: 'IPT', Selected: normalizedCoverage.ipt },
        { Code: 'ITT', Selected: normalizedCoverage.itt },
        { Code: 'IPP', Selected: normalizedCoverage.ipp }
      ],
      Quotite: normalizedCoverage.quotity
    };
  } catch (error) {
    if (error instanceof AFIESCAError) {
      throw error;
    }
    throw new AFIESCAError(
      'Données de simulation invalides',
      'INVALID_DATA',
      error
    );
  }
}

export { validateGuarantees, normalizeGuarantees, assessHealthRisks };