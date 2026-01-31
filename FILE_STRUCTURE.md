# GOGOBUS - Complete File Structure

> Complete directory tree and file organization for the GOGOBUS bus booking application.

---

## 📁 Root Directory Structure

```
gogobus/
├── 📄 Configuration Files
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── vitest.config.js
│   ├── playwright.config.js
│   └── index.html
│
├── 📁 Documentation
│   ├── README.md
│   ├── README-ENV.md
│   ├── README-REACT.md
│   ├── README-REACT-SETUP.md
│   ├── SETUP.md
│   ├── claude.md
│   ├── ADMIN_SETUP.md
│   ├── ADMIN_PASSWORD_GUIDE.md
│   ├── ADMIN_DEBUG.md
│   ├── APP_ANALYSIS.md
│   ├── APP_LAYOUT.md
│   ├── CODING_STANDARDS.md
│   ├── MVP_ANALYSIS.md
│   ├── MVP_ROADMAP.md
│   ├── MVP_SETUP.md
│   ├── REACT_MIGRATION.md
│   ├── PAYMENT_INTEGRATION.md
│   ├── TESTING.md
│   ├── PR_REVIEW.md
│   ├── PRODUCTION_CHECKLIST.md
│   ├── PROGRESS(2).md
│   ├── PHASE1_ADMIN_TEST_CHECKLIST.md
│   ├── PHASE1_COMPLETION.md
│   ├── COMPLETION_SUMMARY.md
│   └── 100_PERCENT_COMPLETE.md
│
├── 📁 Source Code (src/)
│   ├── App.jsx
│   ├── main.jsx
│   │
│   ├── 📁 components/          # Reusable UI components
│   ├── 📁 pages/              # Page-level components
│   ├── 📁 context/             # React Context providers
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 services/           # API and business logic services
│   ├── 📁 utils/              # Utility functions
│   ├── 📁 styles/             # Global styles
│   └── 📁 test/               # Test utilities
│
├── 📁 Public Assets
│   ├── public/
│   │   └── images/
│   │       └── bus.jpg
│   └── dist/                  # Build output
│       ├── assets/
│       ├── images/
│       │   └── bus.jpg
│       └── index.html
│
├── 📁 Database & Backend
│   ├── supabase/
│   │   ├── config.toml
│   │   └── functions/         # Supabase Edge Functions
│   └── scripts/               # SQL scripts and utilities
│
├── 📁 Testing
│   └── e2e/                   # End-to-end tests
│
├── 📁 Legacy Files (Root)
│   ├── QRScanner.jsx
│   ├── seat/                  # Legacy seat components
│   ├── reset-password/
│   └── components/            # Legacy components
│
└── 📁 Documentation (docs/)
    ├── ADMIN_MANUAL.md
    ├── BACKUP_RECOVERY.md
    ├── CUSTOMER_SUPPORT_FAQ.md
    ├── DEPLOYMENT.md
    ├── PRIVACY_POLICY.md
    ├── PRODUCTION_SETUP.md
    ├── TERMS_OF_SERVICE.md
    └── TROUBLESHOOTING.md
```

---

## 📂 Detailed Source Code Structure

### `src/` Directory

