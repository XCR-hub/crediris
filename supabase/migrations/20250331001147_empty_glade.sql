/*
  # Set up contracts storage bucket and policies

  1. Changes
    - Create contracts storage bucket
    - Add RLS policies for contract access
  
  2. Security
    - Enable RLS for storage objects
    - Ensure users can only access their own contracts
*/

-- Create contracts bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'contracts'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('contracts', 'contracts');
  END IF;
END $$;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop read policy if exists
  DROP POLICY IF EXISTS "Users can read own contracts" ON storage.objects;
  
  -- Drop upload policy if exists
  DROP POLICY IF EXISTS "Users can upload own contracts" ON storage.objects;
  
  -- Drop delete policy if exists
  DROP POLICY IF EXISTS "Users can delete own contracts" ON storage.objects;
END $$;

-- Create new policies
CREATE POLICY "Users can read own contracts v2"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can upload own contracts v2"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own contracts v2"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'contracts' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_name_v2 ON storage.objects USING btree (name);