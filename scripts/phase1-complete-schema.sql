-- ============================================
-- GOGOBUS - PHASE 1: Complete Database Schema
-- Run this in Supabase SQL Editor to set up complete database
-- ============================================
-- This script consolidates all Phase 1 requirements:
-- 1. Complete database schema with all tables
-- 2. Complete RLS policies for all tables
-- 3. Production seed data (all Botswana routes, operators, 30-day schedules)
-- 4. Performance indexes
-- ============================================

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Profiles table (with role support)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    province TEXT,
    city TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'operator')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 4.0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Routes table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    distance_km INTEGER,
    duration_hours DECIMAL(4,2),
    base_price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buses table
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
    name TEXT,
    plate_number TEXT NOT NULL,
    capacity INTEGER DEFAULT 40,
    bus_type TEXT DEFAULT 'Standard',
    amenities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id),
    bus_id UUID REFERENCES public.buses(id),
    departure_time TIMESTAMPTZ NOT NULL,
    arrival_time TIMESTAMPTZ NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER DEFAULT 40,
    seat_map JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    schedule_id UUID REFERENCES public.schedules(id),
    seats TEXT[] NOT NULL,
    passengers JSONB NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'unpaid',
    payment_reference TEXT,
    status TEXT DEFAULT 'pending',
    booking_ref TEXT UNIQUE,
    qr_code TEXT,
    origin TEXT,
    destination TEXT,
    departure_time TEXT,
    travel_date DATE,
    is_boarded BOOLEAN DEFAULT false,
    boarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (will be replaced by 002_payments_schema.sql if run later)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'BWP',
    method TEXT NOT NULL,
    provider TEXT,
    transaction_ref TEXT,
    status TEXT DEFAULT 'pending',
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES - PROFILES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Users can read/update own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 4. RLS POLICIES - ROUTES
-- ============================================

DROP POLICY IF EXISTS "Public read access for routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can insert routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can update routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can delete routes" ON public.routes;

-- Public read, admin write
CREATE POLICY "Public read access for routes" ON public.routes
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert routes" ON public.routes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update routes" ON public.routes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete routes" ON public.routes
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 5. RLS POLICIES - BUSES
-- ============================================

DROP POLICY IF EXISTS "Public read access for buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can insert buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can update buses" ON public.buses;
DROP POLICY IF EXISTS "Admins can delete buses" ON public.buses;

-- Public read, admin write
CREATE POLICY "Public read access for buses" ON public.buses
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert buses" ON public.buses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update buses" ON public.buses
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete buses" ON public.buses
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 6. RLS POLICIES - SCHEDULES
-- ============================================

DROP POLICY IF EXISTS "Public read access for schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;

-- Public read, admin write
CREATE POLICY "Public read access for schedules" ON public.schedules
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert schedules" ON public.schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update schedules" ON public.schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete schedules" ON public.schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 7. RLS POLICIES - BOOKINGS
-- ============================================

DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can update all bookings" ON public.bookings;

-- Users see own bookings, admins see all
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update all bookings" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 8. RLS POLICIES - PAYMENTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments for their bookings" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;

-- Users see own payments, admins see all
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = payments.booking_id AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create payments for their bookings" ON public.payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = payments.booking_id AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update payments" ON public.payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 9. RLS POLICIES - COMPANIES
-- ============================================

DROP POLICY IF EXISTS "Public read access for companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON public.companies;

CREATE POLICY "Public read access for companies" ON public.companies
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert companies" ON public.companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can update companies" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins can delete companies" ON public.companies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- ============================================
-- 10. TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 11. ADD MISSING COLUMNS (if table already exists)
-- ============================================

