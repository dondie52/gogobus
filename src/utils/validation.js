/**
 * Centralized validation utilities for GOGOBUS
 * Provides validation and sanitization functions for all user inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Botswana phone number format (+267XXXXXXXX)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Botswana phone format
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Botswana format: +267 followed by 8 digits
  const phoneRegex = /^\+267\d{8}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Sanitize phone number (remove spaces, dashes, keep only digits and +)
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  // Remove all characters except digits and +
  return phone.replace(/[^\d+]/g, '');
};

/**
 * Validate name (full name, passenger name, etc.)
 * @param {string} name - Name to validate
 * @param {object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 2)
 * @param {number} options.maxLength - Maximum length (default: 100)
 * @returns {boolean} - True if valid name
 */
export const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 100 } = options;
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) return false;
  // Allow letters, spaces, hyphens, apostrophes (for names like O'Brien, Mary-Jane)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  return nameRegex.test(trimmed);
};

/**
 * Validate payment amount
 * @param {number|string} amount - Amount to validate
 * @param {object} options - Validation options
 * @param {number} options.min - Minimum amount (default: 0.01)
 * @param {number} options.max - Maximum amount (default: 100000)
 * @returns {boolean} - True if valid amount
 */
export const validateAmount = (amount, options = {}) => {
  const { min = 0.01, max = 100000 } = options;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || !isFinite(numAmount)) return false;
  return numAmount >= min && numAmount <= max;
};

/**
 * Validate date (not in past, valid format)
 * @param {string|Date} date - Date to validate
 * @param {object} options - Validation options
 * @param {boolean} options.allowPast - Allow past dates (default: false)
 * @param {number} options.maxDaysFuture - Maximum days in future (default: 365)
 * @returns {boolean} - True if valid date
 */
export const validateDate = (date, options = {}) => {
  const { allowPast = false, maxDaysFuture = 365 } = options;
  if (!date) return false;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return false;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);
  
  if (!allowPast && dateObj < now) return false;
  
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + maxDaysFuture);
  if (dateObj > maxDate) return false;
  
  return true;
};

/**
 * Validate seat selection
 * @param {string|string[]} seats - Seat number(s) to validate
 * @param {number} maxSeats - Maximum number of seats allowed
 * @returns {boolean} - True if valid seat selection
 */
export const validateSeats = (seats, maxSeats = 10) => {
  if (!seats) return false;
  const seatArray = Array.isArray(seats) ? seats : [seats];
  if (seatArray.length === 0 || seatArray.length > maxSeats) return false;
  
  // Seat format: row number + letter (e.g., "1A", "12B", "5D")
  const seatRegex = /^\d+[A-Z]$/i;
  return seatArray.every(seat => {
    if (typeof seat !== 'string') return false;
    return seatRegex.test(seat.trim());
  });
};

/**
 * Sanitize input to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // Import XSS utilities for enhanced protection
  // Using inline implementation for backward compatibility
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Check if input contains XSS patterns
 * @param {string} input - Input to check
 * @returns {boolean} - True if potentially dangerous
 */
export const containsXssPattern = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /expression\s*\(/i,
    /-moz-binding/i,
    /vbscript:/i,
    /data:\s*text\/html/i,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitize object recursively (for nested objects)
 * @param {any} obj - Object to sanitize
 * @returns {any} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Validate booking input data
 * @param {object} bookingData - Booking data to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const validateBookingInput = (bookingData) => {
  const errors = [];
  
  if (!bookingData.schedule_id) {
    errors.push('Schedule ID is required');
  }
  
  if (!bookingData.seats || !Array.isArray(bookingData.seats) || bookingData.seats.length === 0) {
    errors.push('At least one seat must be selected');
  } else if (!validateSeats(bookingData.seats)) {
    errors.push('Invalid seat selection format');
  }
  
  if (!bookingData.passenger_name || !validateName(bookingData.passenger_name)) {
    errors.push('Valid passenger name is required');
  }
  
  if (!bookingData.passenger_email || !validateEmail(bookingData.passenger_email)) {
    errors.push('Valid passenger email is required');
  }
  
  if (!bookingData.passenger_phone || !validatePhone(bookingData.passenger_phone)) {
    errors.push('Valid passenger phone number is required (format: +267XXXXXXXX)');
  }
  
  if (bookingData.total_price && !validateAmount(bookingData.total_price)) {
    errors.push('Invalid payment amount');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} - True if valid UUID
 */
export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 8)
 * @param {boolean} options.requireUppercase - Require uppercase (default: false)
 * @param {boolean} options.requireLowercase - Require lowercase (default: false)
 * @param {boolean} options.requireNumber - Require number (default: false)
 * @param {boolean} options.requireSpecial - Require special char (default: false)
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecial = false,
  } = options;
  
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate date-time string
 * @param {string} dateTime - ISO date-time string
 * @returns {boolean} - True if valid ISO date-time
 */
export const validateDateTime = (dateTime) => {
  if (!dateTime || typeof dateTime !== 'string') return false;
  const date = new Date(dateTime);
  return !isNaN(date.getTime()) && dateTime.includes('T');
};

/**
 * Sanitize and validate phone number
 * @param {string} phone - Phone number to sanitize and validate
 * @returns {object} - { valid: boolean, sanitized: string, error?: string }
 */
export const sanitizeAndValidatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, sanitized: '', error: 'Phone number is required' };
  }
  
  let sanitized = sanitizePhone(phone);
  
  // If doesn't start with +267, try to add it
  if (!sanitized.startsWith('+267')) {
    if (sanitized.startsWith('267')) {
      sanitized = '+' + sanitized;
    } else if (sanitized.length === 8) {
      sanitized = '+267' + sanitized;
    } else {
      return { valid: false, sanitized, error: 'Invalid phone number format' };
    }
  }
  
  if (!validatePhone(sanitized)) {
    return { valid: false, sanitized, error: 'Phone number must be in format +267XXXXXXXX' };
  }
  
  return { valid: true, sanitized };
};
