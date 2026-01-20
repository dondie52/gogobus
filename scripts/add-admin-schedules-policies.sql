-- ============================================
-- ADMIN POLICIES FOR SCHEDULES TABLE
-- ============================================
-- This script adds INSERT, UPDATE, and DELETE policies for admins
-- on the schedules table so they can manage trips/schedules.

-- Drop existing admin policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Admins can insert schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can update schedules" ON public.schedules;
DROP POLICY IF EXISTS "Admins can delete schedules" ON public.schedules;

-- Allow admins and operators to insert schedules (create trips)
CREATE POLICY "Admins can insert schedules" ON public.schedules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- Allow admins and operators to update schedules (edit trips)
CREATE POLICY "Admins can update schedules" ON public.schedules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );

-- Allow admins and operators to delete schedules (delete trips)
CREATE POLICY "Admins can delete schedules" ON public.schedules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'operator')
        )
    );
