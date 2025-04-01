-- Add signature tracking fields
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS signature_date timestamptz,
ADD COLUMN IF NOT EXISTS signature_ip text,
ADD COLUMN IF NOT EXISTS signature_data text,
ADD COLUMN IF NOT EXISTS contract_url text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_signature_date 
ON applications(signature_date) 
WHERE signature_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_applications_afi_esca_id_v3 
ON applications(afi_esca_id) 
WHERE afi_esca_id IS NOT NULL;

-- Add RLS policies for signature data
CREATE POLICY "Users can read own signature data v2"
  ON applications
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update own signature data v2"
  ON applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Add comments for documentation
COMMENT ON COLUMN applications.signature_date IS 'Timestamp when the contract was signed';
COMMENT ON COLUMN applications.signature_ip IS 'IP address of the signer for audit purposes';
COMMENT ON COLUMN applications.signature_data IS 'Base64 encoded signature data';
COMMENT ON COLUMN applications.contract_url IS 'URL to the signed contract PDF';