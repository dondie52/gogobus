# GOGOBUS Backup & Recovery Procedures

This document outlines backup and recovery procedures for GOGOBUS.

## Overview

GOGOBUS uses Supabase for data storage. Backups are critical for:
- Data protection
- Disaster recovery
- Regulatory compliance
- Historical record keeping

## Backup Types

### 1. Automated Backups (Supabase)

Supabase provides automated daily backups for all projects.

**Configuration:**
1. Go to Supabase Dashboard → Settings → Database
2. Verify "Point-in-Time Recovery" is enabled
3. Check backup retention period (recommended: 30 days)

**Backup Details:**
- **Frequency**: Daily (automatic)
- **Retention**: 30 days (configurable)
- **Location**: Supabase managed storage
- **Recovery**: Point-in-time recovery available

### 2. Manual Backups

Manual backups should be created before major changes or deployments.

**Creating Manual Backup:**
```sql
-- Export all critical tables
-- Run in Supabase SQL Editor

-- Profiles (users)
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

**Using Backup Script:**
```bash
# Run manual backup script
cd scripts/backups
npm run backup
```

### 3. Code Backups

Code is backed up via Git:
- **Repository**: GitHub/GitLab
- **Frequency**: Every commit
- **Retention**: Permanent
- **Recovery**: Git history

## Recovery Procedures

### Restoring from Automated Backup

**Point-in-Time Recovery:**
1. Go to Supabase Dashboard → Database → Backups
2. Select point in time to restore
3. Click "Restore to this point"
4. Confirm restoration
5. Verify data after restoration

**Full Database Restore:**
1. Go to Supabase Dashboard → Database → Backups
2. Select latest backup
3. Click "Restore"
4. Verify all tables are restored
5. Test application functionality

### Restoring from Manual Backup

**From CSV Files:**
1. Open Supabase SQL Editor
2. For each table:
   ```sql
   -- Truncate existing data (if needed)
   TRUNCATE TABLE table_name CASCADE;
   
   -- Import from CSV
   COPY table_name (column1, column2, ...)
   FROM '/path/to/backup.csv'
   WITH CSV HEADER;
   ```

**From SQL Dump:**
1. Open Supabase SQL Editor
2. Paste SQL dump contents
3. Execute
4. Verify data imported correctly

### Disaster Recovery Plan

**Scenario 1: Complete Data Loss**

1. **Immediate Actions:**
   - Notify team immediately
   - Assess scope of data loss
   - Check backup availability

2. **Recovery Steps:**
   - Restore from most recent automated backup
   - If unavailable, use manual backup
   - Verify data integrity
   - Test critical functionality

3. **Post-Recovery:**
   - Review what caused data loss
   - Implement prevention measures
   - Document incident

**Scenario 2: Partial Data Loss**

1. **Identify Affected Tables:**
   - Check which tables/data is missing
   - Determine time range of loss

2. **Recovery Steps:**
   - Restore affected tables from backup
   - Use point-in-time recovery if available
   - Replay transactions if possible

3. **Verification:**
   - Compare restored data with backups
   - Test affected features
   - Verify data consistency

**Scenario 3: Data Corruption**

1. **Identify Corruption:**
   - Check error logs
   - Identify affected tables/records

2. **Recovery Steps:**
   - Restore from backup before corruption
   - Verify data integrity
   - Re-apply legitimate changes if needed

## Backup Verification

### Regular Verification

**Weekly:**
1. Check automated backups are being created
2. Verify backup files are accessible
3. Test restore process on test database

**Monthly:**
1. Perform full restore test
2. Verify data integrity
3. Document verification results

### Verification Checklist

- [ ] Automated backups running daily
- [ ] Manual backup created before major changes
- [ ] Backup files accessible and readable
- [ ] Test restore successful
- [ ] Data integrity verified
- [ ] Recovery procedures documented

## Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

### RTO (Recovery Time Objective)
- **Target**: 4 hours
- **Maximum**: 24 hours
- **Description**: Time to restore service after disaster

### RPO (Recovery Point Objective)
- **Target**: 1 hour (point-in-time recovery)
- **Maximum**: 24 hours (daily backups)
- **Description**: Maximum acceptable data loss

## Backup Storage

### Automated Backups
- **Location**: Supabase managed storage
- **Access**: Supabase Dashboard
- **Retention**: 30 days (configurable)

### Manual Backups
- **Location**: Local storage or cloud storage (AWS S3, Google Cloud Storage)
- **Access**: Via backup scripts
- **Retention**: 90 days minimum

### Backup Security
- Encrypt backup files
- Store backups in secure location
- Limit access to authorized personnel
- Regularly test backup restoration

## Maintenance

### Daily
- Monitor backup job status
- Check for backup failures
- Review error logs

### Weekly
- Verify backup integrity
- Review backup storage usage
- Check backup retention policies

### Monthly
- Perform restore test
- Review and update backup procedures
- Document any issues or improvements

## Backup Scripts

### Manual Backup Script

Location: `scripts/backups/backup-manual.sh`

```bash
#!/bin/bash
# Manual backup script for GOGOBUS

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Export critical tables
psql $DATABASE_URL -c "COPY profiles TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/profiles_$TIMESTAMP.csv
psql $DATABASE_URL -c "COPY routes TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/routes_$TIMESTAMP.csv
psql $DATABASE_URL -c "COPY schedules TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/schedules_$TIMESTAMP.csv
psql $DATABASE_URL -c "COPY bookings TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/bookings_$TIMESTAMP.csv
psql $DATABASE_URL -c "COPY payments TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/payments_$TIMESTAMP.csv
psql $DATABASE_URL -c "COPY tickets TO STDOUT WITH CSV HEADER" > $BACKUP_DIR/tickets_$TIMESTAMP.csv

echo "Backup completed: $BACKUP_DIR"
```

## Critical Data

The following data must be backed up regularly:

1. **User Data**
   - Profiles (users)
   - Authentication data

2. **Business Data**
   - Routes
   - Schedules/Trips
   - Buses

3. **Transaction Data**
   - Bookings
   - Payments
   - Tickets

4. **Configuration**
   - Settings
   - Admin users
   - System configuration

## Testing

### Test Restore Procedure

1. Create test Supabase project
2. Restore from latest backup
3. Verify all tables restored
4. Test application functionality
5. Verify data integrity
6. Document test results

### Test Frequency
- Monthly: Full restore test
- Quarterly: Disaster recovery drill
- Annually: Complete disaster recovery test

## Support

For backup/recovery issues:
- **Email**: support@gogobus.co.bw
- **Supabase Support**: https://supabase.com/support
- **Documentation**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Last Updated:** January 2025
