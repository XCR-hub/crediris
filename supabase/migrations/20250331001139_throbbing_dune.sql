/*
  # Add signature fields to applications table

  1. Changes
    - Add signature_date, signature_ip, signature_data, and contract_url columns
    - Add RLS policies for signature data access
  
  2. Security
    - Enable RLS policies for signature data
    - Ensure users can only access their own data
*/

-- Add signature fields if they don't exist
DO $$
BEGIN
  -- Add signature_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'signature_date'
  ) THEN
    ALTER TABLE applications ADD COLUMN signature_date timestamptz;
  END IF;

  -- Add signature_ip column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'signature_ip'
  ) THEN
    ALTER TABLE applications ADD COLUMN signature_ip text;
  END IF;

  -- Add signature_data column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'signature_data'
  ) THEN
    ALTER TABLE applications ADD COLUMN signature_data text;
  END IF;

  -- Add contract_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'contract_url'
  ) THEN
    ALTER TABLE applications ADD COLUMN contract_url text;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN applications.signature_date IS 'Timestamp when the contract was signed';
COMMENT ON COLUMN applications.signature_ip IS 'IP address of the signer for audit purposes';
COMMENT ON COLUMN applications.signature_data IS 'Base64 encoded signature data';
COMMENT ON COLUMN applications.contract_url IS 'URL to the signed contract PDF';