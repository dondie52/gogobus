import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import Button from '../../components/common/Button';
import PriceBreakdown from '../../components/booking/PriceBreakdown';
import styles from './Booking.module.css';

const BookingSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedRoute, selectedSeats, passengerDetails } = useBooking();
  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:11',message:'BookingSummary render - context data check',data:{hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  }, [selectedRoute, selectedSeats, passengerDetails, location.pathname]);
  // #endregion

  const handleContinue = () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:13',message:'handleContinue called',data:{hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log('Continue to Payment clicked', {
      selectedRoute,
      selectedSeats,
      passengerDetails
    });
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:19',message:'About to navigate to /booking/payment',data:{targetPath:'/booking/payment',currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    navigate('/booking/payment');
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:20',message:'navigate call completed',data:{targetPath:'/booking/payment'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
  };

  if (!selectedRoute || !selectedSeats || selectedSeats.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:22',message:'Redirecting due to missing route/seats',data:{hasSelectedRoute:!!selectedRoute,selectedSeatsCount:selectedSeats?.length,redirectTarget:'/booking/seat-selection'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    navigate('/booking/seat-selection');
    return null;
  }

  if (!passengerDetails || passengerDetails.length === 0 || passengerDetails.length !== selectedSeats.length) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:27',message:'Redirecting due to missing passenger details',data:{passengerDetailsCount:passengerDetails?.length,selectedSeatsCount:selectedSeats?.length,redirectTarget:'/booking/passenger-details'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    navigate('/booking/passenger-details');
    return null;
  }

  const totalPrice = selectedRoute.price * selectedSeats.length;

  // Handle back navigation to seat selection
  const handleBack = () => {
    if (selectedRoute?.id) {
      const passengerCount = selectedSeats.length || passengerDetails.length || 1;
      navigate(`/booking/seats/${selectedRoute.id}?passengers=${passengerCount}`);
    } else {
      // Fallback to browser back or home
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/home');
      }
    }
  };

  // Format time for display (from ISO string to readable time)
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-BW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      // If it's already a formatted time string, return as is
      return timeString;
    }
  };

  // Format date and time together for display
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    try {
      const date = new Date(dateTimeString);
      const dateStr = date.toLocaleDateString('en-BW', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-BW', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} • ${timeStr}`;
    } catch (error) {
      return dateTimeString;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-BW', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={styles.bookingScreen}>
      <div className={styles.bookingHeader}>
        <button 
          className={styles.backButton} 
          onClick={handleBack}
        >
          ← Back
        </button>
        <h1>Booking Summary</h1>
      </div>

      <div className={styles.bookingContent}>
        {/* Enhanced Trip Details Section */}
        <div className={styles.summarySection}>
          <h2>Trip Details</h2>
          
          <div className={styles.tripCard}>
            {/* Route Visual Timeline */}
            <div className={styles.routeTimeline}>
              {/* Departure */}
              <div className={styles.timelinePoint}>
                <div className={styles.timelineDot}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="6" cy="6" r="6" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timeLabel}>{formatDateTime(selectedRoute.departure_time)}</span>
                  <span className={styles.locationName}>{selectedRoute.origin}</span>
                  {selectedRoute.origin_station && (
                    <span className={styles.stationName}>{selectedRoute.origin_station}</span>
                  )}
                </div>
              </div>

              {/* Duration Line */}
              <div className={styles.timelineLine}>
                <div className={styles.durationBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  <span>{selectedRoute.duration}</span>
                </div>
              </div>

              {/* Arrival */}
              <div className={styles.timelinePoint}>
                <div className={`${styles.timelineDot} ${styles.destination}`}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="6" cy="6" r="6" />
                  </svg>
                </div>
                <div className={styles.timelineContent}>
                  <span className={styles.timeLabel}>{formatDateTime(selectedRoute.arrival_time)}</span>
                  <span className={styles.locationName}>{selectedRoute.destination}</span>
                  {selectedRoute.destination_station && (
                    <span className={styles.stationName}>{selectedRoute.destination_station}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Meta Info */}
            <div className={styles.tripMeta}>
              <div className={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Date</span>
                  <span className={styles.metaValue}>{formatDate(selectedRoute.date)}</span>
                </div>
              </div>

              <div className={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6v6l4 2" />
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" />
                </svg>
                <div className={styles.metaContent}>
                  <span className={styles.metaLabel}>Duration</span>
                  <span className={styles.metaValue}>{selectedRoute.duration}</span>
                </div>
              </div>

              {selectedRoute.bus_type && (
                <div className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6v6l4 2" />
                    <rect x="3" y="3" width="18" height="14" rx="2" />
                    <path d="M5 17v2" />
                    <path d="M19 17v2" />
                    <circle cx="7" cy="14" r="1.5" />
                    <circle cx="17" cy="14" r="1.5" />
                  </svg>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Bus Type</span>
                    <span className={styles.metaValue}>{selectedRoute.bus_type}</span>
                  </div>
                </div>
              )}

              {selectedRoute.operator && (
                <div className={styles.metaItem}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Operator</span>
                    <span className={styles.metaValue}>{selectedRoute.operator}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Amenities (if available) */}
            {selectedRoute.amenities && selectedRoute.amenities.length > 0 && (
              <div className={styles.amenities}>
                <span className={styles.amenitiesLabel}>Amenities:</span>
                <div className={styles.amenitiesList}>
                  {selectedRoute.amenities.map((amenity, index) => (
                    <span key={index} className={styles.amenityBadge}>
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Seats Section */}
        <div className={styles.summarySection}>
          <h2>Selected Seats</h2>
          <div className={styles.seatsList}>
            {selectedSeats.map((seat) => (
              <span key={seat} className={styles.seatBadge}>
                {seat}
              </span>
            ))}
          </div>
        </div>

        {/* Passengers Section */}
        <div className={styles.summarySection}>
          <h2>Passengers</h2>
          <div className={styles.passengersList}>
            {passengerDetails.map((passenger, index) => (
              <div key={index} className={styles.passengerItem}>
                <div className={styles.passengerAvatar}>
                  {(passenger?.fullName || 'U')[0].toUpperCase()}
                </div>
                <div className={styles.passengerInfo}>
                  <span className={styles.passengerName}>
                    {passenger?.fullName || 'N/A'}
                  </span>
                  {passenger?.idNumber && (
                    <span className={styles.passengerId}>
                      ID: {passenger.idNumber}
                    </span>
                  )}
                </div>
                <span className={styles.passengerSeat}>
                  Seat {passenger?.seatNumber || selectedSeats[index] || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PriceBreakdown
          basePrice={selectedRoute.price}
          seatCount={selectedSeats.length}
          totalPrice={totalPrice}
        />

        <div className={styles.bookingFooter}>
          <Button onClick={handleContinue}>Continue to Payment</Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
