-- ============================================
-- GOGOBUS - Add User Role to Profiles Table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add role column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update existing profiles to have 'user' role (if NULL)
UPDATE public.profiles 
SET role = 'user' 
WHERE role IS NULL;

-- Set default value for new profiles
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'user';

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.role IS 'User role: user (default) or admin';

-- ============================================
-- Optional: Set specific users as admin
-- Replace 'user@example.com' with actual admin email
-- ============================================
-- UPDATE public.profiles 
-- SET role = 'admin' 
-- WHERE email = 'user@example.com';
