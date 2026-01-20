import { supabase } from './supabase';
import { validateBookingInput, validateUUID, sanitizeObject } from '../utils/validation';
import { logError } from '../utils/logger';

/**
 * Booking service
 * Handles booking-related operations
 */
const bookingService = {
  /**
   * Search trips (schedules) with routes and buses
   */
  async searchTrips({ origin, destination, date, passengers }) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq('status', 'active')
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .gte('available_seats', passengers || 1)
      .order('departure_time');

    if (error) {
      return { data: null, error };
    }

    // Filter by origin/destination
    const filtered = data.filter(schedule => {
      const route = schedule.route;
      if (!route) return false;
      
      const originMatch = route.origin?.toLowerCase().includes(origin.toLowerCase());
      const destMatch = route.destination?.toLowerCase().includes(destination.toLowerCase());
      
      return originMatch && destMatch;
    });

    // Transform to match component's expected format
    const trips = filtered.map(schedule => {
      const route = schedule.route || {};
      const bus = schedule.bus || {};
      
      // Convert duration_hours to duration_minutes
      const durationMinutes = route.duration_hours 
        ? Math.round(route.duration_hours * 60)
        : null;

      return {
        id: schedule.id,
        departure_time: schedule.departure_time,
        arrival_time: schedule.arrival_time,
        price: parseFloat(schedule.price),
        available_seats: schedule.available_seats,
        routes: {
          id: route.id,
          origin: route.origin,
          destination: route.destination,
          distance_km: route.distance_km,
          duration_minutes: durationMinutes,
        },
        buses: {
          id: bus.id,
          bus_name: bus.plate_number || 'Standard Bus',
          bus_type: bus.bus_type || 'standard',
          capacity: bus.capacity || 40,
          amenities: Array.isArray(bus.amenities) ? bus.amenities : [],
        },
      };
    });

    return { data: trips, error: null };
  },

  /**
   * Get trip by ID with seats
   */
  async getTripById(tripId) {
    const { data: schedule, error } = await supabase
      .from('schedules')
      .select(`
        *,
        route:routes(*),
        bus:buses(*)
      `)
      .eq('id', tripId)
      .single();

    if (error) {
      return { data: null, error };
    }

    const route = schedule.route || {};
    const bus = schedule.bus || {};
    
    // Convert duration_hours to duration_minutes
    const durationMinutes = route.duration_hours 
      ? Math.round(route.duration_hours * 60)
      : null;

    // Generate seats array from bus capacity and seat_map
    const capacity = bus.capacity || 40;
    const seatMap = schedule.seat_map || [];
    
    // Create seats array (assuming 4 columns: A, B, C, D)
    const seats = [];
    const rows = Math.ceil(capacity / 4);
    const columns = ['A', 'B', 'C', 'D'];
    
    // Parse seat_map to find booked seats
    const bookedSeats = new Set();
    if (Array.isArray(seatMap)) {
      seatMap.forEach(seat => {
        if (typeof seat === 'string') {
          bookedSeats.add(seat);
        } else if (seat && seat.seat_number) {
          bookedSeats.add(seat.seat_number);
        }
      });
    }

    // Generate all seats
    for (let row = 1; row <= rows; row++) {
      for (let colIndex = 0; colIndex < columns.length; colIndex++) {
        const col = columns[colIndex];
        const seatNumber = `${row}${col}`;
        const isBooked = bookedSeats.has(seatNumber);
        
        // Skip if we've exceeded capacity
        if (seats.length >= capacity) break;
        
        seats.push({
          id: `${schedule.id}-${seatNumber}`, // Unique ID
          seat_number: seatNumber,
          seat_row: row.toString(),
          seat_column: col,
          is_available: !isBooked,
        });
      }
      if (seats.length >= capacity) break;
    }

    const trip = {
      id: schedule.id,
      departure_time: schedule.departure_time,
      arrival_time: schedule.arrival_time,
      price: parseFloat(schedule.price),
      available_seats: schedule.available_seats,
      routes: {
        id: route.id,
        origin: route.origin,
        destination: route.destination,
        distance_km: route.distance_km,
        duration_minutes: durationMinutes,
      },
      buses: {
        id: bus.id,
        bus_name: bus.plate_number || 'Standard Bus',
        bus_type: bus.bus_type || 'standard',
        capacity: bus.capacity || 40,
        amenities: Array.isArray(bus.amenities) ? bus.amenities : [],
      },
      seats: seats,
    };

    return { data: trip, error: null };
  },

  /**
   * Search schedules
   */
  async searchSchedules(origin, destination, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        route:routes(*),
        bus:buses(*, company:companies(*))
      `)
      .eq('status', 'active')
      .gte('departure_time', startOfDay.toISOString())
      .lte('departure_time', endOfDay.toISOString())
      .gt('available_seats', 0)
      .order('departure_time');

    if (error) throw error;

    // Filter by origin/destination and transform to app format
    const filtered = data.filter(schedule =>
      schedule.route.origin.toLowerCase().includes(origin.toLowerCase()) &&
      schedule.route.destination.toLowerCase().includes(destination.toLowerCase())
    );

    // Transform to match app's expected format
    return filtered.map(schedule => {
      const depTime = new Date(schedule.departure_time);
      const arrTime = new Date(schedule.arrival_time);
      const durationMs = arrTime - depTime;
      const durationHours = Math.floor(durationMs / 3600000);
      const durationMins = Math.floor((durationMs % 3600000) / 60000);

      return {
        id: schedule.id,
        company: {
          name: schedule.bus?.company?.name || 'Unknown',
          logo: '🚌',
        },
        departure_time: depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        arrival_time: arrTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        duration: `${durationHours}h ${durationMins}m`,
        price: parseFloat(schedule.price),
        available_seats: schedule.available_seats,
        amenities: schedule.bus?.amenities || [],
        bus_type: schedule.bus?.bus_type || 'Standard',
        origin: schedule.route.origin,
        destination: schedule.route.destination,
        date: date,
      };
    });
  },

  /**
   * Create booking and update seat_map
   */
  async createBooking(bookingData) {
    try {
      // Validate booking input
      const validation = validateBookingInput(bookingData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Validate UUIDs
      if (bookingData.schedule_id && !validateUUID(bookingData.schedule_id)) {
        throw new Error('Invalid schedule ID');
      }
      if (bookingData.user_id && !validateUUID(bookingData.user_id)) {
        throw new Error('Invalid user ID');
      }

      // Sanitize input data
      const sanitizedData = sanitizeObject(bookingData);

      // First, create the booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(sanitizedData)
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update seat_map on the schedule if seats are provided
      if (bookingData.schedule_id && bookingData.seats) {
        const seatNumbers = Array.isArray(bookingData.seats) 
          ? bookingData.seats.map(s => typeof s === 'string' ? s : s.seat_number || s)
          : [bookingData.seats];

        // Get current schedule to update seat_map
        const { data: schedule, error: scheduleError } = await supabase
          .from('schedules')
          .select('seat_map, available_seats')
          .eq('id', bookingData.schedule_id)
          .single();

        if (!scheduleError && schedule) {
          // Update seat_map by adding new booked seats
          const currentSeatMap = Array.isArray(schedule.seat_map) ? schedule.seat_map : [];
          const newSeatMap = [...new Set([...currentSeatMap, ...seatNumbers])];

          // Decrease available_seats
          const newAvailableSeats = Math.max(0, (schedule.available_seats || 0) - seatNumbers.length);

          // Update schedule
          await supabase
            .from('schedules')
            .update({
              seat_map: newSeatMap,
              available_seats: newAvailableSeats,
            })
            .eq('id', bookingData.schedule_id);
        }
      }

      return booking;
    } catch (error) {
      logError('Error creating booking', error);
      throw error;
    }
  },

  /**
   * Get user's bookings
   */
  async getUserBookings(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        schedule:schedules(
          *,
          route:routes(*),
          bus:buses(*, company:companies(*))
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export default bookingService;
