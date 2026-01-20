-- ============================================
-- GOGOBUS - Data Retention Policy
-- Defines data retention periods and archiving functions
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- DATA RETENTION PERIODS
-- ============================================
-- Completed bookings: 2 years
-- Cancelled bookings: 1 year
-- Payment records: 7 years (legal requirement for financial records)
-- User profiles: Until account deletion
-- Inactive user accounts: 3 years (after last login)
-- Audit logs: 1 year

-- ============================================
-- CREATE ARCHIVE TABLES (Optional)
-- ============================================

-- Archive table for old bookings
CREATE TABLE IF NOT EXISTS public.bookings_archive (
    LIKE public.bookings INCLUDING ALL
);

-- Archive table for old payments
CREATE TABLE IF NOT EXISTS public.payments_archive (
    LIKE public.payments INCLUDING ALL
);

-- ============================================
-- FUNCTION: Archive old bookings
-- ============================================

CREATE OR REPLACE FUNCTION public.archive_old_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive completed bookings older than 2 years
  INSERT INTO public.bookings_archive
  SELECT * FROM public.bookings
  WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '2 years';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Delete archived bookings
  DELETE FROM public.bookings
  WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '2 years';
  
  -- Archive cancelled bookings older than 1 year
  INSERT INTO public.bookings_archive
  SELECT * FROM public.bookings
  WHERE status = 'cancelled'
    AND created_at < NOW() - INTERVAL '1 year';
  
  GET DIAGNOSTICS archived_count = archived_count + ROW_COUNT;
  
  -- Delete archived cancelled bookings
  DELETE FROM public.bookings
  WHERE status = 'cancelled'
    AND created_at < NOW() - INTERVAL '1 year';
  
  RETURN archived_count;
END;
$$;

-- ============================================
-- FUNCTION: Archive old payments
-- ============================================

CREATE OR REPLACE FUNCTION public.archive_old_payments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive completed payments older than 7 years (legal requirement)
  INSERT INTO public.payments_archive
  SELECT * FROM public.payments
  WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '7 years';
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  -- Delete archived payments
  DELETE FROM public.payments
  WHERE status = 'completed'
    AND created_at < NOW() - INTERVAL '7 years';
  
  RETURN archived_count;
END;
$$;

-- ============================================
-- FUNCTION: Clean up inactive user accounts
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleaned_count INTEGER;
BEGIN
  -- Mark profiles for deletion if user hasn't logged in for 3 years
  -- Note: This requires checking auth.users.last_sign_in_at
  -- For now, we'll mark profiles created more than 3 years ago with no recent activity
  
  -- This is a placeholder - implement based on your auth system
  -- UPDATE public.profiles
  -- SET deleted_at = NOW()
  -- WHERE created_at < NOW() - INTERVAL '3 years'
  --   AND last_login_at < NOW() - INTERVAL '3 years'
  --   AND deleted_at IS NULL;
  
  RETURN 0;
END;
$$;

-- ============================================
-- SCHEDULE AUTOMATED ARCHIVING (Using pg_cron)
-- ============================================

-- Note: pg_cron extension must be enabled in Supabase
-- Run this monthly to archive old data

-- Schedule monthly archiving (runs on 1st of each month at 2 AM)
-- SELECT cron.schedule(
--   'archive-old-data',
--   '0 2 1 * *',
--   $$
--   SELECT public.archive_old_bookings();
--   SELECT public.archive_old_payments();
--   $$
-- );

-- ============================================
-- MANUAL ARCHIVING
-- ============================================

-- To manually archive data, run:
-- SELECT public.archive_old_bookings();
-- SELECT public.archive_old_payments();

-- ============================================
-- DATA DELETION (GDPR/POPIA Compliance)
-- ============================================

-- Function to delete user data on account deletion request
CREATE OR REPLACE FUNCTION public.delete_user_data(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete user's bookings (or anonymize)
  UPDATE public.bookings
  SET 
    passenger_name = 'DELETED',
    passenger_email = 'deleted@example.com',
    passenger_phone = NULL,
    user_id = NULL
  WHERE user_id = delete_user_data.user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles
  WHERE id = delete_user_data.user_id;
  
  -- Note: Payments should be kept for legal/financial records
  -- but can be anonymized
  
  RETURN TRUE;
END;
$$;

-- ============================================
-- VIEW: Data retention summary
-- ============================================

CREATE OR REPLACE VIEW public.data_retention_summary AS
SELECT 
  'bookings' as table_name,
  COUNT(*) FILTER (WHERE status = 'completed' AND created_at < NOW() - INTERVAL '2 years') as ready_for_archive,
  COUNT(*) FILTER (WHERE status = 'cancelled' AND created_at < NOW() - INTERVAL '1 year') as cancelled_ready_for_archive
FROM public.bookings
UNION ALL
SELECT 
  'payments' as table_name,
  COUNT(*) FILTER (WHERE status = 'completed' AND created_at < NOW() - INTERVAL '7 years') as ready_for_archive,
  0 as cancelled_ready_for_archive
FROM public.payments;

-- ============================================
-- NOTES
-- ============================================

-- 1. Before running archiving functions, ensure you have backups
-- 2. Test archiving functions on a copy of production data first
-- 3. Consider exporting archived data to cold storage (S3, etc.) before deletion
-- 4. Review legal requirements for your jurisdiction (Botswana/South Africa)
-- 5. Update retention periods based on business and legal requirements
-- 6. Document the archiving process for compliance audits
