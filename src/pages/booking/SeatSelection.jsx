import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import bookingService from '../../services/bookingService';
import Modal from '../../components/common/Modal';
import styles from './SeatSelection.module.css';

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
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  Steering: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2"/><path d="M12 2v8"/><path d="m4.93 10.93 6.36 2.54"/><path d="m19.07 10.93-6.36 2.54"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Clock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
};

// ==================== MAIN COMPONENT ====================
export default function SeatSelection() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams] = useSearchParams();
  const passengersNeeded = parseInt(searchParams.get('passengers') || '1');
  const { isAuthenticated, isEmailVerified, user } = useAuth();
  const { setSelectedSeats: setContextSelectedSeats, setSelectedRoute } = useBooking();

  // State
  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);

  // Fetch trip and seats
  useEffect(() => {
    // #region agent log
    // #endregion
    const fetchData = async () => {
      setLoading(true);
      // #region agent log
      // #endregion
      try {
        const { data: tripData, error: tripError } = await bookingService.getTripById(tripId);
        // #region agent log
        // #endregion
        if (tripError) throw tripError;
        
        setTrip(tripData);
        setSeats(tripData?.seats || []);
      } catch (err) {
        // #region agent log
        // #endregion
        const { logError } = await import('../../utils/logger');
        logError('Fetch error in SeatSelection', err);
        setError(err.message || 'Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchData();
    } else {
      // #region agent log
      // #endregion
    }
  }, [tripId]);

  // Handle seat selection
  const handleSeatClick = (seat) => {
    if (!seat.is_available) return;

    setSelectedSeats(prev => {
      const isSelected = prev.some(s => s.id === seat.id);
      
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id);
      }
      
      if (prev.length >= passengersNeeded) {
        // Replace the first selected seat
        return [...prev.slice(1), seat];
      }
      
      return [...prev, seat];
    });
  };

  // Calculate pricing
  const basePrice = trip?.price || 0;
  const subtotal = basePrice * selectedSeats.length;
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + serviceFee;

  // Continue to passenger details
  const handleContinue = () => {
    // #region agent log
    // #endregion
    if (selectedSeats.length < passengersNeeded) {
      // #region agent log
      // #endregion
      return;
    }
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      // #region agent log
      // #endregion
      navigate('/login', { state: { returnTo: `/booking/seats/${tripId}?passengers=${passengersNeeded}` } });
      return;
    }
    
    // Check if email is verified
    if (!isEmailVerified) {
      // #region agent log
      // #endregion
      setShowEmailVerificationModal(true);
      return;
    }
    
    // Store selection in BookingContext and navigate
    try {
      const seatNumbers = selectedSeats.map(s => s.seat_number);
      // #region agent log
      // #endregion
      // Set selected seats in context (as seat numbers, matching PassengerDetails expectations)
      setContextSelectedSeats(seatNumbers);
      // Set selected route if trip data is available
      if (trip) {
        setSelectedRoute({
          id: trip.id,
          origin: trip.routes?.origin,
          destination: trip.routes?.destination,
          departure_time: trip.departure_time,
          arrival_time: trip.arrival_time,
          duration: trip.duration,
          price: trip.price,
        });
      }
      // #region agent log
      // #endregion
      // Use setTimeout to ensure context update propagates before navigation
      setTimeout(() => {
        // #region agent log
        // #endregion
        navigate('/booking/passenger-details');
      }, 0);
      // #region agent log
      // #endregion
    } catch (err) {
      // #region agent log
      // #endregion
      console.error('Error in handleContinue:', err);
    }
  };

  // Format helpers
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-BW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BW', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  // Organize seats into rows
  const organizeSeats = () => {
    if (!seats.length) return [];
    
    const rows = {};
    seats.forEach(seat => {
      const row = seat.seat_row;
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    
    // Sort each row by column
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => a.seat_column.localeCompare(b.seat_column));
    });
    
    return Object.entries(rows).sort(([a], [b]) => parseInt(a) - parseInt(b));
  };

  const seatRows = organizeSeats();

  // Get seat status
  const getSeatStatus = (seat) => {
    if (!seat.is_available) return 'unavailable';
    if (selectedSeats.some(s => s.id === seat.id)) return 'selected';
    return 'available';
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading seat map...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>Something went wrong</h2>
          <p>{error || 'Trip not found'}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <Icons.ArrowLeft />
        </button>
        <div className={styles.headerContent}>
          <h1>Select Your Seats</h1>
          <p>Choose {passengersNeeded} {passengersNeeded === 1 ? 'seat' : 'seats'}</p>
        </div>
      </header>

      <div className={styles.content}>
        {/* Trip Info */}
        <div className={styles.tripInfo}>
          <div className={styles.tripRoute}>
            <span className={styles.routeOrigin}>{trip.routes?.origin}</span>
            <span className={styles.routeArrow}>→</span>
            <span className={styles.routeDest}>{trip.routes?.destination}</span>
          </div>
          <div className={styles.tripMeta}>
            <span><Icons.Clock /> {formatTime(trip.departure_time)}</span>
            <span><Icons.MapPin /> {formatDate(trip.departure_time)}</span>
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.available}`} />
            <span>Available</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.selected}`} />
            <span>Selected</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendSeat} ${styles.unavailable}`} />
            <span>Taken</span>
          </div>
        </div>

        {/* Bus Layout */}
        <div className={styles.busContainer}>
          <div className={styles.busFront}>
            <div className={styles.driver}>
              <Icons.Steering />
              <span>Driver</span>
            </div>
            <div className={styles.door}>Door</div>
          </div>

          <div className={styles.seatMap}>
            {seatRows.map(([rowNum, rowSeats]) => (
              <div key={rowNum} className={styles.seatRow}>
                <div className={styles.rowNumber}>{rowNum}</div>
                <div className={styles.rowSeats}>
                  {/* Left side (A, B) */}
                  <div className={styles.seatGroup}>
                    {rowSeats.filter(s => ['A', 'B'].includes(s.seat_column)).map(seat => (
                      <button
                        key={seat.id}
                        className={`${styles.seat} ${styles[getSeatStatus(seat)]}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.is_available}
                      >
                        {getSeatStatus(seat) === 'selected' ? (
                          <Icons.Check />
                        ) : getSeatStatus(seat) === 'unavailable' ? (
                          <Icons.X />
                        ) : (
                          <span>{seat.seat_number}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Aisle */}
                  <div className={styles.aisle} />
                  
                  {/* Right side (C, D) */}
                  <div className={styles.seatGroup}>
                    {rowSeats.filter(s => ['C', 'D'].includes(s.seat_column)).map(seat => (
                      <button
                        key={seat.id}
                        className={`${styles.seat} ${styles[getSeatStatus(seat)]}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={!seat.is_available}
                      >
                        {getSeatStatus(seat) === 'selected' ? (
                          <Icons.Check />
                        ) : getSeatStatus(seat) === 'unavailable' ? (
                          <Icons.X />
                        ) : (
                          <span>{seat.seat_number}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.busBack}>
            <span>Back of Bus</span>
          </div>
        </div>

        {/* Selection Summary */}
        <div className={styles.summary}>
          <div className={styles.selectedSeats}>
            <span className={styles.summaryLabel}>Selected Seats:</span>
            <div className={styles.seatTags}>
              {selectedSeats.length > 0 ? (
                selectedSeats.map(seat => (
                  <span key={seat.id} className={styles.seatTag}>
                    {seat.seat_number}
                    <button onClick={() => handleSeatClick(seat)}>
                      <Icons.X />
                    </button>
                  </span>
                ))
              ) : (
                <span className={styles.noSeats}>No seats selected</span>
              )}
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>P{basePrice} × {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}</span>
                <span>P{subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Service fee</span>
                <span>P{serviceFee.toFixed(2)}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total</span>
                <span>P{total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className={styles.bottomAction}>
        <div className={styles.actionInfo}>
          <span className={styles.actionSeats}>
            {selectedSeats.length}/{passengersNeeded} seats
          </span>
          <span className={styles.actionPrice}>P{total.toFixed(2)}</span>
        </div>
        <button 
          className={styles.continueBtn}
          onClick={(e) => {
            // #region agent log
            // #endregion
            handleContinue();
          }}
          disabled={selectedSeats.length < passengersNeeded}
        >
          Continue
        </button>
      </div>

      {/* Email Verification Modal */}
      <Modal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        title="Email Verification Required"
      >
        <div style={{ padding: '1rem' }}>
          <p>Please verify your email address before making a booking.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            A verification email has been sent to {user?.email}. Please check your inbox and click the verification link.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowEmailVerificationModal(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowEmailVerificationModal(false);
                navigate('/profile');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: 'none',
                borderRadius: '8px',
                background: '#F5A623',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              Go to Profile
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
