/*
  # Set up storage for contracts

  1. Storage Setup
    - Create contracts bucket if it doesn't exist
    - Set up RLS policies for secure access

  2. Security
    - Users can only access their own contracts
    - Strict path validation
    - Secure upload/download policies
*/

-- Check if bucket exists before creating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'contracts'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('contracts', 'contracts');
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  -- Drop read policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can read own contracts'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own contracts" ON storage.objects;
  END IF;

  -- Drop upload policy if exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload own contracts'
  ) THEN
    DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
  END IF;
END $$;

-- Create new policies
CREATE POLICY "Users can read own contracts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own contracts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Add delete policy for user's own files
CREATE POLICY "Users can delete own contracts"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects USING btree (name);