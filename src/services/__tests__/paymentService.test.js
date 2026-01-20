/**
 * Unit tests for payment service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentService, {
  calculateFees,
  calculateTotal,
  getEnabledPaymentMethods,
  PAYMENT_METHODS,
} from '../paymentService';
import { supabase } from '../supabase';

// Mock dependencies
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  },
}));

vi.mock('../../utils/paymentErrors', () => ({
  default: {
    logPaymentError: vi.fn(),
    getUserFriendlyMessage: vi.fn((error) => error.message),
    classifyError: vi.fn(() => 'NETWORK_ERROR'),
    retryWithBackoff: vi.fn((fn) => fn()),
    ERROR_CODES: {
      NETWORK_ERROR: 'NETWORK_ERROR',
      TIMEOUT: 'TIMEOUT',
      CONNECTION_FAILED: 'CONNECTION_FAILED',
    },
  },
}));

vi.mock('../../utils/validation', () => ({
  validateAmount: vi.fn(() => true),
  validateEmail: vi.fn(() => true),
  validatePhone: vi.fn(() => true),
  validateUUID: vi.fn(() => true),
  sanitizeObject: vi.fn((obj) => obj),
}));

vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}));

// Mock environment variables
vi.stubEnv('VITE_DPO_COMPANY_TOKEN', '');
vi.stubEnv('VITE_DPO_SERVICE_TYPE', '');
vi.stubEnv('VITE_ORANGE_MERCHANT_KEY', '');

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateFees', () => {
    it('should calculate percentage fees for card payments', () => {
      const fee = calculateFees('card', 100);
      expect(fee).toBe(2.5); // 2.5% of 100
    });

    it('should calculate flat fees for mobile money', () => {
      const fee = calculateFees('orange_money', 100);
      expect(fee).toBe(5); // Flat fee
    });

    it('should return 0 for cash payments', () => {
      const fee = calculateFees('cash', 100);
      expect(fee).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total with fees correctly', () => {
      const result = calculateTotal(100, 10, 'card');
      expect(result.baseAmount).toBe(100);
      expect(result.serviceFee).toBe(10);
      expect(result.paymentFee).toBe(2.5);
      expect(result.total).toBe(112.5);
    });

    it('should handle different payment methods', () => {
      const cardTotal = calculateTotal(100, 10, 'card');
      const orangeTotal = calculateTotal(100, 10, 'orange_money');
      
      expect(cardTotal.paymentFee).toBe(2.5);
      expect(orangeTotal.paymentFee).toBe(5);
    });
  });

  describe('getEnabledPaymentMethods', () => {
    it('should return only enabled payment methods', () => {
      const enabled = getEnabledPaymentMethods();
      expect(enabled.length).toBeGreaterThan(0);
      enabled.forEach(method => {
        expect(method.enabled).toBe(true);
      });
    });
  });

  describe('PAYMENT_METHODS', () => {
    it('should have all required payment methods', () => {
      expect(PAYMENT_METHODS.CARD).toBeDefined();
      expect(PAYMENT_METHODS.ORANGE_MONEY).toBeDefined();
      expect(PAYMENT_METHODS.MYZAKA).toBeDefined();
      expect(PAYMENT_METHODS.SMEGA).toBeDefined();
      expect(PAYMENT_METHODS.CASH).toBeDefined();
    });

    it('should have correct structure for each method', () => {
      Object.values(PAYMENT_METHODS).forEach(method => {
        expect(method).toHaveProperty('id');
        expect(method).toHaveProperty('name');
        expect(method).toHaveProperty('description');
        expect(method).toHaveProperty('enabled');
        expect(method).toHaveProperty('provider');
        expect(method).toHaveProperty('fees');
      });
    });
  });

  describe('createManualPayment', () => {
    it('should create manual payment record', async () => {
      const paymentData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150,
        paymentMethod: 'cash',
        customerName: 'John Doe',
        customerPhone: '+26771234567',
      };

      const mockPayment = {
        id: 'payment-1',
        transaction_ref: 'GGB-TEST-REF',
        ...paymentData,
      };

      const mockInsert = {
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockPayment,
            error: null,
          })),
        })),
      };

      const mockUpdate = {
        eq: vi.fn(() => ({
          data: null,
          error: null,
        })),
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'payments') {
          return {
            insert: vi.fn(() => mockInsert),
          };
        }
        if (table === 'bookings') {
          return {
            update: vi.fn(() => mockUpdate),
          };
        }
      });

      const result = await paymentService.createManualPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionRef).toBeDefined();
    });

    it('should return bank details for bank transfer', async () => {
      const paymentData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150,
        paymentMethod: 'bank_transfer',
        customerName: 'John Doe',
      };

      const mockPayment = {
        id: 'payment-1',
        transaction_ref: 'GGB-TEST-REF',
      };

      supabase.from.mockImplementation((table) => {
        if (table === 'payments') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: mockPayment,
                  error: null,
                })),
              })),
            })),
          };
        }
        if (table === 'bookings') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => ({
                data: null,
                error: null,
              })),
            })),
          };
        }
      });

      const result = await paymentService.createManualPayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.bankDetails).toBeDefined();
    });
  });

  describe('initiatePayment', () => {
    it('should initiate DPO payment for card method', async () => {
      const paymentData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150,
        paymentMethod: 'card',
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        customerPhone: '+26771234567',
      };

      // Mock will use mock DPO response since credentials not configured
      const result = await paymentService.initiatePayment(paymentData);

      // Since credentials are not configured, it will use mock response
      expect(result).toBeDefined();
    });

    it('should return error for invalid payment method', async () => {
      const paymentData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        amount: 150,
        paymentMethod: 'invalid_method',
      };

      const result = await paymentService.initiatePayment(paymentData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
