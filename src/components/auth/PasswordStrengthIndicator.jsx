import React from 'react';
import styles from './PasswordStrengthIndicator.module.css';

const PasswordStrengthIndicator = ({ password }) => {
  const getStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthLabel = () => {
    const strength = getStrength();
    if (strength === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength <= 2) return 'Fair';
    if (strength <= 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    const strength = getStrength();
    if (strength <= 1) return '#F44336';
    if (strength <= 2) return '#FF9800';
    if (strength <= 3) return '#FFC107';
    return '#4CAF50';
  };

  if (!password) return null;

  const strength = getStrength();
  const strengthLabel = getStrengthLabel();
  const strengthColor = getStrengthColor();

  return (
    <div className={styles.passwordStrength}>
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`${styles.bar} ${strength >= level ? styles.active : ''}`}
            style={strength >= level ? { backgroundColor: strengthColor } : {}}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: strengthColor }}>
        {strengthLabel}
      </span>
    </div>
  );
};

export default PasswordStrengthIndicator;
