# Scripts

This directory contains helper scripts for the GOGOBUS application.

## SQL Schema Scripts

### `seed-data.sql`

SQL script to populate the Supabase database with test data for the bus booking system.

**Usage:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `seed-data.sql`
5. Click **Run**

**What it creates:**
- 5 bus companies (Intercity Express, Botswana Coach, etc.)
- 16 routes connecting major Botswana cities
- 10 buses with various amenities
- Schedules for the next 14 days
- Proper indexes for performance
- Row Level Security policies

**Routes included:**
- Gaborone ↔ Francistown
- Gaborone ↔ Maun
- Gaborone ↔ Kasane
- Gaborone ↔ Palapye
- Francistown ↔ Maun
- Francistown ↔ Kasane
- And more...

---

### `002_payments_schema.sql`

**⚠️ IMPORTANT: Run this AFTER `seed-data.sql` (or after your base schema is set up)**

Complete payments system schema including payments, refunds, and webhooks tables.

**Usage:**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `002_payments_schema.sql`
5. Click **Run**

**What it creates:**
- `payments` table - Complete payment records with provider integration
- `refunds` table - Refund requests and processing
- `payment_webhooks` table - Webhook logs for debugging
- Row Level Security (RLS) policies for secure access
- Helper functions for payment status updates
- Database views for admin dashboards
- Triggers for automatic booking status updates

**Features:**
- ✅ Multiple payment providers (DPO Pay, Orange Money, Manual)
- ✅ Payment status tracking (pending, completed, failed, refunded)
- ✅ Automatic booking status updates when payment completes
- ✅ Secure RLS policies (users can only see their own payments)
- ✅ Admin access for payment management
- ✅ Refund request and processing system
- ✅ Payment summary functions
- ✅ Daily payment statistics view

**Prerequisites:**
- Must have `bookings` table already created
- Must have `profiles` table for admin roles
- If running after `seed-data.sql`, it will replace the simple payments table with the full-featured one

**Note:** This script will DROP the existing simple `payments` table from `seed-data.sql` and create the comprehensive payments schema. Make sure to backup any existing payment data if needed.

---

## JavaScript Scripts

### `complete-ts-migration.js`

Detects and removes duplicate JavaScript files when TypeScript versions exist. This helps complete TypeScript migrations by ensuring only `.ts`/`.tsx` files remain.

**Usage:**
```bash
# Dry run (see what would be deleted)
node scripts/complete-ts-migration.js --dry-run

# Actually delete duplicate JS files
node scripts/complete-ts-migration.js

# Verbose output
node scripts/complete-ts-migration.js --verbose
```

**What it does:**
- Scans the project for JavaScript files (`.js`, `.jsx`)
- Checks if corresponding TypeScript files exist (`.ts`, `.tsx`)
- Warns if JavaScript files are still imported
- Deletes JavaScript files that have TypeScript versions (unless still imported)

**Example output:**
```
🔍 Scanning for duplicate JavaScript/TypeScript files...

Found 5 duplicate file pair(s):

📄 src/apiClient.js
   → TypeScript version: src/apiClient.ts

📄 src/hooks/useApi.js
   → TypeScript version: src/hooks/useApi.ts
   ⚠️  WARNING: Still imported - update imports before deleting

...
```

---

### `check-imports.js`

Checks if any files are importing JavaScript files that have TypeScript versions. Helps identify which imports need to be updated during TypeScript migration.

**Usage:**
```bash
node scripts/check-imports.js
```

**What it does:**
- Scans all files for import statements
- Identifies imports that reference `.js` files when `.ts` versions exist
- Reports which files need import updates

**Example output:**
```
🔍 Checking for imports of JavaScript files with TypeScript versions...

Found 3 import(s) that need updating:

📄 src/components/App.tsx
   Line ~15: ./apiClient.js
   → Should import TypeScript version instead of src/apiClient.js

...
```

---

## Migration Workflow

When completing a TypeScript migration:

1. **Check for duplicates:**
   ```bash
   node scripts/complete-ts-migration.js --dry-run
   ```

2. **Check for outdated imports:**
   ```bash
   node scripts/check-imports.js
   ```

3. **Update imports** in files that reference `.js` files:
   - Change `import ... from './file.js'` → `import ... from './file'`
   - Or explicitly: `import ... from './file.ts'`

4. **Remove duplicate JavaScript files:**
   ```bash
   node scripts/complete-ts-migration.js
   ```

5. **Verify everything works:**
   - Run your build/test commands
   - Ensure no errors reference deleted `.js` files

---

## Database Setup Workflow

1. **First, set up base schema:**
   - Run `seed-data.sql` in Supabase SQL Editor
   - This creates all base tables (bookings, routes, schedules, etc.)

2. **Then, set up payments:**
   - Run `002_payments_schema.sql` in Supabase SQL Editor
   - This creates the full payments system
   - ⚠️ This replaces the simple payments table from seed-data.sql

3. **Verify setup:**
   - Check that all tables exist
   - Test RLS policies
   - Verify triggers are working

---

## Integration with PR Reviews

These scripts should be run before submitting PRs that add TypeScript files:

- ✅ Run `check-imports.js` to ensure no outdated imports
- ✅ Run `complete-ts-migration.js --dry-run` to verify no duplicates
- ✅ Complete the migration by removing `.js` files in the same PR

See [CODING_STANDARDS.md](../CODING_STANDARDS.md) for more details.
