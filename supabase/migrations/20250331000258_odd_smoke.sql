/*
  # Add quote management functionality

  1. New Fields
    - Add quote_url to applications table
    - Add quote_generated_at to applications table
    - Add quote_downloads to applications table

  2. Storage
    - Create quotes bucket for storing generated PDFs
    - Add RLS policies for quote access

  3. Functions
    - Add function to track quote downloads
*/

-- Add quote management fields to applications
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS quote_url text,
ADD COLUMN IF NOT EXISTS quote_generated_at timestamptz,
ADD COLUMN IF NOT EXISTS quote_downloads integer DEFAULT 0;

-- Create quotes bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'quotes'
  ) THEN
    INSERT INTO storage.buckets (id, name)
    VALUES ('quotes', 'quotes');
  END IF;
END $$;

-- Drop existing policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can read own quotes'
  ) THEN
    DROP POLICY IF EXISTS "Users can read own quotes" ON storage.objects;
  END IF;
END $$;

-- Create storage policies for quotes
CREATE POLICY "Users can read own quotes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'quotes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create function to track quote downloads
CREATE OR REPLACE FUNCTION increment_quote_downloads()
RETURNS trigger AS $$
BEGIN
  UPDATE applications
  SET quote_downloads = quote_downloads + 1
  WHERE id = NEW.application_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for quote downloads
DROP TRIGGER IF EXISTS track_quote_downloads ON insurance_documents;
CREATE TRIGGER track_quote_downloads
  AFTER INSERT ON insurance_documents
  FOR EACH ROW
  WHEN (NEW.type = 'QUOTE')
  EXECUTE FUNCTION increment_quote_downloads();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_quote_url ON applications(quote_url) WHERE quote_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_applications_quote_generated ON applications(quote_generated_at) WHERE quote_generated_at IS NOT NULL;

-- Add comments
COMMENT ON COLUMN applications.quote_url IS 'URL of the generated quote PDF';
COMMENT ON COLUMN applications.quote_generated_at IS 'Timestamp when the quote was last generated';
COMMENT ON COLUMN applications.quote_downloads IS 'Number of times the quote has been downloaded';