import React from 'react';
import styles from './TicketTabs.module.css';

const TicketTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className={styles.ticketTabs}>
      <button
        className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
        onClick={() => onTabChange('upcoming')}
      >
        Upcoming
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
        onClick={() => onTabChange('past')}
      >
        Past
      </button>
    </div>
  );
};

export default TicketTabs;
