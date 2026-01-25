import React, { useState, useCallback } from 'react';
import SeatMap from './SeatMap';
import styles from './SeatSelectionPage.module.css';

/**
 * SeatSelectionPage - Complete bus seat booking interface
 * 
 * Features:
 * - Route information display
 * - Interactive seat map
 * - Real-time price calculation
 * - Mobile-responsive design
 * - Dark mode support
 * - Accessibility compliant
 */

const SeatSelectionPage = ({
  route = {
    origin: 'Gaborone',
    destination: 'Francistown',
    date: 'Mon, 27 Jan',
    time: '06:00',
    duration: '5h 30m',
    busType: 'Luxury Coach',
  },
  pricePerSeat = 250,
  currency = 'BWP',
  maxSeats = 4,
  occupiedSeats = ['1A', '2C', '3B', '4D', '5A', '5B', '7C', '8A', '8D', '10C'],
  onBack,
  onContinue,
}) => {
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeatToggle = useCallback((seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId);
      }
      if (prev.length >= maxSeats) {
        return prev;
      }
      return [...prev, seatId].sort((a, b) => {
        const rowA = parseInt(a);
        const rowB = parseInt(b);
        if (rowA !== rowB) return rowA - rowB;
        return a.localeCompare(b);
      });
    });
  }, [maxSeats]);

  const handleContinue = useCallback(async () => {
    if (selectedSeats.length === 0) return;
    
    setIsLoading(true);
    try {
      await onContinue?.({ seats: selectedSeats, total: selectedSeats.length * pricePerSeat });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSeats, pricePerSeat, onContinue]);

  const totalPrice = selectedSeats.length * pricePerSeat;

  return (
    <div className={styles.seatSelectionPage}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          type="button" 
          className={styles.backBtn}
          onClick={onBack}
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
            {maxSeats - selectedSeats.length > 0 
              ? `You can select up to ${maxSeats} seats`
              : 'Maximum seats selected'
            }
          </p>
        </div>
      </header>

      {/* Route Information Card */}
      <div className={styles.routeCard}>
        <div className={styles.routeInfo}>
          <span className={styles.origin}>{route.origin}</span>
          <div className={styles.arrow}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
          <span className={styles.destination}>{route.destination}</span>
        </div>
        <div className={styles.tripMeta}>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{route.date}</span>
          </div>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{route.time} • {route.duration}</span>
          </div>
          <div className={styles.metaItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6v6" />
              <path d="M16 6v6" />
              <path d="M2 12h20" />
              <path d="M4 18h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2z" />
            </svg>
            <span>{route.busType}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.available}`} />
          <span>Available</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.selected}`} />
          <span>Selected</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.taken}`} />
          <span>Taken</span>
        </div>
      </div>

      {/* Seat Map */}
      <main className={styles.mainContent}>
        <SeatMap
          selectedSeats={selectedSeats}
          occupiedSeats={occupiedSeats}
          onSeatToggle={handleSeatToggle}
          maxSelectable={maxSeats}
          pricePerSeat={pricePerSeat}
          currency={currency}
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

      {/* Footer with Price and Continue */}
      <footer className={styles.footer}>
        <div className={styles.priceInfo}>
          <span className={styles.seatCount}>
            {selectedSeats.length === 0 
              ? 'No seats selected'
              : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} × ${currency} ${pricePerSeat}`
            }
          </span>
          <span className={styles.totalPrice}>
            {currency} {totalPrice.toLocaleString()}
          </span>
        </div>
        <button
          type="button"
          className={styles.continueBtn}
          onClick={handleContinue}
          disabled={selectedSeats.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} />
              Processing...
            </>
          ) : (
            <>
              Continue
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default SeatSelectionPage;
