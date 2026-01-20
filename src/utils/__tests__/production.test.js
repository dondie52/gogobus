/**
 * Tests for production environment validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateProductionEnvironment,
  getProductionReadiness,
  calculateReadinessScore,
} from '../production';

describe('Production Environment Validation', () => {
  beforeEach(() => {
    // Reset environment variables
    vi.resetModules();
  });

  describe('validateProductionEnvironment', () => {
    it('should return valid when all required env vars are present', () => {
      // Mock environment variables
      import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      const result = validateProductionEnvironment();
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid when required env vars are missing', () => {
      // Mock missing environment variables
      import.meta.env.VITE_SUPABASE_URL = '';
      import.meta.env.VITE_SUPABASE_ANON_KEY = '';

      const result = validateProductionEnvironment();
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate Supabase URL uses HTTPS', () => {
      import.meta.env.VITE_SUPABASE_URL = 'http://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      const result = validateProductionEnvironment();
      
      expect(result.errors.some(e => e.includes('HTTPS'))).toBe(true);
    });

    it('should warn about missing recommended env vars', () => {
      import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
      import.meta.env.VITE_SENTRY_DSN = '';
      import.meta.env.VITE_GA4_MEASUREMENT_ID = '';

      const result = validateProductionEnvironment();
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('getProductionReadiness', () => {
    it('should return readiness status with all checks', () => {
      import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';

      const readiness = getProductionReadiness();
      
      expect(readiness).toHaveProperty('ready');
      expect(readiness).toHaveProperty('score');
      expect(readiness).toHaveProperty('checks');
      expect(readiness.checks).toHaveProperty('environment');
      expect(readiness.checks).toHaveProperty('supabase');
    });

    it('should calculate correct readiness score', () => {
      import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
      import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-key';
      import.meta.env.VITE_SENTRY_DSN = 'https://test.sentry.io';
      import.meta.env.VITE_GA4_MEASUREMENT_ID = 'G-TEST';

      const readiness = getProductionReadiness();
      
      expect(readiness.score).toBeGreaterThanOrEqual(0);
      expect(readiness.score).toBeLessThanOrEqual(100);
    });
  });
});