```
src/
├── App.jsx                    # Main app component with routing
├── main.jsx                   # Application entry point
│
├── 📁 components/             # Reusable UI components
│   │
│   ├── 📁 auth/              # Authentication components
│   │   ├── AvatarUpload.jsx
│   │   ├── AvatarUpload.module.css
│   │   ├── PasswordStrengthIndicator.jsx
│   │   ├── PasswordStrengthIndicator.module.css
│   │   ├── SocialLoginButton.jsx
│   │   └── SocialLoginButton.module.css
│   │
│   ├── 📁 booking/           # Booking flow components
│   │   ├── PassengerForm.jsx
│   │   ├── PassengerForm.module.css
│   │   ├── PaymentMethod.jsx
│   │   ├── PaymentMethod.module.css
│   │   ├── PriceBreakdown.jsx
│   │   ├── PriceBreakdown.module.css
│   │   ├── QRCodeDisplay.jsx
│   │   ├── QRCodeDisplay.module.css
│   │   ├── Seat.jsx
│   │   ├── Seat.module.css
│   │   ├── SeatMap.jsx
│   │   └── SeatMap.module.css
│   │
│   ├── 📁 chat/              # Chat components
│   │   ├── LiveChatWidget.jsx
│   │   └── LiveChatWidget.module.css
│   │
│   ├── 📁 common/            # Shared/common components
│   │   ├── Breadcrumbs.jsx
│   │   ├── Breadcrumbs.module.css
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   ├── CookieConsent.jsx
│   │   ├── CookieConsent.module.css
│   │   ├── ErrorBoundary.jsx
│   │   ├── ErrorBoundary.module.css
│   │   ├── Input.jsx
│   │   ├── Input.module.css
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadingSpinner.module.css
│   │   ├── Modal.jsx
│   │   ├── Modal.module.css
│   │   └── ProtectedRoute.jsx
│   │
│   ├── 📁 features/          # Feature-specific components (empty)
│   │
│   ├── 📁 home/              # Home page components
│   │   ├── PopularRoutes.jsx
│   │   ├── PopularRoutes.module.css
│   │   ├── SearchForm.jsx
│   │   └── SearchForm.module.css
│   │
│   ├── 📁 layout/            # Layout components
│   │   ├── AppLayout.jsx
│   │   ├── AppLayout.module.css
│   │   ├── Footer.jsx
│   │   ├── Footer.module.css
│   │   ├── Header.jsx
│   │   └── Header.module.css
│   │
│   ├── 📁 profile/           # Profile components
│   │   ├── ProfileHeader.jsx
│   │   ├── ProfileHeader.module.css
│   │   ├── ProfileMenu.jsx
│   │   └── ProfileMenu.module.css
│   │
│   ├── 📁 routing/           # Route protection components
│   │   ├── ProtectedRoute.jsx
│   │   └── AdminProtectedRoute.jsx
│   │
│   ├── 📁 search/            # Search components
│   │   ├── BusCard.jsx
│   │   ├── BusCard.module.css
│   │   ├── FilterPanel.jsx
│   │   ├── FilterPanel.module.css
│   │   ├── SortOptions.jsx
│   │   └── SortOptions.module.css
│   │
│   └── 📁 tickets/          # Ticket components
│       ├── TicketCard.jsx
│       ├── TicketCard.module.css
│       ├── TicketDownload.jsx
│       ├── TicketDownload.module.css
│       ├── TicketTabs.jsx
│       └── TicketTabs.module.css
│
├── 📁 pages/                 # Page-level components
│   │
│   ├── 📁 admin/             # Admin pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminDashboard.module.css
│   │   ├── QRScanner.jsx
│   │   └── QRScanner.module.css
│   │
│   ├── 📁 auth/              # Authentication pages
│   │   ├── Auth.module.css
│   │   ├── CheckEmail.jsx
│   │   ├── CompleteProfile.jsx
│   │   ├── CompleteProfile.module.css
│   │   ├── GetStarted.jsx
│   │   ├── GetStarted.module.css
│   │   ├── Login.jsx
│   │   ├── OTPVerification.jsx
│   │   └── SignUp.jsx
│   │
│   ├── 📁 booking/           # Booking flow pages
│   │   ├── Booking.module.css
│   │   ├── BookingConfirmation.jsx
│   │   ├── BookingSummary.jsx
│   │   ├── PassengerDetails.jsx
│   │   ├── Payment.jsx
│   │   ├── Payment.module.css
│   │   ├── PaymentConfirmation.jsx
│   │   ├── PaymentConfirmation.module.css
│   │   ├── SeatSelection.jsx
│   │   └── SeatSelection.module.css
│   │
│   ├── 📁 help/              # Help & support
│   │   ├── Help.jsx
│   │   └── Help.module.css
│   │
│   ├── 📁 home/              # Home page
│   │   ├── Home.jsx
│   │   └── Home.module.css
│   │
│   ├── 📁 notifications/     # Notifications
│   │   ├── Notifications.jsx
│   │   └── Notifications.module.css
│   │
│   ├── 📁 onboarding/        # Onboarding flow
│   │   ├── OnboardingFlow.jsx
│   │   ├── OnboardingFlow.module.css
│   │   ├── OnboardingStep.module.css
│   │   ├── OnboardingStep1.jsx
│   │   ├── OnboardingStep2.jsx
│   │   └── OnboardingStep3.jsx
│   │
│   ├── 📁 partner/           # Partner pages
│   │   ├── BecomePartner.jsx
│   │   └── BecomePartner.module.css
│   │
│   ├── 📁 payments/          # Payment pages (empty)
│   │
│   ├── 📁 profile/           # Profile pages
│   │   ├── EditProfile.jsx
│   │   ├── EmergencyContacts.jsx
│   │   ├── Profile.jsx
│   │   ├── Profile.module.css
│   │   ├── ProfilePages.module.css
│   │   ├── Rewards.jsx
│   │   ├── SavedRoutes.jsx
│   │   ├── Settings.jsx
│   │   ├── TravelPreferences.jsx
│   │   └── Wallet.jsx
│   │
│   ├── 📁 search/            # Search pages
│   │   ├── SearchResults.jsx
│   │   └── SearchResults.module.css
│   │
│   ├── 📁 tickets/           # Ticket pages
│   │   ├── MyTickets.jsx
│   │   ├── MyTickets.module.css
│   │   ├── TicketView.jsx
│   │   └── TicketView.module.css
│   │
│   ├── Splash.jsx            # Splash screen
│   └── Splash.module.css
│
├── 📁 context/               # React Context providers
│   ├── AuthContext.jsx       # Authentication state
│   ├── BookingContext.jsx   # Booking state
│   ├── SearchContext.jsx     # Search state
│   └── ThemeContext.jsx      # Theme state
│
├── 📁 hooks/                 # Custom React hooks
│   └── usePaymentStatus.js   # Payment status polling hook
│
├── 📁 services/              # API and business logic
│   ├── __tests__/            # Service tests
│   │   ├── (test files)
│   ├── adminService.js       # Admin operations
│   ├── aiChatService.js      # AI chat service
│   ├── authService.js        # Authentication
│   ├── bookingService.js     # Booking operations
│   ├── chatAIService.js      # AI chat integration
│   ├── chatService.js        # Chat operations
│   ├── emailService.js       # Email notifications
│   ├── paymentService.js     # Payment processing
│   ├── profileService.js     # User profile
│   ├── routeService.js       # Route operations
│   ├── supabase.js           # Supabase client
│   └── ticketService.js      # Ticket operations
│
├── 📁 utils/                 # Utility functions
│   ├── __tests__/            # Utility tests
│   │   ├── (test files)
│   ├── analytics.js          # Google Analytics
│   ├── apiLogger.js          # API logging
│   ├── constants.js          # App constants
│   ├── logger.js             # Logging utilities
│   ├── paymentErrors.js      # Payment error handling
│   ├── performance.js        # Performance monitoring
│   ├── pricing.js            # Pricing calculations
│   ├── production.js         # Production utilities
│   ├── rateLimiter.js        # Rate limiting
│   ├── security.js           # Security utilities
│   ├── sentry.js             # Sentry integration
│   ├── validation.js         # Input validation
│   └── xss.js                # XSS prevention
│
├── 📁 styles/                # Global styles
│   └── global.css            # Global CSS variables and styles
│
└── 📁 test/                  # Test utilities
    ├── integration/
    │   └── (test files)
    └── setup.js              # Test setup configuration
```

