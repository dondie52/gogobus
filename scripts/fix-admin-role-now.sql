-- ============================================
-- GOGOBUS - Quick Fix: Set Admin Role for georgymoni04@gmail.com
-- Run this in Supabase SQL Editor RIGHT NOW
-- ============================================

-- Step 1: Create profile with admin role (or update if exists)
INSERT INTO public.profiles (id, email, role)
SELECT 
    id,
    email,
    'admin'
FROM auth.users 
WHERE email = 'georgymoni04@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;

-- Step 2: Verify it worked
SELECT 
    '✅ Admin Profile Created/Updated' as status,
    id, 
    email, 
    role,
    created_at
FROM public.profiles 
WHERE email = 'georgymoni04@gmail.com';

-- Expected result: Should show one row with role = 'admin'
