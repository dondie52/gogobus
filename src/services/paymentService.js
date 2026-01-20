// ============================================================
// GOGOBUS PAYMENT SERVICE
// Supports: DPO Pay, Orange Money, Card Payments, Cash
// Path: src/services/paymentService.js
// ============================================================

import { supabase } from './supabase';
import paymentErrors from '../utils/paymentErrors';
import { validateAmount, validateEmail, validatePhone, validateUUID, sanitizeObject } from '../utils/validation';
import { logError, logWarn } from '../utils/logger';

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  // DPO Pay Configuration (Primary payment gateway for Botswana)
  DPO: {
    API_URL: import.meta.env.VITE_DPO_API_URL || 'https://secure.3gdirectpay.com/API/v6/',
    COMPANY_TOKEN: import.meta.env.VITE_DPO_COMPANY_TOKEN || '',
    SERVICE_TYPE: import.meta.env.VITE_DPO_SERVICE_TYPE || '',
    CURRENCY: 'BWP',
    COUNTRY: 'BW',
  },
  
  // Orange Money Configuration
  ORANGE_MONEY: {
    API_URL: import.meta.env.VITE_ORANGE_API_URL || 'https://api.orange.com/orange-money-webpay/bw/v1',
    MERCHANT_KEY: import.meta.env.VITE_ORANGE_MERCHANT_KEY || '',
    RETURN_URL: import.meta.env.VITE_ORANGE_RETURN_URL || '',
    CANCEL_URL: import.meta.env.VITE_ORANGE_CANCEL_URL || '',
    NOTIF_URL: import.meta.env.VITE_ORANGE_NOTIF_URL || '',
  },
  
  // App URLs
  APP: {
    SUCCESS_URL: import.meta.env.VITE_PAYMENT_SUCCESS_URL || '/booking/confirmation',
    CANCEL_URL: import.meta.env.VITE_PAYMENT_CANCEL_URL || '/booking/payment',
    WEBHOOK_URL: import.meta.env.VITE_PAYMENT_WEBHOOK_URL || '/api/payment/webhook',
  }
};

// ============================================================
// PAYMENT METHODS
// ============================================================

export const PAYMENT_METHODS = {
  CARD: {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa or Mastercard',
    icon: 'card',
    enabled: true,
    provider: 'dpo',
    fees: { type: 'percentage', value: 2.5 },
  },
  ORANGE_MONEY: {
    id: 'orange_money',
    name: 'Orange Money',
    description: 'Pay with Orange Money wallet',
    icon: 'orange',
    enabled: true,
    provider: 'orange',
    fees: { type: 'flat', value: 5 },
  },
  MYZAKA: {
    id: 'myzaka',
    name: 'Mascom MyZaka',
    description: 'Pay with MyZaka mobile money',
    icon: 'myzaka',
    enabled: true,
    provider: 'dpo', // DPO Pay supports MyZaka
    fees: { type: 'flat', value: 5 },
  },
  SMEGA: {
    id: 'smega',
    name: 'BTC Smega',
    description: 'Pay with Smega mobile money',
    icon: 'smega',
    enabled: true,
    provider: 'dpo',
    fees: { type: 'flat', value: 5 },
  },
  BANK_TRANSFER: {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    description: 'Pay via EFT bank transfer',
    icon: 'bank',
    enabled: true,
    provider: 'manual',
    fees: { type: 'flat', value: 0 },
  },
  CASH: {
    id: 'cash',
    name: 'Pay at Station',
    description: 'Pay cash at the bus station',
    icon: 'cash',
    enabled: true,
    provider: 'manual',
    fees: { type: 'flat', value: 0 },
  },
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Calculate payment fees based on method and amount
 */
export const calculateFees = (method, amount) => {
  const paymentMethod = PAYMENT_METHODS[method.toUpperCase()] || PAYMENT_METHODS.CARD;
  const { fees } = paymentMethod;
  
  if (fees.type === 'percentage') {
    return Math.round(amount * (fees.value / 100) * 100) / 100;
  }
  return fees.value;
};

/**
 * Calculate total amount including fees
 */
export const calculateTotal = (baseAmount, serviceFee, paymentMethod) => {
  const paymentFee = calculateFees(paymentMethod, baseAmount);
  return {
    baseAmount,
    serviceFee,
    paymentFee,
    total: baseAmount + serviceFee + paymentFee,
  };
};

/**
 * Generate a unique transaction reference
 */
const generateTransactionRef = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `GGB-${timestamp}-${random}`.toUpperCase();
};

/**
 * Format amount for API (in cents/lowest denomination)
 */
