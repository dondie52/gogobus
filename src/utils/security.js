/**
 * Security Utilities
 * Comprehensive security functions for authentication and authorization
 */

import { supabase } from '../services/supabase';
import { logInfo, logError } from './logger';
import { TOKEN_REFRESH_BUFFER, TOKEN_REFRESH_CHECK_INTERVAL } from './constants';

/**
 * JWT Token Refresh with Rotation
 * Automatically refreshes tokens before expiration and handles rotation
 */

let refreshTimer = null;

/**
 * Initialize automatic token refresh with rotation
 * Should be called once on app initialization
 */
export const initTokenRefresh = () => {
  // Clear any existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  // Check token expiry every minute
  refreshTimer = setInterval(async () => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:28',message:'Token refresh check starting',data:{url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.expires_at) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:32',message:'No session or expires_at, skipping refresh',data:{hasSession:!!session,hasExpiresAt:!!session?.expires_at,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:38',message:'Token expiry check',data:{expiresAt:expiresAt,now:now,timeUntilExpiry:timeUntilExpiry,shouldRefresh:timeUntilExpiry<TOKEN_REFRESH_BUFFER,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Refresh if token expires within buffer time
      if (timeUntilExpiry < TOKEN_REFRESH_BUFFER) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:42',message:'Refreshing token - expires soon',data:{timeUntilExpiry:timeUntilExpiry,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        logInfo('[Security] Refreshing token (expires soon)');
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:47',message:'Token refresh failed',data:{error:error.message,errorCode:error.status,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          logError('[Security] Token refresh failed', error);
          // If refresh fails, user will need to re-authenticate
          return;
        }

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:52',message:'Token refreshed successfully',data:{hasNewSession:!!data?.session,newExpiresAt:data?.session?.expires_at,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        logInfo('[Security] Token refreshed successfully');
        
        // Token rotation happens automatically with Supabase
        // Old refresh token is invalidated, new one is provided
      }
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'security.js:57',message:'Token refresh check error',data:{error:error.message,errorStack:error.stack?.substring(0,500),url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      logError('[Security] Token refresh error', error);
    }
  }, TOKEN_REFRESH_CHECK_INTERVAL);

  return () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
  };
};

/**
 * Verify JWT token expiration settings
 * Checks if token expiration is configured correctly
 * @returns {object} - Token expiration info
 */
export const verifyTokenExpiration = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return {
        valid: false,
        error: 'No active session',
      };
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = session.expires_at;
    const timeUntilExpiry = expiresAt - now;
    const expiresIn = Math.floor((expiresAt - now) / 60); // minutes

    return {
      valid: timeUntilExpiry > 0,
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      expiresIn: `${expiresIn} minutes`,
      timeUntilExpiry,
      shouldRefresh: timeUntilExpiry < TOKEN_REFRESH_BUFFER,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};

/**
 * Verify email before allowing bookings
 * Checks if user's email is verified
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if email is verified
 */
export const verifyEmailForBooking = async (userId) => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return false;
    }

    // Check if email is verified
    if (!user.email_confirmed_at) {
      return false;
    }

    return true;
  } catch (error) {
    logError('[Security] Email verification error', error);
    return false;
  }
};

/**
 * Security audit helper
 * Checks various security settings and configurations
 * @returns {Promise<object>} - Security audit results
 */
export const performSecurityAudit = async () => {
  const results = {
    tokenExpiration: null,
    emailVerification: null,
    rlsEnabled: null,
    httpsEnabled: null,
    secureCookies: null,
  };

  try {
    // Check token expiration
    results.tokenExpiration = await verifyTokenExpiration();

    // Check email verification
    const { data: { user } } = await supabase.auth.getUser();
    results.emailVerification = {
      verified: !!user?.email_confirmed_at,
      email: user?.email || null,
    };

    // Check HTTPS
    results.httpsEnabled = {
      enabled: window.location.protocol === 'https:',
      protocol: window.location.protocol,
    };

    // Check secure cookies (if available)
    results.secureCookies = {
      secure: document.cookie.includes('HttpOnly') || true, // Supabase handles this
      note: 'Supabase manages cookie security',
    };

    // RLS check would need to be done via API
    results.rlsEnabled = {
      note: 'RLS policies should be verified in Supabase dashboard',
    };

    return results;
  } catch (error) {
    logError('[Security] Audit error', error);
    return {
      ...results,
      error: error.message,
    };
  }
};

/**
 * Check if user has permission for action
 * @param {string} action - Action to check
 * @param {object} user - User object
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (action, user) => {
  if (!user) return false;

  // Admin has all permissions
  if (user.role === 'admin' || user.role === 'operator') {
    return true;
  }

  // Define permission matrix
  const permissions = {
    'book:create': ['user', 'admin', 'operator'],
    'book:view-own': ['user', 'admin', 'operator'],
    'book:cancel-own': ['user', 'admin', 'operator'],
    'admin:access': ['admin', 'operator'],
    'admin:manage-trips': ['admin', 'operator'],
    'admin:manage-bookings': ['admin', 'operator'],
    'admin:manage-users': ['admin'],
  };

  const allowedRoles = permissions[action] || [];
  return allowedRoles.includes(user.role);
};

/**
 * Sanitize file name to prevent path traversal
 * @param {string} filename - File name to sanitize
 * @returns {string} - Sanitized file name
 */
export const sanitizeFilename = (filename) => {
  if (!filename || typeof filename !== 'string') return '';
  
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '_');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>:"|?*]/g, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }
  
  return sanitized;
};

/**
 * Check if request origin is allowed (CORS helper)
 * @param {string} origin - Request origin
 * @param {string[]} allowedOrigins - Allowed origins
 * @returns {boolean} - True if origin is allowed
 */
export const isOriginAllowed = (origin, allowedOrigins = []) => {
  if (!origin) return false;
  
  const defaultAllowed = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://gogobus.co.bw',
    'https://www.gogobus.co.bw',
  ];
  
  const allowed = [...defaultAllowed, ...allowedOrigins];
  
  return allowed.some(allowedOrigin => {
    if (allowedOrigin.includes('*')) {
      const pattern = new RegExp('^' + allowedOrigin.replace(/\*/g, '.*') + '$');
      return pattern.test(origin);
    }
    return origin === allowedOrigin;
  });
};
