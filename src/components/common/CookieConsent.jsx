import React, { useState, useEffect } from 'react';
import { initAnalytics } from '../../utils/analytics';
import styles from './CookieConsent.module.css';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie_consent');
    
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted' || consent === 'all') {
      setConsentGiven(true);
      // Initialize GA4 if consent was previously given
      initAnalytics();
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setConsentGiven(true);
    setShowBanner(false);
    // Initialize GA4 after consent
    initAnalytics();
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('cookie_consent', 'necessary');
    setConsentGiven(true);
    setShowBanner(false);
    // Don't initialize GA4 if only necessary cookies
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setConsentGiven(true);
    setShowBanner(false);
    // Don't initialize GA4
  };

  if (!showBanner || consentGiven) {
    return null;
  }

  return (
    <div className={styles.cookieBanner}>
      <div className={styles.cookieContent}>
        <div className={styles.cookieIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.cookieText}>
          <h3 className={styles.cookieTitle}>Cookie Consent</h3>
          <p className={styles.cookieDescription}>
            We use cookies to enhance your experience, analyze site usage, and assist in marketing efforts. 
            By clicking "Accept All", you consent to our use of cookies. You can also choose to accept only 
            necessary cookies. Learn more in our{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.cookieLink}>
              Privacy Policy
            </a>.
          </p>
        </div>
        <div className={styles.cookieActions}>
          <button 
            onClick={handleReject}
            className={styles.rejectButton}
            aria-label="Reject non-essential cookies"
          >
            Reject
          </button>
          <button 
            onClick={handleAcceptNecessary}
            className={styles.necessaryButton}
            aria-label="Accept only necessary cookies"
          >
            Necessary Only
          </button>
          <button 
            onClick={handleAcceptAll}
            className={styles.acceptButton}
            aria-label="Accept all cookies"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
