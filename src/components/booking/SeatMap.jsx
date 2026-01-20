import React from 'react';
import Seat from './Seat';
import styles from './SeatMap.module.css';

// Standard bus layout: 2-2 seating (4 seats per row)
const ROWS = 15;
const SEATS_PER_ROW = 4;
const AISLE_POSITION = 2; // Aisle after 2nd seat

const SeatMap = ({ availableSeats, selectedSeats, onSeatToggle }) => {
  // Generate seat layout
  const generateSeats = () => {
    const seats = [];
    let seatNumber = 1;

    for (let row = 1; row <= ROWS; row++) {
      const rowSeats = [];
      for (let col = 1; col <= SEATS_PER_ROW; col++) {
        const seatId = `${row}${String.fromCharCode(64 + col)}`; // 1A, 1B, 1C, 1D
        const isOccupied = Math.random() > (availableSeats / (ROWS * SEATS_PER_ROW)); // Simplified logic
        const isSelected = selectedSeats.includes(seatId);

        rowSeats.push(
          <Seat
            key={seatId}
            seatNumber={seatId}
            isOccupied={isOccupied}
            isSelected={isSelected}
            onToggle={() => !isOccupied && onSeatToggle(seatId)}
          />
        );
        seatNumber++;
      }
      seats.push(
        <div key={row} className={styles.seatRow}>
          <span className={styles.rowNumber}>{row}</span>
          {rowSeats.slice(0, AISLE_POSITION)}
          <div className={styles.aisle}></div>
          {rowSeats.slice(AISLE_POSITION)}
        </div>
      );
    }
    return seats;
  };

  return (
    <div className={styles.seatMap}>
      <div className={styles.driverSection}>
        <div className={styles.driverIcon}>🚌</div>
        <span>Driver</span>
      </div>
      <div className={styles.seatsContainer}>{generateSeats()}</div>
    </div>
  );
};

export default SeatMap;
