import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePages.module.css';

const TravelPreferences = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePageHeader}>
        <button className={styles.backButton} onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1>Travel Preferences</h1>
      </div>
      <div className={styles.profilePageContent}>
        <p>Travel preferences feature coming soon...</p>
      </div>
    </div>
  );
};

export default TravelPreferences;
