export const API_CONFIG = {
  WSDL_URL: import.meta.env.VITE_AFI_ESCA_WSDL_URL,
  AUTH: {
    login: import.meta.env.VITE_AFI_ESCA_LOGIN,
    password: import.meta.env.VITE_AFI_ESCA_PASSWORD,
  },
  PARTNER_ID: import.meta.env.VITE_AFI_ESCA_PARTNER_ID
};

export const COVERAGE_TYPES = {
  DEATH: 'DC',
  PTIA: 'PTIA',
  IPT: 'IPT',
  ITT: 'ITT',
  IPP: 'IPP'
} as const;

export const PROFESSIONAL_CATEGORIES = {
  EMPLOYEE: 'SALARIE',
  EXECUTIVE: 'CADRE',
  SELF_EMPLOYED: 'TNS',
  CIVIL_SERVANT: 'FONCTIONNAIRE',
  RETIRED: 'RETRAITE',
  OTHER: 'AUTRE'
} as const;

export const LOAN_TYPES = {
  MORTGAGE: 'AMORT',
  CONSUMER: 'RELAIS',
  PROFESSIONAL: 'INFINE'
} as const;