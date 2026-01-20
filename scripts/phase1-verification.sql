-- ============================================
-- GOGOBUS - PHASE 1: Database Verification Script
-- Run this after phase1-complete-schema.sql to verify everything is set up correctly
-- ============================================

-- ============================================
-- 1. VERIFY TABLES EXIST
-- ============================================

SELECT 
    'Tables Check' as check_type,
    tablename as item,
    CASE 
        WHEN tablename IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
ORDER BY tablename;

-- ============================================
-- 2. VERIFY TABLE COLUMNS
-- ============================================

-- Profiles table columns
SELECT 
    'Profiles Columns' as check_type,
    column_name as item,
    data_type as details
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Routes table columns
SELECT 
    'Routes Columns' as check_type,
    column_name as item,
    data_type as details
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routes'
ORDER BY ordinal_position;

-- Schedules table columns (check for arrival_time)
SELECT 
    'Schedules Columns' as check_type,
    column_name as item,
    data_type as details
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'schedules'
ORDER BY ordinal_position;

-- Bookings table columns
SELECT 
    'Bookings Columns' as check_type,
    column_name as item,
    data_type as details
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bookings'
ORDER BY ordinal_position;

-- ============================================
-- 3. VERIFY RLS IS ENABLED
-- ============================================

SELECT 
    'RLS Status' as check_type,
    tablename as item,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
ORDER BY tablename;

-- ============================================
-- 4. VERIFY RLS POLICIES
-- ============================================

SELECT 
    'RLS Policies' as check_type,
    schemaname || '.' || tablename as item,
    policyname as details,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
ORDER BY tablename, policyname;

-- ============================================
-- 5. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================

SELECT
    'Foreign Keys' as check_type,
    tc.table_name || ' → ' || ccu.table_name as item,
    tc.constraint_name as details,
    kcu.column_name as column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
ORDER BY tc.table_name;

-- ============================================
-- 6. VERIFY INDEXES
-- ============================================

SELECT 
    'Indexes' as check_type,
    tablename as item,
    indexname as details
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
ORDER BY tablename, indexname;

-- ============================================
-- 7. VERIFY SEED DATA
-- ============================================

-- Companies count (should be 5)
SELECT 
    'Seed Data' as check_type,
    'Companies' as item,
    COUNT(*)::TEXT || '/5' as details,
    CASE 
        WHEN COUNT(*) = 5 THEN '✅ COMPLETE'
        ELSE '⚠️  INCOMPLETE'
    END as status
FROM public.companies;

-- Routes count (should be 18)
SELECT 
    'Seed Data' as check_type,
    'Routes' as item,
    COUNT(*)::TEXT || '/18' as details,
    CASE 
        WHEN COUNT(*) = 18 THEN '✅ COMPLETE'
        ELSE '⚠️  INCOMPLETE'
    END as status
FROM public.routes;

-- Buses count (should be 10)
SELECT 
    'Seed Data' as check_type,
    'Buses' as item,
    COUNT(*)::TEXT || '/10' as details,
    CASE 
        WHEN COUNT(*) = 10 THEN '✅ COMPLETE'
        ELSE '⚠️  INCOMPLETE'
    END as status
FROM public.buses;

-- Schedules count (should be > 200 for 30 days)
SELECT 
    'Seed Data' as check_type,
    'Schedules (30 days)' as item,
    COUNT(*)::TEXT as details,
    CASE 
        WHEN COUNT(*) >= 200 THEN '✅ COMPLETE'
        ELSE '⚠️  INCOMPLETE'
    END as status
FROM public.schedules
WHERE departure_time >= CURRENT_DATE
AND departure_time < CURRENT_DATE + INTERVAL '30 days';

-- ============================================
-- 8. VERIFY ALL ROUTES FROM ROADMAP
-- ============================================

SELECT 
    'Roadmap Routes' as check_type,
    origin || ' ↔ ' || destination as item,
    '✅' as status
FROM public.routes
WHERE (origin, destination) IN (
    ('Gaborone', 'Francistown'),
    ('Francistown', 'Gaborone'),
    ('Gaborone', 'Maun'),
    ('Maun', 'Gaborone'),
    ('Gaborone', 'Kasane'),
    ('Kasane', 'Gaborone'),
    ('Gaborone', 'Palapye'),
    ('Palapye', 'Gaborone'),
    ('Gaborone', 'Serowe'),
    ('Serowe', 'Gaborone'),
    ('Gaborone', 'Mahalapye'),
    ('Mahalapye', 'Gaborone'),
    ('Francistown', 'Maun'),
    ('Maun', 'Francistown'),
    ('Francistown', 'Kasane'),
    ('Kasane', 'Francistown'),
    ('Maun', 'Kasane'),
    ('Kasane', 'Maun')
)
ORDER BY origin, destination;

-- ============================================
-- 9. VERIFY BUS OPERATORS FROM ROADMAP
-- ============================================

SELECT 
    'Roadmap Operators' as check_type,
    name as item,
    '✅' as status
FROM public.companies
WHERE name IN ('Seabelo Express', 'Maun Coaches', 'Eagle Liner', 'Intercape', 'Cross Country')
ORDER BY name;

-- ============================================
-- 10. CHECK FOR ADMIN USER
-- ============================================

SELECT 
    'Admin Users' as check_type,
    email as item,
    role as details,
    '✅' as status
FROM public.profiles
WHERE role IN ('admin', 'operator')
ORDER BY created_at DESC;

-- ============================================
-- SUMMARY REPORT
-- ============================================

SELECT 
    '=== PHASE 1 VERIFICATION SUMMARY ===' as summary
UNION ALL
SELECT 'Tables: ' || COUNT(DISTINCT tablename)::TEXT || '/7' 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
UNION ALL
SELECT 'RLS Enabled: ' || COUNT(*)::TEXT || '/7 tables'
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'companies', 'routes', 'buses', 'schedules', 'bookings', 'payments')
AND rowsecurity = true
UNION ALL
SELECT 'Companies: ' || COUNT(*)::TEXT || '/5'
FROM public.companies
UNION ALL
SELECT 'Routes: ' || COUNT(*)::TEXT || '/18'
FROM public.routes
UNION ALL
SELECT 'Buses: ' || COUNT(*)::TEXT || '/10'
FROM public.buses
UNION ALL
SELECT 'Schedules (30 days): ' || COUNT(*)::TEXT
FROM public.schedules
WHERE departure_time >= CURRENT_DATE
AND departure_time < CURRENT_DATE + INTERVAL '30 days';

-- ============================================
-- END OF VERIFICATION
-- ============================================
