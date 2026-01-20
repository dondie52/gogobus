# GOGOBUS Troubleshooting Guide

Common issues and solutions for GOGOBUS deployment and operation.

## Table of Contents

1. [Deployment Issues](#deployment-issues)
2. [Database Connection Problems](#database-connection-problems)
3. [Payment Gateway Issues](#payment-gateway-issues)
4. [Authentication Issues](#authentication-issues)
5. [Error Tracking Issues](#error-tracking-issues)
6. [Analytics Issues](#analytics-issues)
7. [Performance Issues](#performance-issues)
8. [Support Contacts](#support-contacts)

## Deployment Issues

### Build Fails

**Problem:** Build command fails with errors

**Solutions:**
1. Check Node.js version (requires 18+)
   ```bash
   node --version
   ```

2. Clear cache and reinstall dependencies
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Check for missing environment variables
   - Verify all required variables are set in deployment platform
   - Check `.env.production.example` for reference

4. Review build logs for specific errors
   - Check for import errors
   - Verify all dependencies are in `package.json`

### Environment Variables Not Working

**Problem:** Environment variables not accessible in production

**Solutions:**
1. Ensure variables are prefixed with `VITE_` (required for Vite)
2. Verify variables are set for correct environment (Production)
3. Restart/redeploy after adding variables
4. Check variable names match exactly (case-sensitive)

### 404 Errors on Routes

**Problem:** Direct URL access returns 404

**Solutions:**
1. **Vercel:** Add `vercel.json`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

2. **Netlify:** Add `public/_redirects`:
   ```
   /*    /index.html   200
   ```

3. **Apache:** Add `.htaccess`:
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

## Database Connection Problems

### Cannot Connect to Supabase

**Problem:** Application cannot connect to Supabase

**Solutions:**
1. Verify Supabase URL is correct
   - Check in Supabase Dashboard → Settings → API
   - Ensure URL includes `https://`

2. Verify anon key is correct
   - Copy from Supabase Dashboard → Settings → API
   - Check for typos

3. Check Supabase project status
   - Ensure project is not paused
   - Verify billing is active (if required)

4. Check network/firewall
   - Ensure deployment platform can reach Supabase
   - Check for IP restrictions

### RLS Policy Errors

**Problem:** Users cannot access their data

**Solutions:**
1. Verify RLS is enabled on tables
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. Check policies exist
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'your_table';
   ```

3. Test with admin user
   - Verify admin role is set correctly
   - Check admin policies are correct

### Slow Database Queries

**Problem:** Database queries are slow

**Solutions:**
1. Add indexes to frequently queried columns
   ```sql
   CREATE INDEX idx_bookings_user_id ON bookings(user_id);
   CREATE INDEX idx_schedules_date ON schedules(departure_time);
   ```

2. Use query profiling
   - Check Supabase Dashboard → Database → Query Performance
   - Identify slow queries

3. Optimize RLS policies
   - Ensure policies use indexed columns
   - Avoid complex joins in policies

## Payment Gateway Issues

### DPO Pay Errors

**Problem:** DPO Pay payment fails

**Solutions:**
1. Verify credentials
   - Check Company Token is correct
   - Verify Service Type ID is correct
   - Ensure credentials are for production (not sandbox)

2. Check API endpoint
   - Production: `https://secure.3gdirectpay.com/API/v6/`
   - Verify URL is correct

3. Verify webhook URL
   - Check webhook URL is accessible
   - Ensure webhook secret matches
   - Test webhook endpoint manually

4. Check payment amount
   - Verify amount format (decimal with 2 places)
   - Ensure currency is BWP

### Orange Money Errors

**Problem:** Orange Money payment fails

**Solutions:**
1. Verify merchant credentials
   - Check merchant key is correct
   - Ensure credentials are for production

2. Verify webhook URL
   - Check webhook URL is accessible
   - Ensure it's HTTPS (required)

3. Check return URLs
   - Verify success/cancel URLs are correct
   - Ensure URLs are HTTPS

### Payment Webhook Not Received

**Problem:** Webhook not triggering after payment

**Solutions:**
1. Verify webhook URL is accessible
   ```bash
   curl https://your-project.supabase.co/functions/v1/payment-webhook-dpo
   ```

2. Check webhook secret matches
   - Verify in Supabase Dashboard → Edge Functions → Secrets
   - Check signature verification in webhook handler

3. Check Supabase Edge Functions logs
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for errors

4. Verify payment gateway webhook settings
   - Check webhook URL in payment gateway dashboard
   - Ensure webhook is enabled

## Authentication Issues

### Login Fails

**Problem:** Users cannot log in

**Solutions:**
1. Check Supabase Auth configuration
   - Verify email provider is enabled
   - Check SMTP settings for email verification

2. Verify rate limiting
   - Check if user is locked out
   - Review rate limit configuration

3. Check browser console for errors
   - Look for authentication errors
   - Check network requests

### Email Verification Not Working

**Problem:** Verification emails not sent

**Solutions:**
1. Configure SMTP in Supabase
   - Go to Settings → Auth → SMTP Settings
   - Use SendGrid, AWS SES, or similar
   - Test email delivery

2. Check email templates
   - Verify templates in Supabase Dashboard
   - Ensure templates include verification link

3. Check spam folder
   - Verification emails may be filtered
   - Check spam/trash folders

## Error Tracking Issues

### Sentry Not Capturing Errors

**Problem:** Errors not appearing in Sentry

**Solutions:**
1. Verify Sentry DSN is correct
   - Check environment variable `VITE_SENTRY_DSN`
   - Ensure DSN is from Sentry dashboard

2. Check Sentry initialization
   - Verify Sentry initializes in production
   - Check browser console for initialization logs

3. Verify error is sent
   - Check Sentry dashboard → Issues
   - Verify errors are not filtered

4. Check environment
   - Ensure Sentry only initializes in production
   - Verify environment variable is set correctly

### Too Many Errors in Sentry

**Problem:** Sentry flooded with non-critical errors

**Solutions:**
1. Configure error filtering in `src/utils/sentry.js`
   - Add errors to `ignoreErrors` array
   - Configure `beforeSend` filter

2. Adjust sample rate
   - Reduce `tracesSampleRate` if too many performance traces

## Analytics Issues

### GA4 Not Tracking

**Problem:** Events not appearing in GA4

**Solutions:**
1. Verify Measurement ID
   - Check `VITE_GA4_MEASUREMENT_ID` is correct
   - Format: `G-XXXXXXXXXX`

2. Check cookie consent
   - Verify user has accepted cookies
   - Check `localStorage.getItem('cookie_consent')`

3. Verify GA4 script loads
   - Check browser Network tab
   - Look for `gtag` or `analytics.js` requests

4. Test with GA4 DebugView
   - Enable debug mode in GA4
   - Check real-time events

### Events Not Firing

**Problem:** Conversion events not tracked

**Solutions:**
1. Verify event tracking code
   - Check events are called after actions
   - Verify event parameters are correct

2. Check browser console
   - Look for GA4 errors
   - Verify `trackEvent` function exists

## Performance Issues

### Slow Page Loads

**Problem:** Application loads slowly

**Solutions:**
1. Enable code splitting
   - Verify lazy loading is used
   - Check chunk sizes

2. Optimize images
   - Use WebP format
   - Compress images
   - Use CDN for images

3. Check bundle size
   ```bash
   npm run build
   # Check dist/ folder sizes
   ```

4. Enable compression
   - Ensure gzip/brotli is enabled
   - Check CDN compression settings

### Slow Database Queries

**Problem:** Queries taking too long

**Solutions:**
1. Add database indexes
2. Optimize RLS policies
3. Use query caching where appropriate
4. Monitor query performance in Supabase Dashboard

## Support Contacts

### Technical Support
- **Email:** support@gogobus.co.bw
- **Phone:** +267 12 345 678

### Service Providers

**Supabase:**
- Documentation: https://supabase.com/docs
- Support: https://supabase.com/support
- Discord: https://discord.supabase.com

**DPO Pay:**
- Email: support@directpay.online
- Dashboard: https://secure.3gdirectpay.com

**Orange Money:**
- Email: merchant@orange.co.bw
- Support: Contact Orange Money merchant support

**Sentry:**
- Documentation: https://docs.sentry.io
- Support: https://sentry.io/support/

**Vercel/Netlify:**
- Check platform-specific documentation
- Use platform support channels

---

**Last Updated:** January 2025