---

## 📂 Backend & Database Structure

### `supabase/` Directory

```
supabase/
├── config.toml               # Supabase configuration
│
└── 📁 functions/             # Supabase Edge Functions (TypeScript)
    ├── 📁 ai-chat-handler/
    │   └── index.ts          # AI chat request handler
    │
    ├── 📁 chat-ai/
    │   └── index.ts          # Alternative AI chat handler
    │
    ├── 📁 payment-webhook-dpo/
    │   └── index.ts          # DPO Pay webhook handler
    │
    ├── 📁 payment-webhook-orange/
    │   └── index.ts          # Orange Money webhook handler
    │
    └── 📁 send-booking-email/
        └── index.ts          # Booking email sender
```

### `scripts/` Directory

```
scripts/
├── 📁 backups/               # Database backup scripts
│   └── README.md
│
├── 📄 SQL Scripts
│   ├── 002_payments_schema.sql
│   ├── add-admin-schedules-policies.sql
│   ├── add-ai-chat-fields.sql
│   ├── add-user-role.sql
│   ├── chat-schema.sql
│   ├── check-and-create-admin.sql
│   ├── create-dev-user.sql
│   ├── data-retention-policy.sql
│   ├── fix-admin-role-now.sql
│   ├── fix-profiles-rls-recursion.sql
│   ├── phase1-complete-schema.sql
│   ├── phase1-verification.sql
│   ├── seed-data.sql
│   ├── set-admin-role.sql
│   └── test-rls-policies.sql
│
├── 📄 JavaScript Utilities
│   ├── check-imports.js
│   └── complete-ts-migration.js
│
├── 📄 Other Files
│   ├── generate_ticket.py
│   ├── PaymentConfirmation.jsx
│   ├── PaymentConfirmation.module.css
│   ├── production-deploy.sh
│   ├── create-dev-user-via-dashboard.md
│   ├── PHASE1_README.md
│   └── README.md
```

---

## 📂 Testing Structure

### `e2e/` Directory

```
e2e/
├── admin.spec.js             # Admin dashboard E2E tests
├── auth.spec.js              # Authentication E2E tests
└── booking.spec.js           # Booking flow E2E tests
```

### `src/test/` Directory

```
src/test/
├── integration/
│   └── (integration test files)
└── setup.js                  # Test environment setup
```

---

## 📂 Public Assets

### `public/` Directory

```
public/
└── images/
    └── bus.jpg              # Bus image asset
```

### `dist/` Directory (Build Output)

```
dist/
├── assets/                   # Compiled JS/CSS assets
├── images/
│   └── bus.jpg
└── index.html                # Production index.html
```

---

