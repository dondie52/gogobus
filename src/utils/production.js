/**
 * Production environment validation and checks
 * Ensures all required configuration is present before deployment
 */

import { logError, logWarn, logInfo } from './logger';

const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  VITE_SUPABASE_URL: 'Supabase project URL',
  VITE_SUPABASE_ANON_KEY: 'Supabase anonymous key',
};

/**
 * Optional but recommended environment variables
 */
const RECOMMENDED_ENV_VARS = {
  VITE_SENTRY_DSN: 'Sentry DSN for error tracking',
  VITE_GA4_MEASUREMENT_ID: 'Google Analytics 4 Measurement ID',
  VITE_DPO_COMPANY_TOKEN: 'DPO Pay company token',
  VITE_DPO_SERVICE_TYPE: 'DPO Pay service type',
  VITE_ORANGE_MERCHANT_KEY: 'Orange Money merchant key',
};

/**
 * Validate production environment configuration
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export const validateProductionEnvironment = () => {
  const errors = [];
  const warnings = [];

  // Check required environment variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${key} (${description})`);
    }
  }

  // Check recommended environment variables
  for (const [key, description] of Object.entries(RECOMMENDED_ENV_VARS)) {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      warnings.push(`Missing recommended environment variable: ${key} (${description})`);
    }
  }

  // Validate Supabase URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    errors.push('VITE_SUPABASE_URL must use HTTPS in production');
  }

  // Validate Sentry DSN format if provided
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  if (sentryDsn && !sentryDsn.startsWith('https://')) {
    warnings.push('VITE_SENTRY_DSN should be a valid HTTPS URL');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Run production checks on app initialization
 * Only runs in production mode
 */
export const runProductionChecks = () => {
  if (!isProduction) return;

  const validation = validateProductionEnvironment();

  if (!validation.valid) {
    logError('[Production] Environment validation failed', { errors: validation.errors });
    // In production, we might want to show a user-friendly error page
    // For now, we log the errors
  }

  if (validation.warnings.length > 0) {
    logWarn('[Production] Environment warnings', { warnings: validation.warnings });
  }

  // Check if we're in a production build
  if (import.meta.env.DEV) {
    logWarn('[Production] Running in development mode in production build');
  }

  return validation;
};

/**
 * Get production readiness status
 * @returns {object} Production readiness information
 */
export const getProductionReadiness = () => {
  const validation = validateProductionEnvironment();
  
  return {
    ready: validation.valid,
    score: calculateReadinessScore(validation),
    errors: validation.errors,
    warnings: validation.warnings,
    checks: {
      environment: validation.valid,
      supabase: !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      monitoring: !!import.meta.env.VITE_SENTRY_DSN,
      analytics: !!import.meta.env.VITE_GA4_MEASUREMENT_ID,
      payments: !!import.meta.env.VITE_DPO_COMPANY_TOKEN && !!import.meta.env.VITE_DPO_SERVICE_TYPE,
    },
  };
};

/**
 * Calculate production readiness score (0-100)
 * @param {object} validation - Validation result
 * @returns {number} Readiness score
 */
export const calculateReadinessScore = (validation) => {
  let score = 100;
  
  // Deduct points for errors (critical)
  score -= validation.errors.length * 20;
  
  // Deduct points for warnings (important but not critical)
  score -= validation.warnings.length * 5;
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Log production readiness status
 */
export const logProductionReadiness = () => {
  if (!isProduction) return;
  
  const readiness = getProductionReadiness();
  
  logInfo('[Production] Readiness Status', {
    ready: readiness.ready,
    score: `${readiness.score}%`,
    checks: readiness.checks,
  });
  
  if (readiness.errors.length > 0) {
    logError('[Production] Critical Issues', { errors: readiness.errors });
  }
  
  if (readiness.warnings.length > 0) {
    logWarn('[Production] Warnings', { warnings: readiness.warnings });
  }
};
