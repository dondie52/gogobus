/**
 * API request logging utility
 * Logs API requests and responses in development mode
 */

import { logApiRequest, logApiResponse, logError } from './logger';

/**
 * Wrap fetch to automatically log requests and responses
 * @param {string} url - Request URL
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const loggedFetch = async (url, options = {}) => {
  const method = options.method || 'GET';
  
  try {
    logApiRequest(method, url, {
      headers: sanitizeHeaders(options.headers),
      body: options.body,
    });
    
    const response = await fetch(url, options);
    const responseData = await response.clone().json().catch(() => null);
    
    logApiResponse(method, url, {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
    });
    
    return response;
  } catch (error) {
    logError(`API Request failed: ${method} ${url}`, error);
    throw error;
  }
};

/**
 * Sanitize headers to remove sensitive data
 * @param {HeadersInit} headers - Headers to sanitize
 * @returns {object} - Sanitized headers
 */
const sanitizeHeaders = (headers) => {
  if (!headers) return {};
  
  if (headers instanceof Headers) {
    const sanitized = {};
    headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('authorization') || 
          lowerKey.includes('token') || 
          lowerKey.includes('secret') ||
          lowerKey.includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    });
    return sanitized;
  }
  
  if (typeof headers === 'object') {
    const sanitized = {};
    for (const key in headers) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('authorization') || 
          lowerKey.includes('token') || 
          lowerKey.includes('secret') ||
          lowerKey.includes('key')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = headers[key];
      }
    }
    return sanitized;
  }
  
  return headers;
};

/**
 * Log Supabase operation
 * @param {string} operation - Operation name (e.g., 'select', 'insert')
 * @param {string} table - Table name
 * @param {any} data - Operation data
 */
export const logSupabaseOperation = (operation, table, data = null) => {
  logApiRequest('SUPABASE', `${operation.toUpperCase()} ${table}`, data);
};

/**
 * Log Supabase response
 * @param {string} operation - Operation name
 * @param {string} table - Table name
 * @param {any} response - Response data
 * @param {any} error - Error if any
 */
export const logSupabaseResponse = (operation, table, response = null, error = null) => {
  if (error) {
    logError(`Supabase ${operation} ${table} failed`, error);
  } else {
    logApiResponse('SUPABASE', `${operation.toUpperCase()} ${table}`, response);
  }
};
