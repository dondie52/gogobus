import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './Auth.module.css';

const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resendVerificationEmail } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Try to get email from localStorage if not in state
  useEffect(() => {
    if (!email) {
      try {
        const signupData = localStorage.getItem('gogobus_signupData');
        if (signupData) {
          const data = JSON.parse(signupData);
          if (data.email) {
            setEmail(data.email);
          }
        }
      } catch (err) {
        console.error('Error reading signup data:', err);
      }
    }
  }, [email]);

  const handleResend = async () => {
    if (!email) {
      setError('Email address is required to resend verification email');
      return;
    }

    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authScreen}>
      {/* Hero Header */}
      <div className={styles.authHero}>
        <div 
          className={styles.heroBackground}
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80)' }}
        >
          <div className={styles.heroOverlay}></div>
        </div>
        
        <div className={styles.heroContent}>
          <button 
            className={styles.backBtn} 
            onClick={() => navigate('/signup')} 
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className={styles.heroLogo}>
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="10" width="32" height="20" rx="5" fill="#F5A623"/>
              <rect x="7" y="13" width="8" height="6" rx="1.5" fill="#1B4D4A"/>
              <rect x="17" y="13" width="8" height="6" rx="1.5" fill="#1B4D4A"/>
              <rect x="27" y="13" width="6" height="10" rx="1.5" fill="#87CEEB"/>
              <circle cx="12" cy="30" r="4" fill="#333"/>
              <circle cx="28" cy="30" r="4" fill="#333"/>
              <circle cx="12" cy="30" r="2" fill="#666"/>
              <circle cx="28" cy="30" r="2" fill="#666"/>
            </svg>
            <span>GOGOBUS</span>
          </div>
          
          <div className={styles.heroText}>
            <h1>Check Your Email</h1>
            <p>We've sent you a verification link</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles.authContainer} ${isLoaded ? styles.loaded : ''}`}>
        <div className={styles.checkEmailContent}>
          {/* Email Icon */}
          <div className={styles.emailIconContainer}>
            <div className={styles.emailIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="#F5A623" strokeWidth="2"/>
                <path d="M2 7L12 13L22 7" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Main Message */}
          <div className={styles.checkEmailMessage}>
            <h2>Please check your email</h2>
            <p>
              We've sent a verification email to:
            </p>
            {email && (
              <div className={styles.emailDisplay}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                  <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <strong>{email}</strong>
              </div>
            )}
            <p className={styles.instructions}>
              Click the verification link in the email to activate your account. 
              The link will expire in 24 hours.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.errorMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Success Message */}
          {resendSuccess && (
            <div className={styles.successMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Verification email sent! Please check your inbox.
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.checkEmailActions}>
            <Button
              onClick={handleResend}
              disabled={resending || !email}
              className={styles.resendButton}
            >
              {resending ? (
                <span className={styles.loadingState}>
                  <LoadingSpinner size="small" />
                  <span>Sending...</span>
                </span>
              ) : (
                <span className={styles.buttonContent}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L10.89 13.26C11.2187 13.4793 11.6049 13.5963 12 13.5963C12.3951 13.5963 12.7813 13.4793 13.11 13.26L21 8M5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7C21 6.46957 20.7893 5.96086 20.4142 5.58579C20.0391 5.21071 19.5304 5 19 5H5C4.46957 5 3.96086 5.21071 3.58579 5.58579C3.21071 5.96086 3 6.46957 3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Resend Verification Email</span>
                </span>
              )}
            </Button>

            <Link to="/login" className={styles.backToLogin}>
              Back to Sign In
            </Link>
          </div>

          {/* Help Text */}
          <div className={styles.helpText}>
            <p>
              <strong>Didn't receive the email?</strong>
            </p>
            <ul>
              <li>Check your spam or junk folder</li>
              <li>Make sure you entered the correct email address</li>
              <li>Wait a few minutes and try resending</li>
              <li>Contact support if you continue to have issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
