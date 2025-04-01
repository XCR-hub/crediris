/*
  # Add AFI ESCA integration fields

  1. Changes
    - Add afi_esca_id column to applications table
    - Add afi_esca_status column to applications table
    - Add afi_esca_url column to applications table
    - Add afi_esca_data column to applications table

  2. Security
    - Enable RLS on new columns
    - Update policies to include new columns
*/

-- Add new columns
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS afi_esca_id text,
ADD COLUMN IF NOT EXISTS afi_esca_status text,
ADD COLUMN IF NOT EXISTS afi_esca_url text,
ADD COLUMN IF NOT EXISTS afi_esca_data jsonb DEFAULT '{}'::jsonb;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_afi_esca_id ON applications(afi_esca_id);

-- Update RLS policies
CREATE POLICY "Users can read own AFI ESCA data"
  ON applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own AFI ESCA data"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);