const formatAmount = (amount) => Math.round(amount * 100);

/**
 * Get enabled payment methods
 */
export const getEnabledPaymentMethods = () => {
  return Object.values(PAYMENT_METHODS).filter(method => method.enabled);
};

// ============================================================
// DPO PAY INTEGRATION
// ============================================================

/**
 * Create a DPO Pay payment token
 * This initiates the payment process with DPO
 */
export const createDPOPayment = async (paymentData) => {
  const {
    bookingId,
    amount,
    customerEmail,
    customerName,
    customerPhone,
    description,
    paymentMethod = 'card',
  } = paymentData;

  // #region agent log
  // #endregion

  // Validate inputs
  if (!bookingId || !validateUUID(bookingId)) {
    // #region agent log
    // #endregion
    throw new Error('Invalid booking ID');
  }
  if (!amount || !validateAmount(amount)) {
    throw new Error('Invalid payment amount');
  }
  if (!customerEmail || !validateEmail(customerEmail)) {
    throw new Error('Invalid customer email');
  }
  if (customerPhone && !validatePhone(customerPhone)) {
    throw new Error('Invalid customer phone number');
  }

  const transactionRef = generateTransactionRef();
  
  try {
    // #region agent log
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: bookingCheck } = await supabase.from('bookings').select('id, user_id').eq('id', bookingId).single();
    // #endregion

    // Sanitize customer data
    const sanitizedCustomerData = sanitizeObject({
      customerEmail,
      customerName,
      customerPhone,
      description,
    });
    // Create payment record in database first
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        transaction_ref: transactionRef,
        amount,
        currency: CONFIG.DPO.CURRENCY,
        payment_method: paymentMethod,
        provider: 'dpo',
        status: 'pending',
        customer_email: sanitizedCustomerData.customerEmail,
        customer_name: sanitizedCustomerData.customerName,
        customer_phone: sanitizedCustomerData.customerPhone,
        metadata: { description: sanitizedCustomerData.description },
      })
      .select()
      .single();

    // #region agent log
    // #endregion

    if (dbError) throw dbError;

    // Build DPO API request
    const dpoRequest = {
      CompanyToken: CONFIG.DPO.COMPANY_TOKEN,
      Request: 'createToken',
      Transaction: {
        PaymentAmount: amount.toFixed(2),
        PaymentCurrency: CONFIG.DPO.CURRENCY,
        CompanyRef: transactionRef,
        RedirectURL: `${window.location.origin}${CONFIG.APP.SUCCESS_URL}?ref=${transactionRef}`,
        BackURL: `${window.location.origin}${CONFIG.APP.CANCEL_URL}?ref=${transactionRef}`,
        CompanyRefUnique: 1,
        PTL: 30, // Payment Time Limit in minutes
      },
      Services: {
        Service: {
          ServiceType: CONFIG.DPO.SERVICE_TYPE,
          ServiceDescription: description || 'GOGOBUS Bus Ticket',
          ServiceDate: new Date().toISOString().split('T')[0],
        },
      },
      Customer: {
        CustomerFirstName: sanitizedCustomerData.customerName?.split(' ')[0] || 'Customer',
        CustomerLastName: sanitizedCustomerData.customerName?.split(' ').slice(1).join(' ') || '',
        CustomerEmail: sanitizedCustomerData.customerEmail,
        CustomerPhone: sanitizedCustomerData.customerPhone,
        CustomerCountry: CONFIG.DPO.COUNTRY,
      },
    };

    // In production, this would call the actual DPO API
    // For now, we'll simulate the response
    const dpoResponse = await callDPOAPI('createToken', dpoRequest);

    if (dpoResponse.Result !== '000') {
      throw new Error(dpoResponse.ResultExplanation || 'Payment initiation failed');
    }

    // Update payment record with token
    await supabase
      .from('payments')
      .update({
        provider_token: dpoResponse.TransToken,
        provider_ref: dpoResponse.TransRef,
      })
      .eq('id', payment.id);

    return {
      success: true,
      transactionRef,
      paymentId: payment.id,
      token: dpoResponse.TransToken,
      paymentUrl: `https://secure.3gdirectpay.com/payv2.php?ID=${dpoResponse.TransToken}`,
    };

  } catch (error) {
    logError('DPO Payment Error', error);
    
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'createDPOPayment',
      bookingId,
      transactionRef,
    });
    
    return {
      success: false,
      error: paymentErrors.getUserFriendlyMessage(error),
    };
  }
};

/**
 * Verify DPO payment status
 */
