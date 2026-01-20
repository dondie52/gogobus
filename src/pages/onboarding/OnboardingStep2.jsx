import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const OnboardingStep2 = ({ onNext, currentStep, totalSteps }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.onboardingScreen}>
      <div className={styles.onboardingContent}>
        <div className={styles.onboardingIllustration}>
          <div className={styles.bonusCard}>
            <div className={styles.bonusHeader}>
              <div className={styles.bonusIcon}>🎁</div>
              <span className={styles.bonusLabel}>Account</span>
              <span className={styles.bonusTag}>Bonuses</span>
            </div>
            <div className={styles.bonusPoints}>
              <span className={styles.pointsIcon}>⭐</span>
              <span className={styles.pointsValue}>850 pt</span>
            </div>
            <div className={styles.bonusPromo}>
              <div className={styles.promoImage}>
                <div className={styles.coffeeCup}>☕</div>
              </div>
              <div className={styles.promoDetails}>
                <span className={styles.promoBrand}>GOGOBUS Coffee Latte</span>
                <span className={styles.promoTerms}>Terms & Conditions</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.onboardingText}>
          <h2>Get a bonus on every ticket purchase transaction</h2>
          <p>Collect points earned from each ticket purchase and redeem them for reward vouchers</p>
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

export default OnboardingStep2;
