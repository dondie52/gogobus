import { supabase, BASE_URL } from './supabase';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts } from '../utils/rateLimiter';
import { logError, logInfo } from '../utils/logger';

/**
 * Authentication service
 * Handles all authentication-related operations
 */
export const authService = {
  /**
   * Sign up with email and password
   */
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // { full_name, phone }
        emailRedirectTo: BASE_URL,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in with email and password
   * Includes rate limiting and account lockout protection
   */
  async signIn(email, password) {
    // Check rate limit
    const rateLimit = checkRateLimit(email);
    if (rateLimit.limited) {
      const error = new Error(
        `Too many failed login attempts. Please try again in ${rateLimit.minutesRemaining} minute(s).`
      );
      error.name = 'RateLimitError';
      throw error;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Record failed attempt
        recordFailedAttempt(email);
        throw error;
      }

      // Clear failed attempts on successful login
      clearFailedAttempts(email);
      return data;
    } catch (error) {
      logError('Sign in error', { email, error: error.message });
      throw error;
    }
  },

  /**
   * Refresh the current session
   * Automatically refreshes token before expiration
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logError('Session refresh error', error);
        throw error;
      }
      logInfo('Session refreshed successfully');
      return data;
    } catch (error) {
      logError('Failed to refresh session', error);
      throw error;
    }
  },

  /**
   * Sign in with OAuth provider (Google, Facebook, Apple)
   */
  async signInWithProvider(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: BASE_URL,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Send OTP to email
   */
  async sendOTP(email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Resend email verification
   */
  async resendVerificationEmail(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: BASE_URL,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Verify OTP
   */
  async verifyOTP(email, token) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) throw error;
    return data;
  },

  /**
   * Reset password
   * Includes rate limiting to prevent abuse
   */
  async resetPassword(email) {
    // Check rate limit for password reset
    const rateLimit = checkRateLimit(`reset_${email}`);
    if (rateLimit.limited) {
      const error = new Error(
        `Too many password reset requests. Please try again in ${rateLimit.minutesRemaining} minute(s).`
      );
      error.name = 'RateLimitError';
      throw error;
    }

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${BASE_URL}/reset-password`,
      });

      if (error) {
        recordFailedAttempt(`reset_${email}`);
        throw error;
      }

      // Record successful request (for rate limiting)
      recordFailedAttempt(`reset_${email}`);
      return data;
    } catch (error) {
      logError('Password reset error', { email, error: error.message });
      throw error;
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
