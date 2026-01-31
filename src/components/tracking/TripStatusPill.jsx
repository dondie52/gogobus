/**
 * TripStatusPill - Displays the current trip status as a colored pill
 */

import React from 'react';
import styles from './TripStatusPill.module.css';

const STATUS_CONFIG = {
  on_time: {
    label: 'On Time',
    className: 'onTime',
  },
  delayed: {
    label: 'Delayed',
    className: 'delayed',
  },
  boarding: {
    label: 'Boarding',
    className: 'boarding',
  },
  departed: {
    label: 'Departed',
    className: 'departed',
  },
  arriving: {
    label: 'Arriving',
    className: 'arriving',
  },
};

export default function TripStatusPill({ status, size = 'medium' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'unknown',
  };

  return (
    <span
      className={`${styles.pill} ${styles[config.className]} ${styles[size]}`}
      role="status"
      aria-label={`Trip status: ${config.label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      {config.label}
    </span>
  );
}
