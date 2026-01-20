-- ============================================================
-- GOGOBUS PAYMENTS DATABASE SCHEMA
-- Run this AFTER seed-data.sql (or after your base schema is set up)
-- ============================================================

-- ============================================================
-- HELPER FUNCTIONS (if not already exists)
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DROP EXISTING SIMPLE PAYMENTS TABLE (if exists from seed-data.sql)
-- ============================================================

-- Drop the simple payments table if it exists (from seed-data.sql)
DROP TABLE IF EXISTS public.payments CASCADE;

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    transaction_ref TEXT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'BWP',
    payment_method TEXT NOT NULL,
    provider TEXT NOT NULL, -- 'dpo', 'orange', 'manual'
    provider_ref TEXT, -- Reference from payment provider
    provider_token TEXT, -- Token from payment provider
    provider_status TEXT, -- Status message from provider
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refund_requested', 'refunded')),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    completed_at TIMESTAMPTZ,
    confirmed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments for their bookings" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
DROP POLICY IF EXISTS "System can update payments" ON public.payments;

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
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

-- Note: The "System can update payments" policy with USING (true) 
-- is not recommended for production. Use service role key for system updates instead.
-- If needed, uncomment below and use only with proper security measures:
-- CREATE POLICY "System can update payments" ON public.payments
--     FOR UPDATE USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_ref ON public.payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_provider ON public.payments(provider);

-- Updated at trigger
DROP TRIGGER IF EXISTS payments_updated_at ON public.payments;
CREATE TRIGGER payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- REFUNDS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE RESTRICT,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')),
    provider_ref TEXT, -- Refund reference from payment provider
    requested_by UUID REFERENCES public.profiles(id),
    processed_by UUID REFERENCES public.profiles(id),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own refunds" ON public.refunds;
DROP POLICY IF EXISTS "Users can request refunds for their bookings" ON public.refunds;
DROP POLICY IF EXISTS "Admins can manage refunds" ON public.refunds;

-- Refunds policies
CREATE POLICY "Users can view their own refunds" ON public.refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = refunds.booking_id AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can request refunds for their bookings" ON public.refunds
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings b
            WHERE b.id = refunds.booking_id AND b.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage refunds" ON public.refunds
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON public.refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- Updated at trigger
DROP TRIGGER IF EXISTS refunds_updated_at ON public.refunds;
CREATE TRIGGER refunds_updated_at
    BEFORE UPDATE ON public.refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PAYMENT WEBHOOKS LOG (for debugging)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.payment_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    event_type TEXT,
    transaction_ref TEXT,
    raw_payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (admin only)
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view webhooks" ON public.payment_webhooks;
CREATE POLICY "Admins can view webhooks" ON public.payment_webhooks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to get payment summary for a booking
CREATE OR REPLACE FUNCTION get_booking_payment_summary(p_booking_id UUID)
RETURNS TABLE (
    total_paid DECIMAL,
    total_refunded DECIMAL,
    payment_status TEXT,
    last_payment_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END), 0) as total_refunded,
        CASE 
            WHEN SUM(CASE WHEN p.status = 'completed' THEN 1 ELSE 0 END) > 0 THEN 'paid'
            WHEN SUM(CASE WHEN p.status = 'pending' THEN 1 ELSE 0 END) > 0 THEN 'pending'
            ELSE 'unpaid'
        END as payment_status,
        MAX(CASE WHEN p.status = 'completed' THEN p.completed_at END) as last_payment_date
    FROM public.payments p
    WHERE p.booking_id = p_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update booking payment status when payment completes
CREATE OR REPLACE FUNCTION update_booking_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE public.bookings
        SET 
            payment_status = 'paid',
            payment_method = NEW.payment_method,
            payment_reference = NEW.transaction_ref,
            updated_at = NOW()
        WHERE id = NEW.booking_id;
    ELSIF NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
        UPDATE public.bookings
        SET 
            payment_status = 'refunded',
            updated_at = NOW()
        WHERE id = NEW.booking_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_status_update ON public.payments;
CREATE TRIGGER payment_status_update
    AFTER UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION update_booking_on_payment();

-- ============================================================
-- ADD MISSING COLUMNS TO BOOKINGS TABLE (if needed)
-- ============================================================

-- Add payment_status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_status TEXT DEFAULT 'unpaid';
    END IF;
END $$;

-- Add payment_reference column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN payment_reference TEXT;
    END IF;
END $$;

-- ============================================================
-- VIEWS
-- ============================================================

-- Payments with booking details
-- Note: Simplified to work with actual bookings table structure
CREATE OR REPLACE VIEW public.payments_detailed AS
SELECT 
    p.*,
    b.id::TEXT as booking_reference,
    COALESCE(p.customer_name, 'N/A') as booking_passenger,
    s.departure_time,
    COALESCE(r.origin, 'N/A') as origin,
    COALESCE(r.destination, 'N/A') as destination
FROM public.payments p
JOIN public.bookings b ON p.booking_id = b.id
LEFT JOIN public.schedules s ON b.schedule_id = s.id
LEFT JOIN public.routes r ON s.route_id = r.id;

-- Daily payment stats (for admin dashboard)
CREATE OR REPLACE VIEW public.daily_payment_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
    SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
    payment_method,
    provider
FROM public.payments
GROUP BY DATE(created_at), payment_method, provider
ORDER BY date DESC;

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Payments schema created successfully!' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') as payments_table,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'refunds') as refunds_table,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_webhooks') as webhooks_table;
