-- Audit Log Retention Policy (180 days)
-- Automatically delete audit logs older than 180 days to comply with GDPR data retention requirements

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup job at 3 AM UTC to delete audit logs older than 180 days
SELECT cron.schedule(
  'delete-old-audit-logs',
  '0 3 * * *',
  $$DELETE FROM audit_log WHERE created_at < now() - interval '180 days'$$
);

-- Comment documenting the retention policy
COMMENT ON TABLE audit_log IS 'Audit log of personal data processing events. Records are automatically deleted after 180 days in accordance with GDPR Article 5 (storage limitation) and LGPD Article 7.';
