/**
 * Google Analytics 4 (GA4) Integration
 * Tracks user behavior, conversions, and key events
 */

import { logInfo } from './logger';

/**
 * Initialize Google Analytics 4
 * Only initializes if measurement ID is provided
 */
export const initAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID;
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Don't initialize in development or if measurement ID is not provided
  if (isDevelopment || !measurementId) {
    logInfo('[Analytics] Not initialized - Development mode or Measurement ID not provided');
    return;
  }
  
  // Load GA4 script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);
  
  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args) {
    window.dataLayer.push(args);
  }
  window.gtag = gtag;
  
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: true,
  });
  
  logInfo('[Analytics] Initialized successfully');
};

/**
 * Track page view
 * @param {string} path - Page path
 * @param {string} title - Page title
 */
export const trackPageView = (path, title) => {
  if (!window.gtag) return;
  
  window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
    page_path: path,
    page_title: title,
  });
};

/**
 * Track custom event
 * @param {string} eventName - Event name
 * @param {object} params - Event parameters
 */
export const trackEvent = (eventName, params = {}) => {
  if (!window.gtag) return;
  
  window.gtag('event', eventName, {
    ...params,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track signup completion
 * @param {string} method - Signup method (email, google, etc.)
 */
export const trackSignup = (method = 'email') => {
  trackEvent('signup_completed', {
    method,
    event_category: 'engagement',
    event_label: 'User Registration',
  });
};

/**
 * Track login
 * @param {string} method - Login method
 */
export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method,
    event_category: 'engagement',
  });
};

/**
 * Track booking initiated
 * @param {object} bookingData - Booking data
 */
export const trackBookingInitiated = (bookingData) => {
  trackEvent('booking_initiated', {
    origin: bookingData.origin,
    destination: bookingData.destination,
    passengers: bookingData.passengers || 1,
    event_category: 'booking',
  });
};

/**
 * Track booking completed
 * @param {object} bookingData - Booking data
 */
export const trackBookingCompleted = (bookingData) => {
  trackEvent('booking_completed', {
    booking_id: bookingData.id,
    total_amount: bookingData.total_amount,
    payment_method: bookingData.payment_method,
    event_category: 'booking',
    value: bookingData.total_amount,
    currency: 'BWP',
  });
};

/**
 * Track payment successful
 * @param {object} paymentData - Payment data
 */
export const trackPaymentSuccess = (paymentData) => {
  trackEvent('payment_successful', {
    booking_id: paymentData.booking_id,
    amount: paymentData.amount,
    method: paymentData.method,
    provider: paymentData.provider,
    event_category: 'payment',
    value: paymentData.amount,
    currency: paymentData.currency || 'BWP',
  });
};

/**
 * Track payment failed
 * @param {object} paymentData - Payment data
 * @param {string} error - Error message
 */
export const trackPaymentFailed = (paymentData, error) => {
  trackEvent('payment_failed', {
    booking_id: paymentData.booking_id,
    amount: paymentData.amount,
    method: paymentData.method,
    error: error,
    event_category: 'payment',
  });
};

/**
 * Track ticket download
 * @param {string} bookingId - Booking ID
 */
export const trackTicketDownload = (bookingId) => {
  trackEvent('ticket_downloaded', {
    booking_id: bookingId,
    event_category: 'engagement',
  });
};

/**
 * Track search performed
 * @param {object} searchData - Search data
 */
export const trackSearch = (searchData) => {
  trackEvent('search_performed', {
    origin: searchData.origin,
    destination: searchData.destination,
    date: searchData.date,
    passengers: searchData.passengers || 1,
    event_category: 'search',
  });
};

/**
 * Track user engagement
 * @param {string} action - Action name
 * @param {string} category - Category
 * @param {object} params - Additional parameters
 */
export const trackEngagement = (action, category = 'engagement', params = {}) => {
  trackEvent(action, {
    event_category: category,
    ...params,
  });
};

/**
 * Set user properties
 * @param {object} properties - User properties
 */
export const setUserProperties = (properties) => {
  if (!window.gtag) return;
  
  window.gtag('set', 'user_properties', properties);
};

/**
 * Set user ID for tracking
 * @param {string} userId - User ID
 */
export const setUserId = (userId) => {
  if (!window.gtag) return;
  
  window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
    user_id: userId,
  });
};

/**
 * Clear user ID (on logout)
 */
export const clearUserId = () => {
  if (!window.gtag) return;
  
  window.gtag('config', import.meta.env.VITE_GA4_MEASUREMENT_ID, {
    user_id: null,
  });
};
