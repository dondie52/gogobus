import React, { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import { BookingProvider } from './context/BookingContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminProtectedRoute from './components/routing/AdminProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import CookieConsent from './components/common/CookieConsent';
import { trackPageView } from './utils/analytics';
import { initPerformanceMonitoring } from './utils/performance';

// Lazy load pages for code splitting
const Splash = lazy(() => import('./pages/Splash'));
const OnboardingFlow = lazy(() => import('./pages/onboarding/OnboardingFlow'));
const GetStarted = lazy(() => import('./pages/auth/GetStarted'));
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const OTPVerification = lazy(() => import('./pages/auth/OTPVerification'));
const CompleteProfile = lazy(() => import('./pages/auth/CompleteProfile'));
const Home = lazy(() => import('./pages/home/Home'));
const SearchResults = lazy(() => import('./pages/search/SearchResults'));
const SeatSelection = lazy(() => import('./pages/booking/SeatSelection'));
const PassengerDetails = lazy(() => import('./pages/booking/PassengerDetails'));
const BookingSummary = lazy(() => import('./pages/booking/BookingSummary'));
const Payment = lazy(() => import('./pages/booking/Payment'));
const PaymentConfirmation = lazy(() => import('./pages/booking/PaymentConfirmation'));
const BookingConfirmation = lazy(() => import('./pages/booking/BookingConfirmation'));
const MyTickets = lazy(() => import('./pages/tickets/MyTickets'));
const TicketView = lazy(() => import('./pages/tickets/TicketView'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Help = lazy(() => import('./pages/help/Help'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const BecomePartner = lazy(() => import('./pages/partner/BecomePartner'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const QRScanner = lazy(() => import('./pages/admin/QRScanner'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <LoadingSpinner size="large" />
  </div>
);

// Track page views on route changes
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    // #region agent log
    // #endregion
    trackPageView(location.pathname + location.search);
  }, [location]);

  useEffect(() => {
    // #region agent log
    const handlePopState = (event) => {
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // #endregion
  }, []);

  return null;
}

function App() {
  // Initialize performance monitoring on mount
  useEffect(() => {
    // #region agent log
    // #endregion
    initPerformanceMonitoring();
    return () => {
      // #region agent log
      // #endregion
    };
  }, []);

  // Monitor for page visibility changes (might indicate refresh)
  useEffect(() => {
    // #region agent log
    const handleVisibilityChange = () => {
    };
    const handleBeforeUnload = () => {
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // #endregion
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <BookingProvider>
              <HashRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <PageViewTracker />
                <CookieConsent />
                <AppLayout>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Splash />} />
                  <Route path="/onboarding" element={<OnboardingFlow />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/otp-verification" element={<OTPVerification />} />
                  <Route path="/become-partner" element={<BecomePartner />} />
                  
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
                    path="/booking/seats/:tripId"
                    element={
                      <ProtectedRoute>
                        <SeatSelection />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/passenger-details"
                    element={
                      <ProtectedRoute>
                        <PassengerDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/summary"
                    element={
                      <ProtectedRoute>
                        <BookingSummary />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/payment"
                    element={
                      <ProtectedRoute>
                        <Payment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/payment-confirmation"
                    element={
                      <ProtectedRoute>
                        <PaymentConfirmation />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking/confirmation"
                    element={
                      <ProtectedRoute>
                        <BookingConfirmation />
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
                    path="/tickets/:id"
                    element={
                      <ProtectedRoute>
                        <TicketView />
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
                  <Route
                    path="/help"
                    element={
                      <ProtectedRoute>
                        <Help />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Admin Routes */}
                  <Route
                    path="/admin/scanner"
                    element={
                      <AdminProtectedRoute>
                        <QRScanner />
                      </AdminProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <AdminProtectedRoute>
                        <AdminDashboard />
                      </AdminProtectedRoute>
                    }
                  />
                  
                  {/* Catch all - redirect to home or login */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </AppLayout>
          </HashRouter>
            </BookingProvider>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
