import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import Button from '../../components/common/Button';
import QRCodeDisplay from '../../components/booking/QRCodeDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TicketDownload from '../../components/tickets/TicketDownload';
import { logError } from '../../utils/logger';
import styles from './TicketView.module.css';

const TicketView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBooking = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const bookings = await bookingService.getUserBookings(user.id);
        const foundBooking = bookings.find((b) => b.id === id);
        if (foundBooking) {
          setBooking(foundBooking);
        } else {
          setError('Ticket not found');
        }
      } catch (err) {
        logError('Failed to load booking', err);
        setError('Failed to load ticket. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id, user]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(true);
    try {
      await bookingService.cancelBooking(id);
      setBooking((prev) => ({ ...prev, status: 'cancelled' }));
      alert('Booking cancelled successfully');
    } catch (err) {
      logError('Failed to cancel booking', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || 'Ticket not found'}</p>
        <Button onClick={() => navigate('/tickets')}>Back to Tickets</Button>
      </div>
    );
  }

  const schedule = booking.schedule || {};
  const route = schedule.route || {};
  const bus = schedule.bus || {};
  const company = bus.company || {};

  // Transform booking data for ticketService format
  const transformBookingForTicket = () => {
    if (!booking) return null;
    
    return {
      id: booking.id,
      booking_reference: booking.booking_reference || `BK${booking.id.substring(0, 8).toUpperCase()}`,
      passenger_name: booking.passenger_name || booking.user?.name || 'Passenger',
      passenger_phone: booking.passenger_phone || booking.user?.phone || '',
      passenger_email: booking.passenger_email || booking.user?.email || '',
      seat_number: booking.seats?.[0] || booking.seat_number || 'N/A',
      total_amount: booking.total_price || booking.total_amount || 0,
      payment_status: booking.payment_status || booking.status || 'pending',
      payment_method: booking.payment_method || 'card',
      trips: {
        departure_time: schedule.departure_time || booking.created_at,
        arrival_time: schedule.arrival_time,
        price: schedule.price || booking.total_price || 0,
        routes: {
          origin: route.origin || '',
          destination: route.destination || '',
          distance_km: route.distance_km,
          duration_minutes: route.duration_minutes,
        },
        buses: bus || {},
      },
    };
  };

  const ticketBookingData = transformBookingForTicket();

  return (
    <div className={styles.ticketViewScreen}>
      <div className={styles.ticketViewHeader}>
        <button className={styles.backButton} onClick={() => navigate('/tickets')}>
          ← Back
        </button>
        <h1>Ticket Details</h1>
      </div>

      <div className={styles.ticketViewContent}>
        <div className={styles.ticketCard}>
          <div className={styles.ticketHeader}>
            <div className={styles.companyInfo}>
              <span className={styles.companyLogo}>{company.logo || '🚌'}</span>
              <div>
                <div className={styles.companyName}>{company.name || 'Bus Company'}</div>
                <div className={styles.bookingRef}>Booking #{booking.id}</div>
              </div>
            </div>
            <div className={`${styles.statusBadge} ${styles[booking.status]}`}>
              {booking.status || 'confirmed'}
            </div>
          </div>

          <div className={styles.ticketRoute}>
            <div className={styles.routePoint}>
              <span className={styles.city}>{route.origin || 'Origin'}</span>
              <span className={styles.time}>{schedule.departure_time || 'N/A'}</span>
            </div>
            <div className={styles.routeLine}>
              <span className={styles.arrow}>→</span>
              <span className={styles.duration}>{schedule.duration || 'N/A'}</span>
            </div>
            <div className={styles.routePoint}>
              <span className={styles.city}>{route.destination || 'Destination'}</span>
              <span className={styles.time}>{schedule.arrival_time || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.ticketDetails}>
            <div className={styles.detailRow}>
              <span>Date</span>
              <span>{formatDate(schedule.departure_time || booking.created_at)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Seats</span>
              <span>{booking.seats?.join(', ') || 'N/A'}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Total Price</span>
              <span className={styles.price}>P{booking.total_price?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <QRCodeDisplay
            bookingId={booking.id}
            route={route}
            seats={booking.seats}
          />

          {ticketBookingData && (
            <div className={styles.ticketDownloadSection}>
              <TicketDownload
                bookingData={ticketBookingData}
                variant="card"
                showPrint={true}
                showShare={true}
                showEmail={false}
              />
            </div>
          )}

          {booking.status !== 'cancelled' && (
            <div className={styles.ticketActions}>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketView;
