/*
  # Add signature fields to applications table

  1. Changes
    - Add signature_date column to applications table
    - Add signature_ip column to applications table
    - Add signature_data column to applications table
    - Add contract_url column to applications table

  2. Security
    - Enable RLS on new columns
    - Update policies to include new columns
*/

-- Add new columns
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS signature_date timestamptz,
ADD COLUMN IF NOT EXISTS signature_ip text,
ADD COLUMN IF NOT EXISTS signature_data text,
ADD COLUMN IF NOT EXISTS contract_url text;

-- Update RLS policies
CREATE POLICY "Users can read own signature data"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own signature data"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);