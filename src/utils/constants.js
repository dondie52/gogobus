/**
 * Application Constants
 * Centralized constants to avoid magic numbers and improve maintainability
 */

// ============================================================
// TIMEOUT CONSTANTS (milliseconds)
// ============================================================

/** API request timeout duration */
export const API_TIMEOUT = 30000; // 30 seconds

/** Payment polling interval */
export const PAYMENT_POLL_INTERVAL = 5000; // 5 seconds

/** Maximum duration for payment polling */
export const PAYMENT_POLL_MAX_DURATION = 120000; // 2 minutes

/** Token refresh check interval */
export const TOKEN_REFRESH_CHECK_INTERVAL = 60000; // 1 minute

/** Token refresh buffer before expiration */
export const TOKEN_REFRESH_BUFFER = 300; // 5 minutes (in seconds)

/** Magic link processing delay */
export const MAGIC_LINK_PROCESSING_DELAY = 500; // 500ms

/** Authentication timeout */
export const AUTH_TIMEOUT = 5000; // 5 seconds

// ============================================================
// RETRY CONFIGURATION
// ============================================================

/** Maximum number of retry attempts */
export const MAX_RETRIES = 3;

/** Initial retry delay (milliseconds) */
export const RETRY_DELAY = 1000; // 1 second

/** Maximum retry delay (milliseconds) */
export const MAX_RETRY_DELAY = 10000; // 10 seconds

// ============================================================
// VALIDATION LIMITS
// ============================================================

/** Maximum number of seats per booking */
export const MAX_SEATS = 10;

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Maximum password length */
export const MAX_PASSWORD_LENGTH = 128;

/** Maximum name length */
export const MAX_NAME_LENGTH = 100;

/** Maximum phone number length */
export const MAX_PHONE_LENGTH = 15;

/** Maximum email length */
export const MAX_EMAIL_LENGTH = 255;

/** Minimum phone number length (including country code) */
export const MIN_PHONE_LENGTH = 10;

// ============================================================
// PERFORMANCE THRESHOLDS
// ============================================================

/** Slow API call threshold (milliseconds) */
export const SLOW_API_THRESHOLD = 1000; // 1 second

/** Slow resource load threshold (milliseconds) */
export const SLOW_RESOURCE_THRESHOLD = 3000; // 3 seconds

/** Page load time target (milliseconds) */
export const PAGE_LOAD_TARGET = 3000; // 3 seconds

/** API response time target (milliseconds) */
export const API_RESPONSE_TARGET = 500; // 500ms

// ============================================================
// PRICING CONSTANTS
// ============================================================

/** Rate per kilometer (in Pula) */
export const RATE_PER_KM = 0.35;

/** Service fee percentage */
export const SERVICE_FEE_PERCENTAGE = 0.05; // 5%

/** Minimum service fee */
export const MIN_SERVICE_FEE = 5; // 5 BWP

// ============================================================
// CACHE DURATIONS (milliseconds)
// ============================================================

/** Route cache duration */
export const ROUTE_CACHE_DURATION = 3600000; // 1 hour

/** Profile cache duration */
export const PROFILE_CACHE_DURATION = 300000; // 5 minutes

/** Popular routes cache duration */
export const POPULAR_ROUTES_CACHE_DURATION = 1800000; // 30 minutes

// ============================================================
// UI CONSTANTS
// ============================================================

/** Splash screen duration (milliseconds) */
export const SPLASH_DURATION = 2500; // 2.5 seconds

/** Toast notification display duration (milliseconds) */
export const TOAST_DURATION = 3000; // 3 seconds

/** Copy to clipboard feedback duration (milliseconds) */
export const COPY_FEEDBACK_DURATION = 2000; // 2 seconds

/** Hero slide rotation interval (milliseconds) */
export const HERO_SLIDE_INTERVAL = 5000; // 5 seconds

// ============================================================
// PAGINATION
// ============================================================

/** Default items per page */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum items per page */
export const MAX_PAGE_SIZE = 100;

// ============================================================
// FILE UPLOAD LIMITS
// ============================================================

/** Maximum file size for avatar (bytes) */
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

/** Allowed avatar MIME types */
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/** Maximum filename length */
export const MAX_FILENAME_LENGTH = 255;

// ============================================================
// RATE LIMITING
// ============================================================

/** Maximum login attempts before lockout */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Account lockout duration (milliseconds) */
export const ACCOUNT_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/** Rate limit window for password reset (milliseconds) */
export const PASSWORD_RESET_RATE_LIMIT = 60 * 1000; // 1 minute

// ============================================================
// PAYMENT CONFIGURATION
// ============================================================

/**
 * Use mock payment bypass instead of real payment gateways
 * Set VITE_USE_MOCK_PAYMENTS=false to enable real payment integration
 * Defaults to true for development/testing
 */
export const USE_MOCK_PAYMENTS = import.meta.env.VITE_USE_MOCK_PAYMENTS !== 'false';
