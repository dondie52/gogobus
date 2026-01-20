# GOGOBUS Production Deployment Guide

This guide provides step-by-step instructions for deploying GOGOBUS to production.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account and project
- Deployment platform account (Vercel, Netlify, or similar)
- Domain name configured (gogobus.co.bw)
- Payment gateway credentials (DPO Pay, Orange Money)
- Sentry account (for error tracking)
- Google Analytics 4 account (for analytics)

## Step 1: Production Supabase Setup

1. **Create Production Supabase Project**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project for production
   - Note the project URL and anon key

2. **Deploy Database Schema**
   - Run all SQL migration scripts from `scripts/`
   - Execute `scripts/phase1-complete-schema.sql`
   - Verify all tables and RLS policies are created

3. **Seed Production Data**
   - Run `scripts/seed-data.sql` to add routes and bus operators
   - Create admin user using `scripts/check-and-create-admin.sql`
   - Verify data is correctly populated

4. **Configure Edge Functions**
   - Deploy payment webhook functions:
     ```bash
     supabase functions deploy payment-webhook-dpo
     supabase functions deploy payment-webhook-orange
     ```
   - Set webhook secrets in Supabase Dashboard → Settings → Edge Functions → Secrets:
     - `WEBHOOK_SECRET_DPO`
     - `WEBHOOK_SECRET_ORANGE`

5. **Configure Backups**
   - Enable daily automated backups in Supabase Dashboard
   - Set backup retention to 30 days
   - Configure point-in-time recovery if available

## Step 2: Environment Variables Configuration

Create production environment variables in your deployment platform:

### Required Variables

```bash
# Supabase
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Application
VITE_APP_URL=https://gogobus.co.bw

# Error Tracking (Sentry)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# Analytics (Google Analytics 4)
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX

# Payment Gateway - DPO Pay
VITE_DPO_API_URL=https://secure.3gdirectpay.com/API/v6/
VITE_DPO_COMPANY_TOKEN=your-production-company-token
VITE_DPO_SERVICE_TYPE=your-production-service-type-id

# Payment Gateway - Orange Money
VITE_ORANGE_API_URL=https://api.orange.com/orange-money-webpay/bw/v1
VITE_ORANGE_MERCHANT_KEY=your-production-merchant-key
VITE_ORANGE_RETURN_URL=https://gogobus.co.bw/booking/confirmation
VITE_ORANGE_CANCEL_URL=https://gogobus.co.bw/booking/payment
VITE_ORANGE_NOTIF_URL=https://your-project.supabase.co/functions/v1/payment-webhook-orange

# Payment URLs (optional, defaults provided)
VITE_PAYMENT_SUCCESS_URL=/booking/confirmation
VITE_PAYMENT_CANCEL_URL=/booking/payment
```

### Setting Variables

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add each variable for Production environment
3. Save and redeploy

**Netlify:**
1. Go to Site Settings → Build & Deploy → Environment
2. Add each variable
3. Save and redeploy

**Other Platforms:**
- Follow platform-specific documentation for setting environment variables

## Step 3: Build Configuration

The project uses Vite for building. The production build is configured in `vite.config.js`.

### Build Command
```bash
npm run build
```

### Output Directory
The build output is in the `dist/` directory.

### Build Settings
- Sourcemaps: Disabled in production (for security)
- Minification: Enabled (esbuild)
- Code splitting: Enabled for optimal loading
- Chunk optimization: React, Supabase, and UI libraries split separately

