import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import styles from './ProfilePages.module.css';

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePageHeader}>
        <button className={styles.backButton} onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1>Settings</h1>
      </div>
      <div className={styles.profilePageContent}>
        <div className={styles.settingsSection}>
          <h2>Appearance</h2>
          <div className={styles.settingItem}>
            <span>Dark Mode</span>
            <button
              className={styles.toggleButton}
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2>Account</h2>
          <div className={styles.settingItem}>
            <span>Language</span>
            <select className={styles.select} defaultValue="en">
              <option value="en">English</option>
              <option value="tn">Setswana</option>
            </select>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2>Actions</h2>
          <Button variant="outline" onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
