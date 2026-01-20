# GOGOBUS - Application Layout Documentation

## Overview

GOGOBUS is a mobile-first bus booking application built as a Progressive Web App (PWA). The app provides a seamless user experience for booking bus tickets, tracking trips, and managing user accounts.

**Primary Entry Point:** `index.html`

---

## File Structure

```
gogobus/
├── index.html              # Main application HTML (single-page app)
├── index2.html             # Duplicate/backup of index.html
├── app.js                  # Core navigation and screen management
├── auth.js                 # Authentication logic (login, signup, profile)
├── script.js               # Additional scripts (if any)
├── supabase-config.js      # Supabase backend configuration
├── styles.css              # Main application styles
├── auth.css                # Authentication screen styles
├── onboarding.css          # Onboarding screen styles
├── images/
│   └── bus.jpg             # Bus illustration image
├── reset-password/
│   └── index.html          # Password reset page
├── README.md               # Project documentation
├── MVP_SETUP.md            # MVP setup instructions
└── PROGRESS(2).md          # Development progress tracking
```

---

## Screen Flow & Navigation

The app uses a **single-page application (SPA)** architecture with screen-based navigation. All screens are defined in `index.html` and shown/hidden via JavaScript.

### Screen Sequence

1. **Splash Screen** (`splash-screen`)
   - Logo animation
   - Auto-transitions after 2.5 seconds
   - Checks localStorage for onboarding completion

2. **Onboarding Screens** (3 screens)
   - **Screen 1** (`onboarding-1`): Ticket booking feature showcase
   - **Screen 2** (`onboarding-2`): Bonus/rewards system showcase
   - **Screen 3** (`onboarding-3`): Live tracking feature showcase
   - Swipeable navigation (left/right)
   - Keyboard navigation support (arrow keys)

3. **Get Started Screen** (`get-started`)
   - Welcome message
   - Login button
   - Social login options (Google, Facebook, Apple, Email)

4. **Login Screen** (`login`)
   - Email/password form
   - Forgot password link
   - Social login options
   - Link to signup

5. **Sign Up Screen** (`signup`)
   - Full name, email, phone, password
   - Phone number with Botswana country code (+267)
   - Password strength indicator
   - Link to login

6. **Email Verification Screen** (`otp-verification`)
   - Magic link sent confirmation
   - Email display
   - Resend email button

7. **Complete Profile Screen** (`complete-profile`)
   - Avatar upload
   - Personal information form
   - Province and city selection (Botswana-specific)
   - Pre-filled with signup data

8. **Success Modal** (`success-modal`)
   - Welcome message
   - Redirects to home

9. **Home Screen** (`home`)
   - Placeholder screen
   - Logout button
   - *Note: Main functionality to be implemented*

---

## Key Features

### 1. Authentication System
- **Email/Password Authentication**: Traditional login/signup
- **Magic Link Authentication**: Passwordless email verification
- **Social Login**: Google, Facebook, Apple OAuth
- **Password Reset**: Email-based password recovery
- **Session Management**: Persistent sessions via Supabase

### 2. User Profile Management
- Profile completion flow
- Avatar upload support
- Location data (Province/City) for Botswana
- Phone number with country code

### 3. Navigation Features
- **Swipe Gestures**: Left/right swipe on onboarding screens
- **Keyboard Navigation**: Arrow keys for desktop testing
- **Screen Transitions**: Smooth slide animations
- **Progress Persistence**: Remembers last screen via localStorage

### 4. UI/UX Features
- **Toast Notifications**: User feedback messages
- **Loading States**: Button loading indicators
- **Form Validation**: Real-time input validation
- **Password Toggle**: Show/hide password functionality
- **Responsive Design**: Mobile-first approach

---

## Technical Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom styling with CSS variables
- **Vanilla JavaScript**: No framework dependencies
- **Font**: Plus Jakarta Sans (Google Fonts)

### Backend
- **Supabase**: Backend-as-a-Service
  - Authentication
  - Database (PostgreSQL)
  - Storage (for avatars)
  - Real-time subscriptions

### Libraries
- **Supabase JS Client**: `@supabase/supabase-js@2`

---

## UI Components

### Color Scheme
- **Primary**: `#1B4D4A` (Dark teal/green)
- **Accent**: `#F5A623` (Orange/gold)
- **Background**: Dark theme with primary color
- **Text**: White with varying opacity levels

### Typography
- **Font Family**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700, 800
- **Sizes**: Responsive scaling

### Buttons
- **Primary Button**: Orange accent color, black text
- **Social Buttons**: Icon-based, provider-specific colors
- **Loading State**: Spinner animation

### Forms
- **Input Fields**: Rounded corners, icon support
- **Validation**: Real-time error messages
- **Phone Input**: Country code selector (Botswana +267)

### Modals & Overlays
- **Success Modal**: Centered overlay with message
- **Toast**: Bottom-center notification
- **Screen Overlays**: Full-screen transitions

---

## Authentication Flow

### Sign Up Flow
1. User fills signup form → Data stored in `AuthState.signupData` and localStorage
2. Magic link sent to email → User redirected to `otp-verification` screen
3. User clicks link in email → Supabase handles verification
4. Auth state change detected → User redirected to `complete-profile`
5. User completes profile → Profile saved to Supabase `profiles` table
6. Success modal shown → Redirect to `home`

### Login Flow
1. User enters credentials → Validated client-side
2. Supabase authentication → Session created
3. Profile fetched → User data loaded
4. Redirect to `home` screen

