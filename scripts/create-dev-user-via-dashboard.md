# Create Dev User via Supabase Dashboard

## Problem
Creating users directly in `auth.users` via SQL doesn't work with Supabase Auth because the password hash format doesn't match what Supabase expects.

## Solution: Create User via Dashboard

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create New User"**
3. Enter:
   - **Email**: `dev@test.com`
   - **Password**: `dev-password-123`
   - **Auto Confirm User**: ✅ (check this box)
4. Click **"Create User"**
5. **Update the user ID** to match the dev user ID (run in SQL Editor):
   ```sql
   -- Get the new user's ID first
   SELECT id, email FROM auth.users WHERE email = 'dev@test.com';
   
   -- Update to use the dev user ID (replace NEW_USER_ID with the ID from above)
   UPDATE auth.users 
   SET id = '00000000-0000-0000-0000-000000000123'::uuid 
   WHERE email = 'dev@test.com';
   
   -- Update profile ID to match
   UPDATE public.profiles 
   SET id = '00000000-0000-0000-0000-000000000123'::uuid 
   WHERE email = 'dev@test.com';
   ```

## Alternative: Let App Create User

If you prefer, you can let the app create the user automatically:
1. Delete any existing dev user from `auth.users`
2. Restart the app
3. The app will attempt to sign up the dev user automatically
4. If email confirmation is disabled, it will work immediately

## Verify User Creation

Run this to verify:
```sql
SELECT 
    u.id, 
    u.email, 
    u.email_confirmed_at,
    p.full_name,
    p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'dev@test.com';
```

Expected result: User exists with `email_confirmed_at` set and profile created.
