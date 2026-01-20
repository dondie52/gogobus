# Production Setup Guide

This guide covers the complete setup process for deploying GOGOBUS to production.

## Prerequisites

- Production Supabase project
- Domain name (gogobus.co.bw)
- SSL certificate
- Payment gateway merchant accounts (DPO Pay, Orange Money)
- Sentry account (for error tracking)
- Google Analytics 4 property

## 1. Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sentry
VITE_SENTRY_DSN=your-sentry-dsn

# Google Analytics
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# App
VITE_APP_URL=https://gogobus.co.bw
VITE_APP_VERSION=1.0.0

# Payment Gateways (Server-side, use Supabase secrets)
DPO_COMPANY_TOKEN=your-dpo-token
DPO_SERVICE_TYPE=your-service-type
ORANGE_MONEY_API_KEY=your-orange-key
ORANGE_MONEY_MERCHANT_ID=your-merchant-id
```

## 2. Supabase Production Setup

### 2.1 Create Production Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and anon key

### 2.2 Run Database Migrations

1. Go to SQL Editor in Supabase
2. Run `scripts/phase1-complete-schema.sql`
3. Verify all tables and RLS policies are created

### 2.3 Configure RLS Policies

Verify all RLS policies are enabled:
- Profiles: Users can read/update own, admins can read all
- Routes: Public read, admin write
- Buses: Public read, admin write
- Schedules: Public read, admin write
- Bookings: Users see own, admins see all
- Payments: Users see own, admins see all

### 2.4 Seed Production Data

1. Run `scripts/seed-data.sql` in SQL Editor
2. Verify routes, buses, and schedules are created
3. Create admin user:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@gogobus.co.bw';
   ```

### 2.5 Configure Edge Functions

Deploy webhook handlers:
```bash
supabase functions deploy payment-webhook-dpo
supabase functions deploy payment-webhook-orange
```

### 2.6 Set Up Secrets

In Supabase Dashboard → Settings → Secrets:
- `DPO_COMPANY_TOKEN`
- `DPO_SERVICE_TYPE`
- `ORANGE_MONEY_API_KEY`
- `ORANGE_MONEY_MERCHANT_ID`

## 3. Domain & SSL Setup

### 3.1 Configure Domain

1. Point your domain (gogobus.co.bw) to your hosting provider
2. Configure DNS records as required

### 3.2 SSL Certificate

1. Use Let's Encrypt or your hosting provider's SSL
2. Ensure HTTPS is enforced (redirect HTTP to HTTPS)
3. Configure HSTS headers

### 3.3 CDN Setup (Optional)

For static assets:
- Cloudflare CDN
- AWS CloudFront
- Vercel/Netlify CDN (if hosting there)

## 4. Error Monitoring (Sentry)

### 4.1 Create Sentry Project

1. Go to [Sentry.io](https://sentry.io)
2. Create a new project (React)
3. Copy your DSN

### 4.2 Configure Environment Variables

Add `VITE_SENTRY_DSN` to your production environment variables.

### 4.3 Set Up Alerts

1. Configure email alerts for critical errors
2. Set up Slack integration (optional)
3. Configure release tracking

## 5. Analytics Setup (Google Analytics 4)

### 5.1 Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property
3. Copy your Measurement ID (G-XXXXXXXXXX)

### 5.2 Configure Conversion Events

Track these events:
- `signup_completed`
- `booking_completed`
- `payment_successful`

### 5.3 Set Up Goals

1. Signup completion
2. Booking completion
3. Payment success

## 6. Payment Gateway Setup

### 6.1 DPO Pay

1. Register merchant account at [DPO Pay](https://www.directpay.online)
2. Obtain Company Token and Service Type
3. Configure webhook URL: `https://your-project.supabase.co/functions/v1/payment-webhook-dpo`
4. Test in sandbox environment first

### 6.2 Orange Money

1. Register merchant API account
2. Obtain API credentials
3. Configure webhook URL: `https://your-project.supabase.co/functions/v1/payment-webhook-orange`
4. Test with sandbox numbers

## 7. Build & Deploy

### 7.1 Build Production Bundle

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### 7.2 Deploy

Choose your hosting platform:

**Option 1: Vercel**
```bash
npm i -g vercel
vercel --prod
```

**Option 2: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod
```

**Option 3: Traditional Hosting**
Upload `dist/` folder contents to your web server.

### 7.3 Configure Redirects

For SPA routing, ensure all routes redirect to `index.html`:
- Apache: `.htaccess`
- Nginx: `nginx.conf`
- Vercel/Netlify: `vercel.json` or `netlify.toml`

## 8. Post-Deployment Checklist

- [ ] Test all critical user flows
- [ ] Verify payment integration works
- [ ] Test admin dashboard functionality
- [ ] Verify email confirmations work
- [ ] Check error monitoring is capturing data
- [ ] Verify analytics is tracking events
- [ ] Test on mobile devices
- [ ] Check SSL certificate is valid
- [ ] Verify CORS settings
- [ ] Test booking flow end-to-end

## 9. Monitoring & Maintenance

### 9.1 Regular Checks

- Monitor Sentry for errors
- Check Supabase dashboard for database issues
- Review Google Analytics for traffic patterns
- Monitor payment gateway webhooks

### 9.2 Database Backups

Configure automated backups in Supabase:
- Daily backups (recommended)
- Point-in-time recovery enabled
- Test restore process quarterly

### 9.3 Performance Monitoring

- Monitor Core Web Vitals (LCP, FID, CLS)
- Track API response times
- Monitor database query performance
- Review slow query logs

## 10. Security Checklist

- [ ] All environment variables set (no hardcoded secrets)
- [ ] SSL certificate configured and valid
- [ ] CORS properly configured
- [ ] RLS policies verified
- [ ] Rate limiting enabled
- [ ] Error tracking active (Sentry)
- [ ] Security headers configured
- [ ] Content Security Policy set (if needed)
- [ ] Password reset flow tested
- [ ] Email verification working

## 11. Support & Documentation

### 11.1 Customer Support

- Set up support email (support@gogobus.co.bw)
- Configure email forwarding
- Set up monitoring for support requests

### 11.2 Documentation

- API documentation
- Admin user manual
- Customer FAQ
- Troubleshooting guide

## 12. Launch Day

1. **Pre-Launch**
   - Final testing of all flows
   - Team briefing
   - Rollback plan ready

2. **Launch**
   - Deploy to production
   - Smoke test all critical flows
   - Monitor error dashboard
   - Monitor server performance
   - Team on standby

3. **Post-Launch**
   - Monitor for issues
   - Gather user feedback
   - Address any critical bugs
   - Celebrate! 🚀

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## Support

For deployment issues:
- Check deployment logs
- Review Supabase logs
- Check Sentry for errors
- Contact: support@gogobus.co.bw

---

**Last Updated:** January 2025
