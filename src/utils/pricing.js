import { routeService } from '../services/routeService';
import { logWarn } from './logger';

/**
 * Pricing helper
 * Calculates route prices
 */
export const pricingHelper = {
  /**
   * Base rate: 35 thebe per kilometer = 0.35 pula per km
   */
  RATE_PER_KM: 0.35,

  /**
   * Known route prices (for routes with specific pricing)
   */
  ROUTE_PRICES: {
    'Gaborone-Maun': 305,
    'Gaborone-Palapye': 98,
    'Gaborone-Serowe': 114,
    'Gaborone-Mahalapye': 72,
    'Maun-Gaborone': 305,
    'Palapye-Gaborone': 98,
    'Serowe-Gaborone': 114,
    'Mahalapye-Gaborone': 72,
  },

  /**
   * Calculate price from distance using the base rate
   * @param {number} distanceKm - Distance in kilometers
   * @returns {number} Price in pula
   */
  calculatePriceFromDistance(distanceKm) {
    return Math.round(distanceKm * this.RATE_PER_KM * 100) / 100; // Round to 2 decimal places
  },

  /**
   * Get route price by origin and destination
   * First checks known route prices, then calculates from distance if route exists
   * @param {string} origin - Origin city
   * @param {string} destination - Destination city
   * @param {number} distanceKm - Optional distance in km (if not provided, will try to fetch from routes)
   * @returns {Promise<number>|number} Price in pula
   */
  async getRoutePrice(origin, destination, distanceKm = null) {
    // Check known route prices first
    const routeKey = `${origin}-${destination}`;
    if (this.ROUTE_PRICES[routeKey]) {
      return this.ROUTE_PRICES[routeKey];
    }

    // If distance provided, calculate from distance
    if (distanceKm !== null) {
      return this.calculatePriceFromDistance(distanceKm);
    }

    // Try to fetch route from database
    try {
      const routes = await routeService.getRoutes();
      const route = routes.find(r =>
        r.origin.toLowerCase() === origin.toLowerCase() &&
        r.destination.toLowerCase() === destination.toLowerCase()
      );

      if (route && route.distance_km) {
        return this.calculatePriceFromDistance(route.distance_km);
      }
    } catch (error) {
      logWarn('Failed to fetch route for pricing', error);
    }

    // Fallback: return calculated price if distance was provided, otherwise return 0
    return distanceKm !== null ? this.calculatePriceFromDistance(distanceKm) : 0;
  },

  /**
   * Get route price synchronously (uses known prices or provided distance)
   * @param {string} origin - Origin city
   * @param {string} destination - Destination city
   * @param {number} distanceKm - Distance in km (required if route not in known prices)
   * @returns {number} Price in pula
   */
  getRoutePriceSync(origin, destination, distanceKm = null) {
    const routeKey = `${origin}-${destination}`;
    if (this.ROUTE_PRICES[routeKey]) {
      return this.ROUTE_PRICES[routeKey];
    }

    if (distanceKm !== null) {
      return this.calculatePriceFromDistance(distanceKm);
    }

    // Return 0 if no price found and no distance provided
    return 0;
  },
};
