# GOGOBUS - Project Documentation

> A modern bus booking mobile application for Botswana, built with React and designed for seamless travel experiences.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Project Structure](#project-structure)
5. [Components](#components)
6. [Pages](#pages)
7. [Context & State Management](#context--state-management)
8. [Services](#services)
9. [Styling Guidelines](#styling-guidelines)
10. [Animation Patterns](#animation-patterns)
11. [Development Guidelines](#development-guidelines)
12. [Deployment](#deployment)
13. [MVP Analysis](#mvp-analysis)

---

## 🚌 Project Overview

GOGOBUS is a mobile-first bus booking application designed for travelers in Botswana. The app allows users to:

- Search for bus routes between cities
- Select seats and book tickets
- Make secure payments
- View and manage bookings
- Access digital tickets with QR codes

### Key Features

- **User Authentication** - Email/password and social login (Google, Facebook, Apple)
- **Route Search** - Find buses by origin, destination, and date
- **Seat Selection** - Interactive seat map for choosing preferred seats
- **Secure Payments** - Integration with local payment methods
- **Digital Tickets** - QR code tickets for contactless boarding
- **Real-time Updates** - Live bus tracking and notifications
- **Offline Support** - View booked tickets without internet
- **Admin Dashboard** - Comprehensive admin panel for managing trips, routes, bookings, and settings

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation and routing
- **CSS Modules** - Scoped styling
- **Vite** - Build tool and dev server
- **Supabase** - Backend as a Service (Auth, Database, Storage)

### Fonts
- **Plus Jakarta Sans** - Primary font family (weights: 400, 500, 600, 700, 800)

### Icons
- **react-icons** - Icon library (react-icons v4.12.0)
- Custom SVG icons (inline) - Used where needed

### Build Tools
- **Vite 5.0** - Build tool and dev server
- ESLint - Code linting

---

## 🎨 Design System

### Color Palette

```css
/* Primary Colors */
--color-primary: #1B4D4A;        /* Teal - Main brand color */
--color-primary-dark: #153D3A;   /* Dark teal - Hover states */
--color-primary-light: #0F2D2B;  /* Darker teal - Backgrounds */

/* Accent Colors */
--color-accent: #F5A623;         /* Gold/Orange - CTAs, highlights */
--color-accent-dark: #E8941F;    /* Dark gold - Hover states */

/* Semantic Colors */
--color-success: #22C55E;        /* Green - Success states */
--color-error: #DC2626;          /* Red - Error states */
--color-warning: #F59E0B;        /* Amber - Warning states */
--color-info: #3B82F6;           /* Blue - Info states */

/* Neutral Colors */
--color-white: #FFFFFF;
--color-gray-50: #F8FAFC;
--color-gray-100: #F1F5F9;
--color-gray-200: #E2E8F0;
--color-gray-300: #CBD5E1;
--color-gray-400: #94A3B8;
--color-gray-500: #64748B;
--color-gray-600: #475569;
--color-gray-700: #334155;
--color-gray-800: #1E293B;
--color-gray-900: #0F172A;

/* Text Colors */
--color-text-primary: #1A1A1A;
--color-text-secondary: #64748B;
--color-text-muted: #94A3B8;
```

### Typography

```css
/* Font Family */
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.75rem;   /* 28px */
--text-4xl: 2rem;      /* 32px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Spacing

```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 6px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 14px;
--radius-2xl: 16px;
--radius-3xl: 20px;
--radius-4xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
/* Shadow Scale */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 8px 30px rgba(0, 0, 0, 0.12);
--shadow-2xl: 0 25px 60px rgba(0, 0, 0, 0.15);

/* Colored Shadows */
--shadow-primary: 0 4px 15px rgba(27, 77, 74, 0.3);
--shadow-accent: 0 4px 15px rgba(245, 166, 35, 0.3);
--shadow-success: 0 4px 15px rgba(34, 197, 94, 0.3);
```

---

## 📁 Project Structure

```
gogobus/
├── public/
│   ├── images/
│   │   └── bus.jpg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AvatarUpload.jsx
│   │   │   ├── AvatarUpload.module.css
│   │   │   ├── PasswordStrengthIndicator.jsx
│   │   │   ├── PasswordStrengthIndicator.module.css
│   │   │   ├── SocialLoginButton.jsx
│   │   │   └── SocialLoginButton.module.css
│   │   ├── booking/
│   │   │   ├── PassengerForm.jsx
│   │   │   ├── PassengerForm.module.css
│   │   │   ├── PaymentMethod.jsx
│   │   │   ├── PaymentMethod.module.css
│   │   │   ├── PriceBreakdown.jsx
│   │   │   ├── PriceBreakdown.module.css
│   │   │   ├── QRCodeDisplay.jsx
│   │   │   ├── QRCodeDisplay.module.css
│   │   │   ├── Seat.jsx
│   │   │   ├── Seat.module.css
│   │   │   ├── SeatMap.jsx
│   │   │   └── SeatMap.module.css
│   │   ├── common/
│   │   │   ├── Breadcrumbs.jsx
│   │   │   ├── Breadcrumbs.module.css
│   │   │   ├── Button.jsx
│   │   │   ├── Button.module.css
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── ErrorBoundary.module.css
│   │   │   ├── Input.jsx
│   │   │   ├── Input.module.css
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── LoadingSpinner.module.css
│   │   │   ├── Modal.jsx
│   │   │   ├── Modal.module.css
│   │   │   └── ProtectedRoute.jsx
│   │   ├── features/
│   │   │   (Empty - reserved for feature-specific components)
│   │   ├── home/
│   │   │   ├── PopularRoutes.jsx
│   │   │   ├── PopularRoutes.module.css
│   │   │   ├── SearchForm.jsx
│   │   │   └── SearchForm.module.css
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── AppLayout.module.css
│   │   │   ├── Footer.jsx
│   │   │   ├── Footer.module.css
│   │   │   ├── Header.jsx
│   │   │   └── Header.module.css
│   │   ├── profile/
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ProfileHeader.module.css
│   │   │   ├── ProfileMenu.jsx
│   │   │   └── ProfileMenu.module.css
│   │   ├── routing/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminProtectedRoute.jsx
│   │   ├── search/
│   │   │   ├── BusCard.jsx
│   │   │   ├── BusCard.module.css
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── FilterPanel.module.css
│   │   │   ├── SortOptions.jsx
│   │   │   └── SortOptions.module.css
│   │   └── tickets/
│   │       ├── TicketCard.jsx
│   │       ├── TicketCard.module.css
│   │       ├── TicketDownload.jsx
│   │       ├── TicketDownload.module.css
│   │       ├── TicketTabs.jsx
│   │       └── TicketTabs.module.css
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── BookingContext.jsx
│   │   ├── SearchContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   (Empty - custom hooks can be added here)
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminDashboard.module.css
│   │   │   ├── QRScanner.jsx
│   │   │   └── QRScanner.module.css
│   │   ├── auth/
│   │   │   ├── Auth.module.css
│   │   │   ├── CompleteProfile.jsx
│   │   │   ├── CompleteProfile.module.css
│   │   │   ├── GetStarted.jsx
│   │   │   ├── GetStarted.module.css
│   │   │   ├── Login.jsx
│   │   │   ├── OTPVerification.jsx
│   │   │   └── SignUp.jsx
│   │   ├── booking/
│   │   │   ├── Booking.module.css
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── BookingSummary.jsx
│   │   │   ├── PassengerDetails.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Payment.module.css
│   │   │   ├── PaymentConfirmation.jsx
│   │   │   ├── PaymentConfirmation.module.css
│   │   │   └── SeatSelection.jsx
│   │   ├── home/
│   │   │   ├── Home.jsx
│   │   │   └── Home.module.css
│   │   ├── onboarding/
│   │   │   ├── OnboardingFlow.jsx
│   │   │   ├── OnboardingFlow.module.css
│   │   │   ├── OnboardingStep.module.css
│   │   │   ├── OnboardingStep1.jsx
│   │   │   ├── OnboardingStep2.jsx
│   │   │   └── OnboardingStep3.jsx
│   │   ├── partner/
│   │   │   ├── BecomePartner.jsx
│   │   │   └── BecomePartner.module.css
│   │   ├── payments/
│   │   │   (Empty - payment pages can be added here)
│   │   ├── profile/
│   │   │   ├── EditProfile.jsx
│   │   │   ├── EmergencyContacts.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Profile.module.css
│   │   │   ├── ProfilePages.module.css
│   │   │   ├── Rewards.jsx
│   │   │   ├── SavedRoutes.jsx
│   │   │   ├── Settings.jsx
│   │   │   ├── TravelPreferences.jsx
│   │   │   └── Wallet.jsx
│   │   ├── search/
│   │   │   ├── SearchResults.jsx
│   │   │   └── SearchResults.module.css
│   │   ├── tickets/
│   │   │   ├── MyTickets.jsx
│   │   │   ├── MyTickets.module.css
│   │   │   ├── TicketView.jsx
│   │   │   └── TicketView.module.css
│   │   ├── help/
│   │   │   ├── Help.jsx
│   │   │   └── Help.module.css
│   │   ├── Splash.jsx
│   │   └── Splash.module.css
│   ├── services/
│   │   ├── adminService.js
│   │   ├── authService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   ├── profileService.js
│   │   ├── routeService.js
│   │   ├── supabase.js
│   │   └── ticketService.js
│   ├── styles/
│   │   └── global.css
│   ├── utils/
│   │   └── pricing.js
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   ├── 002_payments_schema.sql
│   ├── add-user-role.sql
│   ├── check-and-create-admin.sql
│   ├── check-imports.js
│   ├── complete-ts-migration.js
│   ├── fix-admin-role-now.sql
│   ├── generate_ticket.py
│   ├── PaymentConfirmation.jsx
│   ├── PaymentConfirmation.module.css
│   ├── README.md
│   ├── seed-data.sql
│   └── set-admin-role.sql
├── components/ (legacy - old components, not used in src/)
│   ├── Breadcrumbs.jsx
│   └── Modal.jsx
├── images/
│   └── bus.jpg
├── reset-password/
│   └── index.html
├── vite.config.js
├── package.json
├── package-lock.json
├── supabase-config.js
├── index.html
├── index2.html
├── app.js
├── auth.js
├── auth.css
├── script.js
├── styles.css
├── onboarding.css
├── SearchResults.jsx (legacy - use src/pages/search/SearchResults.jsx)
├── SearchResults.module.css (legacy)
├── SeatSelection.jsx (legacy - use src/pages/booking/SeatSelection.jsx)
├── SeatSelection.module.css (legacy)
├── QRScanner.jsx (legacy - use src/pages/admin/QRScanner.jsx)
├── claude.md
├── ADMIN_SETUP.md
├── ADMIN_PASSWORD_GUIDE.md
├── ADMIN_DEBUG.md
├── APP_LAYOUT.md
├── CODING_STANDARDS.md
├── MVP_SETUP.md
├── PR_REVIEW.md
├── PROGRESS(2).md
├── README.md
├── README-ENV.md
├── README-REACT-SETUP.md
├── README-REACT.md
├── REACT_MIGRATION.md
└── SETUP.md
```

---

## 🧩 Components

### Common Components

#### Button
```jsx
<Button 
  variant="primary" | "outline" | "ghost"
  size="small" | "medium" | "large"
  disabled={false}
  loading={false}
  onClick={handleClick}
>
  Button Text
</Button>
```

#### Input
```jsx
<Input
  type="text" | "email" | "password" | "tel"
  label="Field Label"
  placeholder="Placeholder text"
  value={value}
  onChange={handleChange}
  error="Error message"
  required
/>
```

#### LoadingSpinner
```jsx
<LoadingSpinner size="small" | "medium" | "large" />
```

#### Modal
```jsx
<Modal 
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
>
  Modal Content
</Modal>
```

#### ErrorBoundary
```jsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

#### Breadcrumbs
```jsx
<Breadcrumbs items={[
  { label: 'Home', path: '/home' },
  { label: 'Search', path: '/search' }
]} />
```

### Auth Components

#### SocialLoginButton
```jsx
<SocialLoginButton 
  provider="google" | "facebook" | "apple"
  onClick={handleSocialLogin}
/>
```

#### AvatarUpload
```jsx
<AvatarUpload onAvatarChange={setAvatar} />
```

#### PasswordStrengthIndicator
```jsx
<PasswordStrengthIndicator password={password} />
```

### Booking Components

#### SeatMap
```jsx
<SeatMap 
  seats={seats}
  selectedSeats={selectedSeats}
  onSeatSelect={handleSeatSelect}
/>
```

#### Seat
```jsx
<Seat 
  seat={seatData}
  isSelected={isSelected}
  isOccupied={isOccupied}
  onClick={handleClick}
/>
```

#### QRCodeDisplay
```jsx
<QRCodeDisplay ticketId={ticketId} />
```

#### PassengerForm
```jsx
<PassengerForm 
  onSubmit={handleSubmit}
  initialData={passengerData}
/>
```

#### PaymentMethod
```jsx
<PaymentMethod 
  selectedMethod={method}
  onMethodChange={handleChange}
/>
```

#### PriceBreakdown
```jsx
<PriceBreakdown 
  basePrice={100}
  seatCount={2}
  fees={10}
  total={210}
/>
```

### Search Components

#### BusCard
```jsx
<BusCard 
  bus={busData}
  onSelect={handleSelect}
/>
```

#### FilterPanel
```jsx
<FilterPanel 
  filters={filters}
  onFilterChange={handleChange}
/>
```

#### SortOptions
```jsx
<SortOptions 
  sortBy={sortBy}
  onSortChange={handleChange}
/>
```

### Ticket Components

#### TicketCard
```jsx
<TicketCard 
  ticket={ticketData}
  onClick={handleClick}
/>
```

#### TicketTabs
```jsx
<TicketTabs 
  activeTab={activeTab}
  onTabChange={handleChange}
/>
```

#### TicketDownload
```jsx
<TicketDownload 
  ticket={ticketData}
  onDownload={handleDownload}
/>
```
- Features: Download ticket as PDF/image
- Formats: PDF, PNG, JPEG
- Includes QR code and ticket details

### Layout Components

#### AppLayout
```jsx
<AppLayout>
  <YourPageContent />
</AppLayout>
```

#### Header
```jsx
<Header title="Page Title" />
```

#### Footer
```jsx
<Footer />
```

### Profile Components

#### ProfileHeader
```jsx
<ProfileHeader user={userData} />
```

#### ProfileMenu
```jsx
<ProfileMenu 
  items={menuItems}
  onItemClick={handleClick}
/>
```

### Home Components

#### SearchForm
```jsx
<SearchForm 
  onSearch={handleSearch}
/>
```
- Features: Origin/destination selection, date picker, passenger count
- Responsive: Stacks vertically on mobile devices
- Validation: Ensures origin and destination are different

#### PopularRoutes
```jsx
<PopularRoutes 
  onRouteSelect={handleRouteSelect}
  loading={externalLoading}
/>
```
- Features: Displays popular routes with prices
- States: Loading skeleton, empty state, route cards
- Interactions: Click to search for route

---

## 📄 Pages

### Authentication Flow
1. **Splash** - Initial splash screen
2. **OnboardingFlow** - Multi-step onboarding (OnboardingStep1, OnboardingStep2, OnboardingStep3)
3. **GetStarted** - Welcome screen with login/signup options
4. **Login** - Email/password login with social options
5. **SignUp** - User registration
6. **OTPVerification** - OTP verification step
7. **CompleteProfile** - Profile completion (name, location, avatar)

### Main App Flow
1. **Home** - Dashboard with search, quick actions, promos
   - Quick Actions: My Tickets, History (past tickets), Favorites (saved routes), Help
   - Promotional banner carousel with auto-rotation
   - Popular routes section with loading states
   - Search form with origin/destination selection
2. **SearchResults** - List of available routes
   - Displays search results with filters and sorting
   - Bus cards with route details, pricing, and availability
3. **SeatSelection** - Interactive seat map
   - Visual seat selection interface
   - Real-time seat availability
   - Multiple seat selection support
4. **PassengerDetails** - Enter passenger information
   - Form for passenger details
   - Validation and error handling
5. **BookingSummary** - Review booking details
   - Complete booking overview
   - Price breakdown
   - Edit options before payment
6. **Payment** - Payment method selection
   - Multiple payment options
   - Secure payment processing
7. **PaymentConfirmation** - Payment processing confirmation
   - Payment status display
   - Transaction details
8. **BookingConfirmation** - Success screen with QR ticket
   - Booking confirmation details
   - QR code for ticket verification
   - Download and share options

### Tickets
1. **MyTickets** - List of booked tickets
   - Tabs: Upcoming and Past tickets
   - Supports URL query parameter `?tab=past` for direct navigation to past tickets
   - Loading states and empty states
2. **TicketView** - Individual ticket details with QR code

### Profile
1. **Profile** - Main profile page with sub-routes
   - **EditProfile** - Edit user information
   - **Settings** - App settings
   - **TravelPreferences** - Travel preferences
   - **EmergencyContacts** - Manage emergency contacts
   - **SavedRoutes** - Saved/favorite routes
   - **Wallet** - Payment methods and wallet
   - **Rewards** - Rewards and loyalty points

### Help & Support
1. **Help** - Help and support page
   - Contact information (phone, email, live chat)
   - Frequently asked questions (FAQs)
   - Support hours and availability

### Partner
1. **BecomePartner** - Partner registration page
   - Information about becoming a bus operator partner
   - Partner registration form
   - Benefits and requirements

### Admin Dashboard
1. **AdminDashboard** - Comprehensive admin management panel (admin-only)
   - **Dashboard Overview**: Statistics cards (bookings, revenue, trips, routes), upcoming trips table, popular routes visualization, recent bookings
   - **Trip Management**: Create, edit, delete trips; filter by status (active, full, departed); manage departure times, prices, and seat availability
   - **Routes Management**: Add/edit/delete city-to-city routes; set distance, duration, and base pricing
   - **Bookings Overview**: View all passenger bookings; filter by trip and payment status; mark passengers as boarded; export bookings to CSV
   - **Settings**: Company information management; support contact details; toggle switches for bookings, notifications, auto-confirm
   - **Access Control**: Protected by `AdminProtectedRoute` - only users with `role = 'admin'` can access
   - **Features**: Mobile-responsive sidebar, toast notifications, modal forms, smooth animations, consistent GOGOBUS branding

2. **QRScanner** - QR code scanner for ticket verification (admin-only)
   - Scan QR codes from digital tickets
   - Verify ticket validity
   - Mark passengers as boarded
   - Accessible at `/admin/scanner`

---

## 🧭 Routing & Navigation

### Route Structure
```
/                           → Splash screen
/onboarding                 → Onboarding flow
/get-started                → Welcome/authentication entry
/login                      → Login page
/signup                     → Registration page
/otp-verification           → OTP verification
/complete-profile           → Profile completion (protected)
/become-partner             → Partner registration (public)
/home                       → Home dashboard (protected)
/search                     → Search results (protected)
/booking/seat-selection     → Seat selection (protected)
/booking/passenger-details  → Passenger details (protected)
/booking/summary            → Booking summary (protected)
/booking/payment            → Payment page (protected)
/booking/payment-confirmation → Payment confirmation (protected)
/booking/confirmation       → Booking confirmation (protected)
/tickets                    → My Tickets (protected)
/tickets?tab=past           → My Tickets - Past tab (protected)
/tickets/:id                → Individual ticket view (protected)
/profile                    → Profile main page (protected)
/profile/edit               → Edit profile (protected)
/profile/saved-routes       → Saved routes (protected)
/profile/settings           → Settings (protected)
/profile/rewards            → Rewards (protected)
/profile/wallet             → Wallet (protected)
/profile/travel-preferences → Travel preferences (protected)
/profile/emergency-contacts → Emergency contacts (protected)
/help                       → Help & Support (protected)
/admin                      → Admin Dashboard (admin-only, protected)
/admin/scanner              → QR Scanner (admin-only, protected)
/admin/*                    → Admin Dashboard routes (admin-only, protected)
```

### Quick Action Navigation (Home Page)
The Home page includes quick action buttons that navigate to:
- **My Tickets** → `/tickets` - View all tickets
- **History** → `/tickets?tab=past` - View past tickets (opens past tab)
- **Favorites** → `/profile/saved-routes` - View saved routes
- **Help** → `/help` - Help & support page

### Navigation Patterns
- Use `useNavigate()` hook from `react-router-dom` for programmatic navigation
- Query parameters for tab state: `/tickets?tab=past`
- Nested routes for profile sections: `/profile/*`
- Protected routes require authentication via `ProtectedRoute` component
- Admin routes require authentication AND admin role via `AdminProtectedRoute` component
- Admin users are automatically redirected to `/admin` after login

---

## 🔄 Context & State Management

### AuthContext
```jsx
const { 
  user,           // Current user object
  userProfile,    // User profile from profiles table (includes role)
  login,          // Email/password login
  signup,         // User registration
  logout,         // Sign out
  signInWithProvider,  // Social login
  loading,        // Auth loading state
  isAuthenticated, // Boolean: true if user is logged in
  isAdmin,        // Boolean: true if user has admin role
} = useAuth();
```

### BookingContext
```jsx
const {
  booking,        // Current booking
  selectedRoute,  // Selected route details
  selectedSeats,  // Array of selected seat IDs
  passengerDetails, // Passenger information
  updateBooking,  // Update booking state
  clearBooking,   // Reset booking
} = useBooking();
```

### SearchContext
```jsx
const {
  searchParams,   // Current search parameters
  updateSearchParams,  // Update search
  clearSearch,    // Reset search
} = useSearch();
```

### ThemeContext
```jsx
const {
  theme,          // Current theme ('light' | 'dark')
  toggleTheme,    // Toggle between light/dark
  isDark,         // Boolean indicating dark mode
} = useTheme();
```

---

## 🔌 Services

### authService
```javascript
authService.login(email, password)
authService.signup(email, password)
authService.logout()
authService.signInWithProvider(provider)
authService.resetPassword(email)
```

### routeService
```javascript
routeService.searchRoutes(origin, destination, date)
routeService.getRouteDetails(routeId)
routeService.getPopularRoutes()
routeService.getAvailableSeats(routeId)
```

### bookingService
```javascript
bookingService.createBooking(bookingData)
bookingService.getBooking(bookingId)
bookingService.getUserBookings(userId)
bookingService.cancelBooking(bookingId)
```

### paymentService
```javascript
paymentService.processPayment(paymentData)
paymentService.getPaymentMethods()
paymentService.getPaymentHistory(userId)
paymentService.refundPayment(paymentId)
```

### ticketService
```javascript
ticketService.getTicket(ticketId)
ticketService.getUserTickets(userId)
ticketService.downloadTicket(ticketId, format)
ticketService.validateTicket(ticketId, qrCode)
```

### adminService
```javascript
adminService.getDashboardStats()
adminService.getTrips(filters)
adminService.createTrip(tripData)
adminService.updateTrip(tripId, tripData)
adminService.deleteTrip(tripId)
adminService.getRoutes()
adminService.createRoute(routeData)
adminService.updateRoute(routeId, routeData)
adminService.deleteRoute(routeId)
adminService.getBookings(filters)
adminService.updateBookingStatus(bookingId, status)
adminService.exportBookings(filters)
adminService.getSettings()
adminService.updateSettings(settings)
```

### profileService
```javascript
profileService.getProfile(userId)
profileService.updateProfile(userId, data)
profileService.uploadAvatar(userId, file)
```

### Admin Features
- **Role-Based Access Control**: Users have a `role` field in `profiles` table (`'user'` or `'admin'`)
- **Admin Route Protection**: `AdminProtectedRoute` component checks for admin role before allowing access
- **Automatic Redirect**: Admin users are redirected to `/admin` after login
- **Profile Loading**: User profile (including role) is fetched automatically on login

### supabase.js
```javascript
// Supabase client configuration and initialization
// Exports configured Supabase client instance
```

---

## 🎨 Styling Guidelines

### CSS Module Naming
```css
/* Use camelCase for class names */
.componentName { }
.componentNameHeader { }
.componentNameTitle { }
.componentNameButton { }

/* State classes */
.isActive { }
.isLoading { }
.isDisabled { }
.hasError { }

/* Variant classes */
.primary { }
.secondary { }
.outline { }
```

### Responsive Breakpoints
```css
/* Mobile first approach */
.component { /* Base mobile styles */ }

@media (min-width: 360px) { /* Small phones */ }
@media (min-width: 480px) { /* Large phones */ }
@media (min-width: 768px) { /* Tablets */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Dark Mode
```css
/* Use :global(.dark-mode) for dark theme overrides */
:global(.dark-mode) .component {
  background: #1E293B;
  color: #F1F5F9;
}
```

---

## ✨ Animation Patterns

### Standard Animations

#### Fade In Up
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.element {
  animation: fadeInUp 0.5s ease forwards;
}
```

#### Staggered Animation
```css
.element:nth-child(1) { animation-delay: 0.1s; }
.element:nth-child(2) { animation-delay: 0.2s; }
.element:nth-child(3) { animation-delay: 0.3s; }
```

#### Scale In (Bounce)
```css
@keyframes scaleIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

#### Shake (Error)
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

### Transition Standards
```css
/* Standard transition */
transition: all 0.3s ease;

/* Smooth spring-like transition */
transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

/* Quick snappy transition */
transition: all 0.2s ease;
```

### Hover Effects
```css
/* Lift effect */
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* Scale effect */
.button:hover {
  transform: scale(1.02);
}

/* Glow effect */
.button:hover {
  box-shadow: 0 0 20px rgba(245, 166, 35, 0.4);
}
```

---

## 📝 Development Guidelines

### Component Structure
```jsx
import React, { useState, useEffect } from 'react';
import styles from './Component.module.css';

const Component = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className={styles.component}>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

### File Naming Conventions
- Components: `PascalCase.jsx`
- Styles: `PascalCase.module.css`
- Utilities: `camelCase.js`
- Constants: `UPPER_SNAKE_CASE`

### Import Order
```jsx
// 1. React and hooks
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useNavigate } from 'react-router-dom';

// 3. Context and hooks
import { useAuth } from '../../context/AuthContext';

// 4. Components
import Button from '../../components/common/Button';

// 5. Services and utilities
import { authService } from '../../services/authService';

// 6. Styles
import styles from './Component.module.css';
```

### Accessibility
- Use semantic HTML elements
- Include `aria-label` for icon buttons
- Ensure proper focus states
- Support keyboard navigation
- Use sufficient color contrast

---

## 🚀 Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_NAME=GOGOBUS
```

### Build Commands
```bash
# Development (runs on port 3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Deployment Platforms
- Vercel (recommended)
- Netlify
- Firebase Hosting

---

## 📚 Resources

### Botswana Locations

#### Provinces
- Central, Ghanzi, Kgalagadi, Kgatleng, Kweneng
- North East, North West, South East, Southern

#### Major Cities
- Gaborone (Capital)
- Francistown
- Maun
- Kasane
- Serowe
- Mahalapye
- Palapye

### Currency
- Botswana Pula (BWP)
- Symbol: P
- Format: P150.00

### Contact
- Support: support@gogobus.co.bw
- Phone: +267 12 345 678

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01 | Initial release |
| 1.1.0 | 2024-02 | Enhanced UI/UX |
| 1.2.0 | 2024-03 | Added dark mode |
| 1.3.0 | 2025-01 | Home page improvements, Help page, navigation fixes |
|         |        | - Added Help & Support page with FAQs and contact info |
|         |        | - Fixed quick action button navigation (My Tickets, History, Favorites, Help) |
|         |        | - Enhanced Home page with improved spacing, shadows, and dividers |
|         |        | - Added loading skeleton states for Popular Routes |
|         |        | - Improved mobile responsiveness (stacked inputs, scrollable quick actions) |
|         |        | - Enhanced animations (banner carousel, icon entrance animations) |
|         |        | - Added empty states for routes and tickets |
|         |        | - MyTickets now supports URL query parameters for tab navigation |
| 1.4.0 | 2025-01 | Admin Dashboard Implementation |
|         |        | - Added comprehensive Admin Dashboard at `/admin` route |
|         |        | - Implemented role-based access control (RBAC) with admin role |
|         |        | - Added AdminProtectedRoute component for admin-only routes |
|         |        | - Admin dashboard features: Dashboard overview, Trip management, Routes management, Bookings overview, Settings |
|         |        | - Enhanced AuthContext to fetch and manage user profiles with roles |
|         |        | - Added automatic admin redirect after login |
|         |        | - Created SQL scripts for admin role setup and management |
|         |        | - Added admin documentation (ADMIN_SETUP.md, ADMIN_PASSWORD_GUIDE.md, ADMIN_DEBUG.md) |
|         |        | - Added QR Scanner page for ticket verification at `/admin/scanner` |
|         |        | - Added PaymentConfirmation page in booking flow |
|         |        | - Added BecomePartner page for partner registration |
|         |        | - Added TicketDownload component for ticket downloads |
|         |        | - Added paymentService and ticketService |
|         |        | - Added adminService for admin operations |
|         |        | - Updated documentation with complete file structure |

---

## 👨‍💻 Development Team

- **Frontend Lead**: Webster
- **Backend Lead**: Samkele
- **Security Lead**: [Your Name]
- **Testing**: Matildah
- **Design**: Team Collaboration

---

*Last updated: January 2025*

---

## 🔐 Admin Dashboard Setup

### Quick Setup Guide

1. **Add Role Column to Database**:
   - Run `scripts/add-user-role.sql` in Supabase SQL Editor
   - This adds the `role` column to the `profiles` table

2. **Grant Admin Access**:
   - Run `scripts/set-admin-role.sql` with the admin user's email
   - Or use `scripts/fix-admin-role-now.sql` for quick setup

3. **Access Dashboard**:
   - Login with admin credentials
   - Automatically redirected to `/admin` or navigate manually

### Admin Features

- **Dashboard**: Overview statistics, upcoming trips, popular routes, recent bookings
- **Trip Management**: Full CRUD operations for bus trips
- **Routes Management**: Manage city-to-city routes with pricing
- **Bookings**: View all bookings, filter, mark as boarded, export CSV
- **Settings**: Configure company info, support contacts, booking settings

### Security

- Admin routes protected by `AdminProtectedRoute` component
- Role checked from `profiles.role` field
- Regular users automatically redirected to `/home`
- Profile fetched securely from Supabase

For detailed setup instructions, see `ADMIN_SETUP.md`
For password management, see `ADMIN_PASSWORD_GUIDE.md`
For troubleshooting, see `ADMIN_DEBUG.md`

---

## 📊 MVP Analysis

### Overview

A comprehensive MVP (Minimum Viable Product) analysis has been conducted to assess the production readiness of GOGOBUS. The analysis evaluates all core features, identifies gaps, and provides recommendations for launch.

**Status:** MVP is **95% production-ready** with critical payment integration pending.

### Quick Assessment

| Category | Status | Score |
|----------|--------|-------|
| **Core Booking Features** | ✅ Complete | 95% |
| **Payment Integration** | ⚠️ API Integration Needed | 60% |
| **User Experience** | ✅ Excellent | 90% |
| **Admin Dashboard** | ✅ Complete | 100% |
| **Security** | ✅ Good | 85% |
| **Testing** | ⚠️ Manual Only | 40% |

**Overall MVP Readiness:** **76% - Production-Ready with Critical Fixes**

### Critical Launch Blockers

1. **Payment Gateway Integration** (🔴 CRITICAL)
   - Payment architecture is complete
   - Real API integration required (DPO Pay, Orange Money)
   - Currently using mocked responses
   - **Estimated Effort:** 2-3 weeks

2. **Testing & Quality Assurance** (🟠 HIGH)
   - Comprehensive testing needed
   - Security audit required
   - Load testing recommended
   - **Estimated Effort:** 2-3 weeks

### Completed MVP Features

✅ **Authentication & Onboarding** - Full user registration, login, profile completion  
✅ **Core Booking Flow** - Search, seat selection, passenger details, confirmation  
✅ **Ticket Management** - Digital tickets with QR codes, PDF generation  
✅ **Admin Dashboard** - Complete management interface for trips, routes, bookings  
✅ **User Profile** - Profile management, settings, saved routes  
✅ **Payment UI** - Payment method selection, confirmation pages  
✅ **Help & Support** - Customer support page  

### Key Recommendations

**Before Launch:**
1. Complete payment gateway API integration
2. Set up production Supabase instance
3. Implement error logging/monitoring
4. Conduct security audit
5. Perform load testing

**Post-Launch:**
1. Live bus tracking integration
2. Push notifications system
3. Loyalty/rewards program
4. Multi-language support (Setswana)
5. User reviews and ratings

### Detailed Analysis

For a comprehensive MVP analysis including:
- Detailed feature breakdown
- Technical architecture assessment
- Gap analysis with priorities
- Pre-launch checklist
- Success metrics and KPIs
- Time estimates and recommendations

**See:** [`MVP_ANALYSIS.md`](./MVP_ANALYSIS.md)

---

*Last updated: January 2025* 