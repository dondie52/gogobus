import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { supabase } from './services/supabase';

// Helper function to safely lazy load components with error handling
// This prevents React's lazy() from encountering errors that can't be stringified
const safeLazy = (importFn, componentName = 'Unknown') => {
  return lazy(() => {
    // Wrap in Promise.resolve to ensure we always return a promise
    return Promise.resolve(importFn())
      .then((module) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:25',message:'Lazy component loaded successfully',data:{componentName,hasDefault:!!module?.default,moduleKeys:module ? Object.keys(module).join(',') : 'null'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        if (!module || !module.default) {
          const errorMsg = `Component ${componentName} does not have a default export. Available exports: ${module ? Object.keys(module).join(', ') : 'none'}`;
          console.error(errorMsg);
          // Return a fallback component instead of throwing
          return {
            default: () => {
              return React.createElement('div', { 
                style: { padding: '20px', textAlign: 'center', color: '#dc2626' } 
              }, `Error: ${errorMsg}`);
            }
          };
        }
        return module;
      })
      .catch((error) => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:38',message:'Lazy component load error',data:{componentName,errorMessage:error?.message || 'Unknown error',errorName:error?.name,errorType:typeof error},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        // Ensure error can be stringified by extracting message safely
        let errorMessage = 'Failed to load component';
        try {
          if (error && typeof error === 'object') {
            errorMessage = error.message || error.toString() || 'Unknown error';
          } else if (error) {
            errorMessage = String(error);
          }
        } catch (e) {
          errorMessage = `Failed to load component ${componentName}`;
        }
        
        console.error(`Failed to load lazy component ${componentName}:`, errorMessage);
        
        // Return a default component that shows an error
        return {
          default: () => {
            return React.createElement('div', { 
              style: { padding: '20px', textAlign: 'center', color: '#dc2626' } 
            }, `Failed to load component: ${componentName}`);
          }
        };
      });
  });
};

// Lazy load pages for code splitting
const Splash = safeLazy(() => import('./pages/Splash'), 'Splash');
const OnboardingFlow = safeLazy(() => import('./pages/onboarding/OnboardingFlow'), 'OnboardingFlow');
const GetStarted = safeLazy(() => import('./pages/auth/GetStarted'), 'GetStarted');
const Login = safeLazy(() => import('./pages/auth/Login'), 'Login');
const SignUp = safeLazy(() => import('./pages/auth/SignUp'), 'SignUp');
const OTPVerification = safeLazy(() => import('./pages/auth/OTPVerification'), 'OTPVerification');
const CheckEmail = safeLazy(() => import('./pages/auth/CheckEmail'), 'CheckEmail');
const CompleteProfile = safeLazy(() => import('./pages/auth/CompleteProfile'), 'CompleteProfile');
const Home = safeLazy(() => import('./pages/home/Home'), 'Home');
const SearchResults = safeLazy(() => import('./pages/search/SearchResults'), 'SearchResults');
const SeatSelection = safeLazy(() => import('./pages/booking/SeatSelection'), 'SeatSelection');
const PassengerDetails = safeLazy(() => import('./pages/booking/PassengerDetails'), 'PassengerDetails');
const BookingSummary = safeLazy(() => import('./pages/booking/BookingSummary'), 'BookingSummary');
const Payment = safeLazy(() => import('./pages/booking/Payment'), 'Payment');
const PaymentConfirmation = safeLazy(() => import('./pages/booking/PaymentConfirmation'), 'PaymentConfirmation');
const BookingConfirmation = safeLazy(() => import('./pages/booking/BookingConfirmation'), 'BookingConfirmation');
const MyTickets = safeLazy(() => import('./pages/tickets/MyTickets'), 'MyTickets');
const TicketView = safeLazy(() => import('./pages/tickets/TicketView'), 'TicketView');
const Profile = safeLazy(() => import('./pages/profile/Profile'), 'Profile');
const Help = safeLazy(() => import('./pages/help/Help'), 'Help');
const Notifications = safeLazy(() => import('./pages/notifications/Notifications'), 'Notifications');
const BecomePartner = safeLazy(() => import('./pages/partner/BecomePartner'), 'BecomePartner');
const AdminDashboard = safeLazy(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const QRScanner = safeLazy(() => import('./pages/admin/QRScanner'), 'QRScanner');

// Loading fallback component
const PageLoader = () => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:PageLoader',message:'PageLoader (Suspense fallback) rendering',data:{hash:window.location.hash,pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});
  // #endregion
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <LoadingSpinner size="large" />
    </div>
  );
};

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

// Debug route matching and rendering
function RouteDebugger() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:RouteDebugger',message:'Route debug info',data:{pathname:location.pathname,hash:window.location.hash,hasUser:!!user,userId:user?.id,loading,expectedRoute:location.pathname === '/' ? 'Splash' : location.pathname === '/home' ? 'Home' : location.pathname === '/login' ? 'Login' : 'Other'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
  }, [location.pathname, user, loading]);
  
  return null;
}

// Check if URL hash contains Supabase auth tokens (not a route path)
function hasAuthTokensInHash() {
  const hash = window.location.hash;
  // Auth tokens start with #access_token= or contain type=signup/email/recovery
  return hash && !hash.startsWith('#/') && (
    hash.includes('access_token=') || 
    hash.includes('type=signup') || 
    hash.includes('type=email') ||
    hash.includes('type=recovery')
  );
}

function App() {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:84',message:'App component rendering',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const [isProcessingAuth, setIsProcessingAuth] = useState(() => hasAuthTokensInHash());

  // Handle Supabase auth callback before HashRouter processes the URL
  useEffect(() => {
    if (!hasAuthTokensInHash()) {
      return;
    }

    const processAuthCallback = async () => {
      try {
        // Extract the hash params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          // Set the session from the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session from auth callback:', error);
            window.location.hash = '/login';
            return;
          }

          // Redirect based on verification type
          if (type === 'signup') {
            // New user signup verification - go to complete profile
            window.location.hash = '/complete-profile';
          } else if (type === 'recovery') {
            // Password recovery - stay on root for now (can add reset-password page later)
            window.location.hash = '/';
          } else {
            // Magic link or other - go to home
            window.location.hash = '/home';
          }
        } else {
          // No valid tokens, redirect to login
          window.location.hash = '/login';
        }
        
      } catch (error) {
        console.error('Error processing auth callback:', error);
        window.location.hash = '/login';
      } finally {
        setIsProcessingAuth(false);
      }
    };

    processAuthCallback();
  }, []);

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

  // Show loading while processing auth callback
  if (isProcessingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#1a1a2e' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'App.jsx:177',message:'Before rendering providers',data:{isProcessingAuth},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
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
                <ErrorBoundary>
                  <RouteDebugger />
                  <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Splash />} />
                  <Route path="/onboarding" element={<OnboardingFlow />} />
                  <Route path="/get-started" element={<GetStarted />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/otp-verification" element={<OTPVerification />} />
                  <Route path="/check-email" element={<CheckEmail />} />
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
                </ErrorBoundary>
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
