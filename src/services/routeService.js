import { supabase } from './supabase';
import { logError } from '../utils/logger';

/**
 * Route service
 * Handles route-related operations
 */
export const routeService = {
  /**
   * Get all active routes
   */
  async getRoutes() {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .order('origin');

    if (error) throw error;
    return data;
  },

  /**
   * Get unique cities (for dropdowns)
   */
  async getCities() {
    const routes = await this.getRoutes();
    const cities = new Set();

    routes.forEach(route => {
      cities.add(route.origin);
      cities.add(route.destination);
    });

    return Array.from(cities).sort();
  },

  /**
   * Search routes by origin and destination
   */
  async searchRoutes(origin, destination, date) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_active', true)
        .ilike('origin', `%${origin}%`)
        .ilike('destination', `%${destination}%`)
        .order('origin');

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  /**
   * Get route details by ID
   */
  async getRouteDetails(routeId) {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Get popular routes (routes with most bookings)
   */
  async getPopularRoutes(limit = 4) {
    try {
      // Get routes with booking counts
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          schedule:schedules!inner(
            route_id,
            route:routes!inner(
              id,
              origin,
              destination,
              base_price
            )
          )
        `)
        .eq('status', 'confirmed');

      if (bookingsError) throw bookingsError;

      // Count bookings per route
      const routeCounts = {};
      bookings?.forEach(booking => {
        const routeId = booking.schedule?.route?.id;
        if (routeId) {
          if (!routeCounts[routeId]) {
            routeCounts[routeId] = {
              route: booking.schedule.route,
              bookings: 0
            };
          }
          routeCounts[routeId].bookings++;
        }
      });

      // Sort by booking count and limit
      const popular = Object.values(routeCounts)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, limit)
        .map(item => ({
          origin: item.route.origin,
          destination: item.route.destination,
          price: item.route.base_price || 0,
          bookings: item.bookings
        }));

      // If no bookings, fall back to all routes
      if (popular.length === 0) {
        const routes = await this.getRoutes();
        return routes.slice(0, limit).map(route => ({
          origin: route.origin,
          destination: route.destination,
          price: route.base_price || 0,
          bookings: 0
        }));
      }

      return popular;
    } catch (error) {
      logError('Error getting popular routes', error);
      // Fallback to default routes
      return [
        { origin: 'Gaborone', destination: 'Francistown', price: 150, bookings: 0 },
        { origin: 'Gaborone', destination: 'Maun', price: 305, bookings: 0 },
        { origin: 'Gaborone', destination: 'Palapye', price: 98, bookings: 0 },
        { origin: 'Francistown', destination: 'Maun', price: 200, bookings: 0 },
      ].slice(0, limit);
    }
  },

  /**
   * Get available seats for a route/trip
   */
  async getAvailableSeats(routeId, tripId) {
    try {
      // Get trip/schedule to find booked seats
      const { data: schedule, error: scheduleError } = await supabase
        .from('schedules')
        .select('seat_map, available_seats, bus:buses(capacity)')
        .eq('id', tripId)
        .single();

      if (scheduleError) throw scheduleError;

      const bookedSeats = Array.isArray(schedule.seat_map) 
        ? schedule.seat_map.map(s => typeof s === 'string' ? s : s.seat_number || s)
        : [];
      
      const capacity = schedule.bus?.capacity || 40;
      const availableCount = schedule.available_seats || 0;

      return {
        available: availableCount,
        total: capacity,
        booked: bookedSeats,
        availableSeats: capacity - bookedSeats.length
      };
    } catch (error) {
      logError('Error getting available seats', error);
      return { available: 0, total: 40, booked: [], availableSeats: 0 };
    }
  },
};
