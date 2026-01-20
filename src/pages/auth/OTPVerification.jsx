import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './Auth.module.css';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, sendOTP } = useAuth();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if email is in URL hash (from magic link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      // Magic link authentication - redirect will be handled by auth context
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      navigate('/complete-profile');
    } catch (err) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email is required to resend code');
      return;
    }

    setResending(true);
    try {
      await sendOTP(email);
      setError('');
      alert('Verification code sent! Please check your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authScreen}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <button className={styles.backBtn} onClick={() => navigate('/signup')} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className={styles.authTitle}>Verify Email</h1>
          <div className={styles.headerSpacer}></div>
        </div>

        <div className={styles.otpInfo}>
          <p>We've sent a verification code to:</p>
          <p className={styles.emailDisplay}>{email || 'your email'}</p>
          <p className={styles.otpInstructions}>
            Please check your email and enter the 6-digit code below, or click the magic link in the email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && <div className={styles.errorMessage}>{error}</div>}

          <Input
            type="text"
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            required
            maxLength={6}
          />

          <Button type="submit" disabled={loading || otp.length !== 6} className={styles.submitButton}>
            {loading ? <LoadingSpinner size="small" /> : 'Verify'}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className={styles.resendButton}
          >
            {resending ? 'Sending...' : "Didn't receive code? Resend"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;
