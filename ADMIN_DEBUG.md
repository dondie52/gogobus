# Admin Dashboard Access Debugging Guide

If you can't access the admin dashboard after setting the admin role, follow these steps:

## Step 1: Verify Admin Role in Database

Run this in Supabase SQL Editor:

```sql
-- Check if profile exists and has admin role
SELECT id, email, full_name, role, created_at
FROM public.profiles 
WHERE email = 'georgymoni04@gmail.com';
```

**Expected Result**: Should show a row with `role = 'admin'`

**If no rows returned**: User doesn't have a profile yet. See "Creating Profile" below.

**If role is NULL or 'user'**: Run the admin role update:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'georgymoni4@gmail.com';
```

## Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to access `/admin`
4. Look for debug messages:
   - `AdminProtectedRoute Debug:` - Shows user profile and role
   - `Login - Profile check:` - Shows profile during login

**What to look for**:
- `profileRole: 'admin'` ✅ Good
- `profileRole: 'user'` ❌ Role not set correctly
- `profileRole: undefined` ❌ Profile doesn't exist

## Step 3: Verify User Exists in Auth

Run this in Supabase SQL Editor:

```sql
SELECT id, email, email_confirmed_at, created_at
FROM auth.users 
WHERE email = 'georgymonie0@gmail.com';
```

**If no rows**: User needs to sign up first.

## Step 4: Common Issues & Solutions

### Issue 1: Profile Doesn't Exist

**Symptom**: Console shows `profileRole: undefined` or `userProfile: null`

**Solution**: Create profile manually:
```sql
-- Get user ID from auth.users
SELECT id FROM auth.users WHERE email = 'georgymonie0@gmail.com';

-- Then create profile (replace USER_ID with actual ID)
INSERT INTO public.profiles (id, email, role)
VALUES ('USER_ID_HERE', 'georgymonie0@gmail.com', 'admin')
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;
```

### Issue 2: Role Not Set

**Symptom**: Console shows `profileRole: 'user'` or `role: null`

**Solution**: Update role:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'georgymonie0@gmail.com';
```

### Issue 3: Profile Not Loading

**Symptom**: Stuck on "Loading admin profile..." screen

**Possible causes**:
1. Profile doesn't exist
2. RLS (Row Level Security) blocking access
3. Network error

**Solution**: 
1. Check Supabase Dashboard → Authentication → Policies
2. Verify RLS allows users to read their own profile
3. Check browser Network tab for failed requests

### Issue 4: Redirected to /home

**Symptom**: After login, goes to `/home` instead of `/admin`

**Possible causes**:
1. Profile not loaded yet when redirect happens
2. Role check happens before profile fetch completes
3. `isAdmin` is false

**Solution**: 
- Wait a moment after login, then manually navigate to `/admin`
- Check console for debug messages
- Verify profile exists and role is 'admin'

## Step 5: Manual Navigation Test

After logging in:
1. Wait 2-3 seconds for profile to load
2. Manually type `/admin` in the address bar
3. Check console for debug output
4. See if you get redirected or see the dashboard

## Step 6: Force Profile Refresh

If profile was just updated:
1. **Log out** completely
2. **Clear browser cache** (optional)
3. **Log back in**
4. Try accessing `/admin` again

## Quick Fix Script

Run this complete script in Supabase SQL Editor to ensure everything is set up:

```sql
-- Step 1: Check if user exists
SELECT 'User in auth.users:' as check_type, id, email 
FROM auth.users 
WHERE email = 'georgymonie0@gmail.com';

-- Step 2: Create or update profile with admin role
INSERT INTO public.profiles (id, email, role)
SELECT 
    id,
    email,
    'admin'
FROM auth.users 
WHERE email = 'georgymonie0@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', email = EXCLUDED.email;

-- Step 3: Verify
SELECT 'Profile check:' as check_type, id, email, role, created_at
FROM public.profiles 
WHERE email = 'georgymonie0@gmail.com';
```

## Testing Checklist

- [ ] User exists in `auth.users`
- [ ] Profile exists in `public.profiles`
- [ ] Profile has `role = 'admin'`
- [ ] User can log in successfully
- [ ] Browser console shows `profileRole: 'admin'`
- [ ] Can access `/admin` route
- [ ] Admin dashboard loads correctly

## Still Not Working?

1. **Check Supabase Dashboard**:
   - Authentication → Users → Verify user exists
   - Table Editor → profiles → Verify role is 'admin'

2. **Check Browser**:
   - Clear cache and cookies
   - Try incognito/private window
   - Check Network tab for API errors

3. **Check Code**:
   - Verify `AdminProtectedRoute.jsx` is checking `userProfile?.role === 'admin'`
   - Verify `AuthContext.jsx` is fetching profile correctly
   - Check for any console errors

4. **Contact Support**:
   - Share console debug output
   - Share SQL query results
   - Describe exact behavior (redirects, errors, etc.)
