import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import paymentService from '../../services/paymentService';
import bookingService from '../../services/bookingService';
import { logError } from '../../utils/logger';
import styles from './Payment.module.css';

// ==================== ICONS ====================
const Icons = {
  Card: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Phone: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  ),
  Building: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>
    </svg>
  ),
  Cash: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  Lock: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  ),
  Bus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Ticket: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
  Shield: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  Loader: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinner}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
};

// Payment method icons (brand logos)
const PaymentIcons = {
  card: () => (
    <div className={styles.brandLogos}>
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/120px-Visa_Inc._logo.svg.png" alt="Visa" />
      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/120px-Mastercard-logo.svg.png" alt="Mastercard" />
    </div>
  ),
  orange: () => (
    <div className={styles.providerLogo} style={{ background: '#FF6600' }}>
      <span style={{ color: 'white', fontWeight: 700 }}>Orange</span>
    </div>
  ),
  myzaka: () => (
    <div className={styles.providerLogo} style={{ background: '#00A651' }}>
      <span style={{ color: 'white', fontWeight: 700 }}>MyZaka</span>
    </div>
  ),
  smega: () => (
    <div className={styles.providerLogo} style={{ background: '#003366' }}>
      <span style={{ color: 'white', fontWeight: 700 }}>Smega</span>
    </div>
  ),
  bank: () => <Icons.Building />,
  cash: () => <Icons.Cash />,
};

