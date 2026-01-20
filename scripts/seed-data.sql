-- ============================================
-- GOGOBUS - Supabase Seed Data
-- Run this in Supabase SQL Editor to populate test data
-- ============================================

-- ============================================
-- 1. CREATE TABLES (if not exists)
-- ============================================

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
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buses table
CREATE TABLE IF NOT EXISTS public.buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id),
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
    status TEXT DEFAULT 'pending',
    qr_code TEXT,
    origin TEXT,
    destination TEXT,
    departure_time TEXT,
    travel_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
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

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Public read access for companies, routes, buses, schedules
CREATE POLICY IF NOT EXISTS "Public read access for companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for buses" ON public.buses FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Public read access for schedules" ON public.schedules FOR SELECT USING (true);

-- Users can only access their own bookings
CREATE POLICY IF NOT EXISTS "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Users can only access their own payments
CREATE POLICY IF NOT EXISTS "Users can view own payments" ON public.payments FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = payments.booking_id AND bookings.user_id = auth.uid()));

-- ============================================
-- 3. SEED BUS COMPANIES
-- ============================================

INSERT INTO public.companies (id, name, logo_url, contact_phone, description, rating) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'Intercity Express', NULL, '+267 395 1234', 'Premium intercity bus service with comfortable seating and onboard amenities.', 4.5),
    ('c1000000-0000-0000-0000-000000000002', 'Botswana Coach', NULL, '+267 391 5678', 'Reliable coach service connecting major cities across Botswana.', 4.2),
    ('c1000000-0000-0000-0000-000000000003', 'Seabelo Transport', NULL, '+267 397 9012', 'Affordable and safe travel for everyone.', 4.0),
    ('c1000000-0000-0000-0000-000000000004', 'Maun Express', NULL, '+267 686 3456', 'Specializing in northern routes to Maun and Kasane.', 4.3),
    ('c1000000-0000-0000-0000-000000000005', 'Safari Coaches', NULL, '+267 625 7890', 'Luxury coaches with wildlife viewing routes.', 4.6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. SEED ROUTES
-- ============================================

INSERT INTO public.routes (id, origin, destination, distance_km, duration_hours) VALUES
    ('r1000000-0000-0000-0000-000000000001', 'Gaborone', 'Francistown', 430, 5.5),
    ('r1000000-0000-0000-0000-000000000002', 'Francistown', 'Gaborone', 430, 5.5),
    ('r1000000-0000-0000-0000-000000000003', 'Gaborone', 'Maun', 950, 9.0),
    ('r1000000-0000-0000-0000-000000000004', 'Maun', 'Gaborone', 950, 9.0),
    ('r1000000-0000-0000-0000-000000000005', 'Gaborone', 'Kasane', 1000, 12.0),
    ('r1000000-0000-0000-0000-000000000006', 'Kasane', 'Gaborone', 1000, 12.0),
    ('r1000000-0000-0000-0000-000000000007', 'Francistown', 'Maun', 520, 6.0),
    ('r1000000-0000-0000-0000-000000000008', 'Maun', 'Francistown', 520, 6.0),
    ('r1000000-0000-0000-0000-000000000009', 'Francistown', 'Kasane', 480, 5.5),
    ('r1000000-0000-0000-0000-000000000010', 'Kasane', 'Francistown', 480, 5.5),
    ('r1000000-0000-0000-0000-000000000011', 'Gaborone', 'Palapye', 280, 3.5),
    ('r1000000-0000-0000-0000-000000000012', 'Palapye', 'Gaborone', 280, 3.5),
    ('r1000000-0000-0000-0000-000000000013', 'Gaborone', 'Serowe', 320, 4.0),
    ('r1000000-0000-0000-0000-000000000014', 'Serowe', 'Gaborone', 320, 4.0),
    ('r1000000-0000-0000-0000-000000000015', 'Maun', 'Kasane', 320, 4.5),
    ('r1000000-0000-0000-0000-000000000016', 'Kasane', 'Maun', 320, 4.5),
    ('r1000000-0000-0000-0000-000000000017', 'Gaborone', 'Mahalapye', 206, 2.5),
    ('r1000000-0000-0000-0000-000000000018', 'Mahalapye', 'Gaborone', 206, 2.5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. SEED BUSES
-- ============================================

INSERT INTO public.buses (id, company_id, plate_number, capacity, bus_type, amenities) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'B 123 ABC', 44, 'Luxury Coach', '["wifi", "ac", "usb", "tv"]'),
    ('b1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'B 124 ABC', 44, 'Luxury Coach', '["wifi", "ac", "usb", "tv"]'),
    ('b1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'B 200 DEF', 50, 'Standard Coach', '["ac", "usb"]'),
    ('b1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'B 201 DEF', 50, 'Standard Coach', '["ac", "usb"]'),
    ('b1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'B 300 GHI', 40, 'Standard', '["ac"]'),
    ('b1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'B 301 GHI', 40, 'Standard', '["ac"]'),
    ('b1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'B 400 JKL', 44, 'Express Coach', '["wifi", "ac", "usb"]'),
    ('b1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'B 401 JKL', 44, 'Express Coach', '["wifi", "ac", "usb"]'),
    ('b1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000005', 'B 500 MNO', 30, 'Safari Luxury', '["wifi", "ac", "usb", "tv"]'),
    ('b1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000005', 'B 501 MNO', 30, 'Safari Luxury', '["wifi", "ac", "usb", "tv"]')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. SEED SCHEDULES (for next 14 days)
-- ============================================

-- Function to generate schedules for multiple days
DO $$
DECLARE
    day_offset INTEGER;
    schedule_date DATE;
    dep_time TIME;
    arr_time TIME;
BEGIN
    -- Loop through next 14 days
    FOR day_offset IN 0..13 LOOP
        schedule_date := CURRENT_DATE + day_offset;
        
        -- Gaborone → Francistown schedules
        -- Morning 06:00
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000001',
            'b1000000-0000-0000-0000-000000000001',
            schedule_date + TIME '06:00',
            schedule_date + TIME '11:30',
            180.00,
            40 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Morning 08:30
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000001',
            'b1000000-0000-0000-0000-000000000003',
            schedule_date + TIME '08:30',
            schedule_date + TIME '14:00',
            150.00,
            45 - FLOOR(RANDOM() * 20)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Afternoon 14:00
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000001',
            'b1000000-0000-0000-0000-000000000002',
            schedule_date + TIME '14:00',
            schedule_date + TIME '19:30',
            180.00,
            42 - FLOOR(RANDOM() * 12)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Evening 20:00
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000001',
            'b1000000-0000-0000-0000-000000000005',
            schedule_date + TIME '20:00',
            (schedule_date + 1) + TIME '01:30',
            140.00,
            38 - FLOOR(RANDOM() * 10)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Francistown → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000002',
            'b1000000-0000-0000-0000-000000000004',
            schedule_date + TIME '07:00',
            schedule_date + TIME '12:30',
            160.00,
            48 - FLOOR(RANDOM() * 18)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000002',
            'b1000000-0000-0000-0000-000000000006',
            schedule_date + TIME '15:00',
            schedule_date + TIME '20:30',
            150.00,
            40 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Gaborone → Maun schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000003',
            'b1000000-0000-0000-0000-000000000007',
            schedule_date + TIME '06:00',
            schedule_date + TIME '15:00',
            305.00,
            42 - FLOOR(RANDOM() * 12)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000003',
            'b1000000-0000-0000-0000-000000000009',
            schedule_date + TIME '18:00',
            (schedule_date + 1) + TIME '03:00',
            305.00,
            28 - FLOOR(RANDOM() * 8)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Maun → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000004',
            'b1000000-0000-0000-0000-000000000008',
            schedule_date + TIME '07:00',
            schedule_date + TIME '16:00',
            305.00,
            43 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Gaborone → Kasane schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000005',
            'b1000000-0000-0000-0000-000000000009',
            schedule_date + TIME '05:00',
            schedule_date + TIME '17:00',
            350.00,
            28 - FLOOR(RANDOM() * 10)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Francistown → Kasane schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000009',
            'b1000000-0000-0000-0000-000000000010',
            schedule_date + TIME '08:00',
            schedule_date + TIME '13:30',
            200.00,
            30 - FLOOR(RANDOM() * 8)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Gaborone → Palapye schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000011',
            'b1000000-0000-0000-0000-000000000003',
            schedule_date + TIME '09:00',
            schedule_date + TIME '12:30',
            98.00,
            50 - FLOOR(RANDOM() * 20)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000011',
            'b1000000-0000-0000-0000-000000000005',
            schedule_date + TIME '16:00',
            schedule_date + TIME '19:30',
            98.00,
            40 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Gaborone → Serowe schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000013',
            'b1000000-0000-0000-0000-000000000003',
            schedule_date + TIME '08:00',
            schedule_date + TIME '12:00',
            114.00,
            48 - FLOOR(RANDOM() * 18)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000013',
            'b1000000-0000-0000-0000-000000000005',
            schedule_date + TIME '14:00',
            schedule_date + TIME '18:00',
            114.00,
            40 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Serowe → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000014',
            'b1000000-0000-0000-0000-000000000004',
            schedule_date + TIME '09:00',
            schedule_date + TIME '13:00',
            114.00,
            45 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Gaborone → Mahalapye schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000017',
            'b1000000-0000-0000-0000-000000000003',
            schedule_date + TIME '10:00',
            schedule_date + TIME '12:30',
            72.00,
            50 - FLOOR(RANDOM() * 20)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000017',
            'b1000000-0000-0000-0000-000000000005',
            schedule_date + TIME '15:00',
            schedule_date + TIME '17:30',
            72.00,
            40 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
        -- Mahalapye → Gaborone schedules
        INSERT INTO public.schedules (route_id, bus_id, departure_time, arrival_time, price, available_seats)
        VALUES (
            'r1000000-0000-0000-0000-000000000018',
            'b1000000-0000-0000-0000-000000000004',
            schedule_date + TIME '11:00',
            schedule_date + TIME '13:30',
            72.00,
            45 - FLOOR(RANDOM() * 15)::INTEGER
        ) ON CONFLICT DO NOTHING;
        
    END LOOP;
END $$;

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_schedules_departure ON public.schedules(departure_time);
CREATE INDEX IF NOT EXISTS idx_schedules_route ON public.schedules(route_id);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON public.schedules(status);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule ON public.bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_routes_origin_dest ON public.routes(origin, destination);

-- ============================================
-- 8. VERIFY DATA
-- ============================================

-- Check inserted data
SELECT 'Companies: ' || COUNT(*)::TEXT FROM public.companies;
SELECT 'Routes: ' || COUNT(*)::TEXT FROM public.routes;
SELECT 'Buses: ' || COUNT(*)::TEXT FROM public.buses;
SELECT 'Schedules: ' || COUNT(*)::TEXT FROM public.schedules;

-- ============================================
-- DONE! 
-- Your database is now populated with test data.
-- ============================================
