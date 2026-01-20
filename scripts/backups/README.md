# Backup Scripts

Manual backup scripts for GOGOBUS database.

## Usage

### SQL Backup Script

Export critical tables to CSV files:

```sql
-- Run in Supabase SQL Editor
-- This exports all critical tables to CSV format

-- Profiles
COPY (SELECT * FROM profiles) 
TO STDOUT WITH CSV HEADER;

-- Routes  
COPY (SELECT * FROM routes) 
TO STDOUT WITH CSV HEADER;

-- Schedules
COPY (SELECT * FROM schedules) 
TO STDOUT WITH CSV HEADER;

-- Bookings
COPY (SELECT * FROM bookings) 
TO STDOUT WITH CSV HEADER;

-- Payments
COPY (SELECT * FROM payments) 
TO STDOUT WITH CSV HEADER;

-- Tickets
COPY (SELECT * FROM tickets) 
TO STDOUT WITH CSV HEADER;
```

### Manual Backup Process

1. Open Supabase SQL Editor
2. For each table, run the COPY command
3. Save output to CSV files with timestamp
4. Store backups in secure location

### Backup File Naming

Use format: `table_name_YYYYMMDD_HHMMSS.csv`

Example:
- `profiles_20250115_143022.csv`
- `bookings_20250115_143022.csv`

### Restore Process

To restore from CSV backup:

```sql
-- Truncate table (if needed)
TRUNCATE TABLE table_name CASCADE;

-- Import from CSV
COPY table_name (column1, column2, ...)
FROM '/path/to/backup.csv'
WITH CSV HEADER;
```

### Automated Backups

Supabase provides automated daily backups. See [docs/BACKUP_RECOVERY.md](../../docs/BACKUP_RECOVERY.md) for details.

## Notes

- Manual backups should be created before major deployments
- Store backups securely (encrypted, multiple locations)
- Test restore procedures regularly
- Keep backups for minimum 90 days
