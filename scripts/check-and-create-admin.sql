-- ============================================
-- GOGOBUS - Check User and Create Admin Profile
-- Run this in Supabase SQL Editor to check if user exists and create profile
-- ============================================

-- Step 1: Check if user exists in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'georgymoni04@gmail.com';

-- Step 2: If user exists in auth.users but not in profiles, create profile
-- (Uncomment and run this if the SELECT above returns a user)
INSERT INTO public.profiles (id, email, role)
SELECT 
    id,
    email,
    'admin' -- Set as admin directly
FROM auth.users 
WHERE email = 'georgymoni04@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;

-- Step 3: Verify admin role is set
SELECT id, email, full_name, role, created_at
FROM public.profiles 
WHERE email = 'georgymoni04@gmail.com';

-- ============================================
-- If user doesn't exist at all:
-- Option 1: Create via Supabase Dashboard
--   Dashboard → Authentication → Users → "Add User"
--   Email: georgymoni04@gmail.com
--   Password: (set a strong password)
--   Auto Confirm: ✅
--
-- Option 2: User signs up via app
--   Go to /signup and create account with georgymoni04@gmail.com
--
-- Then run this to set admin role:
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'georgymoni04@gmail.com';
-- ============================================
