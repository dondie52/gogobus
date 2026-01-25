/**
 * Client-side rate limiter for authentication endpoints
 * Prevents brute force attacks by limiting login attempts
 */

const STORAGE_KEY_PREFIX = 'gogobus_rate_limit_';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Disable rate limiting in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Get rate limit key for a specific identifier (email, IP, etc.)
 * @param {string} identifier - Unique identifier (usually email)
 * @returns {string} - Storage key
 */
const getStorageKey = (identifier) => {
  return `${STORAGE_KEY_PREFIX}${identifier}`;
};

/**
 * Get rate limit data for an identifier
 * @param {string} identifier - Unique identifier
 * @returns {object|null} - Rate limit data or null
 */
const getRateLimitData = (identifier) => {
  try {
    const key = getStorageKey(identifier);
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

/**
 * Set rate limit data for an identifier
 * @param {string} identifier - Unique identifier
 * @param {object} data - Rate limit data
 */
const setRateLimitData = (identifier, data) => {
  try {
    const key = getStorageKey(identifier);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Ignore localStorage errors (private browsing, etc.)
  }
};

/**
 * Clear rate limit data for an identifier
 * @param {string} identifier - Unique identifier
 */
const clearRateLimitData = (identifier) => {
  try {
    const key = getStorageKey(identifier);
    localStorage.removeItem(key);
  } catch (error) {
    // Ignore localStorage errors
  }
};

/**
 * Check if identifier is rate limited
 * @param {string} identifier - Unique identifier (usually email)
 * @returns {object} - { limited: boolean, remainingAttempts: number, lockoutUntil?: number }
 */
export const checkRateLimit = (identifier) => {
  // Disable rate limiting in development mode and clear any existing lockouts
  if (isDevelopment) {
    clearRateLimitData(identifier);
    return { limited: false, remainingAttempts: MAX_ATTEMPTS };
  }
  
  const data = getRateLimitData(identifier);
  
  if (!data) {
    return { limited: false, remainingAttempts: MAX_ATTEMPTS };
  }
  
  const now = Date.now();
  
  // Check if lockout period has expired
  if (data.lockoutUntil && now < data.lockoutUntil) {
    const minutesRemaining = Math.ceil((data.lockoutUntil - now) / 60000);
    return {
      limited: true,
      remainingAttempts: 0,
      lockoutUntil: data.lockoutUntil,
      minutesRemaining,
    };
  }
  
  // Reset if lockout expired
  if (data.lockoutUntil && now >= data.lockoutUntil) {
    clearRateLimitData(identifier);
    return { limited: false, remainingAttempts: MAX_ATTEMPTS };
  }
  
  // Check if max attempts reached
  if (data.attempts >= MAX_ATTEMPTS) {
    // Lock out for 15 minutes
    const lockoutUntil = now + LOCKOUT_DURATION;
    setRateLimitData(identifier, {
      attempts: MAX_ATTEMPTS,
      lockoutUntil,
      lastAttempt: now,
    });
    return {
      limited: true,
      remainingAttempts: 0,
      lockoutUntil,
      minutesRemaining: 15,
    };
  }
  
  return {
    limited: false,
    remainingAttempts: MAX_ATTEMPTS - data.attempts,
  };
};

/**
 * Record a failed attempt
 * @param {string} identifier - Unique identifier
 */
export const recordFailedAttempt = (identifier) => {
  // Don't record failed attempts in development mode
  if (isDevelopment) {
    return;
  }
  
  const data = getRateLimitData(identifier) || { attempts: 0 };
  data.attempts = (data.attempts || 0) + 1;
  data.lastAttempt = Date.now();
  
  // If max attempts reached, set lockout
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockoutUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  setRateLimitData(identifier, data);
};

/**
 * Clear failed attempts (on successful login)
 * @param {string} identifier - Unique identifier
 */
export const clearFailedAttempts = (identifier) => {
  clearRateLimitData(identifier);
};

/**
 * Get remaining lockout time in minutes
 * @param {string} identifier - Unique identifier
 * @returns {number|null} - Minutes remaining or null if not locked
 */
export const getLockoutTimeRemaining = (identifier) => {
  const data = getRateLimitData(identifier);
  if (!data || !data.lockoutUntil) return null;
  
  const now = Date.now();
  if (now >= data.lockoutUntil) {
    clearRateLimitData(identifier);
    return null;
  }
  
  return Math.ceil((data.lockoutUntil - now) / 60000);
};

/**
 * Clear all rate limit data (useful for development/testing)
 * @param {string} identifier - Optional identifier to clear, or clear all if not provided
 */
export const clearAllRateLimits = (identifier) => {
  if (identifier) {
    clearRateLimitData(identifier);
  } else {
    // Clear all rate limit entries
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Ignore errors
    }
  }
};

// Expose clear function globally in development for easy access
if (isDevelopment && typeof window !== 'undefined') {
  window.clearRateLimit = clearAllRateLimits;
}
