/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing RLS policies on users table
    - Add new policies for:
      - SELECT: Users can read their own data
      - INSERT: Service role can insert new users
      - UPDATE: Users can update their own data
  
  2. Security
    - Enable RLS on users table
    - Ensure authenticated users can only access their own data
    - Allow service role to create new users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies
CREATE POLICY "Enable read access to own user data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert access for service role"
ON users FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Enable update access to own user data"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;