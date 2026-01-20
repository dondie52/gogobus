import React from 'react';
import styles from './PriceBreakdown.module.css';

const PriceBreakdown = ({ basePrice, seatCount, totalPrice }) => {
  return (
    <div className={styles.priceBreakdown}>
      <h2>Price Breakdown</h2>
      <div className={styles.priceRow}>
        <span>Base Price (per seat)</span>
        <span>P{basePrice.toFixed(2)}</span>
      </div>
      <div className={styles.priceRow}>
        <span>Seats ({seatCount})</span>
        <span>× {seatCount}</span>
      </div>
      <div className={styles.priceRow}>
        <span>Service Fee</span>
        <span>P0.00</span>
      </div>
      <div className={styles.divider}></div>
      <div className={`${styles.priceRow} ${styles.total}`}>
        <span>Total</span>
        <span>P{totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default PriceBreakdown;
