/**
 * TrackingMap - Real-time map component using Leaflet + OpenStreetMap
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './TrackingMap.module.css';

// Fix for default marker icons in Leaflet + Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom bus icon
const createBusIcon = (heading = 0) => {
  return L.divIcon({
    className: styles.busMarker,
    html: `
      <div class="${styles.busIconWrapper}" style="transform: rotate(${heading}deg)">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="3" width="16" height="16" rx="3" fill="#2563eb"/>
          <rect x="6" y="5" width="5" height="4" rx="1" fill="#bfdbfe"/>
          <rect x="13" y="5" width="5" height="4" rx="1" fill="#bfdbfe"/>
          <rect x="6" y="11" width="5" height="3" rx="0.5" fill="#93c5fd"/>
          <rect x="13" y="11" width="5" height="3" rx="0.5" fill="#93c5fd"/>
          <circle cx="7.5" cy="18.5" r="1.5" fill="#1e3a5f"/>
          <circle cx="16.5" cy="18.5" r="1.5" fill="#1e3a5f"/>
          <path d="M12 0L15 3H9L12 0Z" fill="#2563eb"/>
        </svg>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 24],
    popupAnchor: [0, -24],
  });
};

// Component to update map view when location changes
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1,
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

// Default center: Gaborone, Botswana
const DEFAULT_CENTER = [-24.6282, 25.9231];
const DEFAULT_ZOOM = 14;

export default function TrackingMap({
  location,
  origin,
  destination,
  onMapReady,
  className,
}) {
  const mapRef = useRef(null);

  // Calculate center based on current location or default
  const center = useMemo(() => {
    if (location?.lat && location?.lng) {
      return [location.lat, location.lng];
    }
    return DEFAULT_CENTER;
  }, [location]);

  // Create bus icon with heading
  const busIcon = useMemo(() => {
    return createBusIcon(location?.heading || 0);
  }, [location?.heading]);

  // Origin marker icon
  const originIcon = useMemo(() => {
    return L.divIcon({
      className: styles.originMarker,
      html: `
        <div class="${styles.markerPin} ${styles.origin}">
          <span>A</span>
        </div>
      `,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  // Destination marker icon
  const destinationIcon = useMemo(() => {
    return L.divIcon({
      className: styles.destinationMarker,
      html: `
        <div class="${styles.markerPin} ${styles.destination}">
          <span>B</span>
        </div>
      `,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  return (
    <div className={`${styles.mapContainer} ${className || ''}`}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className={styles.map}
        whenReady={() => onMapReady && onMapReady(mapRef.current)}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin marker */}
        {origin?.lat && origin?.lng && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <strong>Origin</strong>
              <br />
              {origin.name || 'Departure Point'}
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destination?.lat && destination?.lng && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <strong>Destination</strong>
              <br />
              {destination.name || 'Arrival Point'}
            </Popup>
          </Marker>
        )}

        {/* Bus marker - current location */}
        {location?.lat && location?.lng && (
          <Marker position={[location.lat, location.lng]} icon={busIcon}>
            <Popup>
              <div className={styles.busPopup}>
                <strong>🚌 Bus Location</strong>
                <br />
                {location.speed && (
                  <span>Speed: {Math.round(location.speed)} km/h</span>
                )}
                {location.status && (
                  <>
                    <br />
                    <span>Status: {location.status.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Auto-update map center when location changes */}
        <MapUpdater center={center} />
      </MapContainer>

      {/* No location overlay */}
      {!location && (
        <div className={styles.noLocationOverlay}>
          <div className={styles.noLocationContent}>
            <span className={styles.noLocationIcon}>📍</span>
            <p>Waiting for bus location...</p>
          </div>
        </div>
      )}
    </div>
  );
}
