-- ============================================
-- GOGOBUS: Live Bus Tracking Migration
-- ============================================
-- Run this in your Supabase SQL Editor

-- ============================================
-- A) CREATE trip_locations TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trip_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    heading DOUBLE PRECISION NULL,
    speed DOUBLE PRECISION NULL,
    status TEXT NULL CHECK (status IN ('boarding', 'departed', 'delayed', 'arriving', 'on_time')),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'device',
    
    -- Foreign key to trips table (adjust if your table name differs)
    CONSTRAINT fk_trip
        FOREIGN KEY (trip_id) 
        REFERENCES trips(id) 
        ON DELETE CASCADE
);

-- Create index for efficient queries (latest location per trip)
CREATE INDEX IF NOT EXISTS idx_trip_locations_trip_recorded 
    ON trip_locations (trip_id, recorded_at DESC);

-- ============================================
-- B) ENABLE REALTIME
-- ============================================
-- Enable realtime for trip_locations table
ALTER PUBLICATION supabase_realtime ADD TABLE trip_locations;

-- ============================================
-- C) ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on the table
ALTER TABLE trip_locations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADJUST TABLE NAMES HERE IF NEEDED:
-- - bookings -> your_bookings_table_name
-- - profiles -> your_profiles_table_name  
-- - trips -> your_trips_table_name
-- ============================================

-- Policy: Users can read trip_locations if they have a booking for that trip
CREATE POLICY "Users can view locations for their booked trips"
ON trip_locations
FOR SELECT
USING (
    -- User has a booking for this trip
    EXISTS (
        SELECT 1 FROM bookings
        WHERE bookings.trip_id = trip_locations.trip_id
        AND bookings.user_id = auth.uid()
    )
    OR
    -- User is an admin
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: Only admins (or device/system) can insert locations
-- In production, you'd use a service role key for device updates
CREATE POLICY "Admins can insert trip locations"
ON trip_locations
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: Admins can update locations
CREATE POLICY "Admins can update trip locations"
ON trip_locations
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Policy: Admins can delete locations
CREATE POLICY "Admins can delete trip locations"
ON trip_locations
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================
-- D) HELPER FUNCTION: Get latest location for a trip
-- ============================================
CREATE OR REPLACE FUNCTION get_latest_trip_location(p_trip_id UUID)
RETURNS TABLE (
    id UUID,
    trip_id UUID,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    status TEXT,
    recorded_at TIMESTAMPTZ,
    source TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tl.id,
        tl.trip_id,
        tl.lat,
        tl.lng,
        tl.heading,
        tl.speed,
        tl.status,
        tl.recorded_at,
        tl.source
    FROM trip_locations tl
    WHERE tl.trip_id = p_trip_id
    ORDER BY tl.recorded_at DESC
    LIMIT 1;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_latest_trip_location(UUID) TO authenticated;
