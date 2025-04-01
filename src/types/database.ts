export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at?: string;
}

export interface Application {
  id: string;
  user_id: string;
  status: 'draft' | 'pending_review' | 'submitted' | 'approved' | 'rejected';
  loan_amount: number;
  loan_duration: number;
  loan_rate: number;
  monthly_payment?: number;
  total_cost?: number;
  submitted_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  afi_esca_id?: string;
  afi_esca_status?: string;
  afi_esca_documents?: {
    type: string;
    url: string;
    required: boolean;
  }[];
  simulation_id?: string;
  coverage_type?: 'DEATH' | 'DISABILITY' | 'BOTH';
  health_data?: {
    hasChronicCondition: boolean;
    hasSurgeryHistory: boolean;
    currentMedications: boolean;
    [key: string]: any;
  };
  signature_date?: string;
  signature_ip?: string;
  signature_data?: string;
  contract_url?: string;
}

export interface LoanSimulation {
  id: string;
  application_id: string;
  afi_esca_id: string;
  simulation_data: Record<string, any>;
  result_data: Record<string, any>;
  monthly_premium: number;
  total_premium: number;
  created_at: string;
  updated_at: string;
}

export interface HealthQuestionnaire {
  id: string;
  application_id: string;
  height: number;
  weight: number;
  smoker: boolean;
  cigarettes_per_day?: number;
  alcohol_consumption: 'NONE' | 'OCCASIONAL' | 'REGULAR';
  exercise_frequency: 'NEVER' | 'OCCASIONAL' | 'REGULAR';
  has_chronic_condition: boolean;
  chronic_condition_details?: string;
  has_surgery_history: boolean;
  surgery_history_details?: string;
  current_medications: boolean;
  medication_details?: string;
  has_cardiovascular_disease: boolean;
  has_respiratory_disease: boolean;
  has_diabetes: boolean;
  has_cancer: boolean;
  has_autoimmune_disease: boolean;
  has_musculoskeletal_disorder: boolean;
  has_neurological_disorder: boolean;
  has_mental_health_disorder: boolean;
  family_history: {
    cancer: boolean;
    heart_disease: boolean;
    diabetes: boolean;
  };
  practices_dangerous_sports: boolean;
  dangerous_sports_details?: string;
  additional_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InsuranceDocument {
  id: string;
  application_id: string;
  type: 'IDENTITY' | 'PROOF_OF_ADDRESS' | 'BANK_DETAILS' | 'LOAN_OFFER';
  status: 'pending' | 'approved' | 'rejected';
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewer_id?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}