import React, { useMemo, useCallback } from 'react';
import Seat from './Seat';
import styles from './SeatMap.module.css';

/**
 * SeatMap Component - Interactive bus seat selection
 * 
 * Features:
 * - Configurable bus layout (rows, seats per row)
 * - Accessible keyboard navigation
 * - Visual feedback for seat states
 * - Responsive design with mobile support
 */

const DEFAULT_CONFIG = {
  rows: 10,
  seatsPerRow: 4,
  aisleAfter: 2,
  emergencyExitRows: [3, 7],
  hasBackRow: true,
  backRowSeats: 5,
};

const SeatMap = ({
  config = DEFAULT_CONFIG,
  selectedSeats = [],
  occupiedSeats = [],
  onSeatToggle,
  maxSelectable = 4,
  pricePerSeat = 0,
  currency = 'BWP',
}) => {
  const {
    rows,
    seatsPerRow,
    aisleAfter,
    emergencyExitRows,
    hasBackRow,
    backRowSeats,
  } = { ...DEFAULT_CONFIG, ...config };

  // Generate seat layout with memoization
  const seatLayout = useMemo(() => {
    const layout = [];

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      const seatsInThisRow = (hasBackRow && row === rows) ? backRowSeats : seatsPerRow;

      for (let col = 1; col <= seatsInThisRow; col++) {
        const seatId = `${row}${String.fromCharCode(64 + col)}`;
        rowSeats.push({
          id: seatId,
          row,
          col,
          isOccupied: occupiedSeats.includes(seatId),
          isSelected: selectedSeats.includes(seatId),
          isEmergencyRow: emergencyExitRows.includes(row),
        });
      }

      layout.push({
        rowNumber: row,
        seats: rowSeats,
        isEmergencyRow: emergencyExitRows.includes(row),
        isBackRow: hasBackRow && row === rows,
      });
    }

    return layout;
  }, [rows, seatsPerRow, hasBackRow, backRowSeats, occupiedSeats, selectedSeats, emergencyExitRows]);

  // Handle seat selection with max limit
  const handleSeatToggle = useCallback((seatId) => {
    if (occupiedSeats.includes(seatId)) return;
    
    const isCurrentlySelected = selectedSeats.includes(seatId);
    
    if (!isCurrentlySelected && selectedSeats.length >= maxSelectable) {
      // Optionally show a toast/notification here
      return;
    }

    onSeatToggle?.(seatId);
  }, [occupiedSeats, selectedSeats, maxSelectable, onSeatToggle]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e, seatId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSeatToggle(seatId);
    }
  }, [handleSeatToggle]);

  return (
    <div className={styles.seatMapWrapper}>
      {/* Bus Frame */}
      <div className={styles.busFrame}>
        {/* Bus Front */}
        <div className={styles.busFront}>
          <div className={styles.frontWindow}>
            <div className={styles.windowGlare} />
          </div>
          <div className={styles.frontDetails}>
            <div className={styles.driverArea}>
              <div className={styles.steeringWheel}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
                </svg>
              </div>
              <span className={styles.driverLabel}>Driver</span>
            </div>
            <div className={styles.doorIndicator}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="2" width="18" height="20" rx="2" />
                <path d="M12 2v20" />
                <circle cx="15" cy="12" r="1" fill="currentColor" />
              </svg>
              <span>Entry</span>
            </div>
          </div>
        </div>

        {/* Seat Grid */}
        <div className={styles.seatGrid} role="group" aria-label="Bus seat selection">
          {seatLayout.map(({ rowNumber, seats, isEmergencyRow, isBackRow }) => (
            <React.Fragment key={rowNumber}>
              {/* Emergency Exit Marker - Before Row */}
              {isEmergencyRow && (
                <div className={styles.emergencyMarker}>
                  <div className={styles.emergencyLine} />
                  <div className={styles.emergencyBadge}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Emergency Exit</span>
                  </div>
                  <div className={styles.emergencyLine} />
                </div>
              )}

              {/* Seat Row */}
              <div 
                className={`${styles.seatRow} ${isBackRow ? styles.backRow : ''}`}
                role="row"
                aria-label={`Row ${rowNumber}`}
              >
                <span className={styles.rowLabel}>{rowNumber}</span>
                
                <div className={styles.leftSection}>
                  {seats.slice(0, isBackRow ? Math.ceil(backRowSeats / 2) : aisleAfter).map((seat) => (
                    <Seat
                      key={seat.id}
                      seatId={seat.id}
                      isOccupied={seat.isOccupied}
                      isSelected={seat.isSelected}
                      isEmergencyRow={seat.isEmergencyRow}
                      onSelect={() => handleSeatToggle(seat.id)}
                      onKeyDown={(e) => handleKeyDown(e, seat.id)}
                      disabled={seat.isOccupied || (!seat.isSelected && selectedSeats.length >= maxSelectable)}
                    />
                  ))}
                </div>

                {!isBackRow && <div className={styles.aisle} aria-hidden="true" />}

                <div className={styles.rightSection}>
                  {seats.slice(isBackRow ? Math.ceil(backRowSeats / 2) : aisleAfter).map((seat) => (
                    <Seat
                      key={seat.id}
                      seatId={seat.id}
                      isOccupied={seat.isOccupied}
                      isSelected={seat.isSelected}
                      isEmergencyRow={seat.isEmergencyRow}
                      onSelect={() => handleSeatToggle(seat.id)}
                      onKeyDown={(e) => handleKeyDown(e, seat.id)}
                      disabled={seat.isOccupied || (!seat.isSelected && selectedSeats.length >= maxSelectable)}
                    />
                  ))}
                </div>

                <span className={styles.rowLabel}>{rowNumber}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Bus Rear */}
        <div className={styles.busRear}>
          <div className={styles.rearWindow} />
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className={styles.selectionSummary}>
          <div className={styles.selectedSeatsChips}>
            {selectedSeats.map((seatId) => (
              <span key={seatId} className={styles.seatChip}>
                {seatId}
                <button
                  type="button"
                  className={styles.removeSeat}
                  onClick={() => handleSeatToggle(seatId)}
                  aria-label={`Remove seat ${seatId}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className={styles.summaryTotal}>
            <span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}</span>
            <span className={styles.totalPrice}>
              {currency} {(selectedSeats.length * pricePerSeat).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;
