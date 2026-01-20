# Admin Role Setup Guide

This guide explains how to set up and use the admin role system for the GOGOBUS Admin Dashboard.

## Overview

The admin dashboard at `/admin` is now protected by role-based access control. Only users with the `admin` role can access it.

## Setup Steps

### Step 1: Add Role Column to Database

1. Go to your Supabase Dashboard → SQL Editor
2. Open and run the file: `scripts/add-user-role.sql`
   - This adds a `role` column to the `profiles` table
   - Sets default role as `'user'` for all existing users
   - Creates an index for faster role lookups

### Step 2: Grant Admin Access to a User

1. Go to Supabase Dashboard → SQL Editor
2. Open and run the file: `scripts/set-admin-role.sql`
3. **Important**: Replace `'admin@example.com'` with the actual email of the user you want to make admin
4. Run the query

Example:
```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

### Step 3: Password Setup (If Needed)

**Important**: Passwords are managed by Supabase Auth, not in the database. The admin user needs:
- ✅ A valid password (set during signup or via password reset)
- ✅ `role = 'admin'` in the profiles table

If the admin user doesn't have a password or forgot it:
1. **Via App**: Go to `/login` → Click "Forgot Password?"
2. **Via Supabase Dashboard**: Authentication → Users → Find user → "Reset Password"
3. **Create new admin**: Dashboard → Authentication → Users → "Add User"

See `ADMIN_PASSWORD_GUIDE.md` for detailed password management instructions.

### Step 3: Verify Admin Role

Run this query to see all admins:
```sql
SELECT id, email, full_name, role, created_at
FROM public.profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;
```

## How It Works

1. **Authentication**: User must be logged in
2. **Role Check**: System checks if `userProfile.role === 'admin'`
3. **Access Control**: 
   - ✅ Admin users → Can access `/admin`
   - ❌ Regular users → Redirected to `/home`
   - ❌ Not logged in → Redirected to `/login`

## Code Implementation

### AuthContext
- Fetches user profile including `role` field
- Provides `isAdmin` boolean for easy checks
- Provides `userProfile` object with full profile data

### AdminProtectedRoute
- Checks authentication
- Waits for profile to load
- Verifies admin role
- Redirects non-admins to `/home`

## Testing

1. **As Admin User**:
   - Login with admin credentials
   - Navigate to `/admin`
   - Should see admin dashboard

2. **As Regular User**:
   - Login with regular user credentials
   - Navigate to `/admin`
   - Should be redirected to `/home`

3. **Not Logged In**:
   - Navigate to `/admin`
   - Should be redirected to `/login`

## Troubleshooting

### User can't access admin dashboard

1. **Check if role is set correctly**:
   ```sql
   SELECT email, role FROM public.profiles WHERE email = 'user@example.com';
   ```

2. **Verify user is logged in**: Check browser console for auth errors

3. **Clear cache and reload**: User may need to log out and log back in after role change

4. **Check profile exists**: Ensure user has a profile record in the `profiles` table

### Profile not loading

- Check Supabase connection
- Verify RLS (Row Level Security) policies allow profile reads
- Check browser console for errors

## Security Notes

- Role is stored in the `profiles` table, not in auth metadata
- Only users with `role = 'admin'` can access admin routes
- Regular users are automatically redirected away from admin routes
- Always verify admin status server-side for sensitive operations

## Future Enhancements

- Add more roles (e.g., `moderator`, `support`)
- Implement role-based permissions for different admin features
- Add admin role management UI (for super admins only)
