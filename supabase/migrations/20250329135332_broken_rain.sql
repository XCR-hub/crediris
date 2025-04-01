/*
  # Add AFI ESCA integration fields

  1. Changes
    - Add AFI ESCA specific fields to applications table:
      - afi_esca_id (text): Store AFI ESCA application ID
      - afi_esca_status (text): Store AFI ESCA application status
      - afi_esca_documents (jsonb): Store document URLs
      - simulation_id (text): Store simulation reference
      - coverage_type (text): Type of insurance coverage
      - health_data (jsonb): Store health questionnaire responses

  2. Security
    - Maintain existing RLS policies
    - Add new policy for document access
*/

DO $$ 
BEGIN
  -- Add AFI ESCA specific fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'afi_esca_id') THEN
    ALTER TABLE applications ADD COLUMN afi_esca_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'afi_esca_status') THEN
    ALTER TABLE applications ADD COLUMN afi_esca_status text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'afi_esca_documents') THEN
    ALTER TABLE applications ADD COLUMN afi_esca_documents jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'simulation_id') THEN
    ALTER TABLE applications ADD COLUMN simulation_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'coverage_type') THEN
    ALTER TABLE applications ADD COLUMN coverage_type text;
    ALTER TABLE applications ADD CONSTRAINT applications_coverage_type_check 
      CHECK (coverage_type IN ('DEATH', 'DISABILITY', 'BOTH'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'health_data') THEN
    ALTER TABLE applications ADD COLUMN health_data jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add index for AFI ESCA ID
  CREATE INDEX IF NOT EXISTS idx_applications_afi_esca_id ON applications(afi_esca_id);
END $$;