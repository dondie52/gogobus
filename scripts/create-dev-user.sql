-- ============================================
-- Create Development User for Chat Testing
-- ============================================
-- IMPORTANT: This script is DEPRECATED. 
-- Instead, create the user via Supabase Dashboard or let the app create it via signUp.
-- 
-- If you must use this script:
-- 1. Delete the user first if it exists
-- 2. The password hash created here may not work with Supabase Auth
-- 3. Better: Use Supabase Dashboard → Authentication → Users → "Add User"
--
-- ============================================
-- STEP 1: Delete existing dev user if it exists (to allow proper creation via API)
-- ============================================
-- Run this first to clean up any existing dev user created via SQL
DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000123'::uuid;
DELETE FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000123'::uuid;

-- ============================================
-- STEP 2: After running the above, restart the app
-- The app will automatically create the dev user via signUp API
-- This ensures the password hash is correct and authentication works
-- ============================================

-- ============================================
-- Create user via Supabase Dashboard instead:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Email: dev@test.com
-- 4. Password: dev-password-123
-- 5. Auto Confirm User: ✅
-- 6. Click "Create User"
-- 7. Then update the user ID to match the dev user ID:
--    UPDATE auth.users SET id = '00000000-0000-0000-0000-000000000123'::uuid WHERE email = 'dev@test.com';
--    UPDATE public.profiles SET id = '00000000-0000-0000-0000-000000000123'::uuid WHERE email = 'dev@test.com';
-- ============================================

-- OLD METHOD (may not work - password hash issues):
-- Insert the dev user into auth.users
-- Note: This requires service role access or running as a database admin
-- Use a valid email format that Supabase accepts
-- INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    '00000000-0000-0000-0000-000000000123'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'dev@test.com',
    crypt('dev-password-123', gen_salt('bf')), -- Password: dev-password-123
    NOW(), -- Email confirmed immediately for development
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Dev User"}'::jsonb,
    false,
    'authenticated'
) ON CONFLICT (id) DO NOTHING;
-- END OLD METHOD

-- Also create a profile entry for the dev user (only if user was created via Dashboard)
INSERT INTO profiles (
    id,
    full_name,
    email,
    phone,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000123'::uuid,
    'Dev User',
    'dev@test.com',
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
