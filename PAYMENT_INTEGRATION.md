# Payment Integration Guide

This document provides comprehensive information about the GOGOBUS payment integration, including API endpoints, webhook setup, testing procedures, and troubleshooting.

## Table of Contents

1. [Overview](#overview)
2. [Payment Gateways](#payment-gateways)
3. [API Integration](#api-integration)
4. [Webhook Setup](#webhook-setup)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)

## Overview

GOGOBUS supports multiple payment methods for Botswana:

- **DPO Pay** - Primary gateway supporting:
  - Credit/Debit Cards (Visa, Mastercard)
  - MyZaka (Mascom mobile money)
  - Smega (BTC mobile money)
- **Orange Money** - Mobile money payments
- **Manual Payments** - Cash and bank transfers

### Payment Flow

```
1. User selects payment method
2. Payment initiated → Payment record created in database
3. User redirected to payment gateway
4. User completes payment
5. Gateway sends webhook → Supabase Edge Function
6. Edge Function updates payment status
7. Ticket generated automatically (if payment successful)
8. Confirmation email/SMS sent
```

## Payment Gateways

### DPO Pay

**Provider:** Direct Pay Online (DPO)  
**API Format:** XML  
**Documentation:** https://secure.3gdirectpay.com/API/v6/

#### Configuration

Set these environment variables:

```env
VITE_DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
VITE_DPO_COMPANY_TOKEN=your_company_token
VITE_DPO_SERVICE_TYPE=your_service_type
```

#### API Endpoints

**Create Payment Token:**
- Endpoint: `POST /API/v6/`
- Request: XML with `Request: createToken`
- Response: XML with `TransToken` and `TransRef`

**Verify Payment:**
- Endpoint: `POST /API/v6/`
- Request: XML with `Request: verifyToken`
- Response: XML with payment status

**Refund:**
- Endpoint: `POST /API/v6/`
- Request: XML with `Request: refundToken`
- Response: XML with refund status

#### Response Codes

- `000` - Success
- `901` - Failed
- `904` - Cancelled
- Other codes - Various error states

### Orange Money

**Provider:** Orange Money Botswana  
**API Format:** JSON  
**Documentation:** Contact Orange Money for API documentation

#### Configuration

Set these environment variables:

```env
VITE_ORANGE_API_URL=https://api.orange.com/orange-money-webpay/bw/v1
VITE_ORANGE_MERCHANT_KEY=your_merchant_key
VITE_ORANGE_RETURN_URL=https://yourdomain.com/booking/confirmation
VITE_ORANGE_CANCEL_URL=https://yourdomain.com/booking/payment
VITE_ORANGE_NOTIF_URL=https://your-project.supabase.co/functions/v1/payment-webhook-orange
```

#### API Endpoints

**Initialize Payment:**
- Endpoint: `POST /payment`
- Request: JSON with merchant_key, amount, order_id, etc.
- Response: JSON with `pay_token` and `payment_url`

**Check Status:**
- Endpoint: `POST /payment/status`
- Request: JSON with order_id and pay_token
- Response: JSON with payment status

**Refund:**
- Endpoint: `POST /payment/refund`
- Request: JSON with order_id, pay_token, amount
- Response: JSON with refund status

#### Status Values

- `SUCCESS` / `PAID` - Payment completed
- `FAILED` / `ERROR` - Payment failed
- `CANCELLED` - Payment cancelled
- `PENDING` - Payment pending

## API Integration

### Payment Service

The payment service (`src/services/paymentService.js`) handles all payment operations:

#### Key Functions

**Initiate Payment:**
```javascript
import paymentService from './services/paymentService';

const result = await paymentService.initiatePayment({
  bookingId: 'booking-uuid',
  amount: 150.00,
  paymentMethod: 'card', // or 'orange_money', 'myzaka', 'smega'
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+26771234567',
  description: 'GOGOBUS: Gaborone → Francistown',
});
```

**Verify Payment:**
```javascript
const result = await paymentService.verifyPayment(transactionRef);
```

**Poll Payment Status (for mobile money):**
```javascript
import { pollOrangeMoneyStatus } from './services/paymentService';

const result = await pollOrangeMoneyStatus(transactionRef, maxDuration);
```

### Payment Status Polling Hook

For React components, use the `usePaymentStatus` hook:

```javascript
import usePaymentStatus from './hooks/usePaymentStatus';

function PaymentConfirmation({ transactionRef, provider }) {
  const { status, payment, isPolling, isCompleted } = usePaymentStatus(
    transactionRef,
    provider,
    true, // enabled
    5000,  // poll interval (ms)
    120000 // max duration (ms)
  );

  if (isPolling) {
    return <div>Verifying payment...</div>;
  }

  if (isCompleted) {
    return <div>Payment successful!</div>;
  }

  return <div>Payment status: {status}</div>;
}
```

## Webhook Setup

Webhooks are handled via Supabase Edge Functions. They automatically update payment status when payments complete.

### Prerequisites

1. **Supabase CLI installed:**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project linked:**
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

### Deploying Webhook Handlers

1. **Deploy DPO webhook handler:**
   ```bash
   supabase functions deploy payment-webhook-dpo
   ```

2. **Deploy Orange Money webhook handler:**
   ```bash
   supabase functions deploy payment-webhook-orange
   ```

### Setting Webhook Secrets

1. Go to Supabase Dashboard → Settings → Edge Functions → Secrets
2. Add the following secrets:
   - `WEBHOOK_SECRET_DPO` - Secret for DPO webhook verification
   - `WEBHOOK_SECRET_ORANGE` - Secret for Orange Money webhook verification

### Configuring Gateway Webhooks

#### DPO Pay

1. Log in to DPO merchant dashboard
2. Go to Settings → Webhooks
3. Set webhook URL to:
   ```
   https://your-project.supabase.co/functions/v1/payment-webhook-dpo
   ```
4. Configure webhook events (payment success, failure, cancellation)

#### Orange Money

1. Log in to Orange Money merchant portal
2. Go to API Settings → Webhooks
3. Set notification URL to:
   ```
   https://your-project.supabase.co/functions/v1/payment-webhook-orange
   ```
4. Configure webhook events

### Webhook Payload Examples

#### DPO Webhook (XML)

```xml
<?xml version="1.0" encoding="utf-8"?>
<API3G>
  <TransactionToken>TOKEN123</TransactionToken>
  <TransactionRef>REF456</TransactionRef>
  <CompanyRef>GGB-ABC123</CompanyRef>
  <Result>000</Result>
  <ResultExplanation>Transaction paid</ResultExplanation>
  <TransactionAmount>150.00</TransactionAmount>
  <TransactionCurrency>BWP</TransactionCurrency>
</API3G>
```

#### Orange Money Webhook (JSON)

```json
{
  "order_id": "GGB-ABC123",
  "pay_token": "OM-TOKEN-456",
  "status": "SUCCESS",
  "amount": 15000,
  "currency": "BWP",
  "message": "Payment successful"
}
```

## Testing Guide

### Sandbox Testing

Both DPO Pay and Orange Money provide sandbox/test environments for development.

#### DPO Pay Sandbox

1. Request sandbox credentials from DPO support
2. Use sandbox API URL: `https://secure.3gdirectpay.com/API/v6/` (same as production)
3. Use test company token and service type
4. Test cards:
   - Success: Use DPO test card numbers
   - Failure: Use declined test cards
   - Cancellation: Cancel during payment flow

#### Orange Money Sandbox

1. Request sandbox credentials from Orange Money
2. Use sandbox API URL provided by Orange Money
3. Use test merchant key
4. Test with sandbox phone numbers

### Testing Checklist

- [ ] Payment initiation works
- [ ] User redirected to payment gateway
- [ ] Payment completion updates status
- [ ] Webhook receives and processes callbacks
- [ ] Ticket generates on successful payment
- [ ] Payment failure handled gracefully
- [ ] Payment cancellation handled
- [ ] Refund process works
- [ ] Payment status polling works (mobile money)
- [ ] Error messages are user-friendly

### Test Scenarios

1. **Successful Payment:**
   - Initiate payment
   - Complete payment on gateway
   - Verify webhook received
   - Verify ticket generated
   - Verify booking status updated

2. **Failed Payment:**
   - Initiate payment
   - Use declined card/failed payment
   - Verify error message displayed
   - Verify payment status updated

3. **Cancelled Payment:**
   - Initiate payment
   - Cancel on gateway
   - Verify cancellation handled
   - Verify user can retry

4. **Webhook Failure:**
   - Simulate webhook failure
   - Verify manual verification works
   - Verify payment status can be checked

## Troubleshooting

### Common Issues

#### Payment Not Initiating

**Symptoms:** Payment initiation fails immediately

**Solutions:**
1. Check API credentials are correct
2. Verify environment variables are set
3. Check network connectivity
4. Review browser console for errors
5. Check payment service logs

#### Webhook Not Receiving Callbacks

**Symptoms:** Payment completes but status not updated

**Solutions:**
1. Verify webhook URL is correct in gateway dashboard
2. Check Supabase Edge Function logs
3. Verify webhook secrets are set
4. Check `payment_webhooks` table for received webhooks
5. Test webhook endpoint manually

#### Payment Status Stuck on Pending

**Symptoms:** Payment shows as pending after completion

**Solutions:**
1. Manually verify payment: `verifyPayment(transactionRef)`
2. Check webhook was received
3. Review payment record in database
4. Check for webhook processing errors

#### XML Parsing Errors (DPO)

**Symptoms:** DPO API calls fail with parsing errors

**Solutions:**
1. Verify XML format is correct
2. Check special characters are escaped
3. Review DPO API documentation
4. Test with DPO sandbox

#### Orange Money Timeout

**Symptoms:** Orange Money payments timeout

**Solutions:**
1. Increase polling duration
2. Check Orange Money API status
3. Verify phone number format
4. Check network connectivity

### Debugging

#### Enable Debug Logging

Add to your code:

```javascript
// In paymentService.js
const DEBUG = import.meta.env.DEV;
if (DEBUG) {
  console.log('Payment API Call:', { action, data });
}
```

#### Check Webhook Logs

Query the `payment_webhooks` table:

```sql
SELECT * FROM payment_webhooks 
WHERE provider = 'dpo' 
ORDER BY created_at DESC 
LIMIT 10;
```

#### Check Payment Errors

Query payment errors (if table exists):

```sql
SELECT * FROM payment_errors 
ORDER BY created_at DESC 
LIMIT 10;
```

### Support Contacts

- **DPO Pay Support:** support@directpay.online
- **Orange Money Support:** merchant@orange.co.bw
- **Supabase Support:** https://supabase.com/docs

## Security Considerations

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Verify webhook signatures** before processing
4. **Use HTTPS** for all API calls
5. **Implement rate limiting** on webhook endpoints
6. **Log all payment operations** for audit trail
7. **Validate all inputs** before processing
8. **Use service role key** only in Edge Functions (never in client)

## Additional Resources

- [DPO Pay API Documentation](https://secure.3gdirectpay.com/API/v6/)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Payment Service Source Code](../src/services/paymentService.js)
- [Webhook Handlers](../supabase/functions/)

---

**Last Updated:** January 2025  
**Version:** 1.0
