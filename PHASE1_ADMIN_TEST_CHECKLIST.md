# Phase 1.4: Admin Dashboard Verification Checklist

## ✅ Prerequisites

Before testing, ensure:
- [ ] Admin user account exists with `role = 'admin'` in profiles table
- [ ] Admin user can log in successfully
- [ ] Database has seed data (routes, buses, schedules)

## 🧪 Testing Checklist

### 1. Trip Management (CRUD)

#### Create Trip
- [ ] Navigate to Admin Dashboard → Trips
- [ ] Click "Create Trip" button
- [ ] Fill in form:
  - [ ] Select a route (dropdown should populate)
  - [ ] Select a bus (dropdown should populate)
  - [ ] Enter departure date/time
  - [ ] Enter price
  - [ ] Enter total seats
- [ ] Click "Save" 
- [ ] ✅ **Expected**: Trip created successfully, appears in list, toast notification shows "Trip created"

#### Read/View Trips
- [ ] Trips list displays all trips
- [ ] Can filter by status (All, Scheduled, Boarding, Departed, Cancelled)
- [ ] Trip details show: Route, Bus, Departure time, Price, Seats available
- [ ] Can refresh list

#### Update Trip
- [ ] Click "Edit" on an existing trip
- [ ] Modify trip details (e.g., change price or departure time)
- [ ] Click "Save"
- [ ] ✅ **Expected**: Trip updated, changes reflected in list, toast shows "Trip updated"

#### Delete Trip
- [ ] Click "Delete" on a trip
- [ ] Confirm deletion
- [ ] ✅ **Expected**: Trip removed from list (or cancelled if has bookings), toast notification

#### Status Management
- [ ] Change trip status using status dropdown
- [ ] ✅ **Expected**: Status updates successfully

---

### 2. Routes Management (CRUD)

#### Create Route
- [ ] Navigate to Admin Dashboard → Routes
- [ ] Click "Create Route" button
- [ ] Fill in form:
  - [ ] Enter origin city
  - [ ] Enter destination city
  - [ ] Enter distance (km) - optional
  - [ ] Enter duration (hours) - optional
  - [ ] Enter base price
- [ ] Click "Save"
- [ ] ✅ **Expected**: Route created, appears in routes list, toast shows "Route created"

#### Read/View Routes
- [ ] Routes list displays all routes
- [ ] Can sort by column (origin, destination, distance, etc.)
- [ ] Route details show correctly

#### Update Route
- [ ] Click "Edit" on an existing route
- [ ] Modify route details (e.g., change base price)
- [ ] Click "Save"
- [ ] ✅ **Expected**: Route updated, changes reflected, toast shows "Route updated"

#### Delete Route
- [ ] Click "Delete" on a route (use caution - may affect schedules)
- [ ] Confirm deletion
- [ ] ✅ **Expected**: Route removed from list, toast notification

---

### 3. Bookings Overview

#### View Bookings
- [ ] Navigate to Admin Dashboard → Bookings
- [ ] Bookings list displays all bookings
- [ ] Can filter by payment status (All, Paid, Pending, Refunded)
- [ ] Can search by name, phone, or reference
- [ ] Booking details show: Passenger name, Phone, Reference, Payment status, Seat numbers

#### Mark as Boarded
- [ ] Find a booking with payment status "Paid"
- [ ] Click "Mark as Boarded" (or toggle boarding status)
- [ ] ✅ **Expected**: Booking marked as boarded, status updates, timestamp recorded

#### Unmark as Boarded
- [ ] Click to unmark a boarded passenger
- [ ] ✅ **Expected**: Boarding status removed

---

### 4. CSV Export

#### Export Bookings
- [ ] Navigate to Bookings page
- [ ] (Optional) Set filter (e.g., "Paid" bookings only)
- [ ] Click "Export CSV" button
- [ ] ✅ **Expected**: CSV file downloads with filename like `bookings-2025-01-18.csv`
- [ ] Open CSV file
- [ ] ✅ **Expected**: Contains columns: Booking Reference, Passenger Name, Phone, Seat, Route, Departure, Payment Status, etc.
- [ ] ✅ **Expected**: Contains filtered/selected bookings data

---

### 5. QR Scanner Functionality

#### Access QR Scanner
- [ ] Navigate to Admin Dashboard → Scanner (or `/admin/scanner`)
- [ ] ✅ **Expected**: QR Scanner page loads

#### Scan QR Code
- [ ] Use a test ticket QR code (from a completed booking)
- [ ] Scan QR code (or manually enter booking reference)
- [ ] ✅ **Expected**: Booking details display:
  - Passenger name
  - Seat number
  - Route (origin → destination)
  - Departure time
  - Payment status
  - Boarding status

#### Mark Boarded via Scanner
- [ ] After scanning, click "Mark as Boarded"
- [ ] ✅ **Expected**: Passenger marked as boarded, success message

---

### 6. Settings Management

#### Access Settings
- [ ] Navigate to Admin Dashboard → Settings
- [ ] ✅ **Expected**: Settings page loads

#### View Settings
- [ ] Company information displays (if configured)
- [ ] Support contact details display (if configured)
- [ ] Toggle switches display for:
  - [ ] Bookings enabled
  - [ ] Notifications enabled
  - [ ] Auto-confirm enabled

#### Update Company Information
- [ ] Edit company name, contact phone, email
- [ ] Click "Save Changes"
- [ ] ✅ **Expected**: Settings saved, toast shows "Settings updated", changes persist after refresh

#### Update Toggle Settings
- [ ] Toggle any switch (e.g., "Bookings Enabled")
- [ ] Click "Save Changes"
- [ ] ✅ **Expected**: Toggle state saved, persists after refresh

---

## 🐛 Common Issues to Watch For

- **RLS Errors**: If operations fail with permission errors, check admin user has `role = 'admin'` in profiles table
- **Empty Dropdowns**: If route/bus dropdowns are empty, verify seed data was loaded
- **Date/Time Issues**: Ensure departure time format matches expected format (ISO datetime)
- **CSV Export**: Verify browser allows file downloads

---

## ✅ Completion Criteria

Phase 1.4 is complete when:
- [ ] All CRUD operations work for Trips
- [ ] All CRUD operations work for Routes  
- [ ] Bookings can be viewed and managed (boarded/unboarded)
- [ ] CSV export downloads correctly
- [ ] QR Scanner scans and displays booking info
- [ ] Settings can be viewed and updated

---

## 📝 Notes

- Test with a non-admin user to verify access control (should be blocked)
- Keep test data minimal (can delete test routes/trips after testing)
- Document any errors encountered for fixing

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete
