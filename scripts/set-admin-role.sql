-- ============================================
-- GOGOBUS - Set Admin Role for Users
-- Run this in Supabase SQL Editor to grant admin access
-- ============================================
-- 
-- INSTRUCTIONS:
-- 1. Replace 'admin@example.com' with the actual email of the user you want to make admin
-- 2. Run this query in Supabase SQL Editor
-- 3. The user will need to log out and log back in for changes to take effect
--
-- ============================================

-- Set a specific user as admin by email
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'georgymoni04@gmail.com';

-- Verify the update
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'georgymoni04@gmail.com';

-- ============================================
-- Alternative: Set admin by user ID
-- ============================================
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE id = 'USER_UUID_HERE';

-- ============================================
-- List all admins
-- ============================================
-- SELECT id, email, full_name, role, created_at
-- FROM public.profiles 
-- WHERE role = 'admin'
-- ORDER BY created_at DESC;
