import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { trackBookingCompleted } from '../../utils/analytics';
import Button from '../../components/common/Button';
import QRCodeDisplay from '../../components/booking/QRCodeDisplay';
import { logInfo } from '../../utils/logger';
import emailService from '../../services/emailService';
import styles from './Booking.module.css';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { booking, selectedRoute, selectedSeats, passengerDetails, clearBooking } = useBooking();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!booking) {
      navigate('/home');
      return;
    }
    
    // Track booking completion conversion
    const totalPrice = ((selectedRoute?.price || 150) * (selectedSeats?.length || passengerDetails?.length || 0)) + 5;
    trackBookingCompleted({
      bookingId: booking.id,
      transactionId: booking.id,
      totalPrice: totalPrice,
      amount: totalPrice,
      items: selectedSeats?.map((seat, index) => ({
        item_id: seat,
        item_name: `Seat ${seat}`,
        price: selectedRoute?.price || 150,
        quantity: 1,
      })) || [],
      origin: selectedRoute?.origin,
      destination: selectedRoute?.destination,
      date: selectedRoute?.date,
    });
    
    // Send booking confirmation email (non-blocking, as fallback)
    const passengerEmail = passengerDetails?.[0]?.email || booking.passenger_email;
    if (passengerEmail && booking.id) {
      emailService.sendBookingConfirmation({
        bookingId: booking.id,
        customerEmail: passengerEmail,
        customerName: passengerDetails?.[0]?.fullName || passengerDetails?.[0]?.name || booking.passenger_name || 'Customer',
        origin: selectedRoute?.origin || booking.origin || 'Unknown',
        destination: selectedRoute?.destination || booking.destination || 'Unknown',
        departureTime: selectedRoute?.departure_time || booking.departure_time || '',
        seats: selectedSeats || booking.seats || [],
        totalAmount: booking.total_amount || booking.total_price || totalPrice,
        bookingRef: booking.booking_ref || booking.id,
      }).catch(err => {
        // Email sending is non-critical - just log
        console.warn('Email sending failed (non-critical):', err);
      });
    }
    
    const timer = setTimeout(() => setIsLoaded(true), 100);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [booking, navigate, selectedRoute, selectedSeats, passengerDetails]);

  const handleGoHome = () => {
    clearBooking();
    navigate('/home');
  };

  const handleViewTicket = () => {
    navigate(`/tickets/${booking.id}`);
  };

  const handleCopyBookingRef = () => {
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: 'GOGOBUS Booking Confirmation',
      text: `My trip from ${selectedRoute?.origin} to ${selectedRoute?.destination} on ${selectedRoute?.date}. Booking Ref: #${booking.id}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyBookingRef();
      }
    } catch (err) {
      logInfo('Share failed', { error: err });
    }
  };

  const handleAddToCalendar = () => {
    const event = {
      title: `GOGOBUS: ${selectedRoute?.origin} → ${selectedRoute?.destination}`,
      start: selectedRoute?.date,
      details: `Booking Reference: ${booking.id}\nSeats: ${selectedSeats?.join(', ')}`,
    };
    
    // Create Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start?.replace(/-/g, '')}/${event.start?.replace(/-/g, '')}&details=${encodeURIComponent(event.details)}`;
    window.open(googleCalendarUrl, '_blank');
  };

  if (!booking) {
    return null;
  }

  const totalPassengers = passengerDetails?.length || selectedSeats?.length || 0;

  return (
    <div className={styles.bookingScreen}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className={styles.confettiContainer}>
          {[...Array(50)].map((_, i) => (
            <div 
              key={i} 
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#F5A623', '#1B4D4A', '#22C55E', '#3B82F6', '#EC4899'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      <div className={`${styles.confirmationContent} ${isLoaded ? styles.loaded : ''}`}>
        {/* Success Animation */}
        <div className={styles.successAnimation}>
          <div className={styles.successCircle}>
            <div className={styles.successIconWrapper}>
              <svg viewBox="0 0 24 24" fill="none" className={styles.checkIcon}>
                <path 
                  d="M20 6L9 17L4 12" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.checkPath}
                />
              </svg>
            </div>
          </div>
          <div className={styles.successRipple}></div>
          <div className={styles.successRipple} style={{ animationDelay: '0.2s' }}></div>
        </div>

        <h1 className={styles.confirmationTitle}>Booking Confirmed!</h1>
        <p className={styles.confirmationMessage}>
          Your journey is all set. A confirmation has been sent to your email.
        </p>

        {/* Booking Reference Card */}
        <div className={styles.bookingRefCard}>
          <div className={styles.bookingRefHeader}>
            <span className={styles.bookingRefLabel}>Booking Reference</span>
            <button 
              className={`${styles.copyBtn} ${copied ? styles.copied : ''}`}
              onClick={handleCopyBookingRef}
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className={styles.bookingRefNumber}>#{booking.id}</div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn} onClick={handleShare}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
              <path d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Share
          </button>
          <button className={styles.quickActionBtn} onClick={handleAddToCalendar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Calendar
          </button>
          <button className={styles.quickActionBtn} onClick={() => window.print()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9V2H18V9M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Print
          </button>
        </div>

        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Trip Details
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'qr' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('qr')}
            >
              QR Ticket
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'details' && (
            <div className={styles.detailsTab}>
              {/* Journey Card */}
              <div className={styles.journeyCard}>
                <div className={styles.journeyHeader}>
                  <div className={styles.journeyBadge}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor"/>
                      <circle cx="7" cy="18" r="2" fill="currentColor"/>
                      <circle cx="17" cy="18" r="2" fill="currentColor"/>
                    </svg>
                    Bus Journey
                  </div>
                  <span className={styles.journeyDate}>{selectedRoute?.date}</span>
                </div>

                <div className={styles.journeyRoute}>
                  <div className={styles.journeyPoint}>
                    <div className={styles.journeyDot}>
                      <div className={styles.dotInner}></div>
                    </div>
                    <div className={styles.journeyLocation}>
                      <span className={styles.locationName}>{selectedRoute?.origin}</span>
                      <span className={styles.locationTime}>{selectedRoute?.departureTime || '06:00 AM'}</span>
                    </div>
                  </div>
                  
                  <div className={styles.journeyLine}>
                    <div className={styles.journeyDuration}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      {selectedRoute?.duration || '4h 30m'}
                    </div>
                  </div>

                  <div className={styles.journeyPoint}>
                    <div className={`${styles.journeyDot} ${styles.destination}`}>
                      <div className={styles.dotInner}></div>
                    </div>
                    <div className={styles.journeyLocation}>
                      <span className={styles.locationName}>{selectedRoute?.destination}</span>
                      <span className={styles.locationTime}>{selectedRoute?.arrivalTime || '10:30 AM'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seats & Passengers */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 18V14C4 13.4477 4.44772 13 5 13H7C7.55228 13 8 13.4477 8 14V18C8 18.5523 7.55228 19 7 19H5C4.44772 19 4 18.5523 4 18Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 9V6C4 5.44772 4.44772 5 5 5H7C7.55228 5 8 5.44772 8 6V9C8 9.55228 7.55228 10 7 10H5C4.44772 10 4 9.55228 4 9Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 18V14C16 13.4477 16.4477 13 17 13H19C19.5523 13 20 13.4477 20 14V18C20 18.5523 19.5523 19 19 19H17C16.4477 19 16 18.5523 16 18Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M16 9V6C16 5.44772 16.4477 5 17 5H19C19.5523 5 20 5.44772 20 6V9C20 9.55228 19.5523 10 19 10H17C16.4477 10 16 9.55228 16 9Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M10 18V14C10 13.4477 10.4477 13 11 13H13C13.5523 13 14 13.4477 14 14V18C14 18.5523 13.5523 19 13 19H11C10.4477 19 10 18.5523 10 18Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Seat Information
                </h3>
                <div className={styles.seatsDisplay}>
                  {selectedSeats?.map((seat, index) => (
                    <div key={seat} className={styles.seatChip}>
                      <span className={styles.seatNumber}>{seat}</span>
                      {passengerDetails?.[index] && (
                        <span className={styles.passengerName}>
                          {passengerDetails[index].name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoCardTitle}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V18M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Payment Summary
                </h3>
                <div className={styles.priceSummaryList}>
                  <div className={styles.priceRow}>
                    <span>Ticket Price × {totalPassengers}</span>
                    <span>P{(selectedRoute?.price || 150) * totalPassengers}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Booking Fee</span>
                    <span>P5</span>
                  </div>
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Total Paid</span>
                    <span className={styles.totalPrice}>
                      P{((selectedRoute?.price || 150) * totalPassengers) + 5}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className={styles.qrTab}>
              <div className={styles.qrCard}>
                <QRCodeDisplay
                  bookingId={booking.id}
                  route={selectedRoute}
                  seats={selectedSeats}
                />
                <p className={styles.qrHint}>
                  Show this QR code to the bus conductor when boarding
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={styles.confirmationActions}>
          <Button onClick={handleViewTicket} variant="outline" className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Ticket
          </Button>
          <Button onClick={handleGoHome} className={styles.actionBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Go Home
          </Button>
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <p>Need help with your booking?</p>
          <a href="tel:+26712345678" className={styles.helpLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.98C20.61 21.01 20.21 21.03 19.81 21.03C10.84 21.03 3.47 13.66 3.47 4.69C3.47 4.29 3.49 3.89 3.52 3.5C3.57 2.94 4.02 2.5 4.58 2.5H7.58C8.06 2.5 8.48 2.85 8.56 3.32C8.67 4.01 8.86 4.68 9.13 5.31C9.27 5.63 9.19 6 8.93 6.26L7.66 7.53C9.06 10.08 11.14 12.16 13.69 13.56L14.96 12.29C15.22 12.03 15.59 11.95 15.91 12.09C16.54 12.36 17.21 12.55 17.9 12.66C18.37 12.74 18.72 13.16 18.72 13.64V16.64C18.72 17.2 18.28 17.65 17.72 17.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
