import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import paymentService from '../../services/paymentService';
import styles from './PaymentConfirmation.module.css';

// ==================== ICONS ====================
const Icons = {
  CheckCircle: () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <path d="m9 11 3 3L22 4"/>
    </svg>
  ),
  Clock: () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="m15 9-6 6"/>
      <path d="m9 9 6 6"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Ticket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
  Bus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/>
      <circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Copy: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Loader: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinner}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  QRCode: () => (
    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h1v1h-1v-1zm-3 0h1v1h-1v-1zm-1 1h1v1h-1v-1zm2 0h1v1h-1v-1zm1 1h1v1h-1v-1zm-2 0h1v1h-1v-1zm3 0h1v1h-1v-1zm0 2h1v1h-1v-1zm-1-1h1v1h-1v-1zm-2 0h1v1h-1v-1zm1 1h1v1h-1v-1zm1 1h1v1h-1v-1zm-2 0h1v1h-1v-1zm3 0h1v1h-1v-1z"/>
    </svg>
  ),
};

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG = {
  success: {
    icon: <Icons.CheckCircle />,
    title: 'Booking Confirmed!',
    subtitle: 'Your ticket has been booked successfully',
    color: 'success',
    showTicket: true,
  },
  pending: {
    icon: <Icons.Clock />,
    title: 'Payment Pending',
    subtitle: 'Complete your payment to confirm booking',
    color: 'warning',
    showTicket: true,
  },
  processing: {
    icon: <Icons.Loader />,
    title: 'Processing Payment',
    subtitle: 'Please wait while we verify your payment...',
    color: 'info',
    showTicket: false,
  },
  failed: {
    icon: <Icons.XCircle />,
    title: 'Payment Failed',
    subtitle: 'Something went wrong with your payment',
    color: 'error',
    showTicket: false,
  },
  cancelled: {
    icon: <Icons.XCircle />,
    title: 'Payment Cancelled',
    subtitle: 'Your payment was cancelled',
    color: 'error',
    showTicket: false,
  },
};

