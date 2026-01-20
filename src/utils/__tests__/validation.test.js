/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  sanitizePhone,
  validateName,
  validateAmount,
  validateDate,
  validateSeats,
  sanitizeInput,
  sanitizeObject,
  validateBookingInput,
  validateUUID,
  validatePassword,
  validateDateTime,
  sanitizeAndValidatePhone,
} from '../validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.bw')).toBe(true);
    expect(validateEmail('user+tag@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });

  it('should trim whitespace', () => {
    expect(validateEmail('  test@example.com  ')).toBe(true);
  });
});

describe('validatePhone', () => {
  it('should validate Botswana phone numbers', () => {
    expect(validatePhone('+26771234567')).toBe(true);
    expect(validatePhone('+26776543210')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhone('71234567')).toBe(false); // Missing +267
    expect(validatePhone('+2671234567')).toBe(false); // Too short
    expect(validatePhone('+267712345678')).toBe(false); // Too long
    expect(validatePhone('+2677123456a')).toBe(false); // Contains letter
    expect(validatePhone('')).toBe(false);
    expect(validatePhone(null)).toBe(false);
  });

  it('should trim whitespace', () => {
    expect(validatePhone('  +26771234567  ')).toBe(true);
  });
});

describe('sanitizePhone', () => {
  it('should remove spaces and dashes', () => {
    expect(sanitizePhone('+267 7123 4567')).toBe('+26771234567');
    expect(sanitizePhone('+267-7123-4567')).toBe('+26771234567');
    expect(sanitizePhone('+267 7123-4567')).toBe('+26771234567');
  });

  it('should keep only digits and +', () => {
    expect(sanitizePhone('+267-7123-4567')).toBe('+26771234567');
    expect(sanitizePhone('26771234567')).toBe('26771234567');
  });

  it('should handle empty or null input', () => {
    expect(sanitizePhone('')).toBe('');
    expect(sanitizePhone(null)).toBe('');
    expect(sanitizePhone(undefined)).toBe('');
  });
});

describe('validateName', () => {
  it('should validate correct names', () => {
    expect(validateName('John Doe')).toBe(true);
    expect(validateName('Mary-Jane')).toBe(true);
    expect(validateName("O'Brien")).toBe(true);
    expect(validateName('Dr. Smith')).toBe(true);
  });

  it('should reject invalid names', () => {
    expect(validateName('A')).toBe(false); // Too short
    expect(validateName('')).toBe(false);
    expect(validateName(null)).toBe(false);
    expect(validateName('John123')).toBe(false); // Contains numbers
    expect(validateName('John@Doe')).toBe(false); // Contains special chars
  });

  it('should respect min/max length options', () => {
    expect(validateName('Jo', { minLength: 3 })).toBe(false);
    expect(validateName('John', { minLength: 3 })).toBe(true);
    expect(validateName('A'.repeat(101), { maxLength: 100 })).toBe(false);
  });
});

describe('validateAmount', () => {
  it('should validate correct amounts', () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount(0.01)).toBe(true);
    expect(validateAmount('100.50')).toBe(true);
    expect(validateAmount(99999)).toBe(true);
  });

  it('should reject invalid amounts', () => {
    expect(validateAmount(0)).toBe(false); // Below minimum
    expect(validateAmount(-10)).toBe(false); // Negative
    expect(validateAmount(100001)).toBe(false); // Above maximum
    expect(validateAmount('invalid')).toBe(false);
    expect(validateAmount(NaN)).toBe(false);
    expect(validateAmount(Infinity)).toBe(false);
  });

  it('should respect custom min/max', () => {
    expect(validateAmount(50, { min: 100 })).toBe(false);
    expect(validateAmount(150, { min: 100, max: 200 })).toBe(true);
    expect(validateAmount(250, { min: 100, max: 200 })).toBe(false);
  });
});

describe('validateDate', () => {
  it('should validate future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(validateDate(tomorrow)).toBe(true);
    expect(validateDate(tomorrow.toISOString())).toBe(true);
  });

  it('should reject past dates by default', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(validateDate(yesterday)).toBe(false);
  });

  it('should allow past dates when configured', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(validateDate(yesterday, { allowPast: true })).toBe(true);
  });

  it('should reject invalid dates', () => {
    expect(validateDate('invalid')).toBe(false);
    expect(validateDate('2023-13-45')).toBe(false);
    expect(validateDate(null)).toBe(false);
  });

  it('should respect maxDaysFuture', () => {
    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 400);
    expect(validateDate(farFuture, { maxDaysFuture: 365 })).toBe(false);
  });
});

