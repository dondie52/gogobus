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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:15',message:'Component mounted/updated',data:{currentPath:location.pathname,hasRoute:!!selectedRoute,seatsCount:selectedSeats?.length,passengersCount:passengerDetails?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  }, [location.pathname, selectedRoute, selectedSeats, passengerDetails]);
  // #endregion

  const handleContinue = () => {
    console.log('Continue to Payment clicked', {
      selectedRoute,
      selectedSeats,
      passengerDetails
    });
    navigate('/booking/payment');
  };

  if (!selectedRoute || !selectedSeats || selectedSeats.length === 0) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:24',message:'Redirecting: missing route/seats',data:{hasRoute:!!selectedRoute,seatsCount:selectedSeats?.length,redirectTo:'/booking/seat-selection'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    navigate('/booking/seat-selection');
    return null;
  }

  // Redirect if passenger details are missing
  if (!passengerDetails || passengerDetails.length === 0 || passengerDetails.length !== selectedSeats.length) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:31',message:'Redirecting: missing passenger details',data:{passengersCount:passengerDetails?.length,seatsCount:selectedSeats?.length,redirectTo:'/booking/passenger-details'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    navigate('/booking/passenger-details');
    return null;
  }

  const totalPrice = selectedRoute.price * selectedSeats.length;

  return (
    <div className={styles.bookingScreen}>
      <div className={styles.bookingHeader}>
        <button className={styles.backButton} onClick={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:40',message:'Back button clicked',data:{currentPath:location.pathname,eventType:e?.type,defaultPrevented:e?.defaultPrevented},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          try {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:44',message:'Before navigate call',data:{targetPath:'/home',currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            navigate('/home');
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:47',message:'After navigate call',data:{targetPath:'/home'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingSummary.jsx:50',message:'Error in navigate',data:{errorMessage:err?.message,errorStack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
            // #endregion
            console.error('Navigation error:', err);
          }
        }}>
          ← Back
        </button>
        <h1>Booking Summary</h1>
      </div>

      <div className={styles.bookingContent}>
        <div className={styles.summarySection}>
          <h2>Trip Details</h2>
          <div className={styles.tripInfo}>
            <div className={styles.routeInfo}>
              <span className={styles.route}>{selectedRoute.origin} → {selectedRoute.destination}</span>
              <span className={styles.time}>
                {selectedRoute.departure_time} - {selectedRoute.arrival_time}
              </span>
              <span className={styles.duration}>{selectedRoute.duration}</span>
            </div>
          </div>
        </div>

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

        <div className={styles.summarySection}>
          <h2>Passengers</h2>
          <div className={styles.passengersList}>
            {passengerDetails.map((passenger, index) => (
              <div key={index} className={styles.passengerItem}>
                <span className={styles.passengerName}>{passenger?.fullName || 'N/A'}</span>
                <span className={styles.passengerSeat}>Seat {passenger?.seatNumber || selectedSeats[index] || 'N/A'}</span>
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
