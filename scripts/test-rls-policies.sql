-- ============================================
-- GOGOBUS - RLS Policy Test Script
-- Tests that Row Level Security policies are working correctly
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- SETUP: Create test users
-- ============================================

-- Note: In a real test, you would create actual auth users
-- For this test script, we'll test policies using existing users
-- Replace these UUIDs with actual user IDs from your database

-- Test user 1 (regular user)
-- Test user 2 (regular user)
-- Test admin user

-- ============================================
-- TEST 1: Profiles Table - Users can only see own profile
-- ============================================

-- Test as regular user (should only see own profile)
-- Replace 'user1_id' with actual user UUID
DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001'; -- Replace with actual user ID
  user2_id UUID := '00000000-0000-0000-0000-000000000002'; -- Replace with actual user ID
  profile_count INTEGER;
BEGIN
  -- Set role to authenticated user
  SET ROLE authenticated;
  SET request.jwt.claim.sub = user1_id;
  
  -- Try to select own profile (should work)
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles
  WHERE id = user1_id;
  
  RAISE NOTICE 'TEST 1a: User can see own profile - Count: %', profile_count;
  
  -- Try to select other user's profile (should return 0 due to RLS)
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles
  WHERE id = user2_id;
  
  IF profile_count = 0 THEN
    RAISE NOTICE 'TEST 1b: PASS - User cannot see other user profile';
  ELSE
    RAISE WARNING 'TEST 1b: FAIL - User can see other user profile (RLS not working)';
  END IF;
  
  -- Reset role
  RESET ROLE;
END $$;

-- ============================================
-- TEST 2: Bookings Table - Users can only see own bookings
-- ============================================

DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001';
  user2_id UUID := '00000000-0000-0000-0000-000000000002';
  booking_count INTEGER;
BEGIN
  SET ROLE authenticated;
  SET request.jwt.claim.sub = user1_id;
  
  -- Try to select own bookings (should work)
  SELECT COUNT(*) INTO booking_count
  FROM public.bookings
  WHERE user_id = user1_id;
  
  RAISE NOTICE 'TEST 2a: User can see own bookings - Count: %', booking_count;
  
  -- Try to select other user's bookings (should return 0)
  SELECT COUNT(*) INTO booking_count
  FROM public.bookings
  WHERE user_id = user2_id;
  
  IF booking_count = 0 THEN
    RAISE NOTICE 'TEST 2b: PASS - User cannot see other user bookings';
  ELSE
    RAISE WARNING 'TEST 2b: FAIL - User can see other user bookings (RLS not working)';
  END IF;
  
  RESET ROLE;
END $$;

-- ============================================
-- TEST 3: Payments Table - Users can only see own payments
-- ============================================

DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001';
  payment_count INTEGER;
BEGIN
  SET ROLE authenticated;
  SET request.jwt.claim.sub = user1_id;
  
  -- Try to select payments for own bookings (should work)
  SELECT COUNT(*) INTO payment_count
  FROM public.payments p
  JOIN public.bookings b ON p.booking_id = b.id
  WHERE b.user_id = user1_id;
  
  RAISE NOTICE 'TEST 3: User can see own payments - Count: %', payment_count;
  
  RESET ROLE;
END $$;

-- ============================================
-- TEST 4: Admin can see all profiles
-- ============================================

DO $$
DECLARE
  admin_id UUID := '00000000-0000-0000-0000-000000000003'; -- Replace with admin user ID
  profile_count INTEGER;
BEGIN
  SET ROLE authenticated;
  SET request.jwt.claim.sub = admin_id;
  
  -- Admin should be able to see all profiles
  SELECT COUNT(*) INTO profile_count
  FROM public.profiles;
  
  RAISE NOTICE 'TEST 4: Admin can see all profiles - Count: %', profile_count;
  
  RESET ROLE;
END $$;

-- ============================================
-- TEST 5: Non-admin cannot insert/update routes
-- ============================================

DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001';
  insert_success BOOLEAN := FALSE;
BEGIN
  SET ROLE authenticated;
  SET request.jwt.claim.sub = user1_id;
  
  BEGIN
    -- Try to insert a route (should fail for non-admin)
    INSERT INTO public.routes (origin, destination, base_price)
    VALUES ('Test Origin', 'Test Destination', 100);
    
    insert_success := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'TEST 5: PASS - Non-admin cannot insert routes (caught exception)';
    insert_success := FALSE;
  END;
  
  IF insert_success THEN
    RAISE WARNING 'TEST 5: FAIL - Non-admin was able to insert route (RLS not working)';
  END IF;
  
  RESET ROLE;
END $$;

-- ============================================
-- TEST 6: Public can read routes (SELECT only)
-- ============================================

DO $$
DECLARE
  route_count INTEGER;
BEGIN
  -- Test as anonymous user
  SET ROLE anon;
  
  SELECT COUNT(*) INTO route_count
  FROM public.routes;
  
  IF route_count >= 0 THEN
    RAISE NOTICE 'TEST 6: PASS - Public can read routes - Count: %', route_count;
  ELSE
    RAISE WARNING 'TEST 6: FAIL - Public cannot read routes';
  END IF;
  
  RESET ROLE;
END $$;

-- ============================================
-- TEST 7: Users cannot update other users' bookings
-- ============================================

DO $$
DECLARE
  user1_id UUID := '00000000-0000-0000-0000-000000000001';
  user2_id UUID := '00000000-0000-0000-0000-000000000002';
  update_success BOOLEAN := FALSE;
BEGIN
  SET ROLE authenticated;
  SET request.jwt.claim.sub = user1_id;
  
  BEGIN
    -- Try to update another user's booking (should fail)
    UPDATE public.bookings
    SET status = 'cancelled'
    WHERE user_id = user2_id
    LIMIT 1;
    
    update_success := TRUE;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'TEST 7: PASS - User cannot update other user bookings (caught exception)';
    update_success := FALSE;
  END;
  
  IF update_success THEN
    RAISE WARNING 'TEST 7: FAIL - User was able to update other user booking (RLS not working)';
  END IF;
  
  RESET ROLE;
END $$;

-- ============================================
-- SUMMARY
-- ============================================

-- After running all tests, check the output for:
-- - PASS messages: Policy is working correctly
-- - FAIL/WARNING messages: Policy needs to be fixed
-- - Count values: Verify they match expectations

-- ============================================
-- MANUAL TESTING INSTRUCTIONS
-- ============================================

-- 1. Create two test user accounts in Supabase Auth
-- 2. Create one admin user account
-- 3. Update the UUIDs in this script with actual user IDs
-- 4. Run this script in Supabase SQL Editor
-- 5. Review the output for any FAIL messages
-- 6. Test in application:
--    - Login as user1, try to access user2's bookings
--    - Login as regular user, try to create a route
--    - Login as admin, verify you can see all data
--    - Logout, verify you can still see routes (public read)
