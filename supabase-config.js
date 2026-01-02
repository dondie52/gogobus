/* ============================================
   GOGOBUS - Supabase Configuration
   Replace the placeholders with your actual credentials
   ============================================ */

// ===================
// SUPABASE CREDENTIALS
// Get these from: Supabase Dashboard → Settings → API
// ===================
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // The long anon/public key

// ===================
// INITIALIZE SUPABASE CLIENT
// ===================
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================
// AUTH HELPERS
// ===================
const SupabaseAuth = {
    
    /**
     * Sign up with email and password
     */
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata // { full_name, phone }
            }
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Sign in with email and password
     */
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider, // 'google', 'facebook', 'apple'
            options: {
                redirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Sign out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    
    /**
     * Get current session
     */
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    },
    
    /**
     * Get current user
     */
    async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    },
    
    /**
     * Send OTP to email
     */
    async sendOTP(email) {
        const { data, error } = await supabase.auth.signInWithOtp({
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
        const { data, error } = await supabase.auth.verifyOtp({
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
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Update password
     */
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
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
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    },
    
    /**
     * Upload avatar image
     */
    async uploadAvatar(userId, file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload file
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
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
        
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
        const { data, error } = await supabase
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
// EXPORT
// ===================
window.supabaseClient = supabase;
window.SupabaseAuth = SupabaseAuth;
window.SupabaseProfile = SupabaseProfile;
window.SupabaseBookings = SupabaseBookings;
window.SupabaseRoutes = SupabaseRoutes;

// Log initialization status
console.log('🔌 Supabase client initialized');
console.log('📡 URL:', SUPABASE_URL === 'YOUR_SUPABASE_URL' ? '⚠️ Not configured' : '✅ Configured');
