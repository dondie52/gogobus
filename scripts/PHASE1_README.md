# Phase 1: Database & Backend Completion

This directory contains the SQL scripts needed to complete Phase 1 of the GOGOBUS MVP Roadmap.

## 📋 Overview

Phase 1 focuses on completing the database schema, RLS policies, and production seed data. This includes:

- ✅ Complete database schema with all tables
- ✅ Complete RLS (Row Level Security) policies
- ✅ Production seed data (all Botswana routes, operators, 30-day schedules)
- ✅ Performance indexes

## 📁 Scripts

### 1. `phase1-complete-schema.sql` ⭐ **START HERE**

**Main script that sets up everything.** Run this first in Supabase SQL Editor.

**What it does:**
- Creates all database tables (profiles, companies, routes, buses, schedules, bookings, payments)
- Enables Row Level Security (RLS) on all tables
- Creates comprehensive RLS policies for all tables
- Seeds production data:
  - 5 bus operators (Seabelo Express, Maun Coaches, Eagle Liner, Intercape, Cross Country)
  - 18 routes (all Botswana routes from roadmap)
  - 10 buses
  - Schedules for next 30 days
- Creates performance indexes
- Sets up triggers for auto-updating timestamps

**Usage:**
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy and paste the entire `phase1-complete-schema.sql` file
4. Click **Run**
5. Wait for completion (may take 1-2 minutes due to 30-day schedule generation)

### 2. `phase1-verification.sql`

**Verification script to check everything is set up correctly.**

**What it does:**
- Verifies all tables exist
- Verifies all required columns exist
- Checks RLS is enabled on all tables
- Lists all RLS policies
- Verifies foreign key relationships
- Checks indexes are created
- Verifies seed data counts
- Checks all routes from roadmap are present
- Checks all bus operators are present

**Usage:**
1. After running `phase1-complete-schema.sql`
2. Run `phase1-verification.sql` in Supabase SQL Editor
3. Review the results - all checks should show ✅

## 📊 Database Schema

### Tables Created

| Table | Description | RLS Enabled |
|-------|-------------|-------------|
| `profiles` | User profiles with role support | ✅ |
| `companies` | Bus operators/companies | ✅ |
| `routes` | Origin/destination routes | ✅ |
| `buses` | Individual bus vehicles | ✅ |
| `schedules` | Trip schedules | ✅ |
| `bookings` | User bookings | ✅ |
| `payments` | Payment records | ✅ |

### RLS Policies

All tables have comprehensive RLS policies:

- **profiles**: Users can read/update own profile, admins can read all
- **routes**: Public read, admin write (CRUD)
- **buses**: Public read, admin write (CRUD)
- **schedules**: Public read, admin write (CRUD)
- **bookings**: Users see own bookings, admins see all
- **payments**: Users see own payments, admins see all
- **companies**: Public read, admin write (CRUD)

## 🌍 Production Seed Data

### Routes (18 total)

All bidirectional routes:

- Gaborone ↔ Francistown
- Gaborone ↔ Maun
- Gaborone ↔ Kasane
- Gaborone ↔ Palapye
- Gaborone ↔ Serowe
- Gaborone ↔ Mahalapye
- Francistown ↔ Maun
- Francistown ↔ Kasane
- Maun ↔ Kasane

### Bus Operators (5 total)

- Seabelo Express
- Maun Coaches
- Eagle Liner
- Intercape
- Cross Country

### Buses (10 total)

- 2 buses per operator
- Various types: Luxury Coach, Standard Coach, Safari Luxury
- Amenities: WiFi, AC, USB, TV

### Schedules (30 days)

- Generated for next 30 days
- Multiple departure times per day for popular routes
- Random seat availability (realistic booking simulation)

## 🔐 Admin Setup

After running `phase1-complete-schema.sql`, set up an admin user:

1. Run `scripts/set-admin-role.sql` (update the email in the script first)
2. Or manually run:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

## ⚙️ Next Steps

After Phase 1 is complete:

1. **Optional - Enhanced Payments**: Run `002_payments_schema.sql` for the complete payments system (replaces the simple payments table with a full-featured one)

2. **Test Admin Dashboard**: 
   - Login as admin
   - Test Trip Management (Create, Read, Update, Delete)
   - Test Routes Management (CRUD)
   - Test Bookings Overview
   - Test CSV Export
   - Test QR Scanner
   - Test Settings Management

3. **Verify User Experience**:
   - Users can browse routes and schedules
   - All database operations respect security policies

## 🐛 Troubleshooting

### Tables already exist

The script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times. However, if you need to start fresh:

1. **Backup your data first!**
2. Drop tables manually or use Supabase's schema reset feature

### Schedules not generating

If schedules aren't being generated:
- Check that routes and buses are inserted first (they should be)
- Check for errors in the SQL output
- Verify the DO block executed successfully

### RLS policies not working

If RLS policies aren't working:
- Check that RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- Verify policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public'`
- Check user role: `SELECT role FROM profiles WHERE id = auth.uid()`

## ✅ Success Criteria

Phase 1 is complete when:

- ✅ All 7 tables exist with correct columns
- ✅ All tables have RLS enabled
- ✅ All RLS policies are in place
- ✅ 18 routes are seeded
- ✅ 5 bus operators are seeded
- ✅ 10 buses are seeded
- ✅ Schedules exist for next 30 days
- ✅ Admin can create trips without errors
- ✅ Users can browse routes and schedules
- ✅ All database operations respect security policies

## 📝 Notes

- The `payments` table created here is a simple version. For production, run `002_payments_schema.sql` which creates a comprehensive payments system with refunds, webhooks, etc.
- The `booking_ref` column in bookings uses `TEXT UNIQUE` - make sure to generate unique booking references in your application code
- Schedules are generated with random seat availability to simulate real bookings - this is intentional for testing

---

**Status**: ✅ Phase 1 scripts ready for execution  
**Last Updated**: January 2025
