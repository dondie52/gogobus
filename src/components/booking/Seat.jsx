import React from 'react';
import styles from './Seat.module.css';

const Seat = ({ seatNumber, isOccupied, isSelected, onToggle }) => {
  const seatClass = [
    styles.seat,
    isOccupied && styles.occupied,
    isSelected && styles.selected,
    !isOccupied && !isSelected && styles.available,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={seatClass}
      onClick={onToggle}
      disabled={isOccupied}
      aria-label={`Seat ${seatNumber}${isOccupied ? ' (occupied)' : isSelected ? ' (selected)' : ' (available)'}`}
    >
      {seatNumber}
    </button>
  );
};

export default Seat;
