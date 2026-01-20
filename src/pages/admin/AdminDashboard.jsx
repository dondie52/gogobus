import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import chatService from '../../services/chatService';
import { logError } from '../../utils/logger';
import styles from './AdminDashboard.module.css';

// ==================== ICONS ====================
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Bus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
  Route: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>
    </svg>
  ),
  Booking: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m22 21-3-3m1.5-3.5a4 4 0 1 0-5.5 5.5"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Scan: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Chat: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
};

// ==================== BOTSWANA CITIES ====================
const cities = ['Gaborone', 'Francistown', 'Maun', 'Kasane', 'Serowe', 'Mahalapye', 'Palapye', 'Nata', 'Lobatse', 'Selebi-Phikwe', 'Molepolole', 'Kanye'];

// ==================== HELPER FUNCTIONS ====================
const formatCurrency = (amount) => `P${Number(amount || 0).toLocaleString('en-BW', { minimumFractionDigits: 2 })}`;

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-BW', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// ==================== MODAL COMPONENT ====================
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <Icons.X />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
};

// ==================== TOAST COMPONENT ====================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return <div className={`${styles.toast} ${styles[type]}`}>{message}</div>;
};

// ==================== LOADING SKELETON ====================
const Skeleton = ({ width = '100%', height = '20px' }) => (
  <div className={styles.skeleton} style={{ width, height }} />
);

// ==================== EMPTY STATE ====================
const EmptyState = ({ icon: Icon, title, description, actionButton }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyStateIcon}><Icon /></div>
    <div className={styles.emptyStateTitle}>{title}</div>
    <div className={styles.emptyStateText}>{description}</div>
    {actionButton && <div className={styles.emptyStateAction}>{actionButton}</div>}
  </div>
);