## Step 4: Deploy to Platform

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```
   
   Or connect your GitHub repository:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure:
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Install Command: `npm install`
   - Add environment variables
   - Deploy

3. **Configure Custom Domain**
   - Go to Project Settings → Domains
   - Add `gogobus.co.bw`
   - Configure DNS records as instructed
   - SSL will be automatically configured

### Option 2: Netlify

1. **Install Netlify CLI** (optional)
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy**
   ```bash
   netlify deploy --prod
   ```
   
   Or connect via Netlify Dashboard:
   - Go to [netlify.com](https://netlify.com)
   - Import your repository
   - Configure:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Add environment variables
   - Deploy

3. **Configure Custom Domain**
   - Go to Site Settings → Domain Management
   - Add custom domain
   - Configure DNS
   - SSL is automatic

### Option 3: Other Static Hosting

For other platforms (AWS S3 + CloudFront, Firebase Hosting, etc.):
1. Build the project: `npm run build`
2. Upload contents of `dist/` directory to hosting
3. Configure environment variables (if supported)
4. Set up custom domain and SSL

## Step 5: Post-Deployment Verification

After deployment, verify the following:

1. **Application Access**
   - Visit `https://gogobus.co.bw`
   - Verify the application loads correctly
   - Check browser console for errors

2. **Authentication**
   - Test user signup
   - Test user login
   - Verify email verification works

3. **Database Connection**
   - Create a test booking
   - Verify data appears in Supabase dashboard
   - Check RLS policies are working

4. **Payment Integration**
   - Test payment flow (use sandbox mode first)
   - Verify webhook URLs are correct
   - Test payment confirmation

5. **Error Tracking**
   - Trigger a test error
   - Verify it appears in Sentry dashboard
   - Check error alerts are configured

6. **Analytics**
   - Visit the site and navigate
   - Verify events appear in GA4 dashboard
   - Check cookie consent banner works

7. **Admin Dashboard**
   - Log in as admin user
   - Test trip creation
   - Test route management
   - Test booking overview

## Step 6: CDN Configuration

Most deployment platforms include CDN automatically. If using a separate CDN:

1. **Cloudflare** (if not using platform CDN)
   - Add site to Cloudflare
   - Configure DNS
   - Enable caching rules:
     - Cache static assets (CSS, JS, images) for 1 year
     - Cache HTML for 1 hour
   - Enable compression (gzip/brotli)

2. **Cache Headers**
   - Static assets: `Cache-Control: public, max-age=31536000, immutable`
   - HTML: `Cache-Control: public, max-age=3600`

## Step 7: SSL Configuration

Most platforms provide automatic SSL via Let's Encrypt:

- **Vercel**: Automatic
- **Netlify**: Automatic
- **Cloudflare**: Enable SSL/TLS in dashboard
- **AWS CloudFront**: Request certificate in ACM

## Rollback Procedure

If deployment causes issues:

1. **Vercel:**
   - Go to Deployments
   - Click "..." on previous deployment
   - Select "Promote to Production"

2. **Netlify:**
   - Go to Deploys
   - Click "Publish deploy" on previous deployment

3. **Manual:**
   - Rebuild previous version from git
   - Redeploy: `git checkout <previous-commit> && npm run build && deploy`

## Continuous Deployment

Set up automatic deployments:

1. **GitHub Actions** (optional)
   - Create `.github/workflows/deploy.yml`
   - Configure to deploy on push to main branch

2. **Platform Integration**
   - Connect GitHub repository
   - Enable automatic deployments
   - Configure branch protection

## Performance Monitoring

After deployment:

1. **Lighthouse Audit**
   - Run Lighthouse audit
   - Target: 90+ scores
   - Fix any issues

2. **Web Vitals**
   - Monitor Core Web Vitals in GA4
   - Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

3. **API Response Times**
   - Monitor Supabase query performance
   - Optimize slow queries

## Security Checklist

- [ ] All environment variables set (no hardcoded secrets)
- [ ] SSL certificate configured and valid
- [ ] CORS properly configured
- [ ] RLS policies verified
- [ ] Rate limiting enabled (if applicable)
- [ ] Error tracking active (Sentry)
- [ ] Security headers configured
- [ ] Content Security Policy set (if needed)

## Support

For deployment issues:
- Check deployment logs
- Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Contact support: support@gogobus.co.bw

---

**Last Updated:** January 2025
