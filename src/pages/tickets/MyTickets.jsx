import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import TicketCard from '../../components/tickets/TicketCard';
import TicketTabs from '../../components/tickets/TicketTabs';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logError } from '../../utils/logger';
import styles from './MyTickets.module.css';

const MyTickets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'past' ? 'past' : 'upcoming';
  });
  const [error, setError] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === 'past') {
      newSearchParams.set('tab', 'past');
    } else {
      newSearchParams.delete('tab');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const userBookings = await bookingService.getUserBookings(user.id);
        setBookings(userBookings);
      } catch (err) {
        logError('Failed to load bookings', err);
        setError('Failed to load tickets. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'upcoming') {
      const bookingDate = new Date(booking.schedule?.departure_time || booking.created_at);
      return bookingDate >= new Date() && booking.status !== 'cancelled';
    } else {
      const bookingDate = new Date(booking.schedule?.departure_time || booking.created_at);
      return bookingDate < new Date() || booking.status === 'cancelled';
    }
  });

  const handleTicketClick = (bookingId) => {
    navigate(`/tickets/${bookingId}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.myTicketsScreen}>
      <div className={styles.myTicketsHeader}>
        <h1>My Tickets</h1>
      </div>

      <TicketTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {error ? (
        <div className={styles.errorMessage}>{error}</div>
      ) : filteredBookings.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🎫</div>
          <h3>No {activeTab === 'upcoming' ? 'upcoming' : 'past'} tickets</h3>
          <p>
            {activeTab === 'upcoming'
              ? "You don't have any upcoming trips"
              : "You don't have any past trips"}
          </p>
        </div>
      ) : (
        <div className={styles.ticketsList}>
          {filteredBookings.map((booking) => (
            <TicketCard
              key={booking.id}
              booking={booking}
              onClick={() => handleTicketClick(booking.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
