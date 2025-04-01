/*
  # Add admin role and application tracking

  1. Changes
    - Add user_role enum type
    - Add role column to users table
    - Add tracking columns to applications
    - Add admin policies
  
  2. Security
    - Enable RLS for admin access
    - Ensure proper role-based access control
*/

-- Create user_role type if it doesn't exist
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
CREATE INDEX IF NOT EXISTS idx_applications_afi_esca_id_v2 ON applications(afi_esca_id);

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
  DROP POLICY IF EXISTS "Admins can view all users" ON users;
END $$;

-- Create admin policies with new names
CREATE POLICY "Admins can view all applications v2"
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

CREATE POLICY "Admins can view all users v2"
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
COMMENT ON COLUMN applications.afi_esca_id IS 'AFI ESCA application ID';
COMMENT ON COLUMN applications.afi_esca_status IS 'Status in AFI ESCA system';
COMMENT ON COLUMN applications.afi_esca_url IS 'URL to AFI ESCA portal';
COMMENT ON COLUMN applications.afi_esca_data IS 'Additional AFI ESCA data';