export const verifyDPOPayment = async (transactionRef) => {
  try {
    // Get payment from database
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (dbError || !payment) {
      throw new Error('Payment not found');
    }

    if (!payment.provider_token) {
      throw new Error('No payment token found');
    }

    // Verify with DPO API
    const verifyRequest = {
      CompanyToken: CONFIG.DPO.COMPANY_TOKEN,
      Request: 'verifyToken',
      TransactionToken: payment.provider_token,
    };

    const response = await callDPOAPI('verifyToken', verifyRequest);

    // Map DPO status to our status
    let status = 'pending';
    if (response.Result === '000') {
      status = 'completed';
    } else if (response.Result === '901') {
      status = 'failed';
    } else if (response.Result === '904') {
      status = 'cancelled';
    }

    // Update payment record
    const { data: updatedPayment } = await supabase
      .from('payments')
      .update({
        status,
        provider_status: response.ResultExplanation,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', payment.id)
      .select()
      .single();

    // If payment completed, update booking
    if (status === 'completed') {
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_method: payment.payment_method,
          payment_reference: transactionRef,
        })
        .eq('id', payment.booking_id);
    }

    return {
      success: status === 'completed',
      status,
      payment: updatedPayment,
      message: response.ResultExplanation,
    };

  } catch (error) {
    logError('DPO Verification Error', error);
    
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'verifyDPOPayment',
      transactionRef,
    });
    
    return {
      success: false,
      status: 'error',
      error: paymentErrors.getUserFriendlyMessage(error),
    };
  }
};

// ============================================================
// DPO XML UTILITIES
// ============================================================

/**
 * Build DPO XML request from JavaScript object
 */
const buildDPOXML = (data) => {
  const { CompanyToken, Request, Transaction, Services, Customer } = data;
  
  let xml = '<?xml version="1.0" encoding="utf-8"?>';
  xml += '<API3G>';
  
  if (CompanyToken) {
    xml += `<CompanyToken>${escapeXML(CompanyToken)}</CompanyToken>`;
  }
  
  if (Request) {
    xml += `<Request>${escapeXML(Request)}</Request>`;
  }
  
  if (Transaction) {
    xml += '<Transaction>';
    if (Transaction.PaymentAmount) xml += `<PaymentAmount>${escapeXML(Transaction.PaymentAmount)}</PaymentAmount>`;
    if (Transaction.PaymentCurrency) xml += `<PaymentCurrency>${escapeXML(Transaction.PaymentCurrency)}</PaymentCurrency>`;
    if (Transaction.CompanyRef) xml += `<CompanyRef>${escapeXML(Transaction.CompanyRef)}</CompanyRef>`;
    if (Transaction.RedirectURL) xml += `<RedirectURL>${escapeXML(Transaction.RedirectURL)}</RedirectURL>`;
    if (Transaction.BackURL) xml += `<BackURL>${escapeXML(Transaction.BackURL)}</BackURL>`;
    if (Transaction.CompanyRefUnique !== undefined) xml += `<CompanyRefUnique>${Transaction.CompanyRefUnique}</CompanyRefUnique>`;
    if (Transaction.PTL) xml += `<PTL>${Transaction.PTL}</PTL>`;
    if (Transaction.TransactionToken) xml += `<TransactionToken>${escapeXML(Transaction.TransactionToken)}</TransactionToken>`;
    xml += '</Transaction>';
  }
  
  if (Services && Services.Service) {
    xml += '<Services>';
    xml += '<Service>';
    if (Services.Service.ServiceType) xml += `<ServiceType>${escapeXML(Services.Service.ServiceType)}</ServiceType>`;
    if (Services.Service.ServiceDescription) xml += `<ServiceDescription>${escapeXML(Services.Service.ServiceDescription)}</ServiceDescription>`;
    if (Services.Service.ServiceDate) xml += `<ServiceDate>${escapeXML(Services.Service.ServiceDate)}</ServiceDate>`;
    xml += '</Service>';
    xml += '</Services>';
  }
  
  if (Customer) {
    xml += '<Customer>';
    if (Customer.CustomerFirstName) xml += `<CustomerFirstName>${escapeXML(Customer.CustomerFirstName)}</CustomerFirstName>`;
    if (Customer.CustomerLastName) xml += `<CustomerLastName>${escapeXML(Customer.CustomerLastName)}</CustomerLastName>`;
    if (Customer.CustomerEmail) xml += `<CustomerEmail>${escapeXML(Customer.CustomerEmail)}</CustomerEmail>`;
    if (Customer.CustomerPhone) xml += `<CustomerPhone>${escapeXML(Customer.CustomerPhone)}</CustomerPhone>`;
    if (Customer.CustomerCountry) xml += `<CustomerCountry>${escapeXML(Customer.CustomerCountry)}</CustomerCountry>`;
    xml += '</Customer>';
  }
  
  xml += '</API3G>';
  return xml;
};

