/**
 * GOGOBUS - Tracking Service
 * Handles real-time bus location tracking via Supabase
 */

import { supabase } from './supabase';

/**
 * Get the latest location for a trip
 * @param {string} tripId - UUID of the trip
 * @returns {Promise<Object|null>} Latest location data or null
 */
export async function getLatestLocation(tripId) {
  if (!tripId) {
    console.warn('getLatestLocation: tripId is required');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('trip_locations')
      .select('*')
      .eq('trip_id', tripId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is not really an error
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching latest location:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('getLatestLocation error:', err);
    return null;
  }
}

/**
 * Subscribe to real-time location updates for a trip
 * @param {string} tripId - UUID of the trip to track
 * @param {Function} onUpdate - Callback function receiving location updates
 * @returns {Function} Cleanup function to unsubscribe
 */
export function subscribeToTripLocation(tripId, onUpdate) {
  if (!tripId || typeof onUpdate !== 'function') {
    console.warn('subscribeToTripLocation: tripId and onUpdate callback required');
    return () => {};
  }

  const channelName = `trip-location-${tripId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_locations',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        console.log('Realtime location update:', payload.new);
        onUpdate(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trip_locations',
        filter: `trip_id=eq.${tripId}`,
      },
      (payload) => {
        console.log('Realtime location update (UPDATE):', payload.new);
        onUpdate(payload.new);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status for ${channelName}:`, status);
    });

  // Return cleanup function
  return () => {
    console.log(`Unsubscribing from ${channelName}`);
    supabase.removeChannel(channel);
  };
}

/**
 * Push a new location point (for admin/device simulation)
 * @param {string} tripId - UUID of the trip
 * @param {Object} payload - Location data
 * @param {number} payload.lat - Latitude
 * @param {number} payload.lng - Longitude
 * @param {number} [payload.heading] - Heading in degrees
 * @param {number} [payload.speed] - Speed in km/h
 * @param {string} [payload.status] - Trip status
 * @param {string} [payload.source] - Data source identifier
 * @returns {Promise<Object>} Inserted location data
 */
export async function pushLocation(tripId, payload) {
  if (!tripId) {
    throw new Error('tripId is required');
  }

  if (typeof payload.lat !== 'number' || typeof payload.lng !== 'number') {
    throw new Error('lat and lng are required numbers');
  }

  const { data, error } = await supabase
    .from('trip_locations')
    .insert({
      trip_id: tripId,
      lat: payload.lat,
      lng: payload.lng,
      heading: payload.heading ?? null,
      speed: payload.speed ?? null,
      status: payload.status ?? 'on_time',
      source: payload.source ?? 'simulation',
    })
    .select()
    .single();

  if (error) {
    console.error('Error pushing location:', error);
    throw error;
  }

  return data;
}

/**
 * Get location history for a trip
 * @param {string} tripId - UUID of the trip
 * @param {number} limit - Max number of records (default 50)
 * @returns {Promise<Array>} Array of location records
 */
export async function getLocationHistory(tripId, limit = 50) {
  if (!tripId) {
    return [];
  }

  const { data, error } = await supabase
    .from('trip_locations')
    .select('*')
    .eq('trip_id', tripId)
    .order('recorded_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching location history:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if tracking is available for a trip
 * (User must have a booking for the trip)
 * @param {string} tripId - UUID of the trip
 * @param {string} userId - UUID of the user
 * @returns {Promise<boolean>} Whether tracking is available
 */
export async function checkTrackingAccess(tripId, userId) {
  if (!tripId || !userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('id')
    .eq('trip_id', tripId)
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return profile?.role === 'admin';
  }

  return !!data;
}

/**
 * Subscribe to real-time location updates for a route (alias for trip)
 * @param {string} routeId - UUID of the route/trip to track
 * @param {Function} onUpdate - Callback function receiving location updates
 * @returns {Function} Cleanup function to unsubscribe
 */
export function subscribeToRouteLocation(routeId, onUpdate) {
  return subscribeToTripLocation(routeId, onUpdate);
}

/**
 * Simulate bus movement along a route (DEV/ADMIN ONLY)
 * @param {string} tripId - UUID of the trip
 * @param {Object} options - Simulation options
 * @param {Object} options.start - Starting coordinates {lat, lng}
 * @param {Object} options.end - Ending coordinates {lat, lng}
 * @param {number} options.duration - Duration in ms (default 30000)
 * @param {number} options.interval - Update interval in ms (default 3000)
 * @param {Function} [options.onUpdate] - Callback for each update
 * @returns {Promise<Function>} Function to stop simulation
 */
export async function simulateMovement(tripId, options = {}) {
  const {
    start = { lat: -24.6282, lng: 25.9231 }, // Default: Gaborone
    end = { lat: -24.6580, lng: 25.9120 },
    duration = 30000,
    interval = 3000,
    onUpdate,
  } = options;

  const steps = Math.floor(duration / interval);
  const latStep = (end.lat - start.lat) / steps;
  const lngStep = (end.lng - start.lng) / steps;

  let currentStep = 0;
  let stopped = false;

  const statuses = ['boarding', 'departed', 'on_time', 'on_time', 'arriving'];

  const runSimulation = async () => {
    while (currentStep <= steps && !stopped) {
      const lat = start.lat + latStep * currentStep;
      const lng = start.lng + lngStep * currentStep;
      
      // Calculate heading (simplified)
      const heading = Math.atan2(lngStep, latStep) * (180 / Math.PI);
      
      // Determine status based on progress
      const progress = currentStep / steps;
      let status;
      if (progress < 0.1) status = 'boarding';
      else if (progress < 0.2) status = 'departed';
      else if (progress > 0.9) status = 'arriving';
      else status = 'on_time';

      try {
        const location = await pushLocation(tripId, {
          lat,
          lng,
          heading: heading >= 0 ? heading : heading + 360,
          speed: 40 + Math.random() * 20, // 40-60 km/h
          status,
          source: 'simulation',
        });

        if (onUpdate) {
          onUpdate(location);
        }
      } catch (err) {
        console.error('Simulation error:', err);
      }

      currentStep++;
      
      if (currentStep <= steps && !stopped) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  };

  // Start simulation
  runSimulation();

  // Return stop function
  return () => {
    stopped = true;
  };
}
