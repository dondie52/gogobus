import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';
import { logError } from '../../utils/logger';
import styles from './QRScanner.module.css';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Scan: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  Camera: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
    </svg>
  ),
  Keyboard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Ticket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  ),
  Bus: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function QRScanner() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('camera'); // 'camera' or 'manual'
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { booking, status: 'valid' | 'invalid' | 'already_boarded' | 'unpaid' }
  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stats, setStats] = useState({ scanned: 0, boarded: 0 });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      logError('Camera error', err);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Handle mode change
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // Search for booking
  const handleSearch = async (ref = reference) => {
    if (!ref.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: booking, error } = await adminService.getBookingByReference(ref.trim());

      setStats(prev => ({ ...prev, scanned: prev.scanned + 1 }));

      if (error || !booking) {
        setResult({ booking: null, status: 'invalid' });
      } else if (booking.is_boarded) {
        setResult({ booking, status: 'already_boarded' });
      } else if (booking.payment_status !== 'paid') {
        setResult({ booking, status: 'unpaid' });
      } else {
        setResult({ booking, status: 'valid' });
      }
    } catch (err) {
      logError('Search error', err);
      setResult({ booking: null, status: 'invalid' });
    } finally {
      setLoading(false);
    }
  };

  // Mark as boarded
  const handleBoard = async () => {
    if (!result?.booking) return;

    setLoading(true);
    try {
      const { error } = await adminService.markAsBoarded(result.booking.id);
      
      if (!error) {
        setStats(prev => ({ ...prev, boarded: prev.boarded + 1 }));
        setResult({
          booking: { ...result.booking, is_boarded: true, boarded_at: new Date().toISOString() },
          status: 'boarded_success'
        });
      }
    } catch (err) {
      logError('Boarding error', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset scanner
  const handleReset = () => {
    setResult(null);
    setReference('');
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-BW', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render result card
  const renderResult = () => {
    if (!result) return null;

    const { booking, status } = result;

    const statusConfig = {
      valid: {
        class: 'success',
        icon: <Icons.CheckCircle />,
        title: 'Valid Ticket',
        subtitle: 'Ready to board'
      },
      invalid: {
        class: 'error',
        icon: <Icons.XCircle />,
        title: 'Not Found',
        subtitle: 'This booking reference is invalid'
      },
      already_boarded: {
        class: 'alreadyBoarded',
        icon: <Icons.AlertTriangle style={{ width: 64, height: 64 }} />,
        title: 'Already Boarded',
        subtitle: `Boarded at ${booking?.boarded_at ? formatDate(booking.boarded_at) : 'N/A'}`
      },
      unpaid: {
        class: 'warning',
        icon: <Icons.AlertTriangle style={{ width: 64, height: 64 }} />,
        title: 'Payment Pending',
        subtitle: 'Ticket has not been paid for'
      },
      boarded_success: {
        class: 'success',
        icon: <Icons.CheckCircle />,
        title: 'Boarded!',
        subtitle: 'Passenger successfully checked in'
      }
    };

    const config = statusConfig[status];

    return (
      <div className={styles.resultContainer}>
        <div className={styles.resultCard}>
          <div className={`${styles.resultStatus} ${styles[config.class]}`}>
            <div className={styles.statusIcon}>{config.icon}</div>
            <div className={styles.statusTitle}>{config.title}</div>
            <div className={styles.statusSubtitle}>{config.subtitle}</div>
          </div>

          {booking && (
            <div className={styles.resultDetails}>
              <div className={styles.bookingRef}>{booking.booking_reference}</div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}><Icons.User /></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabel}>Passenger</div>
                  <div className={styles.detailValue}>{booking.passenger_name}</div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}><Icons.Phone /></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabel}>Phone</div>
                  <div className={styles.detailValue}>{booking.passenger_phone}</div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}><Icons.MapPin /></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabel}>Route</div>
                  <div className={styles.detailValue}>
                    {booking.trips?.routes?.origin || 'N/A'} → {booking.trips?.routes?.destination || 'N/A'}
                  </div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}><Icons.Clock /></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabel}>Departure</div>
                  <div className={styles.detailValue}>{formatDate(booking.trips?.departure_time)}</div>
                </div>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.detailIcon}><Icons.Ticket /></div>
                <div className={styles.detailContent}>
                  <div className={styles.detailLabel}>Seat Number</div>
                </div>
                <div className={styles.seatBadge}>{booking.seat_number}</div>
              </div>
            </div>
          )}

          <div className={styles.resultActions}>
            {status === 'valid' && (
              <button 
                className={`${styles.actionBtn} ${styles.primary}`}
                onClick={handleBoard}
                disabled={loading}
              >
                <Icons.Check />
                Confirm Boarding
              </button>
            )}
            
            {(status === 'boarded_success' || status === 'already_boarded' || status === 'invalid' || status === 'unpaid') && (
              <button 
                className={`${styles.actionBtn} ${styles.primary}`}
                onClick={handleReset}
              >
                <Icons.Refresh />
                Scan Next
              </button>
            )}
            
            {status === 'valid' && (
              <button 
                className={`${styles.actionBtn} ${styles.secondary}`}
                onClick={handleReset}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.scannerApp}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/admin')}>
          <Icons.ArrowLeft />
        </button>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>Boarding Scanner</div>
          <div className={styles.headerSubtitle}>Scan tickets to verify and board passengers</div>
        </div>
        <div className={styles.headerLogo}>
          <Icons.Bus />
        </div>
      </header>

      {/* Mode Toggle */}
      {!result && (
        <div className={styles.modeToggle}>
          <button 
            className={`${styles.modeBtn} ${mode === 'camera' ? styles.active : ''}`}
            onClick={() => setMode('camera')}
          >
            <Icons.Camera />
            Camera
          </button>
          <button 
            className={`${styles.modeBtn} ${mode === 'manual' ? styles.active : ''}`}
            onClick={() => setMode('manual')}
          >
            <Icons.Keyboard />
            Manual
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !result && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <div className={styles.loadingText}>Verifying ticket...</div>
        </div>
      )}

      {/* Result Display */}
      {result && renderResult()}

      {/* Scanner / Manual Entry */}
      {!loading && !result && (
        <div className={styles.scannerContainer}>
          {mode === 'camera' ? (
            <>
              <div className={styles.cameraViewport}>
                <video 
                  ref={videoRef}
                  className={styles.cameraVideo}
                  autoPlay
                  playsInline
                  muted
                />
                
                {!cameraActive && !cameraError && (
                  <div className={styles.cameraPlaceholder}>
                    <Icons.Camera />
                    <p>Starting camera...</p>
                  </div>
                )}
                
                {cameraActive && (
                  <div className={styles.scannerOverlay}>
                    <div className={styles.scanFrame}>
                      <div className={`${styles.scanCorner} ${styles.tl}`} />
                      <div className={`${styles.scanCorner} ${styles.tr}`} />
                      <div className={`${styles.scanCorner} ${styles.bl}`} />
                      <div className={`${styles.scanCorner} ${styles.br}`} />
                      <div className={styles.scanLine} />
                    </div>
                  </div>
                )}
              </div>
              
              {cameraError && (
                <div className={styles.cameraError}>{cameraError}</div>
              )}
            </>
          ) : (
            <div className={styles.manualEntry}>
              <div className={styles.manualEntryTitle}>Enter Booking Reference</div>
              <div className={styles.manualEntrySubtitle}>
                Type the code shown on the passenger's ticket
              </div>
              
              <div className={styles.referenceInputGroup}>
                <input
                  type="text"
                  className={styles.referenceInput}
                  placeholder="BK••••••"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  maxLength={8}
                  autoFocus
                />
                <button 
                  className={styles.searchBtn}
                  onClick={() => handleSearch()}
                  disabled={!reference.trim()}
                >
                  <Icons.Scan />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.scanned}</div>
          <div className={styles.statLabel}>Scanned</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.boarded}</div>
          <div className={styles.statLabel}>Boarded</div>
        </div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{stats.scanned - stats.boarded}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
      </div>
    </div>
  );
}
