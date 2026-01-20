import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import { logError } from '../../utils/logger';
import styles from './SearchResults.module.css';

// ==================== ICONS ====================
const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  ),
  Bus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/>
      <circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    </svg>
  ),
  Wifi: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>
    </svg>
  ),
  Snowflake: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>
    </svg>
  ),
  Power: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

// ==================== AMENITY ICONS ====================
const AmenityIcon = ({ type }) => {
  const icons = {
    wifi: <Icons.Wifi />,
    ac: <Icons.Snowflake />,
    power: <Icons.Power />,
  };
  return icons[type] || null;
};

// ==================== MAIN COMPONENT ====================
export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get search params
  const origin = searchParams.get('from') || '';
  const destination = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = parseInt(searchParams.get('passengers') || '1');

  // State
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('departure'); // departure, price, duration
  const [filterBusType, setFilterBusType] = useState('all');

  // Fetch trips
  useEffect(() => {
    const fetchTrips = async () => {
      if (!origin || !destination || !date) {
        setError('Invalid search parameters');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await bookingService.searchTrips({
          origin,
          destination,
          date,
          passengers,
        });

        if (fetchError) throw fetchError;
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:108',message:'Trips loaded',data:{tripsCount:data?.length || 0,tripIds:data?.map(t=>t?.id).filter(Boolean),tripsWithIds:data?.filter(t=>t?.id).length,tripsWithoutIds:data?.filter(t=>!t?.id).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setTrips(data || []);
      } catch (err) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:117',message:'Search error occurred',data:{errorMessage:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        logError('Search error', err);
        setError(err.message || 'Failed to search trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [origin, destination, date, passengers]);

  // Sort and filter trips
  const sortedTrips = [...trips]
    .filter(trip => filterBusType === 'all' || trip.buses?.bus_type === filterBusType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return (a.routes?.duration_minutes || 0) - (b.routes?.duration_minutes || 0);
        case 'departure':
        default:
          return new Date(a.departure_time) - new Date(b.departure_time);
      }
    });

  // Format helpers
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-BW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BW', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => `P${amount}`;

  // Handle trip selection
  const handleSelectTrip = (trip) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:169',message:'handleSelectTrip called',data:{tripId:trip?.id,tripIdType:typeof trip?.id,passengers:passengers,passengersType:typeof passengers,availableSeats:trip?.available_seats,isDisabled:trip?.available_seats < passengers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:170',message:'Before navigation',data:{tripId:trip?.id,passengers:passengers,navigationUrl:`/booking/seats/${trip?.id}?passengers=${passengers}`,hasTripId:!!trip?.id,hasPassengers:!!passengers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Navigate to seat selection with trip ID
    navigate(`/booking/seats/${trip.id}?passengers=${passengers}`);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:172',message:'After navigate call',data:{tripId:trip?.id,passengers:passengers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
  };

  // Get unique bus types for filter
  const busTypes = [...new Set(trips.map(t => t.buses?.bus_type).filter(Boolean))];

  return (
    <div className={styles.searchPage}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          className={styles.backBtn} 
          onClick={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:196',message:'Back button clicked',data:{currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            // Go back in history, or to home if no history
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/home');
            }
          }}
        >
          <Icons.ArrowLeft />
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>
            {origin} → {destination}
          </h1>
          <div className={styles.headerMeta}>
            <span><Icons.Calendar /> {formatDate(date)}</span>
            <span><Icons.Users /> {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}</span>
          </div>
        </div>
        <Link to="/" className={styles.modifyBtn}>Modify</Link>
      </header>

      {/* Filters */}
      {trips.length > 0 && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="departure">Departure Time</option>
              <option value="price">Price (Low to High)</option>
              <option value="duration">Duration</option>
            </select>
          </div>
          
          {busTypes.length > 1 && (
            <div className={styles.filterGroup}>
              <label>Bus Type:</label>
              <select value={filterBusType} onChange={(e) => setFilterBusType(e.target.value)}>
                <option value="all">All Types</option>
                {busTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className={styles.resultsCount}>
            {sortedTrips.length} {sortedTrips.length === 1 ? 'bus' : 'buses'} found
          </div>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Searching for available buses...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <Icons.AlertCircle />
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/')}>Back to Search</button>
          </div>
        ) : sortedTrips.length === 0 ? (
          <div className={styles.empty}>
            <Icons.Bus />
            <h2>No buses found</h2>
            <p>
              No buses available from {origin} to {destination} on {formatDate(date)}.
              Try a different date or route.
            </p>
            <button onClick={() => navigate('/')}>Search Again</button>
          </div>
        ) : (
          <div className={styles.tripsList}>
            {sortedTrips.map(trip => {
              // #region agent log
              const isButtonDisabled = trip.available_seats < passengers;
              fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:252',message:'Rendering trip card',data:{tripId:trip?.id,availableSeats:trip?.available_seats,passengers:passengers,isButtonDisabled:isButtonDisabled,hasTripId:!!trip?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
              // #endregion
              return (
              <div key={trip.id} className={styles.tripCard}>
                <div className={styles.tripMain}>
                  {/* Times */}
                  <div className={styles.tripTimes}>
                    <div className={styles.timeBlock}>
                      <span className={styles.time}>{formatTime(trip.departure_time)}</span>
                      <span className={styles.city}>{origin}</span>
                    </div>
                    
                    <div className={styles.duration}>
                      <div className={styles.durationLine}>
                        <div className={styles.durationDot} />
                        <div className={styles.durationDash} />
                        <Icons.Bus />
                        <div className={styles.durationDash} />
                        <div className={styles.durationDot} />
                      </div>
                      <span>{formatDuration(trip.routes?.duration_minutes)}</span>
                    </div>
                    
                    <div className={styles.timeBlock}>
                      <span className={styles.time}>
                        {trip.arrival_time 
                          ? formatTime(trip.arrival_time)
                          : '~' + formatTime(new Date(new Date(trip.departure_time).getTime() + (trip.routes?.duration_minutes || 0) * 60000))
                        }
                      </span>
                      <span className={styles.city}>{destination}</span>
                    </div>
                  </div>

                  {/* Bus Info */}
                  <div className={styles.busInfo}>
                    <div className={styles.busName}>
                      {trip.buses?.bus_name || 'Standard Bus'}
                    </div>
                    <div className={styles.busType}>
                      {trip.buses?.bus_type || 'standard'}
                    </div>
                    {trip.buses?.amenities && trip.buses.amenities.length > 0 && (
                      <div className={styles.amenities}>
                        {trip.buses.amenities.map(amenity => (
                          <span key={amenity} className={styles.amenity} title={amenity}>
                            <AmenityIcon type={amenity} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Seats */}
                  <div className={styles.seatsInfo}>
                    <span className={`${styles.seatsCount} ${trip.available_seats <= 5 ? styles.low : ''}`}>
                      {trip.available_seats} {trip.available_seats === 1 ? 'seat' : 'seats'} left
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className={styles.priceAction}>
                    <div className={styles.price}>
                      <span className={styles.priceAmount}>{formatCurrency(trip.price)}</span>
                      <span className={styles.priceLabel}>per person</span>
                    </div>
                    <button 
                      className={styles.selectBtn}
                      type="button"
                      data-trip-id={trip.id}
                      onClick={(e) => {
                        // #region agent log
                        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'SearchResults.jsx:349',message:'Select button onClick handler called',data:{tripId:trip?.id,availableSeats:trip?.available_seats,passengers:passengers,isDisabled:trip?.available_seats < passengers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
                        // #endregion
                        e.stopPropagation();
                        handleSelectTrip(trip);
                      }}
                      disabled={trip.available_seats < passengers}
                    >
                      Select
                      <Icons.ChevronRight style={{ pointerEvents: 'none' }} />
                    </button>
                  </div>
                </div>

                {/* Warning for low seats */}
                {trip.available_seats <= 5 && trip.available_seats >= passengers && (
                  <div className={styles.lowSeatsWarning}>
                    ⚡ Only {trip.available_seats} seats remaining - Book now!
                  </div>
                )}
              </div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
