/*
  # Add admin role and application tracking

  1. Changes
    - Add role column to users table
    - Add tracking columns to applications
    - Create admin policies

  2. Security
    - Enable RLS for admin access
    - Add policies for admin users
*/

-- Check if type exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'user_role'
  ) THEN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN role user_role NOT NULL DEFAULT 'user';
  END IF;
END $$;

-- Add tracking columns if they don't exist
DO $$
BEGIN
  -- Add reminder_sent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'reminder_sent'
  ) THEN
    ALTER TABLE applications ADD COLUMN reminder_sent boolean NOT NULL DEFAULT false;
  END IF;

  -- Add signature columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'signature_date'
  ) THEN
    ALTER TABLE applications 
    ADD COLUMN signature_date timestamptz,
    ADD COLUMN signature_ip text,
    ADD COLUMN signature_data text,
    ADD COLUMN contract_url text;
  END IF;

  -- Add AFI ESCA columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'afi_esca_id'
  ) THEN
    ALTER TABLE applications 
    ADD COLUMN afi_esca_id text,
    ADD COLUMN afi_esca_status text,
    ADD COLUMN afi_esca_url text,
    ADD COLUMN afi_esca_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_applications_afi_esca_id ON applications(afi_esca_id);

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop admin policies if they exist
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'applications' 
    AND policyname = 'Admins can view all applications'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users' 
    AND policyname = 'Admins can view all users'
  ) THEN
    DROP POLICY IF EXISTS "Admins can view all users" ON users;
  END IF;
END $$;

-- Create admin policies
CREATE POLICY "Admins can view all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN users.role IS 'User role (user or admin)';
COMMENT ON COLUMN applications.reminder_sent IS 'Whether a reminder has been sent';
COMMENT ON COLUMN applications.signature_date IS 'When the contract was signed';
COMMENT ON COLUMN applications.signature_ip IS 'IP address of signer';
COMMENT ON COLUMN applications.signature_data IS 'Signature data';
COMMENT ON COLUMN applications.contract_url IS 'URL to signed contract';
COMMENT ON COLUMN applications.afi_esca_id IS 'AFI ESCA application ID';
COMMENT ON COLUMN applications.afi_esca_status IS 'Status in AFI ESCA system';
COMMENT ON COLUMN applications.afi_esca_url IS 'URL to AFI ESCA portal';
COMMENT ON COLUMN applications.afi_esca_data IS 'Additional AFI ESCA data';