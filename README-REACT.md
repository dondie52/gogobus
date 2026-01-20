# GOGOBUS React Migration

This is the React version of GOGOBUS, migrated from vanilla JavaScript.

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Button, Input, Modal, LoadingSpinner, ErrorBoundary
│   ├── layout/         # Header, Footer, AppLayout
│   ├── routing/        # ProtectedRoute
│   ├── auth/           # SocialLoginButton, PasswordStrengthIndicator, AvatarUpload
│   ├── home/           # SearchForm, PopularRoutes
│   ├── search/         # BusCard, FilterPanel, SortOptions
│   ├── booking/        # SeatMap, Seat, PassengerForm, PriceBreakdown, PaymentMethod, QRCodeDisplay
│   ├── tickets/        # TicketCard, TicketTabs
│   └── profile/        # ProfileHeader, ProfileMenu
├── pages/              # Page components
│   ├── Splash.jsx
│   ├── onboarding/     # OnboardingFlow, OnboardingStep1-3
│   ├── auth/           # GetStarted, Login, SignUp, OTPVerification, CompleteProfile
│   ├── home/           # Home
│   ├── search/         # SearchResults
│   ├── booking/        # SeatSelection, PassengerDetails, BookingSummary, Payment, BookingConfirmation
│   ├── tickets/        # MyTickets, TicketView
│   └── profile/         # Profile, EditProfile, Rewards, Wallet, SavedRoutes, TravelPreferences, EmergencyContacts, Settings
├── context/            # React Context providers
│   ├── ThemeContext.jsx
│   ├── AuthContext.jsx
│   ├── SearchContext.jsx
│   └── BookingContext.jsx
├── services/           # API services
│   ├── supabase.js
│   ├── authService.js
│   ├── profileService.js
│   ├── bookingService.js
│   └── routeService.js
├── utils/              # Utility functions
│   └── pricing.js
├── styles/             # Global styles
│   └── global.css
├── App.jsx             # Main app component with routing
└── main.jsx            # Entry point
```

## Features

- ✅ Complete authentication flow
- ✅ Home screen with search
- ✅ Search results with filtering
- ✅ Booking flow (seat selection, passenger details, payment)
- ✅ Ticket management
- ✅ Profile management
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Lazy loading for performance

## Migration Status

All phases of the migration plan have been completed:
- Phase 1: Foundation ✅
- Phase 2: Authentication ✅
- Phase 3: Home & Search ✅
- Phase 4: Booking Flow ✅
- Phase 5: Tickets & Profile ✅
- Phase 6: Polish & Optimization ✅

## Notes

- The original vanilla JS code is preserved in `index-vanilla.html` and original JS files
- Supabase configuration is in `src/services/supabase.js`
- All routes are protected except authentication and onboarding screens
- CSS Modules are used for component styling
