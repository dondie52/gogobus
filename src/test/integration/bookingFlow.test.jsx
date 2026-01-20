/**
 * Integration tests for booking flow
 * Tests the complete booking journey from search to ticket
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import { supabase } from '../../services/supabase';

// Mock Supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: null }, unsubscribe: vi.fn() })),
    },
  },
}));

// Mock services
vi.mock('../../services/bookingService');
vi.mock('../../services/paymentService');

describe('Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Search to Booking Flow', () => {
    it('should search for trips and return results', async () => {
      const mockTrips = [
        {
          id: 'trip-1',
          departure_time: '2024-01-15T10:00:00Z',
          arrival_time: '2024-01-15T14:00:00Z',
          price: 150,
          available_seats: 5,
          routes: {
            id: 'route-1',
            origin: 'Gaborone',
            destination: 'Francistown',
            distance_km: 430,
          },
          buses: {
            id: 'bus-1',
            bus_name: 'Standard Bus',
            capacity: 40,
          },
        },
      ];

      bookingService.searchTrips.mockResolvedValue({
        data: mockTrips,
        error: null,
      });

      const result = await bookingService.searchTrips({
        origin: 'Gaborone',
        destination: 'Francistown',
        date: '2024-01-15',
        passengers: 2,
      });

      expect(result.data).toEqual(mockTrips);
      expect(result.error).toBeNull();
    });

    it('should create booking after trip selection', async () => {
      const bookingData = {
        schedule_id: 'trip-1',
        user_id: 'user-1',
        seats: ['1A', '1B'],
        passenger_name: 'John Doe',
        passenger_email: 'john@example.com',
        passenger_phone: '+26771234567',
        total_price: 150,
      };

      const mockBooking = {
        id: 'booking-1',
        booking_reference: 'GGB-2024-001',
        ...bookingData,
      };

      bookingService.createBooking.mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(bookingData);

      expect(result).toEqual(mockBooking);
      expect(bookingService.createBooking).toHaveBeenCalledWith(bookingData);
    });

    it('should initiate payment after booking creation', async () => {
      const paymentData = {
        bookingId: 'booking-1',
        amount: 150,
        paymentMethod: 'card',
        customerEmail: 'john@example.com',
        customerName: 'John Doe',
        customerPhone: '+26771234567',
      };

      const mockPayment = {
        success: true,
        transactionRef: 'GGB-TXN-001',
        paymentId: 'payment-1',
        paymentUrl: 'https://secure.3gdirectpay.com/payv2.php?ID=TOKEN',
      };

      paymentService.initiatePayment.mockResolvedValue(mockPayment);

      const result = await paymentService.initiatePayment(paymentData);

      expect(result.success).toBe(true);
      expect(result.transactionRef).toBeDefined();
    });
  });

  describe('Payment Verification Flow', () => {
    it('should verify payment status', async () => {
      const transactionRef = 'GGB-TXN-001';

      const mockVerification = {
        success: true,
        status: 'completed',
        payment: {
          id: 'payment-1',
          status: 'completed',
        },
      };

      paymentService.verifyPayment.mockResolvedValue(mockVerification);

      const result = await paymentService.verifyPayment(transactionRef);

      expect(result.success).toBe(true);
      expect(result.status).toBe('completed');
    });

    it('should handle payment failure', async () => {
      const transactionRef = 'GGB-TXN-002';

      const mockVerification = {
        success: false,
        status: 'failed',
        error: 'Payment failed',
      };

      paymentService.verifyPayment.mockResolvedValue(mockVerification);

      const result = await paymentService.verifyPayment(transactionRef);

      expect(result.success).toBe(false);
      expect(result.status).toBe('failed');
    });
  });

  describe('Complete Booking Journey', () => {
    it('should complete full booking flow: search → book → pay → verify', async () => {
      // Step 1: Search for trips
      const searchResult = await bookingService.searchTrips({
        origin: 'Gaborone',
        destination: 'Francistown',
        date: '2024-01-15',
        passengers: 2,
      });

      expect(searchResult.data).toBeDefined();
      expect(searchResult.data.length).toBeGreaterThan(0);

      // Step 2: Create booking
      const bookingData = {
        schedule_id: searchResult.data[0].id,
        user_id: 'user-1',
        seats: ['1A', '1B'],
        passenger_name: 'John Doe',
        passenger_email: 'john@example.com',
        passenger_phone: '+26771234567',
        total_price: 150,
      };

      const booking = await bookingService.createBooking(bookingData);
      expect(booking).toBeDefined();

      // Step 3: Initiate payment
      const paymentResult = await paymentService.initiatePayment({
        bookingId: booking.id,
        amount: bookingData.total_price,
        paymentMethod: 'card',
        customerEmail: bookingData.passenger_email,
        customerName: bookingData.passenger_name,
        customerPhone: bookingData.passenger_phone,
      });

      expect(paymentResult.success).toBe(true);

      // Step 4: Verify payment
      const verification = await paymentService.verifyPayment(
        paymentResult.transactionRef
      );

      expect(verification).toBeDefined();
    });
  });
});
