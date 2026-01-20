# Admin Password Management Guide

This guide explains how passwords work for admin users in GOGOBUS.

## Password Overview

**Important**: Passwords are handled by Supabase Auth, not by your database. The `profiles` table stores user roles, but passwords are managed separately through Supabase's authentication system.

## Password Requirements

### Sign Up (New Users)
- **Minimum Length**: 8 characters
- **No other restrictions** (enforced by Supabase)
- Password strength indicator shown during signup

### Login
- **Minimum Length**: 6 characters (client-side validation)
- Must match the password set during signup

## Password Management Options

### Option 1: Admin Sets Password During Signup

When an admin user signs up, they set their password during registration:
1. Go to `/signup`
2. Enter email: `georgymonie0@gmail.com` (or your admin email)
3. Set password (minimum 8 characters)
4. Complete signup
5. After signup, grant admin role using SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'georgymonie0@gmail.com';
   ```

### Option 2: Reset Password (For Existing Users)

If the admin user already exists but forgot their password:

1. **Via UI**:
   - Go to `/login`
   - Click "Forgot Password?"
   - Enter admin email
   - Check email for reset link
   - Set new password

2. **Via Supabase Dashboard** (Admin):
   - Go to Supabase Dashboard → Authentication → Users
   - Find the user by email
   - Click "Reset Password" or "Send Password Reset Email"

3. **Programmatically** (for system admins):
   ```javascript
   // In Supabase SQL Editor or via API
   -- Supabase doesn't allow direct password reset via SQL
   -- Must use Supabase Dashboard or API
   ```

### Option 3: Create Admin User via Supabase Dashboard

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add User"** → **"Create New User"**
3. Enter:
   - Email: `georgymonie0@gmail.com`
   - Password: (set a strong password)
   - Auto Confirm User: ✅ (if you want to skip email verification)
4. Click **"Create User"**
5. Grant admin role via SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'georgymonie0@gmail.com';
   ```

### Option 4: Use OAuth/Social Login

Admin users can also use social login (Google, Facebook, Apple):
1. Admin signs up/logs in via social provider
2. Profile is created automatically
3. Grant admin role via SQL:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'georgymonie0@gmail.com';
   ```

## Changing Admin Password

### For Admin Users (Self-Service)

1. **Through App**:
   - Login to admin dashboard (`/admin`)
   - Navigate to Settings (if implemented)
   - Change password feature

2. **Through Supabase**:
   - Go to `/login` → "Forgot Password?"
   - Or use Supabase Dashboard → Users → Reset Password

### For System Admins (Supabase Dashboard)

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find admin user
3. Click on user → **"Update Password"** or **"Send Password Reset Email"**

## Security Best Practices

1. **Strong Passwords**: 
   - Use at least 12+ characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Don't reuse passwords from other services

2. **Password Storage**:
   - ✅ Passwords are **hashed** by Supabase (bcrypt)
   - ✅ Never stored in plain text
   - ✅ Never in `profiles` table
   - ✅ Only in Supabase Auth system

3. **Password Reset**:
   - Reset links expire after a set time
   - Only accessible via email
   - One-time use links

4. **Admin Access**:
   - Admin role (`role = 'admin'`) is separate from password
   - Password is for authentication
   - Role is for authorization (access control)

## Troubleshooting

### Admin Can't Login

1. **Check email exists**:
   ```sql
   SELECT email, role FROM public.profiles WHERE email = 'georgymonie0@gmail.com';
   ```

2. **Check Supabase Auth**:
   - Go to Supabase Dashboard → Authentication → Users
   - Verify user exists
   - Check if email is confirmed

3. **Reset Password**:
   - Use "Forgot Password" on login page
   - Or reset via Supabase Dashboard

### Password Not Accepted

- Check minimum length requirements (8 chars for signup, 6 for login)
- Ensure no extra spaces
- Try resetting password

### Email Not Confirmed

If email confirmation is required:
1. Check email inbox (including spam)
2. Resend confirmation email via Supabase Dashboard
3. Or disable email confirmation in Supabase Settings

## Code Implementation

### Current Password Validation

**Sign Up** (`src/pages/auth/SignUp.jsx`):
```javascript
if (password.length < 8) {
  setError('Password must be at least 8 characters');
  return;
}
```

**Login** (`src/pages/auth/Login.jsx`):
```javascript
if (password.length < 6) {
  setError('Password must be at least 6 characters');
  return;
}
```

### Password Reset Flow

1. User clicks "Forgot Password" → `/login`
2. Calls `authService.resetPassword(email)` → Sends reset email
3. User clicks link in email → Redirects to `/reset-password`
4. User sets new password → Calls `authService.updatePassword(newPassword)`
5. User redirected to login

## Summary

- **Passwords** = Authentication (who you are)
- **Roles** = Authorization (what you can do)
- Passwords managed by Supabase Auth (hashed, secure)
- Roles stored in `profiles.role` column
- Admin access requires: ✅ Valid password + ✅ `role = 'admin'`

## Quick Setup for New Admin

1. User signs up at `/signup` OR create via Supabase Dashboard
2. Set strong password (8+ characters)
3. Run SQL to grant admin role:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```
4. User can now login and access `/admin` dashboard