-- Add missing columns to bookings table if they don't exist
DO $$ 
BEGIN
    -- Add booking_ref column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'booking_ref'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN booking_ref TEXT UNIQUE;
    END IF;
    
    -- Add payment_status column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
    END IF;
    
    -- Add payment_reference column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_reference TEXT;
    END IF;
    
    -- Add qr_code column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'qr_code'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN qr_code TEXT;
    END IF;
    
    -- Add origin column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'origin'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN origin TEXT;
    END IF;
    
    -- Add destination column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'destination'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN destination TEXT;
    END IF;
    
    -- Add departure_time column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'departure_time'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN departure_time TEXT;
    END IF;
    
    -- Add is_boarded column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'is_boarded'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN is_boarded BOOLEAN DEFAULT false;
    END IF;
    
    -- Add boarded_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'boarded_at'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN boarded_at TIMESTAMPTZ;
    END IF;
    
    -- Add travel_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'travel_date'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN travel_date DATE;
    END IF;
    
    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add role column to profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'operator'));
    END IF;
    
    -- Add updated_at to profiles if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add missing columns to routes table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'routes' 
        AND column_name = 'distance_km'
    ) THEN
        ALTER TABLE public.routes ADD COLUMN distance_km INTEGER;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'routes' 
        AND column_name = 'duration_hours'
    ) THEN
        ALTER TABLE public.routes ADD COLUMN duration_hours DECIMAL(4,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'routes' 
        AND column_name = 'base_price'
    ) THEN
        ALTER TABLE public.routes ADD COLUMN base_price DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'routes' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.routes ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add missing columns to buses table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'plate_number'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN plate_number TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'capacity'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN capacity INTEGER DEFAULT 40;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'bus_type'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN bus_type TEXT DEFAULT 'Standard';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'amenities'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN amenities JSONB DEFAULT '[]';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Add name to buses if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'buses' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.buses ADD COLUMN name TEXT;
    END IF;
    
    -- Add missing columns to companies table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'contact_phone'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN contact_phone TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN contact_email TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'rating'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN rating DECIMAL(2,1) DEFAULT 4.0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'companies' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.companies ADD COLUMN logo_url TEXT;
    END IF;
END $$;

-- ============================================
-- 12. INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Routes indexes
CREATE INDEX IF NOT EXISTS idx_routes_origin_dest ON public.routes(origin, destination);
CREATE INDEX IF NOT EXISTS idx_routes_is_active ON public.routes(is_active);

-- Schedules indexes
CREATE INDEX IF NOT EXISTS idx_schedules_departure ON public.schedules(departure_time);
CREATE INDEX IF NOT EXISTS idx_schedules_route ON public.schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_bus ON public.schedules(bus_id);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON public.bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_ref ON public.bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_travel_date ON public.bookings(travel_date);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON public.payments(transaction_ref);

-- Companies indexes
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON public.companies(is_active);

-- Buses indexes
CREATE INDEX IF NOT EXISTS idx_buses_company ON public.buses(company_id);
CREATE INDEX IF NOT EXISTS idx_buses_is_active ON public.buses(is_active);

-- ============================================
-- 13. FIX BUS_TYPE CHECK CONSTRAINT (if exists)
-- ============================================

-- Drop existing bus_type check constraint if it exists and doesn't allow our values
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        WHERE t.relname = 'buses' 
        AND n.nspname = 'public'
        AND c.conname = 'buses_bus_type_check'
    ) THEN
        -- Drop the existing constraint
        ALTER TABLE public.buses DROP CONSTRAINT buses_bus_type_check;
    END IF;
    
    -- Create a new constraint that allows all our bus type values
    ALTER TABLE public.buses 
    ADD CONSTRAINT buses_bus_type_check 
    CHECK (bus_type IN ('Standard', 'Luxury Coach', 'Standard Coach', 'Express Coach', 'Safari Luxury', 'Premium', 'Economy'));
END $$;

-- ============================================
-- 14. SEED PRODUCTION DATA - BUS COMPANIES
-- ============================================