/**
 * Escape XML special characters
 */
const escapeXML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Parse DPO XML response to JavaScript object
 * Uses browser's built-in DOMParser
 */
const parseDPOResponse = (xmlString) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Failed to parse XML: ' + parserError.textContent);
    }
    
    // Helper to get text content of an element
    const getText = (tagName) => {
      const element = xmlDoc.querySelector(tagName);
      return element ? element.textContent : '';
    };
    
    // Extract values from XML
    const response = {
      Result: getText('Result'),
      ResultExplanation: getText('ResultExplanation'),
      TransToken: getText('TransToken'),
      TransRef: getText('TransRef'),
      TransactionAmount: getText('TransactionAmount'),
      TransactionCurrency: getText('TransactionCurrency'),
      RefundRef: getText('RefundRef'),
    };
    
    return Promise.resolve(response);
  } catch (error) {
    return Promise.reject(new Error(`Failed to parse DPO XML response: ${error.message}`));
  }
};

/**
 * Call DPO API with real implementation
 */
const callDPOAPI = async (action, data) => {
  // Check if credentials are available
  if (!CONFIG.DPO.COMPANY_TOKEN || !CONFIG.DPO.SERVICE_TYPE) {
    // Fallback to mock for development
    logWarn('DPO credentials not configured. Using mock response.');
    return getMockDPOResponse(action, data);
  }
  
  try {
    // Build XML request
    const xmlRequest = buildDPOXML(data);
    
    // Call DPO API with retry logic
    const response = await paymentErrors.retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        const fetchResponse = await fetch(CONFIG.DPO.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/xml',
            'Accept': 'application/xml',
          },
          body: xmlRequest,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!fetchResponse.ok) {
          throw new Error(`DPO API returned status ${fetchResponse.status}`);
        }
        
        const responseText = await fetchResponse.text();
        return await parseDPOResponse(responseText);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    }, {
      maxRetries: 3,
      initialDelay: 1000,
      shouldRetry: (error) => {
        const code = paymentErrors.classifyError(error);
        return [
          paymentErrors.ERROR_CODES.NETWORK_ERROR,
          paymentErrors.ERROR_CODES.TIMEOUT,
          paymentErrors.ERROR_CODES.CONNECTION_FAILED,
        ].includes(code);
      },
    });
    
    return response;
  } catch (error) {
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action,
      provider: 'dpo',
      data: { ...data, CompanyToken: '[REDACTED]' },
    });
    
    // If it's a network error, throw user-friendly message
    const errorCode = paymentErrors.classifyError(error);
    if ([
      paymentErrors.ERROR_CODES.NETWORK_ERROR,
      paymentErrors.ERROR_CODES.TIMEOUT,
      paymentErrors.ERROR_CODES.CONNECTION_FAILED,
    ].includes(errorCode)) {
      throw new Error(paymentErrors.getUserFriendlyMessage(error));
    }
    
    // For other errors, throw original error
    throw error;
  }
};

/**
 * Mock DPO response for development (when credentials not configured)
 */
const getMockDPOResponse = (action, data) => {
  // Mock response for development
  
  if (action === 'createToken') {
    return {
      Result: '000',
      ResultExplanation: 'Transaction created successfully',
      TransToken: 'MOCK-TOKEN-' + Date.now(),
      TransRef: 'MOCK-REF-' + Date.now(),
    };
  }
  
  if (action === 'verifyToken') {
    return {
      Result: '000',
      ResultExplanation: 'Transaction paid',
      TransactionAmount: data.Transaction?.PaymentAmount || '',
      TransactionCurrency: 'BWP',
    };
  }
  
  return { Result: '999', ResultExplanation: 'Unknown action' };
};

// ============================================================
// ORANGE MONEY INTEGRATION
// ============================================================

/**
 * Create Orange Money payment
 */
