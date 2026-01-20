import React from 'react';
import styles from './PaymentMethod.module.css';

const PAYMENT_METHODS = [
  { id: 'mobile_money', label: 'Mobile Money', icon: '📱' },
  { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
  { id: 'cash', label: 'Cash on Board', icon: '💵' },
];

const PaymentMethod = ({ selectedMethod, onMethodSelect }) => {
  return (
    <div className={styles.paymentMethods}>
      <h2 className={styles.title}>Select Payment Method</h2>
      <div className={styles.methodsList}>
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            className={`${styles.methodButton} ${selectedMethod === method.id ? styles.selected : ''}`}
            onClick={() => onMethodSelect(method.id)}
          >
            <span className={styles.methodIcon}>{method.icon}</span>
            <span className={styles.methodLabel}>{method.label}</span>
            {selectedMethod === method.id && (
              <span className={styles.checkmark}>✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethod;
