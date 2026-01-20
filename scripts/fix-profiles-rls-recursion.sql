-- ============================================
-- GOGOBUS - Fix RLS Infinite Recursion in Profiles Table
-- Run this in Supabase SQL Editor
-- ============================================
-- PROBLEM: The "Admins can view all profiles" policy causes infinite recursion
-- because it queries profiles table which triggers RLS policies again.
-- 
-- SOLUTION: Create a SECURITY DEFINER function that bypasses RLS to check role,
-- then update the policy to use this function.
-- ============================================

-- Step 1: Create helper function to check if user is admin (bypasses RLS)
-- SECURITY DEFINER allows this function to bypass RLS policies
-- The function owner (typically postgres/superuser) has privileges that bypass RLS
CREATE OR REPLACE FUNCTION public.is_admin_or_operator(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- SECURITY DEFINER functions run with owner privileges, bypassing RLS
  -- This query should not trigger RLS policies
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'operator')
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin_or_operator(UUID) TO authenticated;

-- Step 2: Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 3: Recreate the policy using the helper function (no recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        public.is_admin_or_operator(auth.uid())
    );

-- Step 4: Verify the fix
-- Check if function exists and policy was updated
SELECT 
  'Function exists' as check_type,
  EXISTS (
    SELECT 1 FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = 'is_admin_or_operator'
  ) as function_exists;

-- Check current policies
SELECT 
  'Current policy' as check_type,
  polname as policy_name,
  polcmd as command,
  pg_get_expr(polqual, polrelid) as using_expression
FROM pg_policy 
WHERE polrelid = 'public.profiles'::regclass 
  AND polname = 'Admins can view all profiles';

-- Step 5: Test the function (this should work for any authenticated user)
-- Replace 'd4de1b2b-dcac-49f7-945c-b018e9c19f9f' with the actual user ID if needed
-- SELECT public.is_admin_or_operator('d4de1b2b-dcac-49f7-945c-b018e9c19f9f'::UUID) as is_admin_test;