import { z } from 'zod';
import { COVERAGE_TYPES, PROFESSIONAL_CATEGORIES, LOAN_TYPES } from '../soap/config';

// Base validation schemas
export const loanSchema = z.object({
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

export const healthSchema = z.object({
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

export const coverageSchema = z.object({
  death: z.boolean(),
  ptia: z.boolean(),
  ipt: z.boolean(),
  itt: z.boolean(),
  ipp: z.boolean(),
  quotity: z.number().min(1).max(100)
});

// Business rules validation
export function validateGuarantees(coverage: any) {
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
export function normalizeGuarantees(coverage: any) {
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
export function assessHealthRisks(healthData: any) {
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