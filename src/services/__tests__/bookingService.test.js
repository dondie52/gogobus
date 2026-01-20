/**
 * Unit tests for booking service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import bookingService from '../bookingService';
import { supabase } from '../supabase';
import { validateBookingInput, validateUUID } from '../../utils/validation';

// Mock dependencies
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
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

vi.mock('../../utils/validation', () => ({
  validateBookingInput: vi.fn(() => ({ valid: true, errors: [] })),
  validateUUID: vi.fn(() => true),
  sanitizeObject: vi.fn((obj) => obj),
}));

vi.mock('../../utils/logger', () => ({
  logError: vi.fn(),
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchTrips', () => {
    it('should search trips with correct filters', async () => {
      const mockData = [
        {
          id: '1',
          departure_time: '2024-01-15T10:00:00Z',
          arrival_time: '2024-01-15T14:00:00Z',
          price: 150,
          available_seats: 5,
          route: {
            id: 'route-1',
            origin: 'Gaborone',
            destination: 'Francistown',
            distance_km: 430,
            duration_hours: 4,
          },
          bus: {
            id: 'bus-1',
            plate_number: 'BOT-123',
            bus_type: 'standard',
            capacity: 40,
            amenities: ['AC', 'WiFi'],
          },
        },
      ];

      const mockQuery = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  gte: vi.fn(() => ({
                    order: vi.fn(() => ({
                      data: mockData,
                      error: null,
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      };

      supabase.from.mockReturnValue(mockQuery.from());

      const result = await bookingService.searchTrips({
        origin: 'Gaborone',
        destination: 'Francistown',
        date: '2024-01-15',
        passengers: 2,
      });

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const mockQuery = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              gte: vi.fn(() => ({
                lte: vi.fn(() => ({
                  gte: vi.fn(() => ({
                    order: vi.fn(() => ({
                      data: null,
                      error: { message: 'Database error' },
                    })),
                  })),
                })),
              })),
            })),
          })),
        })),
      };

      supabase.from.mockReturnValue(mockQuery.from());

      const result = await bookingService.searchTrips({
        origin: 'Gaborone',
        destination: 'Francistown',
        date: '2024-01-15',
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('createBooking', () => {
    it('should create booking with valid data', async () => {
      const bookingData = {
        schedule_id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        seats: ['1A', '1B'],
        passenger_name: 'John Doe',
        passenger_email: 'john@example.com',
        passenger_phone: '+26771234567',
        total_price: 150,
      };

      const mockBooking = { id: 'booking-1', ...bookingData };
      const mockSchedule = {
        seat_map: [],
        available_seats: 10,
      };

      const mockInsert = {
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockBooking,
            error: null,
          })),
        })),
      };

      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: mockSchedule,
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
        if (table === 'bookings') {
          return {
            insert: vi.fn(() => mockInsert),
          };
        }
        if (table === 'schedules') {
          return {
            select: vi.fn(() => mockSelect),
            update: vi.fn(() => mockUpdate),
          };
        }
      });

      validateBookingInput.mockReturnValue({ valid: true, errors: [] });
      validateUUID.mockReturnValue(true);

      const result = await bookingService.createBooking(bookingData);

      expect(result).toBeDefined();
      expect(validateBookingInput).toHaveBeenCalledWith(bookingData);
    });

    it('should throw error for invalid booking data', async () => {
      const bookingData = {
        schedule_id: '',
        seats: [],
      };

      validateBookingInput.mockReturnValue({
        valid: false,
        errors: ['Schedule ID is required', 'At least one seat must be selected'],
      });

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow();
    });

    it('should throw error for invalid UUID', async () => {
      const bookingData = {
        schedule_id: 'invalid-uuid',
        seats: ['1A'],
      };

      validateBookingInput.mockReturnValue({ valid: true, errors: [] });
      validateUUID.mockReturnValue(false);

      await expect(bookingService.createBooking(bookingData)).rejects.toThrow('Invalid schedule ID');
    });
  });

  describe('getUserBookings', () => {
    it('should fetch user bookings', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const mockBookings = [
        {
          id: 'booking-1',
          user_id: userId,
          created_at: '2024-01-15T10:00:00Z',
        },
      ];

      const mockQuery = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: mockBookings,
                error: null,
              })),
            })),
          })),
        })),
      };

      supabase.from.mockReturnValue(mockQuery.from());

      const result = await bookingService.getUserBookings(userId);

      expect(result).toEqual(mockBookings);
    });

    it('should throw error on database error', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const mockQuery = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                data: null,
                error: { message: 'Database error' },
              })),
            })),
          })),
        })),
      };

      supabase.from.mockReturnValue(mockQuery.from());

      await expect(bookingService.getUserBookings(userId)).rejects.toThrow();
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      const mockCancelledBooking = {
        id: bookingId,
        status: 'cancelled',
      };

      const mockQuery = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() => ({
                  data: mockCancelledBooking,
                  error: null,
                })),
              })),
            })),
          })),
        })),
      };

      supabase.from.mockReturnValue(mockQuery.from());

      const result = await bookingService.cancelBooking(bookingId);

      expect(result.status).toBe('cancelled');
    });
  });
});
