import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePhone, validateName } from '../../utils/validation';
import { trackSignup } from '../../utils/analytics';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import styles from './Auth.module.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+267');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateName(fullName)) {
      setError('Please enter your full name (at least 2 characters)');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g., +26771234567)');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service');
      return;
    }

    setLoading(true);
    try {
      const { user: authUser, session: authSession } = await signup(email, password, {
        full_name: fullName,
        phone: phone,
      });
      
      // Track signup conversion
      trackSignup('email');
      
      // Check if user is immediately signed in (email confirmation disabled)
      if (authSession && authUser) {
        // User is already authenticated, proceed to profile completion
        localStorage.setItem('gogobus_signupData', JSON.stringify({ fullName, email, phone }));
        navigate('/complete-profile');
      } else {
        // Email confirmation required, show check email screen
        localStorage.setItem('gogobus_signupData', JSON.stringify({ fullName, email, phone }));
        navigate('/check-email', { state: { email } });
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEmailValid = email && validateEmail(email);
  const isPhoneValid = validatePhone(phone);
  const isPasswordValid = password.length >= 8;

  return (
    <div className={styles.authScreen}>
      {/* Hero Header with Bus Image */}
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
            onClick={() => navigate('/get-started')} 
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
            <h1>Join GOGOBUS</h1>
            <p>Create an account to start your journey</p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div className={`${styles.authContainer} ${isLoaded ? styles.loaded : ''}`}>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Full Name Input */}
          <div className={`${styles.inputGroup} ${focusedField === 'name' ? styles.focused : ''} ${fullName.length >= 2 ? styles.valid : ''}`}>
            <label className={styles.inputLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Full Name
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="Enter your full name"
                required
                className={styles.input}
                autoComplete="name"
              />
              {fullName.length >= 2 && (
                <div className={styles.validIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className={`${styles.inputGroup} ${focusedField === 'email' ? styles.focused : ''} ${isEmailValid ? styles.valid : ''}`}>
            <label className={styles.inputLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 7L12 13L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Email Address
            </label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="yourname@example.com"
                required
                className={styles.input}
                autoComplete="email"
              />
              {isEmailValid && (
                <div className={styles.validIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Phone Input */}
          <div className={`${styles.inputGroup} ${focusedField === 'phone' ? styles.focused : ''} ${isPhoneValid ? styles.valid : ''}`}>
            <label className={styles.inputLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V19.92C22 20.4704 21.5504 21 21 21H20C14.477 21 10 16.523 10 11V10C10 9.44957 10.5496 9 11.1 9H14.1C14.6504 9 15.1 9.44957 15.1 10C15.1 10.8267 15.2733 11.6133 15.6 12.32L14.8 13.12C14.4134 13.5066 14.4134 14.1334 14.8 14.52L16.48 16.2C16.8666 16.5866 17.4934 16.5866 17.88 16.2L18.68 15.4C19.3867 15.7267 20.1733 15.9 21 15.9C21.5504 15.9 22 16.3496 22 16.9V16.92Z" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="3" width="14" height="21" rx="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Phone Number
            </label>
            <div className={styles.inputWrapper}>
              <div className={styles.phonePrefix}>🇧🇼</div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                placeholder="+26771234567"
                required
                className={`${styles.input} ${styles.phoneInput}`}
                autoComplete="tel"
              />
              {isPhoneValid && (
                <div className={styles.validIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <span className={styles.inputHint}>Botswana phone number (e.g., +26771234567)</span>
          </div>

          {/* Password Input */}
          <div className={`${styles.inputGroup} ${focusedField === 'password' ? styles.focused : ''} ${isPasswordValid ? styles.valid : ''}`}>
            <label className={styles.inputLabel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
              </svg>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="Create a strong password"
                required
                className={styles.input}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.11 1 12C1.69 10.24 2.78 8.69 4.19 7.46M9.88 9.88A3 3 0 0014.12 14.12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12C2.73 7.61 7 4 12 4C17 4 21.27 7.61 23 12C21.27 16.39 17 20 12 20C7 20 2.73 16.39 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
            <PasswordStrengthIndicator password={password} />
          </div>

          {/* Terms Agreement */}
          <div className={styles.termsCheckbox}>
            <label 
              className={styles.checkboxLabel}
              onClick={(e) => {
                // Don't toggle if clicking on links
                if (e.target.tagName === 'A') {
                  return;
                }
                // Don't toggle if clicking directly on the input (it handles its own onChange)
                if (e.target.type === 'checkbox') {
                  return;
                }
                // Toggle checkbox when clicking anywhere else on the label
                e.preventDefault();
                e.stopPropagation();
                setAgreedToTerms(!agreedToTerms);
              }}
            >
              <input 
                type="checkbox" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              <span className={styles.checkmark}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={styles.termsText}>
                I agree to the <a href="/terms" onClick={(e) => e.stopPropagation()}>Terms of Service</a> and <a href="/privacy" onClick={(e) => e.stopPropagation()}>Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <span className={styles.loadingState}>
                <LoadingSpinner size="small" />
                <span>Creating account...</span>
              </span>
            ) : (
              <span className={styles.buttonContent}>
                <span>Create Account</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className={styles.authFooter}>
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>

        {/* Security badge */}
        <div className={styles.securityBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Your data is protected</span>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
