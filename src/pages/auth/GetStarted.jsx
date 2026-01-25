import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import SocialLoginButton from '../../components/auth/SocialLoginButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logError } from '../../utils/logger';
import { HERO_SLIDE_INTERVAL } from '../../utils/constants';
import styles from './GetStarted.module.css';

const GetStarted = () => {
  const navigate = useNavigate();
  const { signInWithProvider } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Hero slides with Botswana destinations
  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
      title: 'Gaborone to Francistown',
      subtitle: 'Express Service Daily'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80',
      title: 'Maun Delta Express',
      subtitle: 'Gateway to Okavango'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      title: 'Kasane Safari Link',
      subtitle: 'Chobe National Park'
    }
  ];

  // Botswana destinations
  const destinations = [
    { name: 'Gaborone', icon: '🏛️' },
    { name: 'Francistown', icon: '🌆' },
    { name: 'Maun', icon: '🦁' },
    { name: 'Kasane', icon: '🐘' },
    { name: 'Serowe', icon: '🌿' },
    { name: 'Palapye', icon: '🛤️' }
  ];

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GetStarted.jsx:50',message:'GetStarted component mounted',data:{isLoaded},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
    // #endregion
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GetStarted.jsx:52',message:'GetStarted isLoaded set to true',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
      // #endregion
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, HERO_SLIDE_INTERVAL);
    return () => clearInterval(slideTimer);
  }, [heroSlides.length]);

  const handleNavigate = (path) => {
    setLoadingButton(path);
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  const handleSocialLogin = async (provider) => {
    setLoadingButton(provider);
    try {
      await signInWithProvider(provider);
    } catch (error) {
      logError('Social login error', error);
      setLoadingButton(null);
    }
  };

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GetStarted.jsx:80',message:'GetStarted render',data:{isLoaded,hasLoadedClass:document.querySelector(`.${styles.contentSection}.${styles.loaded}`) !== null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'K'})}).catch(()=>{});
  }, [isLoaded]);
  // #endregion
  
  return (
    <div className={styles.getStartedScreen}>
      {/* Hero Section with Bus Images */}
      <div className={styles.heroSection}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.heroSlide} ${index === activeSlide ? styles.activeSlide : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className={styles.heroOverlay}></div>
          </div>
        ))}
        
        {/* Hero Content */}
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
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
            </div>
            <span className={styles.logoName}>GOGOBUS</span>
          </div>

          <div className={styles.heroText}>
            <h1>Travel Botswana<br/>With Comfort</h1>
            <p>Book bus tickets to any destination across Botswana. Safe, reliable, and affordable.</p>
          </div>

          {/* Slide Info */}
          <div className={styles.slideInfo}>
            <div className={styles.routeBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5 7 1 12 1C17 1 21 5 21 10Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {heroSlides[activeSlide].title}
            </div>
            <span className={styles.routeSubtitle}>{heroSlides[activeSlide].subtitle}</span>
          </div>

          {/* Slide Indicators */}
          <div className={styles.slideIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.slideIndicator} ${index === activeSlide ? styles.activeIndicator : ''}`}
                onClick={() => setActiveSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className={`${styles.contentSection} ${isLoaded ? styles.loaded : ''}`}>
        {/* Destinations Scroll */}
        <div className={styles.destinationsSection}>
          <span className={styles.destinationsLabel}>Popular Destinations</span>
          <div className={styles.destinationsScroll}>
            {destinations.map((dest, index) => (
              <div key={index} className={styles.destinationChip}>
                <span className={styles.destIcon}>{dest.icon}</span>
                <span className={styles.destName}>{dest.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Real-time<br/>Tracking</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span>Secure<br/>Booking</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>Easy<br/>Payments</span>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Best<br/>Prices</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className={styles.buttonGroup}>
          <Button 
            onClick={() => handleNavigate('/login')} 
            className={styles.loginButton}
            disabled={loadingButton !== null}
          >
            {loadingButton === '/login' ? (
              <span className={styles.loadingContent}>
                <LoadingSpinner size="small" />
                Loading...
              </span>
            ) : (
              <>
                Login to Your Account
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNavigate('/signup')} 
            className={styles.signupButton}
            disabled={loadingButton !== null}
          >
            {loadingButton === '/signup' ? (
              <span className={styles.loadingContent}>
                <LoadingSpinner size="small" />
                Loading...
              </span>
            ) : (
              'Create New Account'
            )}
          </Button>
        </div>

        {/* Social Login */}
        <div className={styles.socialLogin}>
          <div className={styles.dividerContainer}>
            <div className={styles.dividerLine}></div>
            <span className={styles.dividerText}>or continue with</span>
            <div className={styles.dividerLine}></div>
          </div>
          <div className={styles.socialButtons}>
            <SocialLoginButton 
              provider="google" 
              onClick={() => handleSocialLogin('google')}
              disabled={loadingButton !== null && loadingButton !== 'google'}
            />
            <SocialLoginButton 
              provider="facebook" 
              onClick={() => handleSocialLogin('facebook')}
              disabled={loadingButton !== null && loadingButton !== 'facebook'}
            />
            <SocialLoginButton 
              provider="apple" 
              onClick={() => handleSocialLogin('apple')}
              disabled={loadingButton !== null && loadingButton !== 'apple'}
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className={styles.trustBadges}>
          <div className={styles.trustBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Secure</span>
          </div>
          <div className={styles.trustBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98234 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Verified Operators</span>
          </div>
          <div className={styles.trustBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Terms */}
        <p className={styles.terms}>
          By continuing, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default GetStarted;
