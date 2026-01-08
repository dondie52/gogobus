/* ============================================
   GOGOBUS - Supabase Configuration
   Replace the placeholders with your actual credentials
   ============================================ */

// ===================
// SUPABASE CREDENTIALS
// Get these from: Supabase Dashboard → Settings → API
// ===================
const SUPABASE_URL = 'https://jhnnazntoimddmclzile.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impobm5hem50b2ltZGRtY2x6aWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzMxNzYsImV4cCI6MjA4Mjk0OTE3Nn0.D2swkrh_enTdXC54nERVdoXCwbBVOIGnqYRKtL6eIT8';

// ===================
// BASE URL FOR REDIRECTS
// For GitHub Pages: https://username.github.io/repo-name
// ===================
const BASE_URL = 'https://dondie52.github.io/gogobus';

// ===================
// INITIALIZE SUPABASE CLIENT
// ===================
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================
// AUTH HELPERS
// ===================
const SupabaseAuth = {
    
    /**
     * Sign up with email and password
     */
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // { full_name, phone }
                emailRedirectTo: BASE_URL // Redirect to app after email confirmation
            }
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Sign in with OAuth provider (Google, Facebook, Apple)
     */
    async signInWithProvider(provider) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: BASE_URL
            }
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },
    
    /**
     * Get current session
     */
    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    },
    
    /**
     * Get current user
     */
    async getUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    },
    
    /**
     * Send OTP to email
     */
    async sendOTP(email) {
        const { data, error } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true
            }
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Verify OTP
     */
    async verifyOTP(email, token) {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Reset password
     */
    async resetPassword(email) {
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${BASE_URL}/reset-password`
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Update password
     */
    async updatePassword(newPassword) {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// ===================
// PROFILE HELPERS
// ===================
const SupabaseProfile = {
    
    /**
     * Get user profile
     */
    async getProfile(userId) {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },
    
    async updateProfile(userId, updates) {
        // Try update first
        const { data: updateData, error: updateError } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        // If no rows found, insert instead
        if (updateError && (updateError.code === 'PGRST116' || updateError.message?.includes('No rows'))) {
            const { data: insertData, error: insertError } = await supabaseClient
                .from('profiles')
                .insert({ id: userId, ...updates })
                .select()
                .single();
            if (insertError) throw insertError;
            return insertData;
        }
        
        if (updateError) throw updateError;
        return updateData;
    },
    
    /**
     * Upload avatar image
     */
    async uploadAvatar(userId, file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload file
        const { error: uploadError } = await supabaseClient.storage
            .from('avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        // Update profile with avatar URL
        await this.updateProfile(userId, { avatar_url: publicUrl });
        
        return publicUrl;
    }
};

// ===================
// BOOKING HELPERS
// ===================
const SupabaseBookings = {
    
    /**
     * Search schedules
     */
    async searchSchedules(origin, destination, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data, error } = await supabaseClient
            .from('schedules')
            .select(`
                *,
                route:routes(*),
                bus:buses(*, company:companies(*))
            `)
            .eq('status', 'active')
            .gte('departure_time', startOfDay.toISOString())
            .lte('departure_time', endOfDay.toISOString())
            .gt('available_seats', 0)
            .order('departure_time');
        
        if (error) throw error;
        
        // Filter by origin/destination
        return data.filter(schedule => 
            schedule.route.origin.toLowerCase().includes(origin.toLowerCase()) &&
            schedule.route.destination.toLowerCase().includes(destination.toLowerCase())
        );
    },
    
    /**
     * Create booking
     */
    async createBooking(bookingData) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .insert(bookingData)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Get user's bookings
     */
    async getUserBookings(userId) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .select(`
                *,
                schedule:schedules(
                    *,
                    route:routes(*),
                    bus:buses(*, company:companies(*))
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Cancel booking
     */
    async cancelBooking(bookingId) {
        const { data, error } = await supabaseClient
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
};

// ===================
// ROUTES HELPERS
// ===================
const SupabaseRoutes = {
    
    /**
     * Get all active routes
     */
    async getRoutes() {
        const { data, error } = await supabaseClient
            .from('routes')
            .select('*')
            .eq('is_active', true)
            .order('origin');
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Get unique cities (for dropdowns)
     */
    async getCities() {
        const routes = await this.getRoutes();
        const cities = new Set();
        
        routes.forEach(route => {
            cities.add(route.origin);
            cities.add(route.destination);
        });
        
        return Array.from(cities).sort();
    }
};

// ===================
// EXPORT GLOBALLY
// ===================
window.supabaseClient = supabaseClient;
window.SupabaseAuth = SupabaseAuth;
window.SupabaseProfile = SupabaseProfile;
window.SupabaseBookings = SupabaseBookings;
window.SupabaseRoutes = SupabaseRoutes;

console.log('✅ Supabase initialized successfully');
console.log('🔗 Base URL:', BASE_URL);
