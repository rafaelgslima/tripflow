-- Add GDPR/LGPD compliance columns to profile
ALTER TABLE profile
ADD COLUMN terms_accepted_at TIMESTAMPTZ,
ADD COLUMN privacy_policy_version VARCHAR(20);

-- Create audit_log table for tracking personal data processing
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_log_user_created ON audit_log(user_id, created_at DESC);

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only read their own audit logs
CREATE POLICY audit_log_read_own ON audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (backend) can insert audit logs
CREATE POLICY audit_log_insert ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Service role can update (mark as read, etc.)
CREATE POLICY audit_log_update ON audit_log
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
