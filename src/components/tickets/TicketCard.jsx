import React from 'react';
import styles from './TicketCard.module.css';

const TicketCard = ({ booking, onClick }) => {
  const schedule = booking.schedule || {};
  const route = schedule.route || {};
  const bus = schedule.bus || {};
  const company = bus.company || {};

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div className={styles.ticketCard} onClick={onClick}>
      <div className={styles.ticketHeader}>
        <div className={styles.companyInfo}>
          <span className={styles.companyLogo}>{company.logo || '🚌'}</span>
          <span className={styles.companyName}>{company.name || 'Bus Company'}</span>
        </div>
        <div className={`${styles.statusBadge} ${styles[booking.status]}`}>
          {booking.status || 'confirmed'}
        </div>
      </div>

      <div className={styles.ticketRoute}>
        <div className={styles.routePoint}>
          <span className={styles.city}>{route.origin || 'Origin'}</span>
          <span className={styles.time}>
            {formatTime(schedule.departure_time)}
          </span>
        </div>
        <div className={styles.routeLine}>
          <span className={styles.arrow}>→</span>
          <span className={styles.duration}>{schedule.duration || 'N/A'}</span>
        </div>
        <div className={styles.routePoint}>
          <span className={styles.city}>{route.destination || 'Destination'}</span>
          <span className={styles.time}>
            {formatTime(schedule.arrival_time)}
          </span>
        </div>
      </div>

      <div className={styles.ticketFooter}>
        <div className={styles.ticketDate}>
          <span className={styles.dateLabel}>Date</span>
          <span className={styles.dateValue}>
            {formatDate(schedule.departure_time || booking.created_at)}
          </span>
        </div>
        <div className={styles.ticketPrice}>
          <span className={styles.priceLabel}>Total</span>
          <span className={styles.priceValue}>P{booking.total_price?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
