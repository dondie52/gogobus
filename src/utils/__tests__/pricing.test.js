/**
 * Unit tests for pricing utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pricingHelper } from '../pricing';
import { routeService } from '../../services/routeService';

// Mock routeService
vi.mock('../../services/routeService', () => ({
  routeService: {
    getRoutes: vi.fn(),
  },
}));

describe('pricingHelper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculatePriceFromDistance', () => {
    it('should calculate price from distance correctly', () => {
      expect(pricingHelper.calculatePriceFromDistance(100)).toBe(35); // 100 * 0.35
      expect(pricingHelper.calculatePriceFromDistance(200)).toBe(70); // 200 * 0.35
      expect(pricingHelper.calculatePriceFromDistance(0)).toBe(0);
    });

    it('should round to 2 decimal places', () => {
      expect(pricingHelper.calculatePriceFromDistance(10)).toBe(3.5);
      expect(pricingHelper.calculatePriceFromDistance(33.33)).toBeCloseTo(11.67, 2);
    });
  });

  describe('getRoutePriceSync', () => {
    it('should return known route prices', () => {
      expect(pricingHelper.getRoutePriceSync('Gaborone', 'Maun')).toBe(305);
      expect(pricingHelper.getRoutePriceSync('Maun', 'Gaborone')).toBe(305);
      expect(pricingHelper.getRoutePriceSync('Gaborone', 'Palapye')).toBe(98);
    });

    it('should calculate from distance if route not in known prices', () => {
      expect(pricingHelper.getRoutePriceSync('Gaborone', 'Francistown', 100)).toBe(35);
      expect(pricingHelper.getRoutePriceSync('Unknown', 'City', 200)).toBe(70);
    });

    it('should return 0 if no price found and no distance provided', () => {
      expect(pricingHelper.getRoutePriceSync('Unknown', 'City')).toBe(0);
    });
  });

  describe('getRoutePrice', () => {
    it('should return known route prices synchronously', async () => {
      const price = await pricingHelper.getRoutePrice('Gaborone', 'Maun');
      expect(price).toBe(305);
    });

    it('should calculate from provided distance', async () => {
      const price = await pricingHelper.getRoutePrice('Gaborone', 'Francistown', 100);
      expect(price).toBe(35);
    });

    it('should fetch route from database if not in known prices', async () => {
      routeService.getRoutes.mockResolvedValue([
        {
          origin: 'Gaborone',
          destination: 'Francistown',
          distance_km: 430,
        },
      ]);

      const price = await pricingHelper.getRoutePrice('Gaborone', 'Francistown');
      expect(price).toBeCloseTo(150.5, 1); // 430 * 0.35
      expect(routeService.getRoutes).toHaveBeenCalled();
    });

    it('should return 0 if route not found in database', async () => {
      routeService.getRoutes.mockResolvedValue([]);

      const price = await pricingHelper.getRoutePrice('Unknown', 'City');
      expect(price).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      routeService.getRoutes.mockRejectedValue(new Error('Database error'));

      const price = await pricingHelper.getRoutePrice('Gaborone', 'Francistown', 100);
      expect(price).toBe(35); // Falls back to distance calculation
    });
  });

  describe('ROUTE_PRICES', () => {
    it('should have correct route prices defined', () => {
      expect(pricingHelper.ROUTE_PRICES['Gaborone-Maun']).toBe(305);
      expect(pricingHelper.ROUTE_PRICES['Gaborone-Palapye']).toBe(98);
      expect(pricingHelper.ROUTE_PRICES['Gaborone-Serowe']).toBe(114);
    });

    it('should have bidirectional routes', () => {
      expect(pricingHelper.ROUTE_PRICES['Gaborone-Maun']).toBe(
        pricingHelper.ROUTE_PRICES['Maun-Gaborone']
      );
    });
  });

  describe('RATE_PER_KM', () => {
    it('should have correct rate per kilometer', () => {
      expect(pricingHelper.RATE_PER_KM).toBe(0.35);
    });
  });
});
