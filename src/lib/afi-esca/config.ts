export const API_CONFIG = {
  WSDL_URL: import.meta.env.VITE_AFI_ESCA_WSDL_URL,
  AUTH: {
    login: import.meta.env.VITE_AFI_ESCA_LOGIN,
    partnerId: import.meta.env.VITE_AFI_ESCA_PARTNER_ID
  }
};

// Constantes de configuration
export const SIMULATION_CONFIG = {
  JOUR_PRELEVEMENT: 5,
  TYPE_COTISATION: 'VARIABLE',
  FRANCHISE: '90',
  QUOTITY_MIN: 1,
  QUOTITY_MAX: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  TIMEOUT: 30000
} as const;

// Types de garanties
export const COVERAGE_TYPES = {
  DEATH: 'DC',
  PTIA: 'PTIA', 
  IPT: 'IPT',
  ITT: 'ITT',
  IPP: 'IPP'
} as const;

// Catégories professionnelles
export const PROFESSIONAL_CATEGORIES = {
  EMPLOYEE: 'SALARIE',
  EXECUTIVE: 'CADRE',
  SELF_EMPLOYED: 'TNS',
  CIVIL_SERVANT: 'FONCTIONNAIRE',
  RETIRED: 'RETRAITE',
  OTHER: 'AUTRE'
} as const;

// Types de prêts
export const LOAN_TYPES = {
  MORTGAGE: 'AMORT',
  CONSUMER: 'RELAIS',
  PROFESSIONAL: 'INFINE'
} as const;