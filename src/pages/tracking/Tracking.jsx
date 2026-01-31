/**
 * Tracking Page - Full-screen map with bottom sheet
 * Real-time bus tracking for a specific trip
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackingMap from '../../components/tracking/TrackingMap';
import TripStatusPill from '../../components/tracking/TripStatusPill';
import {
  getLatestLocation,
  subscribeToRouteLocation,
  simulateMovement,
  getLocationHistory,
} from '../../services/trackingService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import styles from './Tracking.module.css';

// Format relative time
function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown';

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Format time
function formatTime(dateString) {
  if (!dateString) return '--:--';
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Tracking() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [location, setLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [sheetExpanded, setSheetExpanded] = useState(false);

  // Admin simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const stopSimulationRef = useRef(null);

  const isAdmin = profile?.role === 'admin';

  // Fetch route details
  useEffect(() => {
    if (!routeId) return;

    async function fetchRoute() {
      try {
        const { data, error: routeError } = await supabase
          .from('routes')
          .select('*')
          .eq('id', routeId)
          .single();

        if (routeError) throw routeError;
        setRoute(data);
      } catch (err) {
        console.error('Failed to fetch route:', err);
        // Don't set error here, tracking might still work
      }
    }

    fetchRoute();
  }, [routeId]);

  // Fetch initial location
  useEffect(() => {
    if (!routeId) {
      setError('No route ID provided');
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchLocation() {
      try {
        setLoading(true);
        const data = await getLatestLocation(routeId);

        if (mounted) {
          setLocation(data);
          setLastUpdate(data?.recorded_at || null);
        }
      } catch (err) {
        console.error('Failed to fetch location:', err);
        if (mounted) {
          setError('Failed to load tracking data');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLocation();

    return () => {
      mounted = false;
    };
  }, [routeId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!routeId) return;

    const handleUpdate = (newLocation) => {
      setLocation(newLocation);
      setLastUpdate(newLocation?.recorded_at || new Date().toISOString());
    };

    const unsubscribe = subscribeToRouteLocation(routeId, handleUpdate);

    return () => {
      unsubscribe();
    };
  }, [routeId]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (stopSimulationRef.current) {
        stopSimulationRef.current();
      }
    };
  }, []);

  // Update time display periodically
  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      setLastUpdate((prev) => prev); // Force re-render
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Toggle bottom sheet
  const toggleSheet = useCallback(() => {
    setSheetExpanded((prev) => !prev);
  }, []);

  // Admin: Start simulation
  const handleStartSimulation = useCallback(async () => {
    if (isSimulating || !routeId) return;

    setIsSimulating(true);

    // Get route coordinates or use defaults
    const start = route
      ? { lat: route.origin_lat || -24.6282, lng: route.origin_lng || 25.9231 }
      : { lat: -24.6282, lng: 25.9231 };

    const end = route
      ? { lat: route.destination_lat || -24.6580, lng: route.destination_lng || 25.9120 }
      : { lat: -24.6580, lng: 25.9120 };

    try {
      const stopFn = await simulateMovement(routeId, {
        start,
        end,
        duration: 45000, // 45 seconds
        interval: 3000, // Every 3 seconds
        onUpdate: (loc) => {
          console.log('Simulation update:', loc);
        },
      });

      stopSimulationRef.current = stopFn;

      // Auto-stop after duration
      setTimeout(() => {
        setIsSimulating(false);
        stopSimulationRef.current = null;
      }, 50000);
    } catch (err) {
      console.error('Simulation error:', err);
      setIsSimulating(false);
    }
  }, [isSimulating, routeId, route]);

  // Admin: Stop simulation
  const handleStopSimulation = useCallback(() => {
    if (stopSimulationRef.current) {
      stopSimulationRef.current();
      stopSimulationRef.current = null;
    }
    setIsSimulating(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingScreen}>
          <div className={styles.loadingSpinner} />
          <p>Loading tracking data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorScreen}>
          <span className={styles.errorIcon}>⚠️</span>
          <h2>Unable to Load Tracking</h2>
          <p>{error}</p>
          <button className={styles.backButton} onClick={handleBack} type="button">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Build origin/destination for map
  const origin = route
    ? {
        lat: route.origin_lat,
        lng: route.origin_lng,
        name: route.origin,
      }
    : null;

  const destination = route
    ? {
        lat: route.destination_lat,
        lng: route.destination_lng,
        name: route.destination,
      }
    : null;

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={handleBack}
          type="button"
          aria-label="Go back"
        >
          ←
        </button>
        <h1 className={styles.headerTitle}>Live Tracking</h1>
        {location?.status && (
          <TripStatusPill status={location.status} size="small" />
        )}
      </header>

      {/* Map area */}
      <div className={styles.mapArea}>
        <TrackingMap
          location={location}
          origin={origin}
          destination={destination}
        />
      </div>

      {/* Bottom sheet */}
      <div className={`${styles.sheet} ${sheetExpanded ? styles.expanded : ''}`}>
        {/* Sheet handle */}
        <button
          className={styles.sheetHandle}
          onClick={toggleSheet}
          type="button"
          aria-label={sheetExpanded ? 'Collapse details' : 'Expand details'}
        >
          <span className={styles.handleBar} />
        </button>

        {/* Sheet content */}
        <div className={styles.sheetContent}>
          {/* Route info */}
          <div className={styles.routeInfo}>
            <div className={styles.routePoint}>
              <span className={`${styles.routeDot} ${styles.origin}`} />
              <div>
                <span className={styles.routeLabel}>From</span>
                <span className={styles.routeValue}>
                  {route?.origin || 'Origin'}
                </span>
              </div>
            </div>
            <div className={styles.routeLine} />
            <div className={styles.routePoint}>
              <span className={`${styles.routeDot} ${styles.destination}`} />
              <div>
                <span className={styles.routeLabel}>To</span>
                <span className={styles.routeValue}>
                  {route?.destination || 'Destination'}
                </span>
              </div>
            </div>
          </div>

          {/* Route details grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Distance</span>
              <span className={styles.detailValue}>
                {route?.distance_km ? `${route.distance_km} km` : '--'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Duration</span>
              <span className={styles.detailValue}>
                {route?.duration_hours ? `${Math.round(route.duration_hours * 60)} min` : '--'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Speed</span>
              <span className={styles.detailValue}>
                {location?.speed != null
                  ? `${Math.round(location.speed)} km/h`
                  : '-- km/h'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Updated</span>
              <span className={styles.detailValue}>
                {formatTimeAgo(lastUpdate)}
              </span>
            </div>
          </div>

          {/* Live indicator */}
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <span>Live tracking active</span>
          </div>

          {/* Admin simulation panel - DEV ONLY */}
          {isAdmin && (
            <div className={styles.adminPanel}>
              <div className={styles.adminHeader}>
                <span>🛠️</span>
                <span>DEV ONLY - Simulation</span>
              </div>
              <div className={styles.adminContent}>
                {isSimulating ? (
                  <button
                    className={`${styles.simButton} ${styles.stopBtn}`}
                    onClick={handleStopSimulation}
                    type="button"
                  >
                    ⏹ Stop Simulation
                  </button>
                ) : (
                  <button
                    className={`${styles.simButton} ${styles.startBtn}`}
                    onClick={handleStartSimulation}
                    type="button"
                  >
                    ▶️ Simulate Movement
                  </button>
                )}
                <p className={styles.adminNote}>
                  Simulates bus movement for ~45 seconds
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}