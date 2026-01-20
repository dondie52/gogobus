import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePages.module.css';

const SavedRoutes = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePageHeader}>
        <button className={styles.backButton} onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1>Saved Routes</h1>
      </div>
      <div className={styles.profilePageContent}>
        <p>Saved routes feature coming soon...</p>
      </div>
    </div>
  );
};

export default SavedRoutes;