// ==================== MAIN COMPONENT ====================
export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { booking, selectedRoute, selectedSeats, passengerDetails } = useBooking();

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [priceBreakdown, setPriceBreakdown] = useState(null);

  // Calculate booking data from context
  const basePrice = selectedRoute?.price || 150;
  const totalBasePrice = basePrice * (selectedSeats?.length || 1);
  const serviceFee = Math.round(totalBasePrice * 0.05 * 100) / 100; // 5% service fee
  
  const bookingData = booking || {
    tripId: selectedRoute?.id || 'mock-trip-id',
    route: selectedRoute || {
      origin: 'Gaborone',
      destination: 'Maun',
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    seats: selectedSeats || ['2A'],
    passenger: (passengerDetails && passengerDetails[0]) || {
      name: user?.user_metadata?.full_name || 'Guest',
      phone: '+267 71 234 567',
      email: user?.email || 'guest@example.com',
    },
    basePrice: totalBasePrice,
    serviceFee,
  };

  // Update price when payment method changes
  const updatePriceBreakdown = (methodId) => {
    const breakdown = paymentService.calculateTotal(
      bookingData.basePrice,
      bookingData.serviceFee,
      methodId
    );
    setPriceBreakdown(breakdown);
  };

  // Load payment methods and calculate fees
  useEffect(() => {
    const methods = paymentService.getEnabledPaymentMethods();
    setPaymentMethods(methods);
    
    // Calculate initial price with default method
    if (bookingData.basePrice && bookingData.serviceFee) {
      updatePriceBreakdown('card');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.basePrice, bookingData.serviceFee]);

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    updatePriceBreakdown(methodId);
    setError(null);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // #region agent log
      // #endregion

      // Create booking first if it doesn't exist
      let bookingId = booking?.id;
      if (!bookingId && selectedRoute?.id && user?.id && selectedSeats?.length > 0 && passengerDetails?.length > 0) {
        // #region agent log
        // #endregion

        const firstPassenger = passengerDetails[0];
        const bookingData = {
          schedule_id: selectedRoute.id,
          user_id: user.id,
          seats: selectedSeats,
          passengers: passengerDetails,
          total_amount: priceBreakdown.total,
          passenger_name: firstPassenger?.fullName || firstPassenger?.name || 'Guest',
          passenger_email: firstPassenger?.email || user?.email || '',
          passenger_phone: firstPassenger?.phone || '',
          origin: selectedRoute.origin,
          destination: selectedRoute.destination,
          departure_time: selectedRoute.departure_time,
          payment_status: 'unpaid',
          status: 'pending',
        };

        const createdBooking = await bookingService.createBooking(bookingData);
        bookingId = createdBooking.id;

        // #region agent log
        // #endregion
      }

      if (!bookingId) {
        throw new Error('Unable to create booking. Please try again.');
      }

      const passenger = bookingData.passenger || passengerDetails?.[0] || {};
      const paymentData = {
        bookingId: bookingId,
        amount: priceBreakdown.total,
        paymentMethod: selectedMethod,
        customerName: passenger.name || passenger.fullName || passenger.full_name || user?.user_metadata?.full_name || 'Guest',
        customerEmail: passenger.email || user?.email || '',
        customerPhone: passenger.phone || passenger.phone_number || '',
        description: `GOGOBUS: ${selectedRoute?.origin || bookingData.route.origin} → ${selectedRoute?.destination || bookingData.route.destination}`,
      };

      // #region agent log
      // #endregion

      const result = await paymentService.initiatePayment(paymentData);

      if (!result.success) {
        throw new Error(result.error);
      }

      // Handle different payment methods
      const method = paymentService.PAYMENT_METHODS[selectedMethod.toUpperCase()];

      if (method.provider === 'manual') {
        // For cash/bank transfer, go directly to confirmation
        navigate(`/booking/confirmation?ref=${result.transactionRef}&method=${selectedMethod}`);
      } else if (result.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = result.paymentUrl;
      } else {
        // Shouldn't happen, but handle gracefully
        navigate(`/booking/confirmation?ref=${result.transactionRef}`);
      }

    } catch (err) {
      logError('Payment error', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `P${amount.toFixed(2)}`;
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-BW', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Redirect if no route/seats selected - but allow some time for context to update
  useEffect(() => {
    if (!selectedRoute || !selectedSeats || selectedSeats.length === 0) {
      // Small delay to allow context to update if navigating from summary
      const timer = setTimeout(() => {
        navigate('/booking/summary');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedRoute, selectedSeats, navigate]);

  // Show loading state while checking data or redirecting
  if (!selectedRoute || !selectedSeats || selectedSeats.length === 0) {
    return (
      <div className={styles.paymentPage}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading payment information...</p>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
            Redirecting to booking summary...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.paymentPage}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <Icons.ArrowLeft />
        </button>
        <h1 className={styles.headerTitle}>Payment</h1>
        <div className={styles.secureIcon}>
          <Icons.Lock />
          <span>Secure</span>
        </div>
      </header>

      <div className={styles.content}>
        {/* Trip Summary Card */}
        <div className={styles.tripSummary}>
          <div className={styles.tripHeader}>
            <Icons.Bus />
            <span>Trip Summary</span>
          </div>
          
          <div className={styles.tripRoute}>
            <div className={styles.routePoint}>
              <div className={styles.routeDot} />
              <span>{selectedRoute?.origin || bookingData.route.origin}</span>
            </div>
            <div className={styles.routeLine} />
            <div className={styles.routePoint}>
              <div className={`${styles.routeDot} ${styles.destination}`} />
              <span>{selectedRoute?.destination || bookingData.route.destination}</span>
            </div>
          </div>

          <div className={styles.tripDetails}>
            {(selectedRoute?.departure_time || bookingData.route.departureTime) && (
              <div className={styles.tripDetail}>
                <Icons.Calendar />
                <span>{selectedRoute?.departure_time || formatDate(bookingData.route.departureTime)}</span>
              </div>
            )}
            {bookingData.passenger && (
              <div className={styles.tripDetail}>
                <Icons.User />
                <span>{bookingData.passenger.name || bookingData.passenger.full_name}</span>
              </div>
            )}
            <div className={styles.tripDetail}>
              <Icons.Ticket />
              <span>Seat {bookingData.seats.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Select Payment Method</h2>
          
          <div className={styles.methodsList}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`${styles.methodCard} ${selectedMethod === method.id ? styles.selected : ''}`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className={styles.methodRadio}>
                  {selectedMethod === method.id && <Icons.Check />}
                </div>
                
                <div className={styles.methodIcon}>
                  {PaymentIcons[method.icon] ? PaymentIcons[method.icon]() : <Icons.Card />}
                </div>
                
                <div className={styles.methodInfo}>
                  <div className={styles.methodName}>{method.name}</div>
                  <div className={styles.methodDesc}>{method.description}</div>
                </div>

                {method.fees.value > 0 && (
                  <div className={styles.methodFee}>
                    {method.fees.type === 'percentage' 
                      ? `${method.fees.value}% fee`
                      : `P${method.fees.value} fee`
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        {priceBreakdown && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Price Breakdown</h2>
            
            <div className={styles.priceCard}>
              <div className={styles.priceRow}>
                <span>Ticket Price</span>
                <span>{formatCurrency(priceBreakdown.baseAmount)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Service Fee</span>
                <span>{formatCurrency(priceBreakdown.serviceFee)}</span>
              </div>
              {priceBreakdown.paymentFee > 0 && (
                <div className={styles.priceRow}>
                  <span>Payment Fee</span>
                  <span>{formatCurrency(priceBreakdown.paymentFee)}</span>
                </div>
              )}
              <div className={styles.priceDivider} />
              <div className={`${styles.priceRow} ${styles.total}`}>
                <span>Total</span>
                <span>{formatCurrency(priceBreakdown.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Security Badge */}
        <div className={styles.securityBadge}>
          <Icons.Shield />
          <div className={styles.securityText}>
            <strong>Secure Payment</strong>
            <span>Your payment is protected with 256-bit SSL encryption</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        {/* Pay Button */}
        <button
          className={styles.payButton}
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <Icons.Loader />
              Processing...
            </>
          ) : (
            <>
              <Icons.Lock />
              Pay {priceBreakdown ? formatCurrency(priceBreakdown.total) : ''}
            </>
          )}
        </button>

        {/* Terms */}
        <p className={styles.terms}>
          By proceeding, you agree to our{' '}
          <a href="/terms">Terms of Service</a> and{' '}
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
