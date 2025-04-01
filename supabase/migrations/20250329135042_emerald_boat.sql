/*
  # Add application details and submission fields

  1. Changes
    - Add new fields to applications table:
      - monthly_payment (numeric)
      - total_cost (numeric)
      - submitted_at (timestamptz)
      - notes (text)
    - Add new status: 'pending_review'

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Add application details fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'monthly_payment') THEN
    ALTER TABLE applications ADD COLUMN monthly_payment numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'total_cost') THEN
    ALTER TABLE applications ADD COLUMN total_cost numeric;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'submitted_at') THEN
    ALTER TABLE applications ADD COLUMN submitted_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'notes') THEN
    ALTER TABLE applications ADD COLUMN notes text;
  END IF;

  -- Update status type to include pending_review
  ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
  ALTER TABLE applications ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('draft', 'pending_review', 'submitted', 'approved', 'rejected'));
END $$;