import React, { useEffect, useRef } from 'react';
import styles from './QRCodeDisplay.module.css';

// Simple QR code generation using a library would be better in production
// For now, we'll create a placeholder
const QRCodeDisplay = ({ bookingId, route, seats }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // In production, use a QR code library like qrcode.js
    // For now, just display booking info
  }, [bookingId, route, seats]);

  const qrData = JSON.stringify({
    bookingId,
    route: `${route?.origin}-${route?.destination}`,
    date: route?.date,
    seats,
  });

  return (
    <div className={styles.qrCodeContainer}>
      <h3 className={styles.qrTitle}>Your E-Ticket</h3>
      <div className={styles.qrCode}>
        {/* Placeholder - in production, use qrcode.js or similar */}
        <div className={styles.qrPlaceholder}>
          <div className={styles.qrGrid}>
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={styles.qrCell}
                style={{
                  backgroundColor: Math.random() > 0.5 ? '#000' : '#fff',
                }}
              />
            ))}
          </div>
        </div>
        <p className={styles.qrData}>{qrData}</p>
      </div>
      <p className={styles.qrInstructions}>
        Show this QR code at the bus terminal for boarding
      </p>
    </div>
  );
};

export default QRCodeDisplay;
