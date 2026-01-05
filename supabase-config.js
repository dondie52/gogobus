/* ============================================
   GOGOBUS - Supabase Configuration
   ============================================ */

// ===================
// SUPABASE CREDENTIALS
// ===================
const SUPABASE_URL = 'https://jhnnazntoimddmclzile.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impobm5hem50b2ltZGRtY2x6aWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzMxNzYsImV4cCI6MjA4Mjk0OTE3Nn0.D2swkrh_enTdXC54nERVdoXCwbBVOIGnqYRKtL6eIT8';

// ===================
// INITIALIZE SUPABASE CLIENT
// Use a different variable name to avoid conflict with CDN
// ===================
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===================
// AUTH HELPERS
// ===================
const SupabaseAuth = {
    
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        if (error) throw error;
        return data;
    },
    
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },
    
    async signInWithProvider(provider) {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        });
        if (error) throw error;
        return data;
    },
    
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    },
    
    async getSession() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return session;
    },
    
    async getUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) throw error;
        return user;
    },
    
    async sendOTP(email) {
        // Send magic link (signInWithOtp sends a link by default, not a code)
        const { data, error } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin + window.location.pathname
            }
        });
        if (error) throw error;
        return data;
    },
    
    async verifyOTP(email, token) {
        const { data, error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        if (error) throw error;
        return data;
    },
    
    async resetPassword(email) {
        const redirectBase = `${window.location.origin}${window.location.pathname}`;
        const redirectUrl = `${redirectBase}#reset-password`;
        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl
        });
        if (error) throw error;
        return data;
    },
    
    async updatePassword(newPassword) {
        const { data, error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return data;
    },
    
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
    
    async uploadAvatar(userId, file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabaseClient.storage
            .from('avatars')
            .upload(filePath, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);
        
        await this.updateProfile(userId, { avatar_url: publicUrl });
        return publicUrl;
    }
};

// ===================
// EXPORT GLOBALLY
// ===================
window.supabaseClient = supabaseClient;
window.SupabaseAuth = SupabaseAuth;
window.SupabaseProfile = SupabaseProfile;

console.log('✅ Supabase initialized successfully');
