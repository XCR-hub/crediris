/*
  # Loan Insurance Schema

  1. New Tables
    - `loan_simulations`
      - Stores simulation results from AFI ESCA
      - Links to applications
    - `health_questionnaires`
      - Stores health data for insurance applications
    - `insurance_documents`
      - Tracks uploaded documents

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add indexes for performance

  3. Changes
    - Add new columns to applications table
    - Add tracking fields for document uploads
*/

-- Create loan_simulations table
CREATE TABLE IF NOT EXISTS loan_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id),
  afi_esca_id text NOT NULL,
  simulation_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  monthly_premium numeric NOT NULL,
  total_premium numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_questionnaires table
CREATE TABLE IF NOT EXISTS health_questionnaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id),
  height numeric NOT NULL,
  weight numeric NOT NULL,
  smoker boolean NOT NULL DEFAULT false,
  cigarettes_per_day integer,
  alcohol_consumption text CHECK (alcohol_consumption IN ('NONE', 'OCCASIONAL', 'REGULAR')),
  exercise_frequency text CHECK (exercise_frequency IN ('NEVER', 'OCCASIONAL', 'REGULAR')),
  has_chronic_condition boolean NOT NULL DEFAULT false,
  chronic_condition_details text,
  has_surgery_history boolean NOT NULL DEFAULT false,
  surgery_history_details text,
  current_medications boolean NOT NULL DEFAULT false,
  medication_details text,
  has_cardiovascular_disease boolean NOT NULL DEFAULT false,
  has_respiratory_disease boolean NOT NULL DEFAULT false,
  has_diabetes boolean NOT NULL DEFAULT false,
  has_cancer boolean NOT NULL DEFAULT false,
  has_autoimmune_disease boolean NOT NULL DEFAULT false,
  has_musculoskeletal_disorder boolean NOT NULL DEFAULT false,
  has_neurological_disorder boolean NOT NULL DEFAULT false,
  has_mental_health_disorder boolean NOT NULL DEFAULT false,
  family_history jsonb NOT NULL DEFAULT '{}'::jsonb,
  practices_dangerous_sports boolean NOT NULL DEFAULT false,
  dangerous_sports_details text,
  additional_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_application_questionnaire UNIQUE (application_id)
);

-- Create insurance_documents table
CREATE TABLE IF NOT EXISTS insurance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id),
  type text NOT NULL CHECK (type IN ('IDENTITY', 'PROOF_OF_ADDRESS', 'BANK_DETAILS', 'LOAN_OFFER')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL,
  mime_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewer_id uuid REFERENCES users(id),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_loan_simulations_application_id ON loan_simulations(application_id);
CREATE INDEX IF NOT EXISTS idx_loan_simulations_afi_esca_id ON loan_simulations(afi_esca_id);
CREATE INDEX IF NOT EXISTS idx_health_questionnaires_application_id ON health_questionnaires(application_id);
CREATE INDEX IF NOT EXISTS idx_insurance_documents_application_id ON insurance_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_insurance_documents_type ON insurance_documents(type);
CREATE INDEX IF NOT EXISTS idx_insurance_documents_status ON insurance_documents(status);

-- Enable RLS
ALTER TABLE loan_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_documents ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can read own loan simulations"
  ON loan_simulations
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own loan simulations"
  ON loan_simulations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own health questionnaires"
  ON health_questionnaires
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own health questionnaires"
  ON health_questionnaires
  FOR INSERT
  TO authenticated
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own health questionnaires"
  ON health_questionnaires
  FOR UPDATE
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read own insurance documents"
  ON insurance_documents
  FOR SELECT
  TO authenticated
  USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own insurance documents"
  ON insurance_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loan_simulations_updated_at
  BEFORE UPDATE ON loan_simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_questionnaires_updated_at
  BEFORE UPDATE ON health_questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_documents_updated_at
  BEFORE UPDATE ON insurance_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE loan_simulations IS 'Stores simulation results from AFI ESCA';
COMMENT ON TABLE health_questionnaires IS 'Stores health data for insurance applications';
COMMENT ON TABLE insurance_documents IS 'Tracks uploaded documents for insurance applications';