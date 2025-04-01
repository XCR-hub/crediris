/*
  # Add contract storage bucket

  1. Storage
    - Create contracts bucket for storing signed PDFs
    - Set up RLS policies for secure access

  2. Security
    - Enable RLS on bucket
    - Add policies for read/write access
*/

-- Enable storage
INSERT INTO storage.buckets (id, name)
VALUES ('contracts', 'contracts')
ON CONFLICT DO NOTHING;

-- Set up RLS policies for contracts bucket
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