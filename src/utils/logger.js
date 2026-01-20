/**
 * Production-safe logging utility
 * Only logs in development mode, sanitizes sensitive data
 */

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Sanitize sensitive data from log messages
 * @param {any} data - Data to sanitize
 * @returns {any} - Sanitized data
 */
const sanitizeLogData = (data) => {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Remove potential sensitive patterns
    return data
      .replace(/password["\s:=]+[^,\s}]+/gi, 'password: [REDACTED]')
      .replace(/token["\s:=]+[^,\s}]+/gi, 'token: [REDACTED]')
      .replace(/key["\s:=]+[^,\s}]+/gi, 'key: [REDACTED]')
      .replace(/secret["\s:=]+[^,\s}]+/gi, 'secret: [REDACTED]');
  }
  
  if (typeof data === 'object') {
    const sanitized = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();
        // Redact sensitive fields
        if (lowerKey.includes('password') || 
            lowerKey.includes('token') || 
            lowerKey.includes('secret') || 
            lowerKey.includes('key') ||
            lowerKey.includes('auth')) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitizeLogData(data[key]);
        }
      }
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Log info message (development only)
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export const logInfo = (message, data = null) => {
  if (!isDevelopment) return;
  const sanitized = data ? sanitizeLogData(data) : null;
  console.log(`[INFO] ${message}`, sanitized || '');
};

/**
 * Log warning message (always logged, but sanitized)
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export const logWarn = (message, data = null) => {
  const sanitized = data ? sanitizeLogData(data) : null;
  console.warn(`[WARN] ${message}`, sanitized || '');
};

/**
 * Log error message (always logged, but sanitized)
 * @param {string} message - Log message
 * @param {Error|any} error - Error object or data
 */
export const logError = (message, error = null) => {
  const sanitized = error ? sanitizeLogData(error) : null;
  console.error(`[ERROR] ${message}`, sanitized || '');
  
  // In production, send to error tracking service (Sentry)
  if (!isDevelopment && error instanceof Error) {
    // Import dynamically to avoid loading Sentry in development
    import('./sentry').then(({ captureException }) => {
      captureException(error);
    }).catch(() => {
      // Sentry not available, ignore
    });
  }
};

/**
 * Log debug message (development only)
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export const logDebug = (message, data = null) => {
  if (!isDevelopment) return;
  const sanitized = data ? sanitizeLogData(data) : null;
  console.debug(`[DEBUG] ${message}`, sanitized || '');
};

/**
 * Log API request (development only)
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {any} data - Request data
 */
export const logApiRequest = (method, url, data = null) => {
  if (!isDevelopment) return;
  const sanitized = data ? sanitizeLogData(data) : null;
  console.log(`[API] ${method} ${url}`, sanitized || '');
};

/**
 * Log API response (development only)
 * @param {string} method - HTTP method
 * @param {string} url - Request URL
 * @param {any} response - Response data
 */
export const logApiResponse = (method, url, response = null) => {
  if (!isDevelopment) return;
  const sanitized = response ? sanitizeLogData(response) : null;
  console.log(`[API] ${method} ${url} →`, sanitized || '');
};
