# Environment Variables Setup

This guide explains how to set up environment variables for the GOGOBUS application.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your values** in the `.env` file

3. **Restart your dev server** if it's running

## Required vs Optional Variables

### ✅ Required for Full Functionality

#### Supabase Configuration
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Note:** Currently, Supabase credentials are hardcoded in `src/services/supabase.js`. You can:
- Keep using hardcoded values (for development)
- Move them to `.env` for better security (recommended for production)

### 🤖 AI Chat Support (Google Gemini)

For AI-powered chat support functionality:
- `VITE_GOOGLE_AI_API_KEY` - Google AI API key for Gemini

**For production**, this key should be set as a Supabase Edge Function secret:
- `GOOGLE_AI_API_KEY` - Set in Supabase Dashboard → Settings → Edge Functions → Secrets

Get your API key from: [Google AI Studio](https://makersuite.google.com/app/apikey)

### 🔐 Optional (Payment Providers)

The payment service **will work without these** (using mock responses for development), but you'll need them for production payment processing:

#### DPO Pay
- `VITE_DPO_API_URL` - DPO Pay API endpoint (defaults to production URL)
- `VITE_DPO_COMPANY_TOKEN` - Your DPO company token
- `VITE_DPO_SERVICE_TYPE` - Your DPO service type ID

#### Orange Money
- `VITE_ORANGE_API_URL` - Orange Money API endpoint
- `VITE_ORANGE_MERCHANT_KEY` - Your Orange Money merchant key
- `VITE_ORANGE_RETURN_URL` - URL to redirect after successful payment
- `VITE_ORANGE_CANCEL_URL` - URL to redirect after cancelled payment
- `VITE_ORANGE_NOTIF_URL` - Webhook URL for payment notifications

#### Payment URLs
- `VITE_PAYMENT_SUCCESS_URL` - Defaults to `/booking/confirmation`
- `VITE_PAYMENT_CANCEL_URL` - Defaults to `/booking/payment`
- `VITE_PAYMENT_WEBHOOK_URL` - Defaults to `/api/payment/webhook`

#### Webhook Secrets (For Supabase Edge Functions)
These should be set in Supabase Dashboard → Settings → Edge Functions → Secrets, not in `.env`:
- `WEBHOOK_SECRET_DPO` - Secret for verifying DPO webhook signatures
- `WEBHOOK_SECRET_ORANGE` - Secret for verifying Orange Money webhook signatures

## Development vs Production

### Development (Local)
- **Optional**: You can run without `.env` file
- Payment service uses **mock responses** when API keys are missing
- Supabase credentials can remain hardcoded (if already set up)

### Production
- **Required**: Set up `.env` with actual credentials
- Use environment variables for all sensitive data
- Never commit `.env` to git (already in `.gitignore`)
- Use your hosting platform's environment variable settings

## Getting Credentials

### Supabase
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy **Project URL** → `VITE_SUPABASE_URL`
5. Copy **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### DPO Pay
1. Contact DPO Pay for merchant account
2. Get credentials from your DPO merchant dashboard
3. Configure your service type and company token

### Orange Money
1. Register as Orange Money merchant
2. Get API credentials from Orange Money developer portal
3. Configure return/cancel URLs for your domain

## Security Notes

⚠️ **Important:**
- `.env` files are **automatically ignored** by git (in `.gitignore`)
- **Never commit** `.env` files to version control
- Use different credentials for development and production
- For production, use your hosting platform's environment variable settings (not `.env` files)
- **Supabase credentials are now moved to environment variables** (see `src/services/supabase.js`)
- Always use environment variables for sensitive data in production

## Vite Environment Variables

This project uses **Vite**, which requires the `VITE_` prefix for client-side environment variables.

- ✅ `VITE_SUPABASE_URL` - Works (prefixed with `VITE_`)
- ❌ `SUPABASE_URL` - Won't work (no `VITE_` prefix)

All environment variables must start with `VITE_` to be accessible in the browser.

## Troubleshooting

### Variables not working?
1. Make sure variables start with `VITE_`
2. Restart your dev server after changing `.env`
3. Check `.env` file is in the project root (same folder as `package.json`)

### Payment not working?
- Check that payment provider credentials are correct
- Verify API URLs are correct
- For development, payment service will use mock responses if credentials are missing

## Current Setup Status

- ✅ `.env.example` - Template file (committed to git)
- ✅ `.gitignore` - Ignores `.env` files
- ✅ Supabase credentials - Now use environment variables (with fallback for backward compatibility)
- ✅ Payment service - Works with or without API keys (uses mocks when missing)
- ✅ Webhook handlers - Supabase Edge Functions configured

## Webhook Setup

Webhooks are handled via Supabase Edge Functions. To set up:

1. **Deploy Edge Functions:**
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy functions
   supabase functions deploy payment-webhook-dpo
   supabase functions deploy payment-webhook-orange
   ```

2. **Set Webhook Secrets:**
   - Go to Supabase Dashboard → Settings → Edge Functions → Secrets
   - Add `WEBHOOK_SECRET_DPO` and `WEBHOOK_SECRET_ORANGE`
   - Add `GOOGLE_AI_API_KEY` for AI chat support
   - These are used to verify webhook signatures and for AI functionality

3. **Configure Webhook URLs:**
   - DPO: Set webhook URL in DPO merchant dashboard to: `https://your-project.supabase.co/functions/v1/payment-webhook-dpo`
   - Orange Money: Set notification URL in Orange Money dashboard to: `https://your-project.supabase.co/functions/v1/payment-webhook-orange`

See `PAYMENT_INTEGRATION.md` for detailed webhook setup instructions.
