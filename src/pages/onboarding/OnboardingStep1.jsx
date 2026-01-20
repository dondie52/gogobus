import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const OnboardingStep1 = ({ onNext, currentStep, totalSteps }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.onboardingScreen}>
      <div className={styles.onboardingContent}>
        <div className={styles.onboardingIllustration}>
          <div className={styles.ticketCard}>
            <div className={styles.ticketHeader}>
              <span className={styles.ticketLabel}>Ticket</span>
              <span className={styles.ticketStatus}>Active</span>
            </div>
            <div className={styles.ticketRoute}>
              <div className={styles.routePoint}>
                <span className={styles.city}>Gaborone</span>
                <span className={styles.time}>08:00</span>
              </div>
              <div className={styles.routeLine}>
                <span className={styles.routeIcon}>→</span>
                <span className={styles.via}>Via A1 Highway</span>
              </div>
              <div className={styles.routePoint}>
                <span className={styles.city}>Francistown</span>
                <span className={styles.time}>14:30</span>
              </div>
            </div>
            <div className={styles.ticketDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Passenger</span>
                <span className={styles.detailValue}>Kago Mosweu</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>24 Jan 2025</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Seat</span>
                <span className={styles.detailValue}>12A</span>
              </div>
            </div>
            <div className={styles.ticketBarcode}>
              <div className={styles.barcodeLines}></div>
            </div>
          </div>
        </div>
        <div className={styles.onboardingText}>
          <h2>Get bus tickets from anywhere without hassle</h2>
          <p>Just browse through GOGOBUS and get tickets without the hassle of coming to our agents</p>
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

export default OnboardingStep1;
