import React from 'react';
import Button from '../common/Button';
import styles from './BusCard.module.css';

const BusCard = ({ bus, onSelect }) => {
  const amenityIcons = {
    wifi: '📶',
    ac: '❄️',
    charging: '🔌',
    entertainment: '📺',
  };

  return (
    <div className={styles.busCard}>
      <div className={styles.busHeader}>
        <div className={styles.busCompany}>
          <span className={styles.companyLogo}>{bus.company?.logo || '🚌'}</span>
          <span className={styles.companyName}>{bus.company?.name || 'Bus Company'}</span>
        </div>
        <div className={styles.busType}>{bus.bus_type || 'Standard'}</div>
      </div>

      <div className={styles.busDetails}>
        <div className={styles.timeSection}>
          <div className={styles.time}>
            <span className={styles.timeValue}>{bus.departure_time}</span>
            <span className={styles.timeLabel}>Departure</span>
          </div>
          <div className={styles.duration}>
            <span className={styles.durationValue}>{bus.duration}</span>
            <span className={styles.durationLabel}>Duration</span>
          </div>
          <div className={styles.time}>
            <span className={styles.timeValue}>{bus.arrival_time}</span>
            <span className={styles.timeLabel}>Arrival</span>
          </div>
        </div>

        {bus.amenities && bus.amenities.length > 0 && (
          <div className={styles.amenities}>
            {bus.amenities.map((amenity, index) => (
              <span key={index} className={styles.amenity}>
                {amenityIcons[amenity.toLowerCase()] || '✨'} {amenity}
              </span>
            ))}
          </div>
        )}

        <div className={styles.busFooter}>
          <div className={styles.seatsInfo}>
            <span className={styles.seatsAvailable}>
              {bus.available_seats} seat{bus.available_seats !== 1 ? 's' : ''} available
            </span>
          </div>
          <div className={styles.priceSection}>
            <span className={styles.price}>P{bus.price.toFixed(2)}</span>
            <Button onClick={onSelect} size="small">
              Select
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