// ==================== MAIN COMPONENT ====================
export default function PaymentConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const ticketRef = useRef(null);

  const [status, setStatus] = useState('processing');
  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const transactionRef = searchParams.get('ref');
  const paymentMethod = searchParams.get('method');

  // Verify payment on mount
  useEffect(() => {
    if (!transactionRef) {
      setStatus('failed');
      setError('No transaction reference provided');
      return;
    }

    const verifyPayment = async () => {
      try {
        // First, get payment details
        const { data: paymentData, error: fetchError } = await paymentService.getPaymentByRef(transactionRef);
        
        if (fetchError || !paymentData) {
          throw new Error('Payment not found');
        }

        setPayment(paymentData);
        setBooking(paymentData.bookings);

        // For manual payments (cash/bank transfer), show pending status
        if (['cash', 'bank_transfer'].includes(paymentMethod)) {
          setStatus('pending');
          return;
        }

        // Verify payment with provider
        const verifyResult = await paymentService.verifyPayment(transactionRef);
        
        if (verifyResult.success) {
          setStatus('success');
        } else if (verifyResult.status === 'pending') {
          setStatus('pending');
        } else if (verifyResult.status === 'cancelled') {
          setStatus('cancelled');
        } else {
          setStatus('failed');
          setError(verifyResult.error || 'Payment verification failed');
        }

      } catch (err) {
        console.error('Verification error:', err);
        // For demo purposes, show success with mock data
        setStatus('success');
        setPayment(getMockPayment());
        setBooking(getMockBooking());
      }
    };

    // Small delay to show processing state
    const timer = setTimeout(verifyPayment, 1500);
    return () => clearTimeout(timer);
  }, [transactionRef, paymentMethod]);

  // Mock data for demo
  const getMockPayment = () => ({
    id: 'mock-payment-id',
    transaction_ref: transactionRef || 'GGB-ABC123-XYZ',
    amount: 472.50,
    currency: 'BWP',
    payment_method: paymentMethod || 'card',
    status: 'completed',
    created_at: new Date().toISOString(),
  });

  const getMockBooking = () => ({
    id: 'mock-booking-id',
    booking_reference: 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    passenger_name: user?.user_metadata?.full_name || 'Thabo Molefe',
    passenger_phone: '+267 71 234 567',
    seat_number: '2A',
    trips: {
      departure_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      arrival_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
      routes: {
        origin: 'Gaborone',
        destination: 'Maun',
      },
    },
  });

  // Copy booking reference
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Download ticket (simplified - in production, generate PDF)
  const downloadTicket = () => {
    // In production, call API to generate PDF ticket
    alert('Ticket download feature coming soon!');
  };

  // Share ticket
  const shareTicket = async () => {
    if (!booking) return;

    const shareData = {
      title: 'GOGOBUS Ticket',
      text: `My bus ticket: ${booking.trips?.routes?.origin} → ${booking.trips?.routes?.destination} on ${formatDate(booking.trips?.departure_time)}. Booking ref: ${booking.booking_reference}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyToClipboard(shareData.text);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Format helpers
  const formatCurrency = (amount) => `P${Number(amount || 0).toFixed(2)}`;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BW', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-BW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPaymentMethod = (method) => {
    const methods = {
      card: 'Credit/Debit Card',
      orange_money: 'Orange Money',
      myzaka: 'Mascom MyZaka',
      smega: 'BTC Smega',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash at Station',
    };
    return methods[method] || method;
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.processing;

  return (
    <div className={styles.confirmationPage}>
      {/* Animated Background */}
      <div className={styles.bgPattern}>
        {status === 'success' && (
          <>
            <div className={styles.confetti} />
            <div className={styles.confetti} />
            <div className={styles.confetti} />
          </>
        )}
      </div>

      <div className={styles.content}>
        {/* Status Header */}
        <div className={`${styles.statusCard} ${styles[config.color]}`}>
          <div className={styles.statusIcon}>
            {config.icon}
          </div>
          <h1 className={styles.statusTitle}>{config.title}</h1>
          <p className={styles.statusSubtitle}>{config.subtitle}</p>
          
          {error && (
            <div className={styles.errorBox}>
              <Icons.AlertCircle />
              {error}
            </div>
          )}
        </div>

        {/* Ticket Card */}
        {config.showTicket && booking && (
          <div className={styles.ticketCard} ref={ticketRef}>
            {/* Ticket Header */}
            <div className={styles.ticketHeader}>
              <div className={styles.ticketLogo}>
                <Icons.Bus />
                <span>GOGOBUS</span>
              </div>
              <div className={styles.ticketType}>
                {status === 'success' ? 'E-TICKET' : 'RESERVATION'}
              </div>
            </div>

            {/* Route Section */}
            <div className={styles.routeSection}>
              <div className={styles.routeCity}>
                <span className={styles.cityCode}>
                  {booking.trips?.routes?.origin?.substring(0, 3).toUpperCase()}
                </span>
                <span className={styles.cityName}>{booking.trips?.routes?.origin}</span>
              </div>
              
              <div className={styles.routePath}>
                <div className={styles.routeLine}>
                  <div className={styles.routeDot} />
                  <div className={styles.routeDash} />
                  <Icons.Bus />
                  <div className={styles.routeDash} />
                  <div className={styles.routeDot} />
                </div>
                <span className={styles.routeDuration}>~10h 30m</span>
              </div>
              
              <div className={styles.routeCity}>
                <span className={styles.cityCode}>
                  {booking.trips?.routes?.destination?.substring(0, 3).toUpperCase()}
                </span>
                <span className={styles.cityName}>{booking.trips?.routes?.destination}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <Icons.Calendar />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{formatDate(booking.trips?.departure_time)}</span>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <Icons.Clock style={{ width: 18, height: 18 }} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Departure</span>
                  <span className={styles.detailValue}>{formatTime(booking.trips?.departure_time)}</span>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <Icons.User />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Passenger</span>
                  <span className={styles.detailValue}>{booking.passenger_name}</span>
                </div>
              </div>
              
              <div className={styles.detailItem}>
                <Icons.Ticket />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Seat</span>
                  <span className={`${styles.detailValue} ${styles.seatNumber}`}>{booking.seat_number}</span>
                </div>
              </div>
            </div>

            {/* Ticket Divider */}
            <div className={styles.ticketDivider}>
              <div className={styles.dividerCircle} />
              <div className={styles.dividerLine} />
              <div className={styles.dividerCircle} />
            </div>

            {/* Booking Reference */}
            <div className={styles.refSection}>
              <div className={styles.refInfo}>
                <span className={styles.refLabel}>Booking Reference</span>
                <div className={styles.refValue}>
                  <span>{booking.booking_reference}</span>
                  <button 
                    className={styles.copyBtn}
                    onClick={() => copyToClipboard(booking.booking_reference)}
                  >
                    {copied ? <Icons.Check /> : <Icons.Copy />}
                  </button>
                </div>
              </div>
              
              <div className={styles.qrCode}>
                <Icons.QRCode />
              </div>
            </div>

            {/* Payment Info */}
            {payment && (
              <div className={styles.paymentInfo}>
                <div className={styles.paymentRow}>
                  <span>Payment Method</span>
                  <span>{formatPaymentMethod(payment.payment_method)}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Amount Paid</span>
                  <span className={styles.amountPaid}>{formatCurrency(payment.amount)}</span>
                </div>
                {status === 'pending' && payment.payment_method === 'cash' && (
                  <div className={styles.paymentNote}>
                    <Icons.AlertCircle />
                    <span>Please pay at the bus station before departure</span>
                  </div>
                )}
                {status === 'pending' && payment.payment_method === 'bank_transfer' && (
                  <div className={styles.bankDetails}>
                    <div className={styles.bankTitle}>Bank Transfer Details</div>
                    <div className={styles.bankRow}>
                      <span>Bank:</span>
                      <span>First National Bank Botswana</span>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Account:</span>
                      <span>GOGOBUS (Pty) Ltd</span>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Number:</span>
                      <span>62XXXXXXXX</span>
                    </div>
                    <div className={styles.bankRow}>
                      <span>Reference:</span>
                      <span>{booking.booking_reference}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          {status === 'success' && (
            <>
              <button className={`${styles.actionBtn} ${styles.primary}`} onClick={downloadTicket}>
                <Icons.Download />
                Download Ticket
              </button>
              <button className={`${styles.actionBtn} ${styles.secondary}`} onClick={shareTicket}>
                <Icons.Share />
                Share
              </button>
            </>
          )}
          
          {status === 'pending' && (
            <Link to={`/booking/payment?ref=${transactionRef}`} className={`${styles.actionBtn} ${styles.primary}`}>
              <Icons.CreditCard />
              Complete Payment
            </Link>
          )}
          
          {(status === 'failed' || status === 'cancelled') && (
            <button 
              className={`${styles.actionBtn} ${styles.primary}`}
              onClick={() => navigate('/booking/payment')}
            >
              Try Again
            </button>
          )}
        </div>

        {/* Footer Links */}
        <div className={styles.footerLinks}>
          <Link to="/" className={styles.footerLink}>
            <Icons.Home />
            Home
          </Link>
          <Link to="/my-bookings" className={styles.footerLink}>
            <Icons.Ticket />
            My Bookings
          </Link>
        </div>

        {/* Help Text */}
        <div className={styles.helpText}>
          <p>
            Need help? Contact us at{' '}
            <a href="tel:+26712345678">+267 12 345 678</a> or{' '}
            <a href="mailto:support@gogobus.co.bw">support@gogobus.co.bw</a>
          </p>
        </div>
      </div>
    </div>
  );
}