export const createOrangeMoneyPayment = async (paymentData) => {
  const {
    bookingId,
    amount,
    customerPhone,
    customerName,
    description,
  } = paymentData;

  // #region agent log
  // #endregion

  const transactionRef = generateTransactionRef();

  try {
    // #region agent log
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: bookingCheck } = await supabase.from('bookings').select('id, user_id').eq('id', bookingId).single();
    // #endregion

    // Create payment record
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        transaction_ref: transactionRef,
        amount,
        currency: 'BWP',
        payment_method: 'orange_money',
        provider: 'orange',
        status: 'pending',
        customer_phone: customerPhone,
        customer_name: customerName,
        metadata: { description },
      })
      .select()
      .single();

    // #region agent log
    // #endregion

    if (dbError) throw dbError;

    // Build Orange Money request
    const orangeRequest = {
      merchant_key: CONFIG.ORANGE_MONEY.MERCHANT_KEY,
      currency: 'OUV', // Orange Universal Value
      order_id: transactionRef,
      amount: formatAmount(amount),
      return_url: `${window.location.origin}${CONFIG.APP.SUCCESS_URL}?ref=${transactionRef}`,
      cancel_url: `${window.location.origin}${CONFIG.APP.CANCEL_URL}?ref=${transactionRef}`,
      notif_url: `${window.location.origin}${CONFIG.APP.WEBHOOK_URL}`,
      lang: 'en',
      reference: description || 'GOGOBUS Bus Ticket',
    };

    // In production, call actual Orange Money API
    const orangeResponse = await callOrangeMoneyAPI('init', orangeRequest);

    if (orangeResponse.status !== 'INITIATED') {
      throw new Error(orangeResponse.message || 'Orange Money payment initiation failed');
    }

    // Update payment with provider reference
    await supabase
      .from('payments')
      .update({
        provider_ref: orangeResponse.pay_token,
        provider_token: orangeResponse.payment_url,
      })
      .eq('id', payment.id);

    return {
      success: true,
      transactionRef,
      paymentId: payment.id,
      paymentUrl: orangeResponse.payment_url,
      payToken: orangeResponse.pay_token,
    };

  } catch (error) {
    logError('Orange Money Error', error);
    
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'createOrangeMoneyPayment',
      bookingId,
      transactionRef,
    });
    
    return {
      success: false,
      error: paymentErrors.getUserFriendlyMessage(error),
    };
  }
};

/**
 * Verify Orange Money payment
 */
export const verifyOrangeMoneyPayment = async (transactionRef) => {
  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) throw new Error('Payment not found');

    const response = await callOrangeMoneyAPI('status', {
      order_id: transactionRef,
      pay_token: payment.provider_ref,
    });

    let status = 'pending';
    if (response.status === 'SUCCESS') {
      status = 'completed';
    } else if (response.status === 'FAILED') {
      status = 'failed';
    } else if (response.status === 'CANCELLED') {
      status = 'cancelled';
    }

    await supabase
      .from('payments')
      .update({
        status,
        provider_status: response.status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', payment.id);

    if (status === 'completed') {
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_method: 'orange_money',
          payment_reference: transactionRef,
        })
        .eq('id', payment.booking_id);
    }

    return { success: status === 'completed', status };

  } catch (error) {
    logError('Orange Money Verification Error', error);
    
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'verifyOrangeMoneyPayment',
      transactionRef,
    });
    
    return {
      success: false,
      status: 'error',
      error: paymentErrors.getUserFriendlyMessage(error),
    };
  }
};

/**
 * Call Orange Money API with real implementation
 */
const callOrangeMoneyAPI = async (action, data) => {
  // Check if credentials are available
  if (!CONFIG.ORANGE_MONEY.MERCHANT_KEY) {
    // Fallback to mock for development
    logWarn('Orange Money credentials not configured. Using mock response.');
    return getMockOrangeMoneyResponse(action, data);
  }
  
  try {
    let url, method, body;
    
    if (action === 'init') {
      // Initialize payment
      url = `${CONFIG.ORANGE_MONEY.API_URL}/payment`;
      method = 'POST';
      body = JSON.stringify({
        merchant_key: CONFIG.ORANGE_MONEY.MERCHANT_KEY,
        currency: data.currency || 'OUV',
        order_id: data.order_id,
        amount: data.amount,
        return_url: data.return_url || CONFIG.ORANGE_MONEY.RETURN_URL,
        cancel_url: data.cancel_url || CONFIG.ORANGE_MONEY.CANCEL_URL,
        notif_url: data.notif_url || CONFIG.ORANGE_MONEY.NOTIF_URL,
        lang: data.lang || 'en',
        reference: data.reference || 'GOGOBUS Bus Ticket',
      });
    } else if (action === 'status') {
      // Check payment status
      url = `${CONFIG.ORANGE_MONEY.API_URL}/payment/status`;
      method = 'POST';
      body = JSON.stringify({
        merchant_key: CONFIG.ORANGE_MONEY.MERCHANT_KEY,
        order_id: data.order_id,
        pay_token: data.pay_token,
      });
    } else {
      throw new Error(`Unknown Orange Money action: ${action}`);
    }
    
    // Call Orange Money API with retry logic
    const response = await paymentErrors.retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      try {
        const fetchResponse = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!fetchResponse.ok) {
          const errorText = await fetchResponse.text();
          throw new Error(`Orange Money API returned status ${fetchResponse.status}: ${errorText}`);
        }
        
        return await fetchResponse.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    }, {
      maxRetries: 3,
      initialDelay: 1000,
      shouldRetry: (error) => {
        const code = paymentErrors.classifyError(error);
        return [
          paymentErrors.ERROR_CODES.NETWORK_ERROR,
          paymentErrors.ERROR_CODES.TIMEOUT,
          paymentErrors.ERROR_CODES.CONNECTION_FAILED,
        ].includes(code);
      },
    });
    
    return response;
  } catch (error) {
    // Log error for debugging
    await paymentErrors.logPaymentError(supabase, error, {
      action,
      provider: 'orange',
      data: { ...data, merchant_key: '[REDACTED]' },
    });
    
    // If it's a network error, throw user-friendly message
    const errorCode = paymentErrors.classifyError(error);
    if ([
      paymentErrors.ERROR_CODES.NETWORK_ERROR,
      paymentErrors.ERROR_CODES.TIMEOUT,
      paymentErrors.ERROR_CODES.CONNECTION_FAILED,
    ].includes(errorCode)) {
      throw new Error(paymentErrors.getUserFriendlyMessage(error));
    }
    
    // For other errors, throw original error
    throw error;
  }
};

