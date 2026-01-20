// ============================================================
// GOGOBUS PAYMENT ERROR HANDLING UTILITIES
// Provides error mapping, retry logic, and user-friendly messages
// Path: src/utils/paymentErrors.js
// ============================================================

import { logError as logErrorUtil } from './logger';
import { MAX_RETRIES, RETRY_DELAY, MAX_RETRY_DELAY } from './constants';

// ============================================================
// ERROR CODE MAPPING
// ============================================================

export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  
  // Payment gateway errors
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INVALID_CARD: 'INVALID_CARD',
  EXPIRED_CARD: 'EXPIRED_CARD',
  DECLINED: 'DECLINED',
  
  // DPO specific errors
  DPO_INVALID_TOKEN: 'DPO_INVALID_TOKEN',
  DPO_EXPIRED_TOKEN: 'DPO_EXPIRED_TOKEN',
  DPO_INVALID_AMOUNT: 'DPO_INVALID_AMOUNT',
  
  // Orange Money specific errors
  ORANGE_INVALID_PHONE: 'ORANGE_INVALID_PHONE',
  ORANGE_USER_CANCELLED: 'ORANGE_USER_CANCELLED',
  ORANGE_TIMEOUT: 'ORANGE_TIMEOUT',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_REQUEST: 'INVALID_REQUEST',
};

// ============================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================

export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: 'Connection failed. Please check your internet connection and try again.',
  [ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again.',
  [ERROR_CODES.CONNECTION_FAILED]: 'Unable to connect to payment service. Please try again later.',
  
  [ERROR_CODES.INSUFFICIENT_FUNDS]: 'Insufficient funds. Please try another payment method or add funds to your account.',
  [ERROR_CODES.PAYMENT_CANCELLED]: 'Payment was cancelled. You can try again when ready.',
  [ERROR_CODES.PAYMENT_FAILED]: 'Payment failed. Please check your payment details and try again.',
  [ERROR_CODES.INVALID_CARD]: 'Invalid card details. Please check your card number and try again.',
  [ERROR_CODES.EXPIRED_CARD]: 'Your card has expired. Please use a different card.',
  [ERROR_CODES.DECLINED]: 'Payment was declined by your bank. Please contact your bank or try another payment method.',
  
  [ERROR_CODES.DPO_INVALID_TOKEN]: 'Payment session expired. Please start a new payment.',
  [ERROR_CODES.DPO_EXPIRED_TOKEN]: 'Payment session expired. Please start a new payment.',
  [ERROR_CODES.DPO_INVALID_AMOUNT]: 'Invalid payment amount. Please contact support.',
  
  [ERROR_CODES.ORANGE_INVALID_PHONE]: 'Invalid phone number. Please check your Orange Money phone number.',
  [ERROR_CODES.ORANGE_USER_CANCELLED]: 'Payment was cancelled. Please try again when ready.',
  [ERROR_CODES.ORANGE_TIMEOUT]: 'Payment timed out. Please try again.',
  
  [ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again or contact support.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Payment service is temporarily unavailable. Please try again later.',
  [ERROR_CODES.INVALID_REQUEST]: 'Invalid payment request. Please check your details and try again.',
};

// ============================================================
// ERROR CLASSIFIER
// ============================================================

/**
 * Classify error and return error code
 */
export const classifyError = (error) => {
  if (!error) return ERROR_CODES.UNKNOWN_ERROR;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return ERROR_CODES.NETWORK_ERROR;
  }
  
  if (errorMessage.includes('timeout') || errorString.includes('timeout')) {
    return ERROR_CODES.TIMEOUT;
  }
  
  // Payment specific errors
  if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
    return ERROR_CODES.INSUFFICIENT_FUNDS;
  }
  
  if (errorMessage.includes('cancelled') || errorMessage.includes('cancel')) {
    return ERROR_CODES.PAYMENT_CANCELLED;
  }
  
  if (errorMessage.includes('declined') || errorMessage.includes('rejected')) {
    return ERROR_CODES.DECLINED;
  }
  
  if (errorMessage.includes('expired')) {
    return ERROR_CODES.EXPIRED_CARD;
  }
  
  if (errorMessage.includes('invalid card') || errorMessage.includes('card number')) {
    return ERROR_CODES.INVALID_CARD;
  }
  
  // DPO specific
  if (errorMessage.includes('dpo') && errorMessage.includes('token')) {
    return ERROR_CODES.DPO_INVALID_TOKEN;
  }
  
  // Orange Money specific
  if (errorMessage.includes('orange') && errorMessage.includes('phone')) {
    return ERROR_CODES.ORANGE_INVALID_PHONE;
  }
  
  return ERROR_CODES.UNKNOWN_ERROR;
};

// ============================================================
// USER-FRIENDLY MESSAGE GENERATOR
// ============================================================

/**
 * Get user-friendly error message
 */
export const getUserFriendlyMessage = (error) => {
  const errorCode = classifyError(error);
  return ERROR_MESSAGES[errorCode] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
};

// ============================================================
// RETRY LOGIC
// ============================================================

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.initialDelay - Initial delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Function to determine if error should be retried
 */
export const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = MAX_RETRIES,
    initialDelay = RETRY_DELAY,
    maxDelay = MAX_RETRY_DELAY,
    shouldRetry = (error) => {
      // Retry on network errors and timeouts
      const code = classifyError(error);
      return [
        ERROR_CODES.NETWORK_ERROR,
        ERROR_CODES.TIMEOUT,
        ERROR_CODES.CONNECTION_FAILED,
        ERROR_CODES.SERVICE_UNAVAILABLE,
      ].includes(code);
    },
  } = options;
  
  let lastError;
  let delay = initialDelay;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's the last attempt or error shouldn't be retried
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, maxDelay);
    }
  }
  
  throw lastError;
};

// ============================================================
// ERROR LOGGER
// ============================================================

/**
 * Log error to database for debugging
 */
export const logPaymentError = async (supabase, error, context = {}) => {
  try {
    const errorData = {
      error_code: classifyError(error),
      error_message: error.message || error.toString(),
      error_stack: error.stack,
      context: JSON.stringify(context),
      created_at: new Date().toISOString(),
    };
    
    // Log to payment_errors table if it exists, otherwise just console
    const { error: dbError } = await supabase
      .from('payment_errors')
      .insert(errorData);
    
    if (dbError) {
      // Table might not exist, just log using logger utility
      logErrorUtil('Payment Error', errorData);
    }
  } catch (logErr) {
    // Don't throw, just log
    logErrorUtil('Failed to log payment error', logErr);
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const paymentErrors = {
  ERROR_CODES,
  ERROR_MESSAGES,
  classifyError,
  getUserFriendlyMessage,
  retryWithBackoff,
  logPaymentError,
};

export default paymentErrors;
