/*
  # Add reminder fields to applications table

  1. New Fields
    - reminder_sent: Track if reminder was sent
    - reminder_sent_at: When the reminder was sent
    - last_activity_at: Track user activity

  2. Indexes
    - Add indexes for efficient querying
*/

-- Add reminder tracking fields
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS last_activity_at timestamptz DEFAULT now();

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_reminder_sent ON applications(reminder_sent) WHERE reminder_sent = false;
CREATE INDEX IF NOT EXISTS idx_applications_status_created ON applications(status, created_at) WHERE status = 'pending_review';

-- Create function to update last_activity_at
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS trigger AS $$
BEGIN
  NEW.last_activity_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_activity_at
DROP TRIGGER IF EXISTS update_applications_last_activity ON applications;
CREATE TRIGGER update_applications_last_activity
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_last_activity();

-- Add comment for documentation
COMMENT ON TABLE applications IS 'Stores loan applications with reminder tracking';
COMMENT ON COLUMN applications.reminder_sent IS 'Indicates if a reminder email has been sent';
COMMENT ON COLUMN applications.reminder_sent_at IS 'Timestamp when the reminder was sent';
COMMENT ON COLUMN applications.last_activity_at IS 'Timestamp of last user activity on the application';