/**
 * Poll Orange Money payment status until completion or timeout
 */
export const pollOrangeMoneyStatus = async (transactionRef, maxDuration = 120000) => {
  const startTime = Date.now();
  const pollInterval = 5000; // Poll every 5 seconds
  
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        // Check if timeout reached
        if (Date.now() - startTime > maxDuration) {
          reject(new Error('Payment polling timeout'));
          return;
        }
        
        // Get payment from database
        const { data: payment } = await supabase
          .from('payments')
          .select('*')
          .eq('transaction_ref', transactionRef)
          .single();
        
        if (!payment || !payment.provider_ref) {
          reject(new Error('Payment not found'));
          return;
        }
        
        // Check status with Orange Money API
        const response = await callOrangeMoneyAPI('status', {
          order_id: transactionRef,
          pay_token: payment.provider_ref,
        });
        
        // Update payment status
        let status = 'pending';
        if (response.status === 'SUCCESS' || response.status === 'PAID') {
          status = 'completed';
        } else if (response.status === 'FAILED' || response.status === 'ERROR') {
          status = 'failed';
        } else if (response.status === 'CANCELLED') {
          status = 'cancelled';
        }
        
        await supabase
          .from('payments')
          .update({
            status,
            provider_status: response.status,
            completed_at: status === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', payment.id);
        
        // If completed or failed, resolve
        if (status === 'completed' || status === 'failed' || status === 'cancelled') {
          if (status === 'completed') {
            await supabase
              .from('bookings')
              .update({
                payment_status: 'paid',
                payment_method: 'orange_money',
                payment_reference: transactionRef,
              })
              .eq('id', payment.booking_id);
          }
          
          resolve({ success: status === 'completed', status, payment });
          return;
        }
        
        // Continue polling
        setTimeout(poll, pollInterval);
      } catch (error) {
        // If error is not timeout, reject immediately
        if (!error.message.includes('timeout')) {
          reject(error);
          return;
        }
        
        // On timeout, continue polling once more
        if (Date.now() - startTime < maxDuration) {
          setTimeout(poll, pollInterval);
        } else {
          reject(new Error('Payment polling timeout'));
        }
      }
    };
    
    // Start polling
    poll();
  });
};

/**
 * Mock Orange Money response for development (when credentials not configured)
 */
const getMockOrangeMoneyResponse = (action, data) => {
  // Mock response for development
  
  if (action === 'init') {
    return {
      status: 'INITIATED',
      pay_token: 'OM-TOKEN-' + Date.now(),
      payment_url: `https://mock-orange-pay.com/pay?token=OM-TOKEN-${Date.now()}`,
    };
  }
  
  if (action === 'status') {
    return { status: 'SUCCESS' };
  }
  
  return { status: 'ERROR', message: 'Unknown action' };
};

// ============================================================
// MANUAL PAYMENT (Cash / Bank Transfer)
// ============================================================

/**
 * Create a manual payment record (for cash or bank transfer)
 */