INSERT INTO public.companies (id, name, logo_url, contact_phone, contact_email, description, rating) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Seabelo Express', NULL, '+267 395 1234', 'info@seabelo.co.bw', 'Premium intercity bus service with comfortable seating and onboard amenities.', 4.5),
    ('c1000000-0000-0000-0000-000000000002', 'Maun Coaches', NULL, '+267 686 5678', 'info@mauncoaches.co.bw', 'Reliable coach service connecting major cities across Botswana.', 4.2),
    ('c1000000-0000-0000-0000-000000000003', 'Eagle Liner', NULL, '+267 391 9012', 'info@eagleliner.co.bw', 'Affordable and safe travel for everyone.', 4.0),
    ('c1000000-0000-0000-0000-000000000004', 'Intercape', NULL, '+267 397 3456', 'info@intercape.co.bw', 'Specializing in northern routes to Maun and Kasane.', 4.3),
    ('c1000000-0000-0000-0000-000000000005', 'Cross Country', NULL, '+267 625 7890', 'info@crosscountry.co.bw', 'Luxury coaches with wildlife viewing routes.', 4.6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 15. SEED PRODUCTION DATA - ROUTES (All Botswana Routes)
-- ============================================

INSERT INTO public.routes (id, origin, destination, distance_km, duration_hours, base_price) VALUES
    -- Gaborone ↔ Francistown
    ('a1000000-0000-0000-0000-000000000001', 'Gaborone', 'Francistown', 430, 5.5, 180.00),
    ('a1000000-0000-0000-0000-000000000002', 'Francistown', 'Gaborone', 430, 5.5, 180.00),
    -- Gaborone ↔ Maun
    ('a1000000-0000-0000-0000-000000000003', 'Gaborone', 'Maun', 950, 9.0, 305.00),
    ('a1000000-0000-0000-0000-000000000004', 'Maun', 'Gaborone', 950, 9.0, 305.00),
    -- Gaborone ↔ Kasane
    ('a1000000-0000-0000-0000-000000000005', 'Gaborone', 'Kasane', 1000, 12.0, 350.00),
    ('a1000000-0000-0000-0000-000000000006', 'Kasane', 'Gaborone', 1000, 12.0, 350.00),
    -- Gaborone ↔ Palapye
    ('a1000000-0000-0000-0000-000000000007', 'Gaborone', 'Palapye', 280, 3.5, 98.00),
    ('a1000000-0000-0000-0000-000000000008', 'Palapye', 'Gaborone', 280, 3.5, 98.00),
    -- Gaborone ↔ Serowe
    ('a1000000-0000-0000-0000-000000000009', 'Gaborone', 'Serowe', 320, 4.0, 114.00),
    ('a1000000-0000-0000-0000-000000000010', 'Serowe', 'Gaborone', 320, 4.0, 114.00),
    -- Gaborone ↔ Mahalapye
    ('a1000000-0000-0000-0000-000000000011', 'Gaborone', 'Mahalapye', 206, 2.5, 72.00),
    ('a1000000-0000-0000-0000-000000000012', 'Mahalapye', 'Gaborone', 206, 2.5, 72.00),
    -- Francistown ↔ Maun
    ('a1000000-0000-0000-0000-000000000013', 'Francistown', 'Maun', 520, 6.0, 200.00),
    ('a1000000-0000-0000-0000-000000000014', 'Maun', 'Francistown', 520, 6.0, 200.00),
    -- Francistown ↔ Kasane
    ('a1000000-0000-0000-0000-000000000015', 'Francistown', 'Kasane', 480, 5.5, 200.00),
    ('a1000000-0000-0000-0000-000000000016', 'Kasane', 'Francistown', 480, 5.5, 200.00),
    -- Maun ↔ Kasane
    ('a1000000-0000-0000-0000-000000000017', 'Maun', 'Kasane', 320, 4.5, 180.00),
    ('a1000000-0000-0000-0000-000000000018', 'Kasane', 'Maun', 320, 4.5, 180.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 16. SEED PRODUCTION DATA - BUSES
-- ============================================

INSERT INTO public.buses (id, company_id, name, plate_number, registration, capacity, bus_type, amenities) VALUES
    -- Seabelo Express buses
    ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Seabelo Express 1', 'B 123 ABC', 'B 123 ABC', 44, 'Luxury Coach', ARRAY['wifi', 'ac', 'usb', 'tv']),
    ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Seabelo Express 2', 'B 124 ABC', 'B 124 ABC', 44, 'Luxury Coach', ARRAY['wifi', 'ac', 'usb', 'tv']),
    -- Maun Coaches buses
    ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'Maun Coach 1', 'B 200 DEF', 'B 200 DEF', 50, 'Standard Coach', ARRAY['ac', 'usb']),
    ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'Maun Coach 2', 'B 201 DEF', 'B 201 DEF', 50, 'Standard Coach', ARRAY['ac', 'usb']),
    -- Eagle Liner buses
    ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'Eagle Liner 1', 'B 300 GHI', 'B 300 GHI', 40, 'Standard', ARRAY['ac']),
    ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'Eagle Liner 2', 'B 301 GHI', 'B 301 GHI', 40, 'Standard', ARRAY['ac']),
    -- Intercape buses
    ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'Intercape 1', 'B 400 JKL', 'B 400 JKL', 44, 'Express Coach', ARRAY['wifi', 'ac', 'usb']),
    ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'Intercape 2', 'B 401 JKL', 'B 401 JKL', 44, 'Express Coach', ARRAY['wifi', 'ac', 'usb']),
    -- Cross Country buses
    ('b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000005', 'Cross Country 1', 'B 500 MNO', 'B 500 MNO', 30, 'Safari Luxury', ARRAY['wifi', 'ac', 'usb', 'tv']),
    ('b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000005', 'Cross Country 2', 'B 501 MNO', 'B 501 MNO', 30, 'Safari Luxury', ARRAY['wifi', 'ac', 'usb', 'tv'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 17. SEED SCHEDULES (for next 30 days)
-- ============================================

-- Function to generate schedules for 30 days
DO $$
DECLARE
    day_offset INTEGER;
    schedule_date DATE;
BEGIN
    -- Loop through next 30 days
    FOR day_offset IN 0..29 LOOP
        schedule_date := CURRENT_DATE + day_offset;
        
        -- Gaborone → Francistown schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', schedule_date + TIME '06:00', schedule_date + TIME '11:30', 180.00, 40 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', schedule_date + TIME '08:30', schedule_date + TIME '14:00', 180.00, 45 - FLOOR(RANDOM() * 20)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', schedule_date + TIME '14:00', schedule_date + TIME '19:30', 180.00, 42 - FLOOR(RANDOM() * 12)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Francistown → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000004', schedule_date + TIME '07:00', schedule_date + TIME '12:30', 180.00, 48 - FLOOR(RANDOM() * 18)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', schedule_date + TIME '15:00', schedule_date + TIME '20:30', 180.00, 40 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Gaborone → Maun schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000007', schedule_date + TIME '06:00', schedule_date + TIME '15:00', 305.00, 42 - FLOOR(RANDOM() * 12)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000009', schedule_date + TIME '18:00', (schedule_date + 1) + TIME '03:00', 305.00, 28 - FLOOR(RANDOM() * 8)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Maun → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000008', schedule_date + TIME '07:00', schedule_date + TIME '16:00', 305.00, 43 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Gaborone → Kasane schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000009', schedule_date + TIME '05:00', schedule_date + TIME '17:00', 350.00, 28 - FLOOR(RANDOM() * 10)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Francistown → Kasane schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000015', 'b1000000-0000-0000-0000-000000000010', schedule_date + TIME '08:00', schedule_date + TIME '13:30', 200.00, 30 - FLOOR(RANDOM() * 8)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Gaborone → Palapye schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000003', schedule_date + TIME '09:00', schedule_date + TIME '12:30', 98.00, 50 - FLOOR(RANDOM() * 20)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000005', schedule_date + TIME '16:00', schedule_date + TIME '19:30', 98.00, 40 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Palapye → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', schedule_date + TIME '10:00', schedule_date + TIME '13:30', 98.00, 45 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Gaborone → Serowe schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', schedule_date + TIME '08:00', schedule_date + TIME '12:00', 114.00, 48 - FLOOR(RANDOM() * 18)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000005', schedule_date + TIME '14:00', schedule_date + TIME '18:00', 114.00, 40 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Serowe → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', schedule_date + TIME '09:00', schedule_date + TIME '13:00', 114.00, 45 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Gaborone → Mahalapye schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000003', schedule_date + TIME '10:00', schedule_date + TIME '12:30', 72.00, 50 - FLOOR(RANDOM() * 20)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000005', schedule_date + TIME '15:00', schedule_date + TIME '17:30', 72.00, 40 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
        -- Mahalapye → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES ('a1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000004', schedule_date + TIME '11:00', schedule_date + TIME '13:30', 72.00, 45 - FLOOR(RANDOM() * 15)::INTEGER)
        ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;

-- ============================================
-- 18. VERIFICATION QUERIES
-- ============================================

-- Check table counts
SELECT 'Companies: ' || COUNT(*)::TEXT as companies_count FROM public.companies;
SELECT 'Routes: ' || COUNT(*)::TEXT as routes_count FROM public.routes;
SELECT 'Buses: ' || COUNT(*)::TEXT as buses_count FROM public.buses;
SELECT 'Schedules: ' || COUNT(*)::TEXT as schedules_count FROM public.schedules;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'routes', 'buses', 'schedules', 'bookings', 'payments', 'companies');

-- ============================================
-- DONE! 
-- Phase 1 database setup is complete.
-- Next steps:
-- 1. Run 002_payments_schema.sql for complete payments system (optional, replaces simple payments table)
-- 2. Set admin role for a user using scripts/set-admin-role.sql
-- 3. Test admin dashboard functionality
-- ============================================
