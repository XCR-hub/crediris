// Base types for loan information
export interface LoanInformation {
  amount: number;
  duration: number;
  rate: number;
  type: 'MORTGAGE' | 'CONSUMER' | 'PROFESSIONAL';
  purpose?: 'MAIN_RESIDENCE' | 'SECONDARY_RESIDENCE' | 'RENTAL_INVESTMENT' | 'WORKS' | 'OTHER';
  repaymentType: 'WITH_INTEREST' | 'WITHOUT_INTEREST';
}

// Types for insured person details
export interface InsuredPerson {
  civility: 'M' | 'MME';
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone?: string;
  address?: {
    number: string;
    street: string;
    complement?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  profession: string;
  professionalCategory: 'EMPLOYEE' | 'EXECUTIVE' | 'SELF_EMPLOYED' | 'CIVIL_SERVANT' | 'RETIRED' | 'OTHER';
  smoker: boolean;
  cigarettesPerDay?: number;
}

// Form Data Types
export interface SimulationFormData {
  loan: {
    amount: number;
    duration: number;
    rate: number;
    type: 'MORTGAGE' | 'CONSUMER' | 'PROFESSIONAL';
  };
  insured: {
    civility: 'M' | 'MME';
    firstName: string;
    lastName: string;
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