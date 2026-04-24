-- Add restrict_logging column for Right to Object (opt-out of legitimate interest processing)
ALTER TABLE profile ADD COLUMN restrict_logging BOOLEAN DEFAULT false;

COMMENT ON COLUMN profile.restrict_logging IS 'If true, user has opted out of routine activity logging (GDPR Article 21 / LGPD Article 16.VI Right to Object). Critical events (account deletion, data export) are still logged.';
