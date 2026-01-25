import React, { memo } from 'react';
import styles from './Seat.module.css';

/**
 * Seat Component - Individual seat button
 * 
 * Props:
 * - seatId: Unique identifier (e.g., "1A", "3C")
 * - isOccupied: Seat is taken/unavailable
 * - isSelected: Seat is currently selected by user
 * - isEmergencyRow: Seat is in emergency exit row
 * - onSelect: Click handler
 * - onKeyDown: Keyboard handler for accessibility
 * - disabled: Prevent interaction
 */

const Seat = memo(({
  seatId,
  isOccupied = false,
  isSelected = false,
  isEmergencyRow = false,
  onSelect,
  onKeyDown,
  disabled = false,
}) => {
  const getAriaLabel = () => {
    const baseLabel = `Seat ${seatId}`;
    if (isOccupied) return `${baseLabel}, unavailable`;
    if (isSelected) return `${baseLabel}, selected`;
    if (isEmergencyRow) return `${baseLabel}, emergency exit row`;
    return `${baseLabel}, available`;
  };

  const classNames = [
    styles.seat,
    isOccupied && styles.occupied,
    isSelected && styles.selected,
    isEmergencyRow && styles.emergencyRow,
    disabled && !isOccupied && styles.maxReached,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classNames}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      disabled={isOccupied}
      aria-label={getAriaLabel()}
      aria-pressed={isSelected}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={isOccupied ? -1 : 0}
    >
      <span className={styles.seatBack} aria-hidden="true" />
      <span className={styles.seatCushion} aria-hidden="true">
        {isOccupied ? (
          <svg className={styles.occupiedIcon} viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="8" r="4" />
            <path d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" />
          </svg>
        ) : (
          <span className={styles.seatLabel}>{seatId}</span>
        )}
      </span>
      {isSelected && (
        <span className={styles.checkmark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </span>
      )}
    </button>
  );
});

Seat.displayName = 'Seat';

export default Seat;
