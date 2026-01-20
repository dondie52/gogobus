import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Notifications.module.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={styles.notificationsScreen}>
      <div className={styles.notificationsHeader}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Notifications</h1>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>{unreadCount} new</span>
        )}
      </div>

      <div className={styles.notificationsContent}>
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔔</div>
            <h2>No notifications</h2>
            <p>You're all caught up! We'll notify you about bookings, promotions, and important updates here.</p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
              >
                <div className={styles.notificationIcon}>
                  {notification.type === 'booking' && '🎫'}
                  {notification.type === 'promotion' && '🎉'}
                  {notification.type === 'reminder' && '⏰'}
                </div>
                <div className={styles.notificationContent}>
                  <h3 className={styles.notificationTitle}>{notification.title}</h3>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <span className={styles.notificationTime}>{notification.time}</span>
                </div>
                {!notification.read && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
