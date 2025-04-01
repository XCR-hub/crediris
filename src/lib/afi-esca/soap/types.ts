import { z } from 'zod';

// Enums from WSDL
export enum TypeCivilite {
  HOMME = 'HOMME',
  FEMME = 'FEMME'
}

export enum TypeCotisation {
  CONSTANTE = 'CONSTANTE',
  VARIABLE = 'VARIABLE'
}

export enum TypePeriodicite {
  ANNUELLE = 'ANNUELLE',
  SEMESTRIELLE = 'SEMESTRIELLE',
  TRIMESTRIELLE = 'TRIMESTRIELLE',
  MENSUELLE = 'MENSUELLE',
  PRIME_UNIQUE = 'PRIME_UNIQUE'
}

export enum NatureProjet {
  NOUVEAU = 'NOUVEAU',
  CHANGEMENT_ASSURANCE = 'CHANGEMENT_ASSURANCE'
}

export enum ObjetPret {
  ACHAT_RESIDENCE_PRINCIPALE = 'ACHAT_RESIDENCE_PRINCIPALE',
  ACHAT_RESIDENCE_SECONDAIRE = 'ACHAT_RESIDENCE_SECONDAIRE',
  INVESTISSEMENT_LOCATIF = 'INVESTISSEMENT_LOCATIF',
  AUTRES_ACHATS_IMMOBILIER = 'AUTRES_ACHATS_IMMOBILIER',
  TRAVAUX = 'TRAVAUX',
  PRET_PROFESSIONNEL = 'PRET_PROFESSIONNEL',
  PRET_CONSOMMATION = 'PRET_CONSOMMATION'
}

// Complex Types from WSDL
export interface AdresseData {
  Numero: string;
  TypeVoie: string;
  NomVoie: string;
  Complement?: string;
  CodePostal: string;
  Ville: string;
  Pays: string;
}

export interface RisqueProfessionnel {
  CSP: string;
  TravailEnHauteur?: boolean;
  ContactAvecProduitDangereux?: boolean;
  TravailManuel: boolean;
  Deplacements?: boolean;
}

export interface AssureData {
  Civilite: TypeCivilite;
  DateNaissance: string;
  Fumeur: boolean;
  Garanties: string[];
  Options?: string[];
  Poids?: number;
  ProfessionID?: number;
  Quotite: number;
  Taille?: number;
  TauxCommission: number;
  Nom?: string;
  Prenom?: string;
  Telephone?: string;
  EMail?: string;
  RisqueProfessionnel?: RisqueProfessionnel;
  DeclareCapitalGlobalSuperieurPlafondLemoine?: boolean;
  CodePostal?: string;
  Ville?: string;
  FraisDossierLisses?: boolean;
}

export interface PalierPretData {
  Duree: number;
  Montant: number;
  Taux: number;
  CapitalDebut?: number;
  CapitalFin?: number;
  PremierAmortissement?: number;
}

export interface PretData {
  Differe: number;
  Duree: number;
  Montant: number;
  Numero: number;
  Paliers?: PalierPretData[];
  Taux: number;
  TauxInfine?: number;
  Type: string;
  ValeurResiduelle: number;
  Objet?: ObjetPret;
  PremierAmortissement?: number;
}

export interface SimulationDataMT {
  Assures: AssureData[];
  CodeLangue: string;
  CotisationType: TypeCotisation;
  DateEffet: string;
  Periodicite: TypePeriodicite;
  Prets: PretData[];
  NatureProjet?: NatureProjet;
  DateSignature?: string;
  PartImmoSupOuEgale60PourCent?: boolean;
  OrganismeBancaire?: string;
  NiveauDelegation?: string;
  FraisDossier?: number;
}

export interface CotisationData {
  Garantie: string;
  Prime: number;
  PrimeHT?: number;
  Taxe?: number;
  SurprimeMedicalePCHT?: number;
  SurprimeMedicalePMHT?: number;
  SurprimeNonMedicalePCHT?: number;
  SurprimeNonMedicalePMHT?: number;
}

export interface CotisationRow {
  Age: number;
  Annee: number;
  Cotisations: CotisationData[];
  FrAcquisition: number;
  FrGestion?: number;
  FrIntermediation?: number;
  MontantKRD: number;
  Pret: number;
  Taxes: number;
  Total: number;
}

export interface TauxAssurePret {
  NumPret: number;
  TypeTaux: string;
  Taux: number;
}

export interface MontantTotalSouscriptionData {
  FraisDossierCompagnie: number;
  FraisDossierIntermediaire: number;
  MontantFraisDossierTTC: number;
  MontantPremierePrimeTTC: number;
  MontantTotalTTC: number;
  TaxeFraisDossier: number;
}

export interface SimulationResultMT {
  Error: boolean;
  ErrorDescription?: string;
  FormalitesMedicales?: string[][];
  TableauCotisationsAssures: CotisationRow[][];
  TableauCotisationsGlobal: CotisationRow[];
  TableauTauxAssurePret: TauxAssurePret[];
  TauxCommission: number[];
  TotalAssures: CotisationData[][];
  TotalGlobal: CotisationData[];
  TotalSouscriptionAssures?: MontantTotalSouscriptionData[];
  TypeProduit?: string;
}

export interface DossierSimulation {
  NumeroDossier?: string;
  Nom?: string;
  Prenom?: string;
  URL?: string;
}

// API Response Types
export type ErrorResponse = {
  ErrorCode: string;
  ErrorDescription: string;
  Details?: any;
};

export type APIResponse<T> = {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
};

// Form Data Types
export interface SimulationFormData {
  loan: {
    amount: number;
    duration: number;
    rate: number;
    type: 'MORTGAGE' | 'CONSUMER' | 'PROFESSIONAL';
  };
  insured: {
    gender: TypeCivilite;
    birthDate: string;
    profession: string;
    professionalCategory: string;
    smoker: boolean;
    cigarettesPerDay?: number;
  };
  coverage: {
    death: boolean;
    ptia: boolean;
    ipt: boolean;
    itt: boolean;
    ipp: boolean;
    quotity: number;
  };
}