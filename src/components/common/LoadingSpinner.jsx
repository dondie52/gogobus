import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={spinnerClasses} role="status" aria-label="Loading">
      <div className={styles.spinnerCircle}></div>
    </div>
  );
};

export default LoadingSpinner;
