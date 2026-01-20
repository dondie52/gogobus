import { supabase } from './supabase';
import { logError, logWarn } from '../utils/logger';
import { validateUUID, validateAmount, validateDate, sanitizeObject } from '../utils/validation';

/**
 * Admin service
 * Handles admin-specific operations for dashboard, trips, routes, bookings, and settings
 */
const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getAdminStats() {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      // Get bookings this week
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .gte('created_at', startOfWeek.toISOString())
        .lte('created_at', endOfWeek.toISOString());

      if (bookingsError) {
        logError('Error fetching bookings', bookingsError);
        throw bookingsError;
      }

      // Get active trips (upcoming trips that are not cancelled)
      const { data: trips, error: tripsError } = await supabase
        .from('schedules')
        .select('id')
        .neq('status', 'cancelled')
        .gte('departure_time', new Date().toISOString());

      if (tripsError) {
        logError('Error fetching trips', tripsError);
        throw tripsError;
      }

      // Get total routes
      const { data: routes, error: routesError } = await supabase
        .from('routes')
        .select('id')
        .eq('is_active', true);

      if (routesError) {
        logError('Error fetching routes', routesError);
        throw routesError;
      }

      const confirmedBookings = bookings?.filter(b => 
        b.status === 'confirmed' || 
        b.status === 'paid' || 
        b.payment_status === 'paid'
      ) || [];
      // Handle missing total_amount column - use fallback to price or 0
      const revenue = confirmedBookings.reduce((sum, b) => {
        const amount = parseFloat(b.total_amount) || parseFloat(b.price) || 0;
        return sum + amount;
      }, 0);

      return {
        data: {
          bookings_this_week: confirmedBookings.length,
          revenue_this_week: revenue,
          active_trips: trips?.length || 0,
          total_routes: routes?.length || 0,
        },
        error: null,
      };
    } catch (error) {
      logError('Error getting admin stats', error);
      return {
        data: { bookings_this_week: 0, revenue_this_week: 0, active_trips: 0, total_routes: 0 },
        error,
      };
    }
  },

  /**
   * Get popular routes with booking counts
   */
  async getPopularRoutes(limit = 4) {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          schedule:schedules!inner(
            route_id,
            route:routes!inner(
              id,
              origin,
              destination
            )
          )
        `)
        .or('payment_status.eq.paid,status.eq.confirmed,status.eq.paid')
        .limit(1000); // Get enough to count

      if (error) {
        logError('Error fetching popular routes', error);
        throw error;
      }

      // Count bookings per route
      const routeCounts = {};
      bookings?.forEach(booking => {
        const route = booking.schedule?.route;
        if (route?.id) {
          if (!routeCounts[route.id]) {
            routeCounts[route.id] = {
              name: `${route.origin} → ${route.destination}`,
              origin: route.origin,
              destination: route.destination,
              price: 0, // Price is on schedules, not routes
              bookings: 0
            };
          }
          routeCounts[route.id].bookings++;
        }
      });

      // Sort by booking count
      const popular = Object.values(routeCounts)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, limit);

      // If no data, return empty array
      return { data: popular, error: null };
    } catch (error) {
      logError('Error getting popular routes', error);
      return { data: [], error };
    }
  },

  /**
   * Get trips/schedules with filters
   */
  async getTrips(filters = {}) {
    try {
      let query = supabase
        .from('schedules')
        .select(`
          *,
          route:routes(*),
          bus:buses(*)
        `)
        .order('departure_time', { ascending: true });

      // Filter by status
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Filter upcoming trips
      if (filters.upcoming) {
        query = query.gte('departure_time', new Date().toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match expected format
      const trips = (data || []).map(trip => ({
        id: trip.id,
        route_id: trip.route_id,
        bus_id: trip.bus_id,
        departure_time: trip.departure_time,
        arrival_time: trip.arrival_time,
        price: trip.price,
        total_seats: trip.bus?.capacity || 40,
        available_seats: trip.available_seats || 0,
        status: trip.status || 'scheduled',
        routes: trip.route,
        bus: trip.bus,
      }));

      return { data: trips, error: null };
    } catch (error) {
      logError('Error getting trips', error);
      return { data: [], error };
    }
  },

  /**
   * Create a new trip/schedule
   */
  async createTrip(tripData) {
    try {
      // Validate inputs
      if (!tripData.route_id || !validateUUID(tripData.route_id)) {
        throw new Error('Invalid route ID');
      }
      if (!tripData.departure_time || !validateDate(tripData.departure_time)) {
        throw new Error('Invalid departure time');
      }
      if (!tripData.price || !validateAmount(tripData.price)) {
        throw new Error('Invalid price');
      }

      // Validate bus_id: must be a valid UUID or null
      const validatedBusId = (tripData.bus_id && validateUUID(tripData.bus_id)) ? tripData.bus_id : null;

      // Sanitize input data
      const sanitizedData = sanitizeObject({
        route_id: tripData.route_id,
        bus_id: validatedBusId,
        departure_time: tripData.departure_time,
        arrival_time: tripData.arrival_time || null,
        price: tripData.price,
        available_seats: tripData.total_seats || 40,
        status: 'scheduled',
      });

      const { data, error } = await supabase
        .from('schedules')
        .insert(sanitizedData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error creating trip', error);
      return { data: null, error };
    }
  },

  /**
   * Update a trip/schedule
   */
  async updateTrip(tripId, tripData) {
    try {
      // Validate tripId
      if (!validateUUID(tripId)) {
        throw new Error('Invalid trip ID');
      }

      // Validate and build update data
      const updateData = {};
      if (tripData.route_id !== undefined) {
        if (!validateUUID(tripData.route_id)) throw new Error('Invalid route ID');
        updateData.route_id = tripData.route_id;
      }
      if (tripData.bus_id !== undefined) {
        updateData.bus_id = (tripData.bus_id && validateUUID(tripData.bus_id)) ? tripData.bus_id : null;
      }
      if (tripData.departure_time !== undefined) {
        if (!validateDate(tripData.departure_time)) throw new Error('Invalid departure time');
        updateData.departure_time = tripData.departure_time;
      }
      if (tripData.arrival_time !== undefined) {
        if (tripData.arrival_time && !validateDate(tripData.arrival_time)) throw new Error('Invalid arrival time');
        updateData.arrival_time = tripData.arrival_time;
      }
      if (tripData.price !== undefined) {
        if (!validateAmount(tripData.price)) throw new Error('Invalid price');
        updateData.price = tripData.price;
      }
      if (tripData.total_seats !== undefined) {
        updateData.available_seats = tripData.total_seats;
      }

      // Sanitize update data
      const sanitizedData = sanitizeObject(updateData);

      const { data, error } = await supabase
        .from('schedules')
        .update(sanitizedData)
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error updating trip', error);
      return { data: null, error };
    }
  },

  /**
   * Update trip status
   */
  async updateTripStatus(tripId, status) {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error updating trip status', error);
      return { data: null, error };
    }
  },

  /**
   * Delete or cancel a trip
   */
  async deleteTrip(tripId) {
    try {
      // Check if trip has bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('schedule_id', tripId)
        .eq('status', 'confirmed')
        .limit(1);

      if (bookings && bookings.length > 0) {
        // Cancel instead of delete
        const { data, error } = await supabase
          .from('schedules')
          .update({ status: 'cancelled' })
          .eq('id', tripId)
          .select()
          .single();

        if (error) throw error;
        return { data, cancelled: true, error: null };
      }

      // No bookings, safe to delete
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      return { data: null, cancelled: false, error: null };
    } catch (error) {
      logError('Error deleting trip', error);
      return { data: null, cancelled: false, error };
    }
  },

  /**
   * Get all routes
   */
  async getRoutes(includeInactive = false) {
    try {
      let query = supabase
        .from('routes')
        .select('*')
        .order('origin');

      if (!includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to ensure consistent format
      const routes = (data || []).map(route => ({
        ...route,
        duration_minutes: route.duration_minutes || (route.duration_hours ? route.duration_hours * 60 : null),
      }));

      return { data: routes, error: null };
    } catch (error) {
      logError('Error getting routes', error);
      return { data: [], error };
    }
  },

  /**
   * Create a new route
   */
  async createRoute(routeData) {
    try {
      const insertData = {
        origin: routeData.origin,
        destination: routeData.destination,
        distance_km: routeData.distance_km || null,
        duration_minutes: routeData.duration_minutes || null,
        duration_hours: routeData.duration_minutes ? routeData.duration_minutes / 60 : null,
        base_price: routeData.base_price,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('routes')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error creating route', error);
      return { data: null, error };
    }
  },

  /**
   * Update a route
   */
  async updateRoute(routeId, routeData) {
    try {
      const updateData = {};
      if (routeData.origin !== undefined) updateData.origin = routeData.origin;
      if (routeData.destination !== undefined) updateData.destination = routeData.destination;
      if (routeData.distance_km !== undefined) updateData.distance_km = routeData.distance_km;
      if (routeData.duration_minutes !== undefined) {
        updateData.duration_minutes = routeData.duration_minutes;
        updateData.duration_hours = routeData.duration_minutes ? routeData.duration_minutes / 60 : null;
      }
      if (routeData.base_price !== undefined) updateData.base_price = routeData.base_price;

      const { data, error } = await supabase
        .from('routes')
        .update(updateData)
        .eq('id', routeId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error updating route', error);
      return { data: null, error };
    }
  },

  /**
   * Delete a route
   */
  async deleteRoute(routeId) {
    try {
      // Check if route has active trips
      const { data: trips } = await supabase
        .from('schedules')
        .select('id')
        .eq('route_id', routeId)
        .gte('departure_time', new Date().toISOString())
        .limit(1);

      if (trips && trips.length > 0) {
        // Deactivate instead of delete
        const { data, error } = await supabase
          .from('routes')
          .update({ is_active: false })
          .eq('id', routeId)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }

      // No active trips, safe to delete
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      logError('Error deleting route', error);
      return { data: null, error };
    }
  },

  /**
   * Get buses
   */
  async getBuses() {
    try {
      const { data, error } = await supabase
        .from('buses')
        .select('*')
        .order('bus_name');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      logError('Error getting buses', error);
      return { data: [], error };
    }
  },

  /**
   * Get all bookings with filters
   */
  async getBookings(filters = {}) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          schedule:schedules(
            *,
            route:routes(*),
            bus:buses(*)
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by payment status
      if (filters.paymentStatus) {
        query = query.eq('payment_status', filters.paymentStatus);
      }

      // Filter by booking status
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Search by name, phone, or reference
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        query = query.or(`passenger_name.ilike.${searchTerm},passenger_phone.ilike.${searchTerm},booking_reference.ilike.${searchTerm}`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to match expected format
      const bookings = (data || []).map(booking => ({
        ...booking,
        trips: {
          ...booking.schedule,
          routes: booking.schedule?.route,
        },
        passenger_name: booking.passenger_name || 'N/A',
        passenger_phone: booking.passenger_phone || 'N/A',
        seat_number: Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats || 'N/A',
        payment_status: booking.payment_status || 'pending',
        total_amount: booking.total_amount || booking.price || 0,
      }));

      return { data: bookings, error: null };
    } catch (error) {
      logError('Error getting bookings', error);
      return { data: [], error };
    }
  },

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, status) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error updating booking status', error);
      return { data: null, error };
    }
  },

  /**
   * Mark passenger as boarded
   */
  async markAsBoarded(bookingId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          is_boarded: true,
          boarded_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error marking as boarded', error);
      return { data: null, error };
    }
  },

  /**
   * Unmark passenger as boarded
   */
  async unmarkAsBoarded(bookingId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          is_boarded: false,
          boarded_at: null
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      logError('Error unmarking as boarded', error);
      return { data: null, error };
    }
  },

  /**
   * Export bookings to CSV
   */
  async exportBookingsToCSV(filters = {}) {
    try {
      const { data: bookings, error } = await this.getBookings(filters);
      
      if (error || !bookings?.length) {
        return null;
      }

      // CSV headers
      const headers = [
        'Reference',
        'Passenger Name',
        'Phone',
        'Email',
        'Route',
        'Departure Time',
        'Seat',
        'Amount',
        'Payment Status',
        'Booking Status',
        'Boarded',
        'Created At'
      ];

      // CSV rows
      const rows = bookings.map(booking => [
        booking.booking_reference || booking.id,
        booking.passenger_name || '',
        booking.passenger_phone || '',
        booking.passenger_email || '',
        `${booking.trips?.routes?.origin || ''} → ${booking.trips?.routes?.destination || ''}`,
        booking.trips?.departure_time || '',
        booking.seat_number || '',
        booking.total_amount || 0,
        booking.payment_status || '',
        booking.status || '',
        booking.is_boarded ? 'Yes' : 'No',
        booking.created_at || ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      return csvContent;
    } catch (error) {
      logError('Error exporting bookings', error);
      return null;
    }
  },

  /**
   * Subscribe to bookings for real-time updates
   */
  subscribeToBookings(callback) {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          callback();
        }
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
      }
    };
  },

  /**
   * Get booking by reference code (from QR code)
   */
  async getBookingByReference(reference) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedule:schedules(
            *,
            route:routes(*),
            bus:buses(*)
          )
        `)
        .or(`booking_reference.eq.${reference},id.eq.${reference},qr_code.eq.${reference}`)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: { message: 'Booking not found' } };
        }
        throw error;
      }

      if (!data) {
        return { data: null, error: { message: 'Booking not found' } };
      }

      // Transform to match expected format
      const booking = {
        id: data.id,
        booking_reference: data.booking_reference || data.qr_code || data.id.substring(0, 8).toUpperCase(),
        passenger_name: data.passenger_name || 'N/A',
        passenger_phone: data.passenger_phone || 'N/A',
        seat_number: Array.isArray(data.seats) ? data.seats.join(', ') : data.seats || 'N/A',
        payment_status: data.payment_status || 'pending',
        is_boarded: data.is_boarded || false,
        boarded_at: data.boarded_at || null,
        trips: {
          departure_time: data.schedule?.departure_time || data.departure_time,
          routes: {
            origin: data.schedule?.route?.origin || 'N/A',
            destination: data.schedule?.route?.destination || 'N/A'
          }
        }
      };

      return { data: booking, error: null };
    } catch (error) {
      logError('Error fetching booking', error);
      return { data: null, error: { message: error.message || 'Failed to fetch booking' } };
    }
  },

  /**
   * Get payment status helper
   */
  getPaymentStatus(booking) {
    if (booking.payment_status === 'paid' || booking.status === 'confirmed' || booking.status === 'paid') {
      return 'paid';
    }
    if (booking.payment_method && booking.status !== 'cancelled') {
      return 'paid';
    }
    return 'pending';
  },

  /**
   * Get settings
   */
  async getSettings() {
    try {
      // Settings are typically stored in a settings table or as a single row
      // For now, we'll check if there's a settings table
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Return default settings if none found
      return {
        data: data || {
          company_name: 'GOGOBUS Botswana',
          support_phone: '+267 12 345 678',
          support_email: 'support@gogobus.co.bw',
          booking_enabled: true,
          auto_confirm_bookings: false,
          require_payment_upfront: true,
        },
        error: null,
      };
    } catch (error) {
      logError('Error getting settings', error);
      // Return defaults on error
      return {
        data: {
          company_name: 'GOGOBUS Botswana',
          support_phone: '+267 12 345 678',
          support_email: 'support@gogobus.co.bw',
          booking_enabled: true,
          auto_confirm_bookings: false,
          require_payment_upfront: true,
        },
        error: null, // Don't fail if settings table doesn't exist
      };
    }
  },

  /**
   * Update settings
   */
  async updateSettings(settings) {
    try {
      // Upsert settings (create if doesn't exist, update if exists)
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          id: 1, // Single settings row
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist, that's okay - settings are optional
        if (error.code === '42P01') {
          logWarn('Settings table does not exist. Settings changes will not persist.');
          return { data: settings, error: null };
        }
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      logError('Error updating settings', error);
      // Don't fail if settings can't be saved
      return { data: settings, error: null };
    }
  },
};

export default adminService;