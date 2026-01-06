# GOGOBUS MVP Setup Guide

## 🚀 Quick Fix for Your Current Issue

Your Login screen is showing the old placeholder. **Replace your `index.html`** with the new one I just provided.

---

## 📁 Required Files

Make sure you have these files in your `gogobus` folder:

```
gogobus/
├── index.html          ← REPLACE THIS with the new one
├── styles.css
├── onboarding.css
├── auth.css
├── app.js
├── auth.js
├── supabase-config.js
└── images/
    └── bus.jpg (optional)
```

---

## 🔧 File Contents Checklist

### 1. `supabase-config.js` - Update with your credentials

```javascript
// Get these from Supabase Dashboard → Settings → API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Make available globally
window.supabaseClient = supabase;

// Auth helpers
window.SupabaseAuth = {
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: metadata }
        });
        if (error) throw error;
        return data;
    },
    
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
        return data;
    },
    
    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },
    
    async signInWithProvider(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
        return data;
    },
    
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },
    
    async sendOTP(email) {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        return data;
    },
    
    async verifyOTP(email, token) {
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });
        if (error) throw error;
        return data;
    },
    
    async resetPassword(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        return data;
    },
    
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

// Profile helpers
window.SupabaseProfile = {
    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) throw error;
        return data;
    },
    
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};

console.log('✅ Supabase initialized');
```

---

## 🗄️ Supabase Database Setup

### Step 1: Create the Profiles Table

Go to Supabase → SQL Editor → New Query and run:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    province TEXT,
    city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
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

-- Trigger for auto-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 2: Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Optional: Enable **Confirm email** for production

---

## 🧪 Testing the App

### Demo Mode (No Supabase)
If Supabase isn't configured, the app works in demo mode:
- Any email/password will work
- Any 4 digits work for OTP
- Data is stored in localStorage

### Production Mode (With Supabase)
Once you add your credentials:
- Real email verification
- Secure authentication
- Data stored in Supabase

---

## 🔄 User Flow

```
1. Splash Screen (2.5s auto)
        ↓
2. Onboarding (3 slides, swipeable)
        ↓
3. Get Started (Login CTA + Social buttons)
        ↓
4. Login OR Sign Up
        ↓
5. OTP Verification (if signup)
        ↓
6. Complete Profile (province, city)
        ↓
7. Success Modal → Home
```

---

## ✅ MVP Checklist

- [x] Splash screen with logo animation
- [x] 3-step onboarding with swipe
- [x] Login with email/password
- [x] Sign up with email/password
- [x] OTP verification screen
- [x] Profile completion form
- [x] Success modal
- [x] Toast notifications
- [x] Form validation
- [x] Password visibility toggle
- [x] Supabase integration ready
- [x] Demo mode for testing
- [ ] Home screen (next step)
- [ ] Bus search (next step)
- [ ] Booking flow (next step)

---

## 🐛 Troubleshooting

### "Login Screen" showing placeholder text
→ Replace `index.html` with the new version

### Supabase not connecting
→ Check browser console for errors
→ Verify your URL and anon key are correct
→ Make sure you ran the SQL schema

### OTP not working
→ In demo mode, any 4 digits work
→ In production, check Supabase email templates

### Social login not working
→ Requires OAuth setup in Supabase for each provider
→ For MVP, use email/password instead

---

## 🚀 Deploy to GitHub Pages

```bash
git add .
git commit -m "MVP with auth screens"
git push origin main
```

Then: GitHub repo → Settings → Pages → Deploy from main branch

---

## 📞 Next Steps

After this MVP is working:
1. **Home Screen** - Search form, recent trips
2. **Search Results** - Available buses
3. **Booking Flow** - Select seats, payment
4. **My Tickets** - Booking history

Let me know when you're ready to proceed!
