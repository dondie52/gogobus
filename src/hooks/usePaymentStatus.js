// ============================================================
// GOGOBUS PAYMENT STATUS POLLING HOOK
// React hook for real-time payment status polling
// Path: src/hooks/usePaymentStatus.js
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { verifyPayment, pollOrangeMoneyStatus } from '../services/paymentService';
import { logError } from '../utils/logger';
import { PAYMENT_POLL_INTERVAL, PAYMENT_POLL_MAX_DURATION } from '../utils/constants';

/**
 * Hook to poll payment status for mobile money payments
 * @param {string} transactionRef - Transaction reference
 * @param {string} provider - Payment provider ('orange', 'dpo', etc.)
 * @param {boolean} enabled - Whether polling is enabled
 * @param {number} pollInterval - Polling interval in ms (default: 5000)
 * @param {number} maxDuration - Maximum polling duration in ms (default: 120000)
 */
export const usePaymentStatus = (
  transactionRef,
  provider,
  enabled = true,
  pollInterval = PAYMENT_POLL_INTERVAL,
  maxDuration = PAYMENT_POLL_MAX_DURATION
) => {
  const [status, setStatus] = useState('pending');
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!transactionRef || !enabled) {
      return;
    }

    // Only poll for mobile money providers that support polling
    const shouldPoll = ['orange', 'dpo'].includes(provider) && status === 'pending';

    if (!shouldPoll) {
      return;
    }

    setIsPolling(true);
    startTimeRef.current = Date.now();

    // Initial verification
    const verify = async () => {
      try {
        const result = await verifyPayment(transactionRef);
        
        if (result.success) {
          setStatus('completed');
          setPayment(result.payment);
          setIsPolling(false);
          return;
        }
        
        if (result.status && result.status !== 'pending') {
          setStatus(result.status);
          setPayment(result.payment);
          setIsPolling(false);
          return;
        }
        
        // Continue polling if still pending
        setPayment(result.payment);
      } catch (err) {
        logError('Payment verification error', err);
        setError(err.message);
        setIsPolling(false);
      }
    };

    // For Orange Money, use the dedicated polling function
    if (provider === 'orange') {
      pollOrangeMoneyStatus(transactionRef, maxDuration)
        .then((result) => {
          setStatus(result.status);
          setPayment(result.payment);
          setIsPolling(false);
        })
        .catch((err) => {
          logError('Payment polling error', err);
          setError(err.message);
          setIsPolling(false);
        });
      return;
    }

    // For other providers, use interval polling
    verify(); // Initial check

    intervalRef.current = setInterval(async () => {
      // Check timeout
      if (Date.now() - startTimeRef.current > maxDuration) {
        clearInterval(intervalRef.current);
        setIsPolling(false);
        setError('Payment verification timeout');
        return;
      }

      try {
        const result = await verifyPayment(transactionRef);
        
        if (result.success || (result.status && result.status !== 'pending')) {
          setStatus(result.status || 'completed');
          setPayment(result.payment);
          setIsPolling(false);
          clearInterval(intervalRef.current);
          return;
        }
        
        setPayment(result.payment);
      } catch (err) {
        logError('Payment polling error', err);
        // Don't stop polling on transient errors
      }
    }, pollInterval);

    // Set timeout
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setIsPolling(false);
      if (status === 'pending') {
        setError('Payment verification timeout');
      }
    }, maxDuration);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsPolling(false);
    };
  }, [transactionRef, provider, enabled, status, pollInterval, maxDuration]);

  return {
    status,
    payment,
    error,
    isPolling,
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
    isCancelled: status === 'cancelled',
    isPending: status === 'pending',
  };
};

export default usePaymentStatus;
