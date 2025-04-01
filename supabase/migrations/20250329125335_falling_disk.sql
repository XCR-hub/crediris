/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing RLS policies on users table
    - Add new policies for:
      - SELECT: Users can read their own data
      - INSERT: Anyone can insert (needed for sign up)
      - UPDATE: Users can update their own data
  
  2. Security
    - Enable RLS on users table
    - Ensure authenticated users can only access their own data
    - Allow new user creation during sign up
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access to own user data" ON users;
DROP POLICY IF EXISTS "Enable insert access for service role" ON users;
DROP POLICY IF EXISTS "Enable update access to own user data" ON users;

-- Create new policies
CREATE POLICY "Users can read own data"
ON users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Anyone can create their own user profile"
ON users FOR INSERT
TO authenticated, anon
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;