describe('validateSeats', () => {
  it('should validate correct seat selections', () => {
    expect(validateSeats('1A')).toBe(true);
    expect(validateSeats(['1A', '1B'])).toBe(true);
    expect(validateSeats('12D')).toBe(true);
    expect(validateSeats(['5A', '5B', '5C'])).toBe(true);
  });

  it('should reject invalid seat selections', () => {
    expect(validateSeats('A1')).toBe(false); // Wrong format
    expect(validateSeats('1')).toBe(false); // Missing letter
    expect(validateSeats('1AA')).toBe(false); // Too many letters
    expect(validateSeats([])).toBe(false); // Empty array
    expect(validateSeats(null)).toBe(false);
  });

  it('should respect maxSeats', () => {
    const manySeats = Array.from({ length: 11 }, (_, i) => `${i + 1}A`);
    expect(validateSeats(manySeats, 10)).toBe(false);
    expect(validateSeats(manySeats.slice(0, 10), 10)).toBe(true);
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML special characters', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
    expect(sanitizeInput('Hello & World')).toBe('Hello &amp; World');
    expect(sanitizeInput("It's working")).toBe('It&#x27;s working');
  });

  it('should handle empty or null input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null)).toBe('');
    expect(sanitizeInput(undefined)).toBe('');
  });
});

describe('sanitizeObject', () => {
  it('should sanitize nested objects', () => {
    const input = {
      name: '<script>alert("xss")</script>',
      email: 'test@example.com',
      nested: {
        value: 'Hello & World',
      },
    };
    const output = sanitizeObject(input);
    expect(output.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    expect(output.email).toBe('test@example.com');
    expect(output.nested.value).toBe('Hello &amp; World');
  });

  it('should sanitize arrays', () => {
    const input = ['<script>', 'normal text', '& special'];
    const output = sanitizeObject(input);
    expect(output[0]).toBe('&lt;script&gt;');
    expect(output[1]).toBe('normal text');
    expect(output[2]).toBe('&amp; special');
  });

  it('should handle null and undefined', () => {
    expect(sanitizeObject(null)).toBe(null);
    expect(sanitizeObject(undefined)).toBe(undefined);
  });
});

describe('validateBookingInput', () => {
  it('should validate correct booking data', () => {
    const validBooking = {
      schedule_id: '123e4567-e89b-12d3-a456-426614174000',
      seats: ['1A', '1B'],
      passenger_name: 'John Doe',
      passenger_email: 'john@example.com',
      passenger_phone: '+26771234567',
      total_price: 150,
    };
    const result = validateBookingInput(validBooking);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject invalid booking data', () => {
    const invalidBooking = {
      schedule_id: '',
      seats: [],
      passenger_name: '',
      passenger_email: 'invalid-email',
      passenger_phone: '123',
    };
    const result = validateBookingInput(invalidBooking);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('validateUUID', () => {
  it('should validate correct UUIDs', () => {
    expect(validateUUID('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    expect(validateUUID('00000000-0000-0000-0000-000000000000')).toBe(true);
  });

  it('should reject invalid UUIDs', () => {
    expect(validateUUID('not-a-uuid')).toBe(false);
    expect(validateUUID('123e4567-e89b-12d3-a456')).toBe(false);
    expect(validateUUID('')).toBe(false);
    expect(validateUUID(null)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('should validate passwords with default requirements', () => {
    expect(validatePassword('password123').valid).toBe(true);
    expect(validatePassword('short').valid).toBe(false);
  });

  it('should validate with custom requirements', () => {
    const result = validatePassword('Password123!', {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecial: true,
    });
    expect(result.valid).toBe(true);
  });

  it('should reject passwords missing required characters', () => {
    const result = validatePassword('password', {
      requireUppercase: true,
      requireNumber: true,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('validateDateTime', () => {
  it('should validate ISO date-time strings', () => {
    expect(validateDateTime('2023-12-25T10:30:00Z')).toBe(true);
    expect(validateDateTime('2023-12-25T10:30:00+02:00')).toBe(true);
  });

  it('should reject invalid date-time strings', () => {
    expect(validateDateTime('2023-12-25')).toBe(false); // Date only
    expect(validateDateTime('invalid')).toBe(false);
    expect(validateDateTime(null)).toBe(false);
  });
});

describe('sanitizeAndValidatePhone', () => {
  it('should sanitize and validate phone numbers', () => {
    const result = sanitizeAndValidatePhone('+267 7123 4567');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('+26771234567');
  });

  it('should add +267 prefix if missing', () => {
    const result = sanitizeAndValidatePhone('71234567');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('+26771234567');
  });

  it('should handle 267 prefix', () => {
    const result = sanitizeAndValidatePhone('26771234567');
    expect(result.valid).toBe(true);
    expect(result.sanitized).toBe('+26771234567');
  });

  it('should reject invalid phone numbers', () => {
    const result = sanitizeAndValidatePhone('123');
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
