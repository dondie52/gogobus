import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import paymentService from '../../services/paymentService';
import bookingService from '../../services/bookingService';
import { logError } from '../../utils/logger';
import { USE_MOCK_PAYMENTS } from '../../utils/constants';
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
  cash: () => <span style={{ fontSize: '32px' }}>💵</span>,
};

// ==================== MAIN COMPONENT ====================
export default function Payment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { booking, selectedRoute, selectedSeats, passengerDetails } = useBooking();
  // #region agent log
  useEffect(() => {
    try {
      const currentPath = typeof window !== 'undefined' ? (window.location.hash || window.location.pathname) : 'unknown';
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:114',message:'Payment component mounted',data:{hasUser:!!user,userId:user?.id,hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    } catch (err) {
      // Silently fail logging
    }
  }, []);
  // #endregion

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
    try {
      const breakdown = paymentService.calculateTotal(
        bookingData.basePrice || 0,
        bookingData.serviceFee || 0,
        methodId || 'card'
      );
      setPriceBreakdown(breakdown);
    } catch (error) {
      logError('Error calculating price breakdown', error);
      setPriceBreakdown(null);
    }
  };

  // Load payment methods and calculate fees
  useEffect(() => {
    try {
      const methods = paymentService.getEnabledPaymentMethods();
      setPaymentMethods(methods || []);
      
      // Calculate initial price with default method
      if (bookingData.basePrice && bookingData.serviceFee) {
        updatePriceBreakdown('card');
      }
    } catch (error) {
      logError('Error loading payment methods', error);
      setPaymentMethods([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData.basePrice, bookingData.serviceFee]);

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
    updatePriceBreakdown(methodId);
    setError(null);
  };

  const handlePayment = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:191',message:'handlePayment called',data:{hasBooking:!!booking,bookingId:booking?.id,hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,hasUser:!!user,userId:user?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,selectedMethod,hasPriceBreakdown:!!priceBreakdown,priceBreakdownTotal:priceBreakdown?.total},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    setLoading(true);
    setError(null);

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:195',message:'handlePayment - starting payment process',data:{loading:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      // Create booking first if it doesn't exist
      let bookingId = booking?.id;
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:203',message:'Checking if booking needs to be created',data:{hasBooking:!!booking,bookingId:booking?.id,hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,hasUser:!!user,userId:user?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,willCreateBooking:!bookingId && !!selectedRoute?.id && !!user?.id && selectedSeats?.length > 0 && passengerDetails?.length > 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      if (!bookingId && selectedRoute?.id && user?.id && selectedSeats?.length > 0 && passengerDetails?.length > 0) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:186',message:'Creating booking - before validation',data:{hasPriceBreakdown:!!priceBreakdown,priceBreakdownTotal:priceBreakdown?.total,priceBreakdownBase:priceBreakdown?.baseAmount,priceBreakdownService:priceBreakdown?.serviceFee,priceBreakdownPayment:priceBreakdown?.paymentFee,selectedRouteId:selectedRoute?.id,userId:user?.id,seatsCount:selectedSeats?.length,passengersCount:passengerDetails?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
        // #endregion

        // Ensure priceBreakdown is calculated
        let finalPriceBreakdown = priceBreakdown;
        if (!finalPriceBreakdown || finalPriceBreakdown.total === null || finalPriceBreakdown.total === undefined) {
          // Recalculate if missing
          const baseAmount = bookingData.basePrice || totalBasePrice;
          const serviceFeeAmount = bookingData.serviceFee || serviceFee;
          finalPriceBreakdown = paymentService.calculateTotal(
            baseAmount,
            serviceFeeAmount,
            selectedMethod
          );
          setPriceBreakdown(finalPriceBreakdown);
          // #region agent log
          fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:192',message:'Recalculated priceBreakdown',data:{recalculatedTotal:finalPriceBreakdown.total,baseAmount,serviceFeeAmount,selectedMethod},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
          // #endregion
        }

        const finalTotal = finalPriceBreakdown?.total || (bookingData.basePrice || totalBasePrice) + (bookingData.serviceFee || serviceFee);
        
        if (!finalTotal || finalTotal <= 0) {
          throw new Error('Invalid booking total. Please refresh and try again.');
        }

        const firstPassenger = passengerDetails[0];
        const bookingDataToSend = {
          schedule_id: selectedRoute.id,
          user_id: user.id,
          seats: selectedSeats,
          passengers: passengerDetails,
          total_amount: finalTotal,
          total_price: finalTotal, // Include both for compatibility
          passenger_name: firstPassenger?.fullName || firstPassenger?.name || 'Guest',
          passenger_email: firstPassenger?.email || user?.email || '',
          passenger_phone: firstPassenger?.phone || '',
          origin: selectedRoute.origin,
          destination: selectedRoute.destination,
          departure_time: selectedRoute.departure_time,
          payment_status: 'unpaid',
          status: 'pending',
        };

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:210',message:'Sending booking data',data:{total_amount:bookingDataToSend.total_amount,total_price:bookingDataToSend.total_price,schedule_id:bookingDataToSend.schedule_id,user_id:bookingDataToSend.user_id,seatsCount:bookingDataToSend.seats?.length,passengersCount:bookingDataToSend.passengers?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
        // #endregion

        const createdBooking = await bookingService.createBooking(bookingDataToSend);
        bookingId = createdBooking.id;

        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:217',message:'Booking created successfully',data:{bookingId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'L'})}).catch(()=>{});
        // #endregion
      }

      if (!bookingId) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:263',message:'No bookingId - throwing error',data:{hasBooking:!!booking,hasSelectedRoute:!!selectedRoute,hasUser:!!user,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        throw new Error('Unable to create booking. Please try again.');
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:265',message:'Booking ID confirmed - proceeding to payment',data:{bookingId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const passenger = bookingData.passenger || passengerDetails?.[0] || {};
      const finalAmount = priceBreakdown?.total || (bookingData.basePrice || totalBasePrice) + (bookingData.serviceFee || serviceFee);
      const paymentData = {
        bookingId: bookingId,
        amount: finalAmount,
        paymentMethod: selectedMethod,
        customerName: passenger.name || passenger.fullName || passenger.full_name || user?.user_metadata?.full_name || 'Guest',
        customerEmail: passenger.email || user?.email || '',
        customerPhone: passenger.phone || passenger.phone_number || '',
        description: `GOGOBUS: ${selectedRoute?.origin || bookingData.route.origin} → ${selectedRoute?.destination || bookingData.route.destination}`,
      };

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:275',message:'About to initiate payment',data:{bookingId,amount:finalAmount,paymentMethod:selectedMethod,hasPaymentData:!!paymentData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      const result = await paymentService.initiatePayment(paymentData);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:278',message:'Payment initiated - result received',data:{success:result?.success,hasTransactionRef:!!result?.transactionRef,hasPaymentUrl:!!result?.paymentUrl,error:result?.error,USE_MOCK_PAYMENTS},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion

      if (!result.success) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:280',message:'Payment failed - result.success is false',data:{error:result?.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        throw new Error(result.error);
      }

      // When mock payments are enabled, always navigate to confirmation
      // Real payment gateway flows are bypassed
      if (USE_MOCK_PAYMENTS) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:286',message:'Mock payment - navigating to confirmation',data:{transactionRef:result.transactionRef,method:selectedMethod,targetPath:`/booking/confirmation?ref=${result.transactionRef}&method=${selectedMethod}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        // Mock payment flow - navigate directly to confirmation
        navigate(`/booking/confirmation?ref=${result.transactionRef}&method=${selectedMethod}`);
      } else {
        // Real payment gateway flow
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
      }

    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:305',message:'Payment error caught',data:{errorMessage:err?.message,errorName:err?.name,errorStack:err?.stack?.substring(0,500)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      logError('Payment error', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:310',message:'handlePayment finally block - setting loading to false',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `P${amount.toFixed(2)}`;
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-BW', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Redirect if no route/seats selected - but allow some time for context to update
  useEffect(() => {
    // #region agent log
    try {
      const currentPath = typeof window !== 'undefined' ? (window.location.hash || window.location.pathname) : 'unknown';
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:310',message:'Payment useEffect - checking context data',data:{hasSelectedRoute:!!selectedRoute,selectedRouteId:selectedRoute?.id,selectedSeatsCount:selectedSeats?.length,passengerDetailsCount:passengerDetails?.length,currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    } catch (err) {
      // Silently fail logging
    }
    // #endregion
    if (!selectedRoute || !selectedSeats || selectedSeats.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:312',message:'Payment redirecting - missing data',data:{hasSelectedRoute:!!selectedRoute,selectedSeatsCount:selectedSeats?.length,redirectTarget:'/booking/summary'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      // Small delay to allow context to update if navigating from summary
      const timer = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:315',message:'Payment executing redirect to summary',data:{redirectTarget:'/booking/summary'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        navigate('/booking/summary');
      }, 500);
      return () => clearTimeout(timer);
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:318',message:'Payment has valid data - no redirect',data:{hasSelectedRoute:!!selectedRoute,selectedSeatsCount:selectedSeats?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    }
  }, [selectedRoute, selectedSeats, navigate, passengerDetails]);

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

        {/* Mock Payment Notice */}
        {USE_MOCK_PAYMENTS && (
          <div className={styles.mockPaymentNotice}>
            <Icons.Shield />
            <div className={styles.mockPaymentText}>
              <strong>Payment will be completed at the station.</strong>
              <span>Ticket reserved now.</span>
            </div>
          </div>
        )}

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
          onClick={(e) => {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Payment.jsx:515',message:'Pay button clicked',data:{loading,disabled:loading,hasHandlePayment:!!handlePayment,priceBreakdownTotal:priceBreakdown?.total},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
            // #endregion
            if (!loading) {
              handlePayment();
            }
          }}
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
