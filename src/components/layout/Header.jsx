import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/home" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="20" width="6" height="25" rx="3" fill="#F5A623"/>
              <rect x="18" y="12" width="6" height="33" rx="3" fill="#F5A623"/>
              <rect x="28" y="8" width="6" height="37" rx="3" fill="#F5A623"/>
              <rect x="38" y="15" width="6" height="30" rx="3" fill="#F5A623"/>
              <rect x="48" y="22" width="6" height="23" rx="3" fill="#F5A623"/>
            </svg>
          </div>
          <h1 className={styles.logoText}>GOGOBUS</h1>
        </Link>
        <nav className={styles.nav}>
          {user && (
            <>
              <Link to="/home" className={styles.navLink}>Home</Link>
              <Link to="/tickets" className={styles.navLink}>My Tickets</Link>
              <Link to="/profile" className={styles.navLink}>Profile</Link>
            </>
          )}
          <button onClick={toggleTheme} className={styles.themeToggle} aria-label="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <Button variant="outline" size="small" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