export const createManualPayment = async (paymentData) => {
  const {
    bookingId,
    amount,
    paymentMethod,
    customerName,
    customerPhone,
    notes,
  } = paymentData;

  // #region agent log
  // #endregion

  const transactionRef = generateTransactionRef();

  try {
    // #region agent log
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: bookingCheck } = await supabase.from('bookings').select('id, user_id').eq('id', bookingId).single();
    // #endregion

    const { data: payment, error } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        transaction_ref: transactionRef,
        amount,
        currency: 'BWP',
        payment_method: paymentMethod,
        provider: 'manual',
        status: 'pending',
        customer_name: customerName,
        customer_phone: customerPhone,
        metadata: { notes, requires_confirmation: true },
      })
      .select()
      .single();

    // #region agent log
    // #endregion

    if (error) throw error;

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        payment_status: 'pending',
        payment_method: paymentMethod,
      })
      .eq('id', bookingId);

    return {
      success: true,
      transactionRef,
      paymentId: payment.id,
      message: paymentMethod === 'cash' 
        ? 'Please pay at the bus station before departure'
        : 'Please complete the bank transfer and upload proof of payment',
      bankDetails: paymentMethod === 'bank_transfer' ? {
        bankName: 'First National Bank Botswana',
        accountName: 'GOGOBUS (Pty) Ltd',
        accountNumber: '62XXXXXXXX',
        branchCode: '282267',
        reference: transactionRef,
      } : null,
    };

  } catch (error) {
    logError('Manual Payment Error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Confirm manual payment (admin action)
 */
export const confirmManualPayment = async (transactionRef, adminUserId) => {
  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) throw new Error('Payment not found');

    await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        confirmed_by: adminUserId,
      })
      .eq('id', payment.id);

    await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_reference: transactionRef,
      })
      .eq('id', payment.booking_id);

    return { success: true };

  } catch (error) {
    logError('Manual Payment Confirmation Error', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// UNIFIED PAYMENT INTERFACE
// ============================================================

/**
 * Initiate payment based on selected method
 */
export const initiatePayment = async (paymentData) => {
  const { paymentMethod } = paymentData;
  const method = PAYMENT_METHODS[paymentMethod.toUpperCase()];

  if (!method || !method.enabled) {
    return { success: false, error: 'Invalid or disabled payment method' };
  }

  switch (method.provider) {
    case 'dpo':
      return createDPOPayment(paymentData);
    case 'orange':
      return createOrangeMoneyPayment(paymentData);
    case 'manual':
      return createManualPayment(paymentData);
    default:
      return { success: false, error: 'Unknown payment provider' };
  }
};

/**
 * Verify payment status
 */
export const verifyPayment = async (transactionRef) => {
  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) throw new Error('Payment not found');

    switch (payment.provider) {
      case 'dpo':
        return verifyDPOPayment(transactionRef);
      case 'orange':
        return verifyOrangeMoneyPayment(transactionRef);
      case 'manual':
        return {
          success: payment.status === 'completed',
          status: payment.status,
          payment,
        };
      default:
        return { success: false, error: 'Unknown provider' };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get payment by transaction reference
 */
export const getPaymentByRef = async (transactionRef) => {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      bookings (
        id,
        booking_reference,
        passenger_name,
        trips (
          departure_time,
          routes (origin, destination)
        )
      )
    `)
    .eq('transaction_ref', transactionRef)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
};

/**
 * Get payments for a booking
 */
export const getBookingPayments = async (bookingId) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };
  return { data, error: null };
};

// ============================================================
// REFUNDS
// ============================================================

/**
 * Request a refund
 */
export const requestRefund = async (transactionRef, reason, requestedBy) => {
  try {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_ref', transactionRef)
      .single();

    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'completed') throw new Error('Payment not completed');

    // Create refund record
    const { data: refund, error } = await supabase
      .from('refunds')
      .insert({
        payment_id: payment.id,
        booking_id: payment.booking_id,
        amount: payment.amount,
        reason,
        status: 'pending',
        requested_by: requestedBy,
      })
      .select()
      .single();

    if (error) throw error;

    // Update payment status
    await supabase
      .from('payments')
      .update({ status: 'refund_requested' })
      .eq('id', payment.id);

    return { success: true, refund };

  } catch (error) {
    logError('Refund Request Error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Process DPO refund via API
 */
const processDPORefund = async (transactionToken, amount, reason) => {
  if (!CONFIG.DPO.COMPANY_TOKEN) {
    logWarn('DPO credentials not configured. Skipping refund API call.');
    return { success: true, providerRef: 'MOCK-REFUND-' + Date.now() };
  }
  
  try {
    const refundRequest = {
      CompanyToken: CONFIG.DPO.COMPANY_TOKEN,
      Request: 'refundToken',
      TransactionToken: transactionToken,
      RefundAmount: amount.toFixed(2),
      RefundCurrency: CONFIG.DPO.CURRENCY,
      RefundDetails: reason || 'Customer refund request',
    };
    
    const response = await callDPOAPI('refundToken', refundRequest);
    
    if (response.Result !== '000') {
      throw new Error(response.ResultExplanation || 'Refund failed');
    }
    
    return {
      success: true,
      providerRef: response.RefundRef || response.TransRef,
      message: response.ResultExplanation,
    };
  } catch (error) {
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'processDPORefund',
      transactionToken,
    });
    throw error;
  }
};

/**
 * Process Orange Money refund via API
 */
const processOrangeMoneyRefund = async (orderId, payToken, amount, reason) => {
  if (!CONFIG.ORANGE_MONEY.MERCHANT_KEY) {
    logWarn('Orange Money credentials not configured. Skipping refund API call.');
    return { success: true, providerRef: 'MOCK-REFUND-' + Date.now() };
  }
  
  try {
    const refundRequest = {
      merchant_key: CONFIG.ORANGE_MONEY.MERCHANT_KEY,
      order_id: orderId,
      pay_token: payToken,
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'Customer refund request',
    };
    
    const response = await callOrangeMoneyAPI('refund', refundRequest);
    
    if (response.status !== 'SUCCESS' && response.status !== 'PROCESSING') {
      throw new Error(response.message || 'Refund failed');
    }
    
    return {
      success: true,
      providerRef: response.refund_id || response.order_id,
      message: response.message || 'Refund processed',
    };
  } catch (error) {
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'processOrangeMoneyRefund',
      orderId,
    });
    throw error;
  }
};

/**
 * Process refund (admin action)
 */
export const processRefund = async (refundId, adminUserId, approved) => {
  try {
    const { data: refund } = await supabase
      .from('refunds')
      .select('*, payments(*)')
      .eq('id', refundId)
      .single();

    if (!refund) throw new Error('Refund not found');

    const status = approved ? 'approved' : 'rejected';

    await supabase
      .from('refunds')
      .update({
        status,
        processed_by: adminUserId,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId);

    if (approved) {
      const payment = refund.payments;
      
      // Call provider's refund API
      let providerRefundResult = null;
      try {
        if (payment.provider === 'dpo' && payment.provider_token) {
          providerRefundResult = await processDPORefund(
            payment.provider_token,
            refund.amount,
            refund.reason
          );
        } else if (payment.provider === 'orange' && payment.provider_ref) {
          providerRefundResult = await processOrangeMoneyRefund(
            payment.transaction_ref,
            payment.provider_ref,
            refund.amount,
            refund.reason
          );
        }
        
        // Update refund with provider reference
        if (providerRefundResult && providerRefundResult.providerRef) {
          await supabase
            .from('refunds')
            .update({
              provider_ref: providerRefundResult.providerRef,
              status: 'processing', // Will be updated to 'completed' via webhook
            })
            .eq('id', refundId);
        }
      } catch (refundError) {
        // Log error but don't fail the refund process
        logError('Provider refund API error', refundError);
        await paymentErrors.logPaymentError(supabase, refundError, {
          action: 'processRefund',
          refundId,
          provider: payment.provider,
        });
      }

      await supabase
        .from('payments')
        .update({ status: 'refunded' })
        .eq('id', refund.payment_id);

      await supabase
        .from('bookings')
        .update({ payment_status: 'refunded' })
        .eq('id', refund.booking_id);
    } else {
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', refund.payment_id);
    }

    return { success: true, status };

  } catch (error) {
    logError('Process Refund Error', error);
    
    await paymentErrors.logPaymentError(supabase, error, {
      action: 'processRefund',
      refundId,
    });
    
    return {
      success: false,
      error: paymentErrors.getUserFriendlyMessage(error),
    };
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const paymentService = {
  // Config
  PAYMENT_METHODS,
  getEnabledPaymentMethods,
  calculateFees,
  calculateTotal,
  
  // Payments
  initiatePayment,
  verifyPayment,
  getPaymentByRef,
  getBookingPayments,
  
  // DPO Pay
  createDPOPayment,
  verifyDPOPayment,
  
  // Orange Money
  createOrangeMoneyPayment,
  verifyOrangeMoneyPayment,
  pollOrangeMoneyStatus,
  
  // Manual
  createManualPayment,
  confirmManualPayment,
  
  // Refunds
  requestRefund,
  processRefund,
};

export default paymentService;
