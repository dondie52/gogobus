# React Migration Guide

## Overview

This document outlines the strategy and step-by-step plan for migrating GOGOBUS from a vanilla JavaScript Single Page Application (SPA) to a modern React application.

**Current State:**
- Vanilla JavaScript with screen-based navigation
- Single HTML file (`index.html`) containing all screens
- Multiple JavaScript modules (`app.js`, `auth.js`, `home.js`, `booking.js`, `ticket.js`)
- CSS modules for styling
- Supabase for backend services
- Some React components already exist (`components/Breadcrumbs.jsx`, `components/Modal.jsx`)

**Target State:**
- Full React application with component-based architecture
- React Router for navigation
- Modern state management
- Improved code organization and maintainability
- Better developer experience and testing capabilities

---

## Table of Contents

1. [Migration Strategy](#migration-strategy)
2. [Prerequisites](#prerequisites)
3. [Project Setup](#project-setup)
4. [Migration Phases](#migration-phases)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [Routing Strategy](#routing-strategy)
8. [Styling Approach](#styling-approach)
9. [Testing Strategy](#testing-strategy)
10. [Migration Checklist](#migration-checklist)

---

## Migration Strategy

### Approach: Incremental Migration

We recommend an **incremental migration** approach rather than a complete rewrite:

1. **Benefits:**
   - Lower risk - app remains functional during migration
   - Gradual learning curve for team
   - Ability to test each migrated feature independently
   - Easier to rollback if issues arise

2. **Strategy:**
   - Set up React alongside existing code
   - Migrate screens one at a time
   - Use feature flags to toggle between old/new implementations
   - Gradually replace vanilla JS with React components

### Alternative: Full Rewrite

If starting fresh is preferred:
- Create new React app structure
- Migrate features in priority order
- Run both apps in parallel during transition
- Switch over when core features are complete

---

## Prerequisites

### Required Knowledge
- React fundamentals (components, hooks, state)
- React Router for navigation
- Modern JavaScript (ES6+)
- Understanding of current GOGOBUS architecture

### Tools & Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-icons": "^4.12.0",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "eslint": "^8.54.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## Project Setup

### Step 1: Initialize React Project

```bash
# Option A: Using Vite (Recommended - Fast and modern)
npm create vite@latest gogobus-react -- --template react
cd gogobus-react

# Option B: Using Create React App
npx create-react-app gogobus-react
cd gogobus-react
```

### Step 2: Install Dependencies

```bash
npm install react-router-dom react-icons @supabase/supabase-js
npm install -D @vitejs/plugin-react vite
```

### Step 3: Project Structure

```
gogobus-react/
├── public/
│   └── images/
│       └── bus.jpg
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/         # Button, Input, Modal, etc.
│   │   ├── layout/         # Header, Footer, Navigation
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components (screens)
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── home/
│   │   ├── booking/
│   │   └── profile/
│   ├── hooks/              # Custom React hooks
│   ├── context/            # React Context providers
│   ├── services/           # API services (Supabase)
│   ├── utils/              # Utility functions
│   ├── styles/             # CSS modules or styled-components
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
└── vite.config.js
```

---

## Migration Phases

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up React infrastructure and migrate core utilities

#### Tasks:
1. ✅ Set up React project structure
2. ✅ Configure build tools (Vite/Webpack)
3. ✅ Set up routing structure
4. ✅ Create base layout components
5. ✅ Migrate Supabase configuration
6. ✅ Set up theme/context providers
7. ✅ Create common UI components (Button, Input, Modal)

**Deliverables:**
- Working React app with routing
- Theme provider (dark mode support)
- Basic layout components
- Supabase service layer

---

### Phase 2: Authentication Flow (Week 3-4)

**Goal:** Migrate authentication screens and logic

#### Screens to Migrate:
1. **Splash Screen** → `pages/Splash.jsx`
2. **Onboarding** → `pages/onboarding/OnboardingFlow.jsx`
   - OnboardingStep1.jsx
   - OnboardingStep2.jsx
   - OnboardingStep3.jsx
3. **Get Started** → `pages/auth/GetStarted.jsx`
4. **Login** → `pages/auth/Login.jsx`
5. **Sign Up** → `pages/auth/SignUp.jsx`
6. **OTP Verification** → `pages/auth/OTPVerification.jsx`
7. **Complete Profile** → `pages/auth/CompleteProfile.jsx`

#### Components to Create:
- `components/auth/SocialLoginButton.jsx`
- `components/auth/PasswordStrengthIndicator.jsx`
- `components/auth/AvatarUpload.jsx`
- `components/common/FormInput.jsx`
- `components/common/Button.jsx`

#### State Management:
- Create `context/AuthContext.jsx` for authentication state
- Migrate auth logic from `auth.js` to React hooks

**Deliverables:**
- Complete authentication flow in React
- Protected routes implementation
- Session management

---

### Phase 3: Home & Search (Week 5-6)

**Goal:** Migrate home screen and search functionality

#### Screens to Migrate:
1. **Home** → `pages/home/Home.jsx`
2. **Search Results** → `pages/search/SearchResults.jsx`

#### Components to Create:
- `components/home/SearchForm.jsx`
- `components/home/CitySelector.jsx`
- `components/home/PopularRoutes.jsx`
- `components/search/BusCard.jsx`
- `components/search/FilterPanel.jsx`
- `components/search/SortOptions.jsx`

#### State Management:
- Create `context/SearchContext.jsx` for search state
- Migrate search logic from `home.js`

**Deliverables:**
- Home screen with search functionality
- Search results with filtering and sorting
- Route selection and navigation

---

### Phase 4: Booking Flow (Week 7-9)

**Goal:** Migrate booking process (most complex phase)

#### Screens to Migrate:
1. **Seat Selection** → `pages/booking/SeatSelection.jsx`
2. **Passenger Details** → `pages/booking/PassengerDetails.jsx`
3. **Booking Summary** → `pages/booking/BookingSummary.jsx`
4. **Payment** → `pages/booking/Payment.jsx`
5. **Booking Confirmation** → `pages/booking/BookingConfirmation.jsx`

#### Components to Create:
- `components/booking/SeatMap.jsx`
- `components/booking/Seat.jsx`
- `components/booking/PassengerForm.jsx`
- `components/booking/PriceBreakdown.jsx`
- `components/booking/PaymentMethod.jsx`
- `components/booking/QRCodeDisplay.jsx`

#### State Management:
- Create `context/BookingContext.jsx` for booking state
- Migrate booking logic from `booking.js`

**Deliverables:**
- Complete booking flow
- Seat selection with visual map
- Payment integration
- QR code ticket generation

---

### Phase 5: Tickets & Profile (Week 10-11)

**Goal:** Migrate ticket management and profile screens

#### Screens to Migrate:
1. **My Tickets** → `pages/tickets/MyTickets.jsx`
2. **Ticket View** → `pages/tickets/TicketView.jsx`
3. **Profile** → `pages/profile/Profile.jsx`
4. **Profile Sub-screens:**
   - Rewards → `pages/profile/Rewards.jsx`
   - Wallet → `pages/profile/Wallet.jsx`
   - Saved Routes → `pages/profile/SavedRoutes.jsx`
   - Travel Preferences → `pages/profile/TravelPreferences.jsx`
   - Emergency Contacts → `pages/profile/EmergencyContacts.jsx`
   - Settings → `pages/profile/Settings.jsx`

#### Components to Create:
- `components/tickets/TicketCard.jsx`
- `components/tickets/TicketList.jsx`
- `components/tickets/TicketTabs.jsx`
- `components/profile/ProfileHeader.jsx`
- `components/profile/ProfileMenu.jsx`
- `components/profile/EditProfileForm.jsx`

**Deliverables:**
- Ticket viewing and management
- Complete profile management
- Settings and preferences

---

### Phase 6: Polish & Optimization (Week 12)

**Goal:** Final touches, performance optimization, and cleanup

#### Tasks:
1. Add loading states and error boundaries
2. Implement lazy loading for routes
3. Optimize bundle size
4. Add animations and transitions
5. Mobile responsiveness testing
6. Accessibility improvements
7. Remove old vanilla JS code
8. Update documentation

**Deliverables:**
- Production-ready React app
- Performance optimizations
- Complete migration

---

## Component Architecture

### Component Hierarchy

```
App
├── ThemeProvider
├── AuthProvider
│   └── Router
│       ├── Splash
│       ├── OnboardingFlow
│       │   ├── OnboardingStep1
│       │   ├── OnboardingStep2
│       │   └── OnboardingStep3
│       ├── AuthRoutes
│       │   ├── GetStarted
│       │   ├── Login
│       │   ├── SignUp
│       │   ├── OTPVerification
│       │   └── CompleteProfile
│       └── ProtectedRoutes
│           ├── Home
│           │   ├── SearchForm
│           │   └── PopularRoutes
│           ├── SearchResults
│           │   ├── FilterPanel
│           │   └── BusCard[]
│           ├── BookingFlow
│           │   ├── SeatSelection
│           │   ├── PassengerDetails
│           │   ├── BookingSummary
│           │   ├── Payment
│           │   └── BookingConfirmation
│           ├── MyTickets
│           │   └── TicketCard[]
│           └── Profile
│               └── ProfileMenu
```

### Component Patterns

#### 1. Presentational Components
Simple components that receive props and render UI:

```jsx
// components/common/Button.jsx
const Button = ({ children, variant, onClick, disabled }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

#### 2. Container Components
Components that manage state and business logic:

```jsx
// pages/auth/Login.jsx
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <FormInput
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit" disabled={loading}>
        Login
      </Button>
    </form>
  );
};
```

#### 3. Custom Hooks
Extract reusable logic:

```jsx
// hooks/useAuth.js
export const useAuth = () => {
  const { user, login, logout, signup } = useContext(AuthContext);
  return { user, login, logout, signup };
};

// hooks/useBooking.js
export const useBooking = () => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState(null);
  
  // Booking logic...
  
  return { selectedSeats, passengerDetails, /* ... */ };
};
```

---

## State Management

### Recommended Approach: React Context + Hooks

For GOGOBUS, React Context API is sufficient. Consider Redux/Zustand only if state becomes complex.

### Context Providers

#### 1. AuthContext
```jsx
// context/AuthContext.jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    // Supabase login logic
  };

  const logout = async () => {
    // Supabase logout logic
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. BookingContext
```jsx
// context/BookingContext.jsx
const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState(null);
  const [booking, setBooking] = useState(null);

  // Booking state management logic

  return (
    <BookingContext.Provider value={{
      selectedRoute,
      selectedSeats,
      passengerDetails,
      booking,
      // ... methods
    }}>
      {children}
    </BookingContext.Provider>
  );
};
```

#### 3. ThemeContext
```jsx
// context/ThemeContext.jsx
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(
    localStorage.getItem('gogobus_theme') || 'light'
  );

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('gogobus_theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## Routing Strategy

### React Router Setup

```jsx
// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Splash />} />
            <Route path="/onboarding" element={<OnboardingFlow />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            
            {/* Protected Routes */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute>
                  <SearchResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/booking/*"
              element={
                <ProtectedRoute>
                  <BookingFlow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/*"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Route Structure

```
/                           → Splash
/onboarding                 → Onboarding flow
/get-started                → Get started screen
/login                      → Login
/signup                     → Sign up
/otp-verification           → OTP verification
/complete-profile           → Complete profile (protected)
/home                       → Home screen (protected)
/search                     → Search results (protected)
/booking/seat-selection     → Seat selection (protected)
/booking/passenger-details  → Passenger details (protected)
/booking/summary            → Booking summary (protected)
/booking/payment            → Payment (protected)
/booking/confirmation       → Booking confirmation (protected)
/tickets                    → My tickets (protected)
/tickets/:id                → View ticket (protected)
/profile                    → Profile (protected)
/profile/rewards            → Rewards (protected)
/profile/wallet             → Wallet (protected)
/profile/settings           → Settings (protected)
```

---

## Styling Approach

### Option 1: CSS Modules (Recommended)

Keep existing CSS structure, convert to CSS modules:

```jsx
// components/common/Button.module.css
.button {
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.primary {
  background-color: #1B4D4A;
  color: white;
}

// components/common/Button.jsx
import styles from './Button.module.css';

const Button = ({ variant = 'primary', children, ...props }) => {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
};
```

### Option 2: Styled Components

```jsx
import styled from 'styled-components';

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  background-color: ${props => props.variant === 'primary' ? '#1B4D4A' : '#F5A623'};
  color: white;
  border: none;
  cursor: pointer;
`;
```

### Option 3: Tailwind CSS

```jsx
const Button = ({ variant, children }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold";
  const variantClasses = variant === 'primary' 
    ? "bg-teal-700 text-white" 
    : "bg-orange-500 text-white";
  
  return (
    <button className={`${baseClasses} ${variantClasses}`}>
      {children}
    </button>
  );
};
```

**Recommendation:** Start with CSS Modules to maintain existing styles, migrate to Tailwind later if desired.

---

## Testing Strategy

### Unit Testing

```jsx
// components/common/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Integration Testing

```jsx
// pages/auth/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from './Login';

test('login flow', async () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'test@example.com' }
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: 'password123' }
  });
  fireEvent.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });
});
```

### Testing Tools

- **Jest** - Test runner
- **React Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking
- **Cypress/Playwright** - E2E testing (optional)

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Initialize React project
- [ ] Set up build configuration (Vite/Webpack)
- [ ] Install dependencies
- [ ] Create project structure
- [ ] Set up routing
- [ ] Create base layout components
- [ ] Migrate Supabase config
- [ ] Set up theme provider
- [ ] Create common UI components

### Phase 2: Authentication
- [ ] Migrate Splash screen
- [ ] Migrate Onboarding flow
- [ ] Migrate Get Started screen
- [ ] Migrate Login screen
- [ ] Migrate Sign Up screen
- [ ] Migrate OTP Verification
- [ ] Migrate Complete Profile
- [ ] Create AuthContext
- [ ] Implement protected routes
- [ ] Test authentication flow

### Phase 3: Home & Search
- [ ] Migrate Home screen
- [ ] Migrate Search Results
- [ ] Create SearchForm component
- [ ] Create CitySelector component
- [ ] Create BusCard component
- [ ] Create FilterPanel component
- [ ] Migrate search logic
- [ ] Test search functionality

### Phase 4: Booking Flow
- [ ] Migrate Seat Selection
- [ ] Migrate Passenger Details
- [ ] Migrate Booking Summary
- [ ] Migrate Payment screen
- [ ] Migrate Booking Confirmation
- [ ] Create SeatMap component
- [ ] Create BookingContext
- [ ] Migrate booking logic
- [ ] Test complete booking flow

### Phase 5: Tickets & Profile
- [ ] Migrate My Tickets
- [ ] Migrate Ticket View
- [ ] Migrate Profile screen
- [ ] Migrate Profile sub-screens
- [ ] Create TicketCard component
- [ ] Create ProfileMenu component
- [ ] Test ticket and profile features

### Phase 6: Polish & Optimization
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Implement lazy loading
- [ ] Optimize bundle size
- [ ] Add animations
- [ ] Test mobile responsiveness
- [ ] Accessibility audit
- [ ] Remove old vanilla JS code
- [ ] Update documentation
- [ ] Deploy and test

---

## Key Considerations

### 1. Screen Transitions
Current app uses custom screen transitions. In React:
- Use React Router transitions (react-transition-group)
- Or CSS animations with route changes
- Maintain swipe gestures for mobile

### 2. State Persistence
- Use localStorage for theme preferences
- Use Supabase for user sessions
- Consider React Query for server state

### 3. Performance
- Lazy load routes
- Code splitting
- Image optimization
- Memoization for expensive components

### 4. Mobile-First
- Maintain PWA capabilities
- Test on real devices
- Optimize touch interactions
- Ensure offline support

### 5. Backward Compatibility
- Keep old code until migration complete
- Use feature flags if needed
- Gradual rollout strategy

---

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

### Tools
- [Vite](https://vitejs.dev/) - Build tool
- [React DevTools](https://react.dev/learn/react-developer-tools) - Debugging
- [ESLint](https://eslint.org/) - Code quality

### Learning Resources
- [React Beta Docs](https://react.dev/)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [React Patterns](https://reactpatterns.com/)

---

## Timeline Estimate

**Total Duration:** 12 weeks (3 months)

- **Phase 1:** 2 weeks
- **Phase 2:** 2 weeks
- **Phase 3:** 2 weeks
- **Phase 4:** 3 weeks
- **Phase 5:** 2 weeks
- **Phase 6:** 1 week

**Note:** Timeline may vary based on team size and complexity of features.

---

## Getting Started

1. Review this migration guide
2. Set up React project (Phase 1)
3. Start with authentication flow (Phase 2)
4. Migrate one screen at a time
5. Test thoroughly before moving to next phase
6. Document any deviations from this plan

---

## Questions & Support

For questions or clarifications about the migration:
- Review existing React components (`components/Breadcrumbs.jsx`, `components/Modal.jsx`)
- Check React and React Router documentation
- Consult with team members
- Create issues for blockers

---

**Last Updated:** [Current Date]
**Version:** 1.0.0
