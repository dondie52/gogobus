# GOGOBUS 🚌

A mobile-first Progressive Web App for booking bus tickets in Botswana. Similar to BuuPass, GOGOBUS lets users search for buses, select seats, book tickets, pay via mobile money, and receive QR e-tickets.

## Features

### Completed ✅
- **Onboarding Flow** - 3-screen swipeable introduction
- **Authentication** - Email/password, magic link, social login (Google, Facebook, Apple)
- **User Profiles** - Avatar upload, personal info, province/city
- **Home Screen** - Search form with city dropdowns, popular routes
- **Search Results** - Bus listings with filters (time of day) and sorting
- **Seat Selection** - Interactive seat map with multi-seat support
- **Passenger Details** - Form with pre-fill from user profile
- **Booking Summary** - Trip details and price breakdown
- **Payment** - Mobile money and card payment options
- **E-Tickets** - QR code generation for boarding
- **My Tickets** - Booking history with upcoming/past tabs

### Coming Soon 🚧
- Live bus tracking
- Push notifications
- Loyalty points/rewards
- Reviews and ratings

## Tech Stack

- **Frontend**: React 18, Vite, CSS Modules
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Payment**: DPO Pay, Orange Money
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4
- **Fonts**: Plus Jakarta Sans
- **QR Codes**: qrcode library

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/dondie52/gogobus.git
cd gogobus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set up Environment Variables

Copy `.env.example` to `.env` (if available) or create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [README-ENV.md](./README-ENV.md) for all environment variables.

### 4. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the seed data script in Supabase SQL Editor:
   - Copy contents of `scripts/seed-data.sql`
   - Paste in SQL Editor and run
3. Deploy Edge Functions (for payment webhooks):
   ```bash
   supabase functions deploy payment-webhook-dpo
   supabase functions deploy payment-webhook-orange
   ```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 7. Preview Production Build

```bash
npm run preview
```

## Production Deployment

For production deployment, see [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

**Quick deployment options:**
- **Vercel**: Import repository → Configure environment variables → Deploy
- **Netlify**: Import repository → Configure environment variables → Deploy
- **Other platforms**: Build locally (`npm run build`) → Deploy `dist/` folder

## File Structure

```
gogobus/
├── index.html          # Main SPA with all screens
├── styles.css          # Core styles and variables
├── onboarding.css      # Onboarding screen styles
├── auth.css            # Authentication screen styles
├── home.css            # Home, search, tickets styles
├── booking.css         # Booking flow styles
├── app.js              # Navigation and screen management
├── auth.js             # Authentication logic
├── home.js             # Home screen and search logic
├── booking.js          # Seat selection and booking
├── ticket.js           # QR code and ticket display
├── supabase-config.js  # Backend configuration
├── scripts/
│   └── seed-data.sql   # Database seed data
├── reset-password/
│   └── index.html      # Password reset page
└── images/
    └── bus.jpg         # Bus illustration
```

## Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profile data |
| `companies` | Bus company information |
| `routes` | Origin/destination pairs |
| `buses` | Individual bus details |
| `schedules` | Trip times and availability |
| `bookings` | User bookings |
| `payments` | Payment transactions |

## User Flow

```
Splash → Onboarding → Get Started → Login/Signup
                                          ↓
                            Email Verification
                                          ↓
                            Complete Profile
                                          ↓
    Home ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← Success
     ↓
Search Results → Seat Selection → Passenger Details
                                          ↓
                            Booking Summary
                                          ↓
                                Payment
                                          ↓
                            Confirmation → E-Ticket
```

## Documentation

- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Admin Manual](./docs/ADMIN_MANUAL.md)** - Admin dashboard guide
- **[Customer Support FAQ](./docs/CUSTOMER_SUPPORT_FAQ.md)** - User FAQ
- **[Environment Variables](./README-ENV.md)** - Environment setup guide
- **[Privacy Policy](./docs/PRIVACY_POLICY.md)** - Privacy policy
- **[Terms of Service](./docs/TERMS_OF_SERVICE.md)** - Terms of service

## Design System

### Colors
- **Primary**: `#1B4D4A` (Dark teal)
- **Accent**: `#F5A623` (Orange)
- **Background**: `#1B4D4A` (dark) / `#F7F7F7` (light)

### Typography
- **Font**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700, 800

### Spacing
Based on 4px unit: 4, 8, 12, 16, 20, 24, 32, 40px

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ for Botswana
