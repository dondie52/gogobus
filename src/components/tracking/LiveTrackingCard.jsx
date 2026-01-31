/**
 * LiveTrackingCard - Compact tracking card for TicketView
 * Shows current status, location, and link to full tracking page
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TripStatusPill from './TripStatusPill';
import { getLatestLocation, subscribeToRouteLocation } from '../../services/trackingService';
import styles from './LiveTrackingCard.module.css';

// Helper to format relative time
function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour} hr ago`;
  return date.toLocaleDateString();
}

// Helper to get location label from coordinates
function getLocationLabel(location) {
  if (!location) return 'Location unavailable';
  if (location.locationName) return location.locationName;
  if (location.lat && location.lng) {
    return `${location.lat.toFixed(4)}°, ${location.lng.toFixed(4)}°`;
  }
  return 'Location unavailable';
}

export default function LiveTrackingCard({ routeId, trip, bookingId }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch initial location
  useEffect(() => {
    if (!routeId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function fetchLocation() {
      try {
        setLoading(true);
        setError(null);
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

  // Update "time ago" display every 10 seconds
  useEffect(() => {
    if (!lastUpdate) return;

    const interval = setInterval(() => {
      // Force re-render to update time display
      setLastUpdate((prev) => prev);
    }, 10000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  // Navigate to full tracking page
  const handleOpenMap = useCallback(() => {
    navigate(`/tracking/${routeId}`);
  }, [navigate, routeId]);

  // Loading state
  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>📍</span>
          <h3 className={styles.headerTitle}>Live Tracking</h3>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading tracking data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>📍</span>
          <h3 className={styles.headerTitle}>Live Tracking</h3>
        </div>
        <div className={styles.errorState}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => window.location.reload()}
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no tracking available
  if (!location) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>📍</span>
          <h3 className={styles.headerTitle}>Live Tracking</h3>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🚌</span>
          <p className={styles.emptyText}>
            Live tracking will be available once the bus departs.
          </p>
          <p className={styles.emptySubtext}>
            Check back closer to departure time.
          </p>
        </div>
      </div>
    );
  }

  // Main tracking card with data
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>📍</span>
        <h3 className={styles.headerTitle}>Live Tracking</h3>
        {location.status && (
          <TripStatusPill status={location.status} size="small" />
        )}
      </div>

      <div className={styles.content}>
        {/* Location row */}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Current Location</span>
          <span className={styles.infoValue}>{getLocationLabel(location)}</span>
        </div>

        {/* Speed row */}
        {location.speed != null && (
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Speed</span>
            <span className={styles.infoValue}>
              {Math.round(location.speed)} km/h
            </span>
          </div>
        )}

        {/* ETA row */}
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>ETA</span>
          <span className={styles.infoValue}>
            {trip?.eta || 'Estimating...'}
          </span>
        </div>

        {/* Last updated */}
        <div className={styles.lastUpdated}>
          <span className={styles.updateDot} />
          Last updated: {formatTimeAgo(lastUpdate)}
        </div>
      </div>

      {/* Open map button */}
      <button
        type="button"
        className={styles.mapButton}
        onClick={handleOpenMap}
        aria-label="Open live map view"
      >
        <span className={styles.mapButtonIcon}>🗺️</span>
        Open Live Map
        <span className={styles.mapButtonArrow}>→</span>
      </button>
    </div>
  );
}