// ==================== DASHBOARD PAGE ====================
const DashboardPage = ({ showToast, onNavigateToTrips }) => {
  const [stats, setStats] = useState(null);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [recentTrips, setRecentTrips] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsRes, routesRes, tripsRes, bookingsRes] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getPopularRoutes(4),
        adminService.getTrips({ upcoming: true }),
        adminService.getBookings({})
      ]);

      // Check each response for errors
      if (statsRes.error) {
        throw new Error(`Failed to load stats: ${statsRes.error.message || statsRes.error}`);
      }
      if (routesRes.error) {
        // Don't throw for popular routes, just log (non-fatal)
      }
      if (tripsRes.error) {
        // Don't throw for trips, just log (non-fatal)
      }
      if (bookingsRes.error) {
        // Don't throw for bookings, just log (non-fatal)
      }

      setStats(statsRes.data);
      setPopularRoutes(routesRes.data || []);
      setRecentTrips((tripsRes.data || []).slice(0, 5));
      setRecentBookings((bookingsRes.data || []).slice(0, 5));
    } catch (err) {
      logError('Dashboard fetch error', err);
      const errorMessage = err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates
    const bookingsSub = adminService.subscribeToBookings(() => {
      fetchData();
    });

    return () => {
      bookingsSub?.unsubscribe();
    };
  }, [fetchData]);

  // Format time filter label
  const getTimeFilterLabel = () => {
    const labels = {
      week: 'This Week',
      month: 'This Month',
      days30: 'Last 30 Days'
    };
    return labels[timeFilter] || 'This Week';
  };

  // Primary stat cards (Bookings & Revenue) - first row
  const primaryStatCards = [
    { 
      label: `Bookings ${getTimeFilterLabel()}`, 
      value: stats?.bookings_this_week || 0, 
      type: 'bookings', 
      icon: <Icons.Booking />
    },
    { 
      label: `${getTimeFilterLabel()} Revenue`, 
      value: formatCurrency(stats?.revenue_this_week), 
      type: 'revenue', 
      icon: <Icons.TrendUp /> 
    },
  ];

  // Secondary stat cards (Trips & Routes) - second row
  const secondaryStatCards = [
    { label: 'Active Trips', value: stats?.active_trips || 0, type: 'trips', icon: <Icons.Bus /> },
    { label: 'Total Routes', value: stats?.total_routes || 0, type: 'routes', icon: <Icons.Route /> },
  ];

  const maxBookings = Math.max(...popularRoutes.map(r => r.bookings), 1);

  if (loading) {
    return (
      <div className={styles.dashboardLoading}>
        <div className={styles.statsGridPrimary}>
          {[1, 2].map(i => (
            <div key={i} className={styles.statCard}>
              <Skeleton width="48px" height="48px" />
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="32px" />
            </div>
          ))}
        </div>
        <div className={styles.statsGridSecondary}>
          {[3, 4].map(i => (
            <div key={i} className={styles.statCard}>
              <Skeleton width="48px" height="48px" />
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="32px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <Icons.AlertCircle />
        <p>{error}</p>
        <button className={styles.btnPrimary} onClick={fetchData}>
          <Icons.Refresh /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Time Filter */}
      <div className={styles.timeFilterBar}>
        <button
          className={`${styles.timeFilterBtn} ${timeFilter === 'week' ? styles.active : ''}`}
          onClick={() => setTimeFilter('week')}
        >
          This Week
        </button>
        <button
          className={`${styles.timeFilterBtn} ${timeFilter === 'month' ? styles.active : ''}`}
          onClick={() => setTimeFilter('month')}
        >
          This Month
        </button>
        <button
          className={`${styles.timeFilterBtn} ${timeFilter === 'days30' ? styles.active : ''}`}
          onClick={() => setTimeFilter('days30')}
        >
          Last 30 Days
        </button>
      </div>

      {/* Primary Stats (Bookings & Revenue) - First Row */}
      <div className={styles.statsGridPrimary}>
        {primaryStatCards.map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${styles[stat.type]} ${styles.primaryStat}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
            {stat.hint && <div className={styles.statHint}>{stat.hint}</div>}
          </div>
        ))}
      </div>

      {/* Secondary Stats (Trips & Routes) - Second Row */}
      <div className={styles.statsGridSecondary}>
        {secondaryStatCards.map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${styles[stat.type]}`}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Upcoming Trips</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={fetchData}>
                <Icons.Refresh /> Refresh
              </button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
                onClick={() => onNavigateToTrips && onNavigateToTrips()}
              >
                <Icons.Plus /> Create Trip
              </button>
            </div>
          </div>
          <div className={styles.cardBody}>
            {recentTrips.length === 0 ? (
              <EmptyState icon={Icons.Bus} title="No upcoming trips" description="Create a trip to get started" />
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map(trip => (
                      <tr key={trip.id}>
                        <td className={styles.fontSemibold}>
                          {trip.routes?.origin} → {trip.routes?.destination}
                        </td>
                        <td>{formatDate(trip.departure_time)}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[trip.status]}`}>
                            {trip.status === 'scheduled' ? 'On time' : trip.status === 'boarding' ? 'Boarding' : trip.status === 'departed' ? 'Delayed' : trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Popular Routes</h3>
          </div>
          <div className={styles.routesChart}>
            {popularRoutes.length === 0 ? (
              <EmptyState icon={Icons.Route} title="No data yet" description="Bookings will appear here" />
            ) : (
              popularRoutes.map((route, index) => (
                <div key={index} className={styles.routeItem}>
                  <div className={styles.routeInfo}>
                    <div className={styles.routeName}>{route.name}</div>
                    <div className={styles.routeBar}>
                      <div 
                        className={`${styles.routeBarFill} ${styles[['primary', 'accent', 'info', 'success'][index % 4]]}`}
                        style={{ width: `${(route.bookings / maxBookings) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className={styles.routeValue}>{route.bookings}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Bookings</h3>
        </div>
        <div className={styles.cardBody}>
          {recentBookings.length === 0 ? (
            <EmptyState 
              icon={Icons.Booking} 
              title="No bookings yet" 
              description="No bookings yet. Once customers book from the app, you'll see them here." 
            />
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Passenger</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(booking => (
                    <tr key={booking.id}>
                      <td className={styles.bookingRef}>{booking.booking_reference}</td>
                      <td>{booking.passenger_name}</td>
                      <td>{booking.trips?.routes?.origin} → {booking.trips?.routes?.destination}</td>
                      <td><span className={`${styles.badge} ${styles[booking.payment_status]}`}>{booking.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ==================== TRIPS PAGE ====================
const TripsPage = ({ showToast }) => {
  const [trips, setTrips] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    route_id: '',
    bus_id: '',
    departure_time: '',
    price: '',
    total_seats: '45'
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripsRes, routesRes, busesRes] = await Promise.all([
        adminService.getTrips(filterStatus !== 'all' ? { status: filterStatus } : {}),
        adminService.getRoutes(),
        adminService.getBuses()
      ]);
      
      setTrips(tripsRes.data || []);
      setRoutes(routesRes.data || []);
      setBuses(busesRes.data || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load trips';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (trip = null) => {
    if (trip) {
      setEditingTrip(trip);
      setFormData({
        route_id: trip.route_id,
        bus_id: trip.bus_id || '',
        departure_time: trip.departure_time?.slice(0, 16) || '',
        price: trip.price?.toString() || '',
        total_seats: trip.total_seats?.toString() || '45'
      });
    } else {
      setEditingTrip(null);
      setFormData({ route_id: '', bus_id: '', departure_time: '', price: '', total_seats: '45' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.route_id || !formData.departure_time || !formData.price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      // Validate bus_id: must be a valid UUID or null (since bus operators are display-only)
      const { validateUUID } = await import('../../utils/validation');
      const validatedBusId = (formData.bus_id && validateUUID(formData.bus_id)) ? formData.bus_id : null;
      const selectedRoute = routes.find(r => r.id === formData.route_id);
      const departureTime = new Date(formData.departure_time);
      // Calculate arrival_time from departure_time + route duration (default 5 hours if duration missing)
      const durationMinutes = selectedRoute?.duration_minutes || 300; // 5 hours default
      const arrivalTime = new Date(departureTime.getTime() + durationMinutes * 60000);
      
      const tripData = {
        route_id: formData.route_id,
        bus_id: validatedBusId,
        departure_time: departureTime.toISOString(),
        arrival_time: arrivalTime.toISOString(),
        price: parseFloat(formData.price),
        total_seats: parseInt(formData.total_seats)
      };

      if (editingTrip) {
        const { error } = await adminService.updateTrip(editingTrip.id, tripData);
        if (error) throw error;
        showToast('Trip updated successfully', 'success');
      } else {
        const { error } = await adminService.createTrip(tripData);
        if (error) throw error;
        showToast('Trip created successfully', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      logError('Failed to save trip', err);
      showToast(err.message || 'Failed to save trip', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;

    try {
      const { error, cancelled } = await adminService.deleteTrip(id);
      if (error) throw error;
      
      showToast(cancelled ? 'Trip cancelled (has bookings)' : 'Trip deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete trip', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const { error } = await adminService.updateTripStatus(id, status);
      if (error) throw error;
      showToast('Trip status updated', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <>
      <div className={styles.filterBar}>
        <select 
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="boarding">Boarding</option>
          <option value="departed">Departed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div style={{ flex: 1 }} />
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={fetchData}>
          <Icons.Refresh />
        </button>
        <button className={`${styles.btn} ${styles.btnAccent}`} onClick={() => openModal()}>
          <Icons.Plus /> Create Trip
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingState}>Loading trips...</div>
          ) : error ? (
            <div className={styles.errorState}>
              <Icons.AlertCircle />
              <p>Could not load trips. {error}</p>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchData}>
                <Icons.Refresh /> Retry
              </button>
            </div>
          ) : trips.length === 0 ? (
            <EmptyState 
              icon={Icons.Bus} 
              title="No trips found" 
              description="Create your first trip to start selling tickets on this route."
              actionButton={
                <button 
                  className={`${styles.btn} ${styles.btnAccent} ${styles.btnSm}`} 
                  onClick={() => openModal()}
                >
                  <Icons.Plus /> Create Trip
                </button>
              }
            />
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map(trip => (
                    <tr key={trip.id}>
                      <td className={styles.fontSemibold}>
                        {trip.routes?.origin} → {trip.routes?.destination}
                      </td>
                      <td>{formatDate(trip.departure_time)}</td>
                      <td>{formatCurrency(trip.price)}</td>
                      <td>{trip.available_seats}/{trip.total_seats}</td>
                      <td>
                        <select
                          className={`${styles.statusSelect} ${styles[trip.status]}`}
                          value={trip.status}
                          onChange={(e) => handleStatusChange(trip.id, e.target.value)}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="boarding">Boarding</option>
                          <option value="departed">Departed</option>
                          <option value="arrived">Arrived</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.btnIcon} onClick={() => openModal(trip)}>
                            <Icons.Edit />
                          </button>
                          <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => handleDelete(trip.id)}>
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTrip ? 'Edit Trip' : 'Create New Trip'}
        footer={
          <>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingTrip ? 'Update Trip' : 'Create Trip'}
            </button>
          </>
        }
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Route *</label>
          <select 
            className={styles.formInput}
            value={formData.route_id}
            onChange={(e) => setFormData({ ...formData, route_id: e.target.value })}
          >
            <option value="">Select Route</option>
            {routes.map(route => (
              <option key={route.id} value={route.id}>
                {route.origin} → {route.destination} ({formatCurrency(route.base_price)})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Bus (Optional)</label>
          <select 
            className={styles.formInput}
            value={formData.bus_id}
            onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
          >
            <option value="">Select Bus</option>
            <optgroup label="🚍 Major Botswana Bus & Coach Operators">
              <option value="nkk_express">NKK Express</option>
              <option value="att_monnakgotla">AT & T Monnakgotla Transport</option>
              <option value="seabelo_express">Seabelo Express</option>
              <option value="mahube_express">Mahube & Sons Express / Mahube Express</option>
              <option value="w_khanda">W Khanda Bus Services</option>
              <option value="golden_bridge">Golden Bridge Express</option>
              <option value="mokoka_express">Mokoka Express</option>
              <option value="bamangwato">Bamangwato Coach Tours</option>
              <option value="city_bus">City Bus Coaches</option>
              <option value="flight_connect">Flight Connect (Bus Service)</option>
            </optgroup>
            <optgroup label="🚌 Regional / Cross-Border Operators">
              <option value="intercape">Intercape</option>
              <option value="hope_diamond">Hope Diamond Transport</option>
            </optgroup>
            {buses.length > 0 && (
              <optgroup label="Registered Buses">
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>
                    {bus.bus_name} ({bus.registration_number}) - {bus.total_seats} seats
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Departure Date & Time *</label>
          <input 
            type="datetime-local"
            className={styles.formInput}
            value={formData.departure_time}
            onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Price (BWP) *</label>
            <input 
              type="number"
              className={styles.formInput}
              placeholder="450"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Total Seats</label>
            <input 
              type="number"
              className={styles.formInput}
              placeholder="45"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

// ==================== BOOKINGS PAGE ====================
const BookingsPage = ({ showToast }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (filterStatus !== 'all') filters.paymentStatus = filterStatus;
      if (searchQuery) filters.search = searchQuery;

      const { data, error } = await adminService.getBookings(filters);
      if (error) throw error;
      setBookings(data || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load bookings';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchQuery, showToast]);

  useEffect(() => {
    fetchData();

    const subscription = adminService.subscribeToBookings(() => {
      fetchData();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchData]);

  const toggleBoarded = async (booking) => {
    try {
      if (booking.is_boarded) {
        await adminService.unmarkAsBoarded(booking.id);
      } else {
        await adminService.markAsBoarded(booking.id);
      }
      showToast('Boarding status updated', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to update boarding status', 'error');
    }
  };

  const handleExport = async () => {
    try {
      const csv = await adminService.exportBookingsToCSV({ paymentStatus: filterStatus !== 'all' ? filterStatus : undefined });
      if (!csv) {
        showToast('No bookings to export', 'error');
        return;
      }

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Bookings exported successfully', 'success');
    } catch (err) {
      showToast('Failed to export bookings', 'error');
    }
  };

  return (
    <>
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Icons.Search />
          <input 
            type="text"
            placeholder="Search by name, phone, or reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          />
        </div>
        <select 
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleExport}>
          <Icons.Download /> Export CSV
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingState}>Loading bookings...</div>
          ) : error ? (
            <div className={styles.errorState}>
              <Icons.AlertCircle />
              <p>Could not load bookings. {error}</p>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchData}>
                <Icons.Refresh /> Retry
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState 
              icon={Icons.Booking} 
              title="No bookings found" 
              description="When customers book, their tickets will appear here. You can filter by trip, status, or phone number."
            />
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Passenger</th>
                    <th>Phone</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Seat</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Boarded</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td className={styles.bookingRef}>{booking.booking_reference}</td>
                      <td className={styles.fontSemibold}>{booking.passenger_name}</td>
                      <td>{booking.passenger_phone}</td>
                      <td>{booking.trips?.routes?.origin} → {booking.trips?.routes?.destination}</td>
                      <td>{formatDate(booking.trips?.departure_time)}</td>
                      <td><span className={styles.seatBadge}>{booking.seat_number}</span></td>
                      <td>{formatCurrency(booking.total_amount)}</td>
                      <td><span className={`${styles.badge} ${styles[booking.payment_status]}`}>{booking.payment_status}</span></td>
                      <td>
                        <div 
                          className={styles.checkboxWrapper}
                          onClick={() => toggleBoarded(booking)}
                        >
                          <div className={`${styles.checkbox} ${booking.is_boarded ? styles.checked : ''}`}>
                            {booking.is_boarded && <Icons.Check />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// ==================== ROUTES PAGE ====================
const RoutesPage = ({ showToast }) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    distance_km: '',
    duration_minutes: '',
    base_price: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await adminService.getRoutes(true);
      if (error) throw error;
      setRoutes(data || []);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load routes';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openModal = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setFormData({
        origin: route.origin,
        destination: route.destination,
        distance_km: route.distance_km?.toString() || '',
        duration_minutes: route.duration_minutes?.toString() || '',
        base_price: route.base_price?.toString() || ''
      });
    } else {
      setEditingRoute(null);
      setFormData({ origin: '', destination: '', distance_km: '', duration_minutes: '', base_price: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.origin || !formData.destination || !formData.base_price) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (formData.origin === formData.destination) {
      showToast('Origin and destination must be different', 'error');
      return;
    }

    setSaving(true);
    try {
      const routeData = {
        origin: formData.origin,
        destination: formData.destination,
        distance_km: formData.distance_km ? parseFloat(formData.distance_km) : null,
        duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
        base_price: parseFloat(formData.base_price)
      };

      if (editingRoute) {
        const { error } = await adminService.updateRoute(editingRoute.id, routeData);
        if (error) throw error;
        showToast('Route updated successfully', 'success');
      } else {
        const { error } = await adminService.createRoute(routeData);
        if (error) throw error;
        showToast('Route created successfully', 'success');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to save route', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      const { error } = await adminService.deleteRoute(id);
      if (error) throw error;
      showToast('Route deleted', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to delete route', 'error');
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRoutes = [...routes].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let aVal, bVal;
    if (sortColumn === 'distance') {
      aVal = a.distance_km || 0;
      bVal = b.distance_km || 0;
    } else if (sortColumn === 'duration') {
      aVal = a.duration_minutes || 0;
      bVal = b.duration_minutes || 0;
    } else {
      return 0;
    }

    if (sortDirection === 'asc') {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  return (
    <>
      <div className={styles.filterBar}>
        <div style={{ flex: 1 }} />
        <button className={`${styles.btn} ${styles.btnOutline}`} onClick={fetchData}>
          <Icons.Refresh />
        </button>
        <button className={`${styles.btn} ${styles.btnAccent}`} onClick={() => openModal()}>
          <Icons.Plus /> Add Route
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.cardBody}>
          {loading ? (
            <div className={styles.loadingState}>Loading routes...</div>
          ) : error ? (
            <div className={styles.errorState}>
              <Icons.AlertCircle />
              <p>Could not load routes. {error}</p>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={fetchData}>
                <Icons.Refresh /> Retry
              </button>
            </div>
          ) : routes.length === 0 ? (
            <EmptyState icon={Icons.Route} title="No routes found" description="Add your first route to get started" />
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => handleSort('distance')}
                      title="Click to sort"
                    >
                      Distance
                      {sortColumn === 'distance' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      {sortColumn !== 'distance' && (
                        <span className={`${styles.sortIcon} ${styles.sortIconHidden}`}>↑↓</span>
                      )}
                    </th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => handleSort('duration')}
                      title="Click to sort"
                    >
                      Duration
                      {sortColumn === 'duration' && (
                        <span className={styles.sortIcon}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                      {sortColumn !== 'duration' && (
                        <span className={`${styles.sortIcon} ${styles.sortIconHidden}`}>↑↓</span>
                      )}
                    </th>
                    <th>Base Fare</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedRoutes.map(route => (
                    <tr key={route.id} className={!route.is_active ? styles.inactive : ''}>
                      <td className={styles.fontSemibold}>{route.origin}</td>
                      <td className={styles.fontSemibold}>{route.destination}</td>
                      <td>{route.distance_km ? `${route.distance_km} km` : 'N/A'}</td>
                      <td>{formatDuration(route.duration_minutes)}</td>
                      <td>{route.base_price ? formatCurrency(route.base_price) : 'N/A'}</td>
                      <td>
                        <span className={`${styles.badge} ${route.is_active ? styles.active : styles.inactive}`}>
                          {route.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button className={styles.btnIcon} onClick={() => openModal(route)}>
                            <Icons.Edit />
                          </button>
                          <button className={`${styles.btnIcon} ${styles.danger}`} onClick={() => handleDelete(route.id)}>
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        footer={
          <>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingRoute ? 'Update Route' : 'Add Route'}
            </button>
          </>
        }
      >
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Origin *</label>
            <select 
              className={styles.formInput}
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Destination *</label>
            <select 
              className={styles.formInput}
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Distance (km)</label>
            <input 
              type="number"
              className={styles.formInput}
              placeholder="e.g., 430"
              value={formData.distance_km}
              onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Duration (minutes)</label>
            <input 
              type="number"
              className={styles.formInput}
              placeholder="e.g., 300"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Base Price (BWP) *</label>
          <input 
            type="number"
            className={styles.formInput}
            placeholder="320"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
          />
        </div>
      </Modal>
    </>
  );
};

// ==================== SETTINGS PAGE ====================
const SettingsPage = ({ showToast }) => {
  const [settings, setSettings] = useState({
    company_name: '',
    support_phone: '',
    support_email: '',
    booking_enabled: true,
    auto_confirm_bookings: false,
    require_payment_upfront: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data, error } = await adminService.getSettings();
        if (error) throw error;
        
        setSettings({
          company_name: data.company_name || 'GOGOBUS Botswana',
          support_phone: data.support_phone || '+267 12 345 678',
          support_email: data.support_email || 'support@gogobus.co.bw',
          booking_enabled: data.booking_enabled !== false,
          auto_confirm_bookings: data.auto_confirm_bookings === true,
          require_payment_upfront: data.require_payment_upfront !== false
        });
      } catch (err) {
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await adminService.updateSettings(settings);
      if (error) throw error;
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ active, onClick, disabled }) => (
    <div 
      className={`${styles.toggle} ${active ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      onClick={disabled ? undefined : onClick}
    />
  );

  if (loading) {
    return <div className={styles.loadingState}>Loading settings...</div>;
  }

  return (
    <>
      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>Company Information</h3>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Company Name</label>
          <input 
            type="text"
            className={styles.formInput}
            value={settings.company_name}
            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Support Phone</label>
            <input 
              type="text"
              className={styles.formInput}
              value={settings.support_phone}
              onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Support Email</label>
            <input 
              type="email"
              className={styles.formInput}
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className={styles.settingsSection}>
        <h3 className={styles.settingsSectionTitle}>Booking Settings</h3>
        
        <div className={styles.settingsRow}>
          <div>
            <div className={styles.settingsLabel}>Enable Bookings</div>
            <div className={styles.settingsDescription}>Allow customers to make new bookings</div>
          </div>
          <Toggle 
            active={settings.booking_enabled}
            onClick={() => setSettings({ ...settings, booking_enabled: !settings.booking_enabled })}
          />
        </div>

        <div className={styles.settingsRow}>
          <div>
            <div className={styles.settingsLabel}>Auto-confirm Bookings</div>
            <div className={styles.settingsDescription}>Automatically confirm bookings without manual review</div>
          </div>
          <Toggle 
            active={settings.auto_confirm_bookings}
            onClick={() => setSettings({ ...settings, auto_confirm_bookings: !settings.auto_confirm_bookings })}
          />
        </div>

        <div className={styles.settingsRow}>
          <div>
            <div className={styles.settingsLabel}>Require Payment Upfront</div>
            <div className={styles.settingsDescription}>Customers must pay before booking is confirmed</div>
          </div>
          <Toggle 
            active={settings.require_payment_upfront}
            onClick={() => setSettings({ ...settings, require_payment_upfront: !settings.require_payment_upfront })}
          />
        </div>
      </div>

      <button 
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </>
  );
};

// ==================== SUPPORT PAGE ====================
const SupportPage = ({ showToast }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationSubRef = useRef(null);
  const messageSubRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchConversations = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.jsx:1484',message:'fetchConversations called',data:{filterStatus,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    setLoading(true);
    try {
      const { data, error } = await chatService.getAllConversations({ status: filterStatus });
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.jsx:1488',message:'fetchConversations result',data:{hasData:!!data,dataLength:data?.length||0,hasError:!!error,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (error) throw error;
      setConversations(data || []);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.jsx:1490',message:'Conversations state updated',data:{conversationsCount:data?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (err) {
      logError('Error fetching conversations', err);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AdminDashboard.jsx:1492',message:'fetchConversations error caught',data:{errorMessage:err.message,errorStack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      showToast('Failed to load conversations', 'error');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, showToast, user?.id]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const { data, error } = await chatService.getMessages(conversationId);
      if (error) throw error;
      setMessages(data || []);
      // Mark messages as read
      await chatService.markMessagesAsRead(conversationId, 'admin');
      // Refresh conversations to update unread counts
      fetchConversations();
    } catch (err) {
      logError('Error fetching messages', err);
    }
  }, [fetchConversations]);

  // Initial load
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to conversation updates
  useEffect(() => {
    conversationSubRef.current = chatService.subscribeToConversations(() => {
      fetchConversations();
    });

    return () => {
      if (conversationSubRef.current) {
        chatService.unsubscribe(conversationSubRef.current);
      }
    };
  }, [fetchConversations]);

  // Subscribe to messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation?.id) return;

    fetchMessages(selectedConversation.id);

    messageSubRef.current = chatService.subscribeToMessages(
      selectedConversation.id,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        // Mark as read if from user
        if (newMsg.sender_type === 'user') {
          chatService.markMessagesAsRead(selectedConversation.id, 'admin');
          fetchConversations();
        }
        scrollToBottom();
      }
    );

    return () => {
      if (messageSubRef.current) {
        chatService.unsubscribe(messageSubRef.current);
      }
    };
  }, [selectedConversation?.id, fetchMessages, fetchConversations, scrollToBottom]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedConversation]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.id || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await chatService.sendMessage(
        selectedConversation.id,
        user.id,
        messageContent,
        'admin'
      );

      if (error) {
        setNewMessage(messageContent);
        showToast('Failed to send message', 'error');
      }
    } catch (err) {
      setNewMessage(messageContent);
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleCloseConversation = async (conversationId) => {
    try {
      const { error } = await chatService.closeConversation(conversationId, user.id);
      if (error) throw error;
      showToast('Conversation closed', 'success');
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
      fetchConversations();
    } catch (err) {
      showToast('Failed to close conversation', 'error');
    }
  };

  const handleReopenConversation = async (conversationId) => {
    try {
      const { error } = await chatService.reopenConversation(conversationId);
      if (error) throw error;
      showToast('Conversation reopened', 'success');
      fetchConversations();
    } catch (err) {
      showToast('Failed to reopen conversation', 'error');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div className={styles.supportContainer}>
      {/* Conversations List */}
      <div className={styles.conversationsList}>
        <div className={styles.conversationsHeader}>
          <h3>Conversations</h3>
          {totalUnread > 0 && (
            <span className={styles.totalUnreadBadge}>{totalUnread}</span>
          )}
        </div>
        
        <div className={styles.conversationsFilter}>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          <button className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`} onClick={fetchConversations}>
            <Icons.Refresh />
          </button>
        </div>

        <div className={styles.conversationsBody}>
          {loading ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : conversations.length === 0 ? (
            <div className={styles.emptyConversations}>
              <Icons.Chat />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${selectedConversation?.id === conv.id ? styles.selected : ''} ${conv.status === 'closed' ? styles.closed : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className={styles.conversationAvatar}>
                  {conv.user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className={styles.conversationInfo}>
                  <div className={styles.conversationName}>
                    {conv.user?.full_name || 'Unknown User'}
                    {conv.unread_count > 0 && (
                      <span className={styles.unreadBadge}>{conv.unread_count}</span>
                    )}
                  </div>
                  <div className={styles.conversationMeta}>
                    <span className={`${styles.statusDot} ${styles[conv.status]}`} />
                    {conv.user?.phone_number || 'No phone'}
                  </div>
                </div>
                <div className={styles.conversationTime}>
                  {formatTime(conv.updated_at)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {selectedConversation ? (
          <>
            <div className={styles.chatHeader}>
              <div className={styles.chatHeaderInfo}>
                <div className={styles.chatHeaderAvatar}>
                  {selectedConversation.user?.full_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h4>{selectedConversation.user?.full_name || 'Unknown User'}</h4>
                  <span>{selectedConversation.user?.phone_number || 'No phone'}</span>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                {selectedConversation.status === 'open' ? (
                  <button
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
                    onClick={() => handleCloseConversation(selectedConversation.id)}
                  >
                    <Icons.Check /> Close
                  </button>
                ) : (
                  <button
                    className={`${styles.btn} ${styles.btnAccent} ${styles.btnSm}`}
                    onClick={() => handleReopenConversation(selectedConversation.id)}
                  >
                    <Icons.Refresh /> Reopen
                  </button>
                )}
              </div>
            </div>

            <div className={styles.chatMessages}>
              {messages.length === 0 ? (
                <div className={styles.noMessages}>
                  <Icons.Chat />
                  <p>No messages in this conversation yet</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.chatMessage} ${msg.sender_type === 'admin' ? styles.adminMsg : styles.userMsg}`}
                  >
                    <div className={styles.messageBubble}>
                      <p>{msg.content}</p>
                      <span className={styles.messageTime}>{formatMessageTime(msg.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className={styles.chatInput} onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                placeholder={selectedConversation.status === 'closed' ? 'Reopen to reply...' : 'Type your reply...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending || selectedConversation.status === 'closed'}
              />
              <button
                type="submit"
                className={`${styles.btn} ${styles.btnPrimary}`}
                disabled={!newMessage.trim() || sending || selectedConversation.status === 'closed'}
              >
                {sending ? <Icons.Refresh /> : <Icons.Send />}
              </button>
            </form>
          </>
        ) : (
          <div className={styles.noConversationSelected}>
            <Icons.Chat />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list to start responding</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN ADMIN DASHBOARD ====================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, userProfile, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      showToast('Failed to logout', 'error');
    }
  };

  const [supportUnreadCount, setSupportUnreadCount] = useState(0);

  // Fetch support unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const { count } = await chatService.getAdminUnreadCount();
      setSupportUnreadCount(count);
    };
    fetchUnreadCount();

    // Subscribe to new messages for unread count
    const subscription = chatService.subscribeToAllMessages(() => {
      fetchUnreadCount();
    });

    return () => {
      if (subscription) {
        chatService.unsubscribe(subscription);
      }
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icons.Dashboard /> },
    { id: 'trips', label: 'Trips', icon: <Icons.Bus /> },
    { id: 'routes', label: 'Routes', icon: <Icons.Route /> },
    { id: 'bookings', label: 'Bookings', icon: <Icons.Booking /> },
    { id: 'support', label: 'Support', icon: <Icons.Chat />, badge: supportUnreadCount },
    { id: 'scanner', label: 'Scanner', icon: <Icons.Scan />, action: () => navigate('/admin/scanner') },
    { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
  ];

  const pageTitles = {
    dashboard: 'Dashboard',
    trips: 'Trip Management',
    routes: 'Routes Management',
    bookings: 'Bookings Overview',
    support: 'Customer Support',
    settings: 'Settings'
  };

  const handleNavigateToTrips = () => {
    setActivePage('trips');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage showToast={showToast} onNavigateToTrips={handleNavigateToTrips} />;
      case 'trips': return <TripsPage showToast={showToast} />;
      case 'routes': return <RoutesPage showToast={showToast} />;
      case 'bookings': return <BookingsPage showToast={showToast} />;
      case 'support': return <SupportPage showToast={showToast} />;
      case 'settings': return <SettingsPage showToast={showToast} />;
      default: return <DashboardPage showToast={showToast} onNavigateToTrips={handleNavigateToTrips} />;
    }
  };

  const userInitials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'A';

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.logoIcon}>🚌</div>
            <div>
              <div className={styles.logoText}>GOGO<span>BUS</span></div>
              <div className={styles.logoSubtitle}>Admin Portal</div>
            </div>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <div className={styles.navLabel}>Main Menu</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActivePage(item.id);
                }
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              {item.label}
              {item.badge > 0 && (
                <span className={styles.navBadge}>{item.badge > 9 ? '9+' : item.badge}</span>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>{userInitials}</div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{userProfile?.full_name || 'Admin'}</div>
              <div className={styles.userRole}>{userProfile?.role || 'admin'}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <Icons.Logout />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.topBar}>
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Icons.Menu />
          </button>
          <h1 className={styles.pageTitle}>{pageTitles[activePage]}</h1>
          <div className={styles.topBarActions}>
            <button 
              className={`${styles.btn} ${styles.btnPrimary} ${styles.scannerBtn}`}
              onClick={() => navigate('/admin/scanner')}
            >
              <Icons.Scan /> Scanner
            </button>
          </div>
        </header>

        <div className={styles.contentArea}>
          {renderPage()}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}