### Password Reset Flow
1. User clicks "Forgot Password" → Email entered
2. Reset link sent → User redirected to `/reset-password`
3. User sets new password → Password updated in Supabase
4. Success state shown → Redirect to login

### Social Login Flow
1. User selects provider → OAuth redirect
2. Provider authentication → Callback to app
3. Session created → Profile fetched/created
4. Redirect to `home` or `complete-profile`

---

## Database Schema (Supabase)

### Tables

#### `profiles`
- `id` (UUID, references auth.users)
- `full_name` (text)
- `email` (text)
- `phone` (text)
- `province` (text)
- `city` (text)
- `avatar_url` (text, nullable)

#### `routes` (referenced in code)
- Route information for bus schedules
- Origin/destination cities

#### `schedules` (referenced in code)
- Bus departure times
- Available seats
- Route associations

#### `bookings` (referenced in code)
- User bookings
- Schedule associations
- Status tracking

---

## State Management

### Local Storage Keys
- `gogobus_user`: Current user data (JSON)
- `gogobus_signupData`: Temporary signup data (JSON)
- `gogobus_onboarding_complete`: Boolean flag
- `gogobus_last_screen`: Last visited screen ID

### JavaScript State Objects

#### `App` (app.js)
```javascript
{
  currentScreen: 'splash-screen',
  screens: [...],
  onboardingScreens: [...],
  touchStartX: 0,
  touchEndX: 0,
  minSwipeDistance: 50,
  isTransitioning: false
}
```

#### `AuthState` (auth.js)
```javascript
{
  user: null,
  signupData: {}
}
```

---

## Supabase Integration

### Auth Helpers (`SupabaseAuth`)
- `signUp()`: Email/password registration
- `signIn()`: Email/password login
- `signInWithProvider()`: OAuth login
- `signOut()`: Logout
- `getSession()`: Get current session
- `sendOTP()`: Send magic link
- `resetPassword()`: Send reset email
- `updatePassword()`: Update password
- `onAuthStateChange()`: Listen to auth events

### Profile Helpers (`SupabaseProfile`)
- `getProfile()`: Fetch user profile
- `updateProfile()`: Update/create profile
- `uploadAvatar()`: Upload avatar image

### Booking Helpers (`SupabaseBookings`)
- `searchSchedules()`: Search available trips
- `createBooking()`: Create new booking
- `getUserBookings()`: Get user's bookings
- `cancelBooking()`: Cancel booking

### Routes Helpers (`SupabaseRoutes`)
- `getRoutes()`: Get all active routes
- `getCities()`: Get unique cities list

---

## Screen Details

### Splash Screen
- **Purpose**: Initial loading/branding
- **Duration**: 2.5 seconds
- **Auto-navigation**: 
  - If onboarding complete → `get-started`
  - If last screen saved → Resume from there
  - Otherwise → `onboarding-1`

### Onboarding Screens
- **Purpose**: Feature introduction
- **Navigation**: 
  - Swipe left/right
  - Arrow keys (desktop)
  - Indicator dots (clickable)
  - "Get Started" button
- **Content**: 
  - Screen 1: Ticket booking
  - Screen 2: Bonus system
  - Screen 3: Live tracking

### Get Started Screen
- **Purpose**: Entry point for authentication
- **Actions**: 
  - Login button → `login`
  - Social login buttons
  - Signup link → `signup`

### Login Screen
- **Form Fields**: Email, Password
- **Features**: 
  - Password visibility toggle
  - Forgot password link
  - Social login options
  - Link to signup

### Sign Up Screen
- **Form Fields**: Full Name, Email, Phone, Password
- **Features**: 
  - Phone with country code
  - Password strength (min 8 chars)
  - Password visibility toggle
  - Link to login

### Email Verification Screen
- **Purpose**: Confirm magic link sent
- **Features**: 
  - Email display
  - Resend link button
  - Instructions text

### Complete Profile Screen
- **Form Fields**: 
  - Avatar upload
  - Full Name, Email, Phone
  - Province (dropdown)
  - City (dropdown)
- **Features**: 
  - Pre-filled with signup data
  - Avatar preview
  - Light theme styling

### Home Screen
- **Status**: Placeholder
- **Current Content**: 
  - Welcome message
  - Logout button
- **Future**: Main booking interface

---

## Responsive Design

- **Mobile-First**: Designed primarily for mobile devices
- **Viewport**: `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`
- **Touch-Friendly**: Large tap targets, swipe gestures
- **Desktop Support**: Keyboard navigation, mouse interactions

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- PWA support (installable)

---

## Future Development

### Planned Features (from code structure)
- Home screen implementation
- Bus schedule search
- Seat selection
- Booking management
- Payment integration
- Live bus tracking
- Bonus/rewards system

### Database Tables to Implement
- `routes`: Bus routes
- `schedules`: Departure schedules
- `buses`: Bus information
- `companies`: Bus company details
- `bookings`: User bookings
- `payments`: Payment transactions

---

## Notes

- `index.html` and `index2.html` appear to be duplicates
- `script.js` exists but may not be actively used
- Reset password page is in separate directory
- All screens are in single HTML file (SPA architecture)
- Supabase credentials are in `supabase-config.js` (should be secured in production)

---

## Development Status

**Current State**: 
- ✅ Authentication flow complete
- ✅ Onboarding screens complete
- ✅ Profile management complete
- ⏳ Home screen (placeholder)
- ⏳ Booking functionality (not implemented)
- ⏳ Payment system (not implemented)
- ⏳ Live tracking (not implemented)

**Last Updated**: Based on current codebase structure
