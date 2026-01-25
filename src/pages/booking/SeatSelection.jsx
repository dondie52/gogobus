import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import SeatMap from '../../components/booking/SeatMap';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './SeatSelection.module.css';

const SeatSelection = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedRoute, selectedSeats, setSelectedSeats } = useBooking();
  const [loading, setLoading] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  
  const initialPassengers = parseInt(searchParams.get('passengers') || '1');
  const [passengersNeeded, setPassengersNeeded] = useState(initialPassengers);

  useEffect(() => {
    // Simulate loading seat availability
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedRoute) {
      // Redirect to home if no route selected (not /search which requires params)
      navigate('/home');
    }
  }, [selectedRoute, navigate]);

  // Update URL when passenger count changes
  useEffect(() => {
    const currentPassengers = searchParams.get('passengers');
    if (currentPassengers !== passengersNeeded.toString()) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('passengers', passengersNeeded.toString());
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [passengersNeeded, searchParams, setSearchParams]);

  // Remove excess seats if passenger count is reduced
  useEffect(() => {
    if (selectedSeats.length > passengersNeeded) {
      setSelectedSeats((prev) => prev.slice(0, passengersNeeded));
    }
  }, [passengersNeeded, selectedSeats.length, setSelectedSeats]);

  const handlePassengerChange = (newCount) => {
    if (newCount >= 1 && newCount <= 10) {
      setPassengersNeeded(newCount);
    }
  };

  const handleSeatToggle = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      } else {
        if (prev.length >= passengersNeeded) {
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    navigate('/booking/passenger-details');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-BW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-BW', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <div className={styles.seatSelectionPage}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!selectedRoute) {
    return null;
  }

  const totalPrice = selectedSeats.length * (selectedRoute.price || 0);

  return (
    <div className={styles.seatSelectionPage}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          type="button"
          className={styles.backBtn} 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Select Your Seats</h1>
          <p className={styles.subtitle}>
            {selectedSeats.length === 0
              ? `Select ${passengersNeeded} seat${passengersNeeded > 1 ? 's' : ''} for ${passengersNeeded} passenger${passengersNeeded > 1 ? 's' : ''}`
              : passengersNeeded - selectedSeats.length > 0 
                ? `${selectedSeats.length} of ${passengersNeeded} seats selected`
                : 'All seats selected'
            }
          </p>
        </div>
      </header>

      {/* Route Info Card */}
      <div className={styles.routeCard}>
        <div className={styles.routeInfo}>
          <span className={styles.origin}>{selectedRoute.origin}</span>
          <div className={styles.arrow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <span className={styles.destination}>{selectedRoute.destination}</span>
        </div>
        <div className={styles.tripMeta}>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(selectedRoute.date)}</span>
          </div>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{formatTime(selectedRoute.departure_time)}</span>
          </div>
        </div>
        
        {/* Passenger Selector */}
        <div className={styles.passengerSelector}>
          <label className={styles.passengerLabel}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Number of Passengers</span>
          </label>
          <div className={styles.passengerControls}>
            <button
              type="button"
              className={styles.passengerBtn}
              onClick={() => handlePassengerChange(passengersNeeded - 1)}
              disabled={passengersNeeded <= 1}
              aria-label="Decrease passengers"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <input
              type="number"
              min="1"
              max="10"
              value={passengersNeeded}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                handlePassengerChange(Math.max(1, Math.min(10, value)));
              }}
              className={styles.passengerInput}
              aria-label="Number of passengers"
            />
            <button
              type="button"
              className={styles.passengerBtn}
              onClick={() => handlePassengerChange(passengersNeeded + 1)}
              disabled={passengersNeeded >= 10}
              aria-label="Increase passengers"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.available}`}></div>
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.selected}`}></div>
          <span>Selected</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.taken}`}></div>
          <span>Taken</span>
        </div>
      </div>

      {/* Seat Map */}
      <main className={styles.mainContent}>
        <SeatMap
          selectedSeats={selectedSeats}
          occupiedSeats={occupiedSeats}
          onSeatToggle={handleSeatToggle}
          maxSelectable={passengersNeeded}
          pricePerSeat={selectedRoute.price || 0}
          currency="BWP"
          config={{
            rows: 10,
            seatsPerRow: 4,
            aisleAfter: 2,
            emergencyExitRows: [3, 7],
            hasBackRow: true,
            backRowSeats: 5,
          }}
        />
      </main>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.priceInfo}>
          <span className={styles.seatCount}>
            {selectedSeats.length === 0 
              ? 'No seats selected'
              : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} × BWP ${(selectedRoute.price || 0).toLocaleString()}`
            }
          </span>
          <span className={styles.totalPrice}>
            {selectedSeats.length === 0 
              ? 'BWP 0'
              : `BWP ${totalPrice.toLocaleString()}`
            }
          </span>
        </div>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={handleContinue}
          disabled={selectedSeats.length === 0}
        >
          Continue
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;
