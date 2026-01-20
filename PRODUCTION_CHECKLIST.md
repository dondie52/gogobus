# GOGOBUS Production Deployment Checklist

**Last Updated:** January 2025  
**Status:** Ready for Production Deployment

---

## 📋 Pre-Deployment Checklist

### 1. Environment Setup ✅

- [ ] Create production Supabase project
- [ ] Configure production environment variables:
  - [ ] `VITE_SUPABASE_URL` - Production Supabase URL
  - [ ] `VITE_SUPABASE_ANON_KEY` - Production Supabase anon key
  - [ ] `VITE_SENTRY_DSN` - Sentry error tracking (recommended)
  - [ ] `VITE_GA4_MEASUREMENT_ID` - Google Analytics 4 (recommended)
  - [ ] `VITE_DPO_COMPANY_TOKEN` - DPO Pay credentials (required for payments)
  - [ ] `VITE_DPO_SERVICE_TYPE` - DPO Pay service type (required for payments)
  - [ ] `VITE_ORANGE_MERCHANT_KEY` - Orange Money credentials (required for payments)

### 2. Database Setup ✅

- [ ] Run database migrations in production Supabase
- [ ] Set up Row Level Security (RLS) policies
- [ ] Seed production data (routes, buses, schedules)
- [ ] Create admin user account
- [ ] Verify RLS policies are working correctly

### 3. Payment Integration ✅

- [ ] Obtain DPO Pay merchant credentials
- [ ] Obtain Orange Money API credentials
- [ ] Test payment flows in sandbox environment
- [ ] Configure webhook URLs in payment provider dashboards:
  - [ ] DPO Pay webhook: `https://your-project.supabase.co/functions/v1/payment-webhook-dpo`
  - [ ] Orange Money webhook: `https://your-project.supabase.co/functions/v1/payment-webhook-orange`
- [ ] Deploy Supabase Edge Functions for webhooks
- [ ] Set webhook secrets in Supabase dashboard

### 4. Security Hardening ✅

- [ ] Verify all RLS policies are active
- [ ] Review and test authentication flows
- [ ] Verify rate limiting is working
- [ ] Test input validation on all forms
- [ ] Verify XSS prevention is working
- [ ] Review error messages (no sensitive data leakage)
- [ ] Enable Supabase security features (if available)

### 5. Testing ✅

- [ ] Run full test suite: `npm run test:all`
- [ ] Test complete booking flow end-to-end
- [ ] Test payment flows (sandbox)
- [ ] Test admin dashboard functionality
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile device testing (iOS Safari, Android Chrome)
- [ ] Load testing (if possible)

### 6. Build & Deployment ✅

- [ ] Run production build: `npm run build`
- [ ] Verify build output in `dist/` folder
- [ ] Check build size (should be optimized)
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to hosting platform (Vercel, Netlify, etc.)
- [ ] Configure custom domain
- [ ] Set up SSL certificate (automatic on most platforms)

### 7. Post-Deployment Verification ✅

- [ ] Verify site is accessible at production URL
- [ ] Test authentication (signup, login, logout)
- [ ] Test booking flow (search → payment → ticket)
- [ ] Test admin dashboard access
- [ ] Verify error tracking (Sentry) is working
- [ ] Verify analytics (GA4) is tracking events
- [ ] Test payment flows (small test transactions)
- [ ] Verify webhooks are receiving payment notifications

### 8. Monitoring & Alerts ✅

- [ ] Set up Sentry alerts for critical errors
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure email/Slack alerts for errors
- [ ] Set up database backup monitoring

### 9. Documentation ✅

- [ ] Update production URLs in documentation
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document rollback procedure

### 10. Launch Preparation ✅

- [ ] Prepare customer support channels
- [ ] Set up support email monitoring
- [ ] Prepare launch announcement
- [ ] Set up social media accounts (if applicable)
- [ ] Prepare press release (if applicable)

---

## 🚀 Quick Deployment Commands

### Using the Deployment Script

```bash
# Make script executable
chmod +x scripts/production-deploy.sh

# Run deployment script
./scripts/production-deploy.sh
```

### Manual Deployment Steps

```bash
# 1. Install dependencies
npm ci

# 2. Run tests
npm run test:all

# 3. Build for production
npm run build

# 4. Preview production build (optional)
npm run preview

# 5. Deploy dist/ folder to your hosting platform
```

---

## 🔧 Environment Variables Reference

### Required Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Recommended Variables

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Payment Variables (Required for Payments)

```env
VITE_DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
VITE_DPO_COMPANY_TOKEN=your-company-token
VITE_DPO_SERVICE_TYPE=your-service-type
VITE_ORANGE_API_URL=https://api.orange.com/orange-money-webpay/bw/v1
VITE_ORANGE_MERCHANT_KEY=your-merchant-key
VITE_ORANGE_RETURN_URL=https://your-domain.com/booking/confirmation
VITE_ORANGE_CANCEL_URL=https://your-domain.com/booking/payment
VITE_ORANGE_NOTIF_URL=https://your-project.supabase.co/functions/v1/payment-webhook-orange
```

---

## 📊 Production Readiness Score

After completing the checklist, your production readiness should be:

- **Environment Setup:** 100%
- **Database Setup:** 100%
- **Payment Integration:** 100% (with credentials)
- **Security:** 100%
- **Testing:** 100%
- **Build & Deployment:** 100%
- **Monitoring:** 100%

**Overall: 100% Production Ready** ✅

---

## 🆘 Troubleshooting

### Build Fails

1. Check Node.js version (should be 18+)
2. Clear `node_modules` and reinstall: `rm -rf node_modules && npm ci`
3. Check for TypeScript errors: `npm run lint`

### Environment Variables Not Working

1. Verify variables start with `VITE_` prefix
2. Restart dev server after changing `.env`
3. Check hosting platform environment variable settings

### Payment Not Working

1. Verify payment provider credentials are correct
2. Check webhook URLs are configured correctly
3. Verify Edge Functions are deployed
4. Check webhook secrets in Supabase dashboard

### Admin Dashboard Not Accessible

1. Verify user has `admin` role in `profiles` table
2. Check browser console for errors
3. Verify RLS policies allow admin access

---

## 📞 Support

For deployment issues, refer to:
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Detailed deployment guide
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues and solutions
- [PRODUCTION_SETUP.md](./docs/PRODUCTION_SETUP.md) - Production environment setup

---

**Ready to launch! 🚀**
