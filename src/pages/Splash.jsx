import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logWarn, logInfo, logError } from '../utils/logger';
import { SPLASH_DURATION } from '../utils/constants';
import styles from './Splash.module.css';

const VALID_ROUTES = ['/onboarding', '/get-started', '/dashboard', '/profile'];

const Splash = () => {
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  // Parse URL hash parameters safely
  const parseHashParams = useCallback(() => {
    try {
      const hash = window.location.hash.substring(1);
      return new URLSearchParams(hash);
    } catch (error) {
      logWarn('Error parsing hash parameters', error);
      return new URLSearchParams();
    }
  }, []);

  // Check if email verification is in progress
  const isEmailVerificationInProgress = useCallback(() => {
    const hashParams = parseHashParams();
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');
    return !!(accessToken && type === 'email');
  }, [parseHashParams]);

  // Get stored user preferences
  const getUserNavigationTarget = useCallback(() => {
    try {
      const hasSeenOnboarding = localStorage.getItem('gogobus_onboarding_complete') === 'true';
      const lastScreen = localStorage.getItem('gogobus_last_screen');
      
      if (hasSeenOnboarding) {
        return '/get-started';
      }
      
      if (lastScreen && VALID_ROUTES.includes(`/${lastScreen}`)) {
        return `/${lastScreen}`;
      }
      
      return '/onboarding';
    } catch (error) {
      logWarn('Error accessing localStorage', error);
      return '/onboarding'; // Fallback to onboarding
    }
  }, []);

  // Handle navigation with error boundary
  const handleNavigation = useCallback(() => {
    if (isNavigating) return; // Prevent double navigation
    
    try {
      // Final check for email verification
      if (isEmailVerificationInProgress()) {
        logInfo('Email verification still in progress, skipping navigation');
        return;
      }

      const targetRoute = getUserNavigationTarget();
      setIsNavigating(true);
      
      logInfo(`Navigating to: ${targetRoute}`);
      navigate(targetRoute, { replace: true });
    } catch (error) {
      logError('Navigation error', error);
      // Fallback navigation
      navigate('/onboarding', { replace: true });
    }
  }, [navigate, isNavigating, isEmailVerificationInProgress, getUserNavigationTarget]);

  useEffect(() => {
    // Early exit if email verification is detected
    if (isEmailVerificationInProgress()) {
      logInfo('Email verification detected, waiting for auth check...');
      return;
    }

    // Set up navigation timer
    const navigationTimer = setTimeout(handleNavigation, SPLASH_DURATION);

    // Cleanup function
    return () => {
      clearTimeout(navigationTimer);
    };
  }, [handleNavigation, isEmailVerificationInProgress]);

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);

  return (
    <div className={styles.splashScreen} role="main" aria-label="GogoBus Loading Screen">
      <div className={styles.splashContent}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon} aria-hidden="true">
            <svg 
              viewBox="0 0 60 60" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              aria-label="GogoBus Logo"
            >
              <rect x="8" y="20" width="6" height="25" rx="3" fill="#F5A623"/>
              <rect x="18" y="12" width="6" height="33" rx="3" fill="#F5A623"/>
              <rect x="28" y="8" width="6" height="37" rx="3" fill="#F5A623"/>
              <rect x="38" y="15" width="6" height="30" rx="3" fill="#F5A623"/>
              <rect x="48" y="22" width="6" height="23" rx="3" fill="#F5A623"/>
            </svg>
          </div>
          <h1 className={styles.logoText}>GOGOBUS</h1>
        </div>
        
        {/* Loading indicator */}
        <div className={styles.loadingIndicator} aria-live="polite">
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Splash;
