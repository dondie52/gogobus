import { createClient } from '@supabase/supabase-js';

// Supabase credentials from environment variables
// Fallback to hardcoded values for backward compatibility (development only)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jhnnazntoimddmclzile.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impobm5hem50b2ltZGRtY2x6aWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNzMxNzYsImV4cCI6MjA4Mjk0OTE3Nn0.D2swkrh_enTdXC54nERVdoXCwbBVOIGnqYRKtL6eIT8';

// Base URL for redirects
export const BASE_URL = (() => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  // Production domain
  if (hostname === 'gogobus.co.bw' || hostname.includes('gogobus')) {
    return `https://${hostname}`;
  }
  // Fallback for other deployments
  return import.meta.env.VITE_APP_URL || `https://${hostname}`;
})();

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
