import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const OnboardingStep3 = ({ onNext, currentStep, totalSteps }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.onboardingScreen}>
      <div className={styles.onboardingContent}>
        <div className={styles.onboardingIllustration}>
          <div className={styles.trackingCard}>
            <div className={styles.trackingHeader}>
              <span className={styles.trackingLabel}>Current Location</span>
              <span className={styles.trackingLive}>🔴 LIVE</span>
            </div>
            <div className={styles.trackingLocation}>
              <div className={styles.locationIcon}>📍</div>
              <span className={styles.locationName}>Nata Junction, Central District</span>
            </div>
            <div className={styles.trackingNext}>
              <span className={styles.nextLabel}>Next Stop</span>
              <div className={styles.nextInfo}>
                <div className={styles.nextIcon}>🍽️</div>
                <div className={styles.nextDetails}>
                  <span className={styles.nextName}>Nata Lodge Restaurant</span>
                  <span className={styles.nextDesc}>Arriving in 00:15:27</span>
                </div>
              </div>
            </div>
            <div className={styles.trackingMap}>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapRoute}></div>
                <div className={`${styles.mapMarker} ${styles.current}`}></div>
                <div className={`${styles.mapMarker} ${styles.destination}`}></div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.onboardingText}>
          <h2>Easily track your current location & trip statuses</h2>
          <p>No need to worry about missing your destination. We provide a Live Tracking feature</p>
        </div>
        <div className={styles.onboardingIndicators}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <span
              key={index}
              className={`${styles.indicator} ${index === currentStep ? styles.active : ''}`}
            />
          ))}
        </div>
        <Button onClick={onNext} className={styles.primaryButton}>
          Get Started
        </Button>
        <p className={styles.registerLink}>
          Don't have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
            Register Account
          </a>
        </p>
      </div>
    </div>
  );
};

export default OnboardingStep3;
