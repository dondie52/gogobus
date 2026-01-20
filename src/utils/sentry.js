/**
 * Sentry Error Tracking Configuration
 * Production error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

/**
 * Initialize Sentry error tracking
 * Only initializes in production if DSN is provided
 */
export const initSentry = () => {
  // Don't initialize in development or if DSN is not provided
  if (isDevelopment || !sentryDsn) {
    console.log('[Sentry] Not initialized - Development mode or DSN not provided');
    return;
  }

  try {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE || 'production',
      // Performance monitoring - sample 10% of transactions
      tracesSampleRate: 0.1,
      // Session replay - disabled for now to reduce data usage
      // replaysSessionSampleRate: 0.1,
      // replaysOnErrorSampleRate: 1.0,
      
      // Filter out common non-actionable errors
      beforeSend(event, hint) {
        // Filter out browser extension errors
        if (event.exception) {
          const error = hint.originalException || hint.syntheticException;
          const errorMessage = error?.message || event.exception.values?.[0]?.value || '';
          
          // Ignore common browser extension errors
          if (
            errorMessage.includes('Non-Error promise rejection captured') ||
            errorMessage.includes('ResizeObserver loop') ||
            errorMessage.includes('ChunkLoadError') ||
            errorMessage.includes('Loading chunk') ||
            errorMessage.includes('Failed to fetch dynamically imported module')
          ) {
            return null; // Don't send to Sentry
          }
        }
        
        return event;
      },
      
      // Ignore specific URLs (e.g., browser extensions)
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'originalCreateNotification',
        'canvas.contentDocument',
        'MyApp_RemoveAllHighlights',
        'atomicFindClose',
        'fb_xd_fragment',
        'bmi_SafeAddOnload',
        'EBCallBackMessageReceived',
        // Network errors that are user's fault
        'NetworkError',
        'Network request failed',
      ],
      
      // Release tracking (can be set via CI/CD)
      release: import.meta.env.VITE_APP_VERSION || undefined,
      
      // Configure integrations
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false, // Don't mask text for better debugging
          blockAllMedia: true, // Block media for privacy
        }),
      ],
    });
    
    console.log('[Sentry] Initialized successfully');
  } catch (error) {
    console.error('[Sentry] Failed to initialize:', error);
  }
};

/**
 * Set user context for error tracking
 * @param {Object} user - User object with id, email, etc.
 */
export const setUser = (user) => {
  if (!sentryDsn || isDevelopment) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.full_name,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUser = () => {
  if (!sentryDsn || isDevelopment) return;
  
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 * @param {string} message - Breadcrumb message
 * @param {string} category - Breadcrumb category
 * @param {Object} data - Additional data
 */
export const addBreadcrumb = (message, category = 'default', data = {}) => {
  if (!sentryDsn || isDevelopment) return;
  
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Capture exception manually
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const captureException = (error, context = {}) => {
  if (!sentryDsn || isDevelopment) {
    // In development, still log to console
    console.error('[Error]', error, context);
    return;
  }
  
  Sentry.captureException(error, {
    contexts: {
      additional: context,
    },
  });
};

/**
 * Capture message manually
 * @param {string} message - Message to capture
 * @param {string} level - Log level (info, warning, error)
 */
export const captureMessage = (message, level = 'info') => {
  if (!sentryDsn || isDevelopment) {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }
  
  Sentry.captureMessage(message, level);
};

export default Sentry;
