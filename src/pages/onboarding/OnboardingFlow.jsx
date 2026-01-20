import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingStep1 from './OnboardingStep1';
import OnboardingStep2 from './OnboardingStep2';
import OnboardingStep3 from './OnboardingStep3';
import styles from './OnboardingFlow.module.css';

const OnboardingFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    { component: OnboardingStep1, path: '/onboarding' },
    { component: OnboardingStep2, path: '/onboarding/step2' },
    { component: OnboardingStep3, path: '/onboarding/step3' },
  ];

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < steps.length - 1) {
        return prev + 1;
      } else {
        // Last step - go to get started
        localStorage.setItem('gogobus_onboarding_complete', 'true');
        navigate('/get-started');
        return prev;
      }
    });
  }, [navigate, steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleSwipe = useCallback((direction) => {
    if (direction === 'left') {
      handleNext();
    } else if (direction === 'right') {
      handlePrevious();
    }
  }, [handleNext, handlePrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious]);

  // Touch swipe handling
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > minSwipeDistance) {
        if (diff > 0) {
          handleSwipe('left'); // Swipe left - next
        } else {
          handleSwipe('right'); // Swipe right - previous
        }
      }
    };

    const container = document.querySelector(`.${styles.onboardingContainer}`);
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className={styles.onboardingContainer}>
      <CurrentStepComponent
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentStep={currentStep}
        totalSteps={steps.length}
      />
    </div>
  );
};

export default OnboardingFlow;