## 📂 Legacy Files (Root Level)

```
(root)/
├── QRScanner.jsx             # Legacy QR scanner (use src/pages/admin/QRScanner.jsx)
│
├── 📁 seat/                  # Legacy seat components
│   ├── Seat.jsx
│   ├── Seat.module.css
│   ├── SeatMap.jsx
│   ├── SeatMap.module.css
│   ├── SeatSelectionPage.jsx
│   └── SeatSelectionPage.module.css
│
├── 📁 reset-password/        # Password reset page
│   └── index.html
│
└── 📁 components/            # Legacy components (not used)
    ├── Breadcrumbs.jsx
    └── Modal.jsx
```

---

## 📂 Documentation Structure

### Root Documentation

```
(root)/
├── README.md                 # Main project README
├── README-ENV.md             # Environment setup
├── README-REACT.md           # React setup guide
├── README-REACT-SETUP.md     # React setup instructions
├── SETUP.md                  # General setup guide
├── claude.md                 # Comprehensive project documentation
├── ADMIN_SETUP.md            # Admin dashboard setup
├── ADMIN_PASSWORD_GUIDE.md   # Admin password management
├── ADMIN_DEBUG.md            # Admin troubleshooting
├── APP_ANALYSIS.md           # Application analysis
├── APP_LAYOUT.md             # Application layout guide
├── CODING_STANDARDS.md       # Coding standards
├── MVP_ANALYSIS.md           # MVP analysis
├── MVP_ROADMAP.md            # MVP roadmap
├── MVP_SETUP.md              # MVP setup guide
├── REACT_MIGRATION.md        # React migration notes
├── PAYMENT_INTEGRATION.md    # Payment integration guide
├── TESTING.md                # Testing guide
├── PR_REVIEW.md              # PR review checklist
├── PRODUCTION_CHECKLIST.md   # Production deployment checklist
├── PROGRESS(2).md            # Progress tracking
├── PHASE1_ADMIN_TEST_CHECKLIST.md
├── PHASE1_COMPLETION.md
├── COMPLETION_SUMMARY.md
└── 100_PERCENT_COMPLETE.md
```

### `docs/` Directory

```
docs/
├── ADMIN_MANUAL.md           # Admin user manual
├── BACKUP_RECOVERY.md        # Backup and recovery procedures
├── CUSTOMER_SUPPORT_FAQ.md   # Customer support FAQ
├── DEPLOYMENT.md             # Deployment guide
├── PRIVACY_POLICY.md         # Privacy policy
├── PRODUCTION_SETUP.md       # Production setup guide
├── TERMS_OF_SERVICE.md       # Terms of service
└── TROUBLESHOOTING.md        # Troubleshooting guide
```

---

## 📊 File Count Summary

| Category | Count | Description |
|----------|-------|-------------|
| **Components** | 33 JSX + 30 CSS | Reusable UI components |
| **Pages** | 34 JSX + 21 CSS | Page-level components |
| **Services** | 15 JS | API and business logic |
| **Utils** | 16 JS | Utility functions |
| **Context** | 4 JSX | React Context providers |
| **Hooks** | 1 JS | Custom React hooks |
| **Edge Functions** | 5 TS | Supabase Edge Functions |
| **SQL Scripts** | 15+ SQL | Database scripts |
| **E2E Tests** | 3 JS | End-to-end tests |
| **Documentation** | 30+ MD | Documentation files |

---

## 🗂️ Key File Patterns

### Component Files
- **Pattern**: `ComponentName.jsx` + `ComponentName.module.css`
- **Location**: `src/components/{category}/`
- **Example**: `src/components/common/Button.jsx` + `Button.module.css`

### Page Files
- **Pattern**: `PageName.jsx` + `PageName.module.css`
- **Location**: `src/pages/{category}/`
- **Example**: `src/pages/auth/Login.jsx`

### Service Files
- **Pattern**: `{feature}Service.js`
- **Location**: `src/services/`
- **Example**: `src/services/authService.js`

### Utility Files
- **Pattern**: `{purpose}.js`
- **Location**: `src/utils/`
- **Example**: `src/utils/validation.js`

### Test Files
- **Pattern**: `{name}.spec.js` or `{name}.test.js`
- **Location**: `e2e/`, `src/services/__tests__/`, `src/utils/__tests__/`
- **Example**: `e2e/auth.spec.js`

---

## 📝 Notes

1. **CSS Modules**: All component styles use CSS Modules (`.module.css`)
2. **Component Organization**: Components are organized by feature/domain
3. **Legacy Files**: Some legacy files exist in root - these should be migrated or removed
4. **Empty Directories**: `src/components/features/` and `src/pages/payments/` are currently empty
5. **Build Output**: `dist/` contains production build files (gitignored in development)

---

*Last updated: January 2025*
