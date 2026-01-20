# GOGOBUS Admin User Manual

This guide explains how to use the GOGOBUS admin dashboard to manage the bus booking platform.

## Table of Contents

1. [Accessing the Admin Dashboard](#accessing-the-admin-dashboard)
2. [Dashboard Overview](#dashboard-overview)
3. [Trip Management](#trip-management)
4. [Route Management](#route-management)
5. [Booking Management](#booking-management)
6. [QR Scanner](#qr-scanner)
7. [Settings](#settings)
8. [Common Tasks](#common-tasks)

## Accessing the Admin Dashboard

1. **Login as Admin**
   - Go to https://gogobus.co.bw/login
   - Log in with your admin email and password
   - You must have the `admin` role assigned in your profile

2. **Access Dashboard**
   - After login, navigate to `/admin` or use the admin menu
   - The dashboard is only accessible to users with admin role

3. **Verify Admin Access**
   - If you don't have admin access, contact the system administrator
   - Admin role must be set in the `profiles` table in Supabase

## Dashboard Overview

The admin dashboard provides an overview of key metrics:

- **Total Bookings**: Number of bookings made
- **Today's Bookings**: Bookings for today
- **Revenue**: Total revenue from bookings
- **Upcoming Trips**: Number of trips scheduled

### Navigation

The dashboard has the following sections:
- **Dashboard**: Overview and statistics
- **Trips**: Manage bus trips
- **Routes**: Manage bus routes
- **Bookings**: View and manage bookings
- **Scanner**: QR code scanner for ticket verification
- **Settings**: Platform settings

## Trip Management

### Creating a Trip

1. Navigate to **Trips** section
2. Click **"Create Trip"** button
3. Fill in the form:
   - **Route**: Select a route (origin → destination)
   - **Bus**: Select a bus (optional, for display)
   - **Departure Time**: Date and time of departure
   - **Price**: Ticket price in BWP
   - **Total Seats**: Number of seats available (default: 45)
4. Click **"Save"**

**Notes:**
- Arrival time is automatically calculated from route duration
- Price should be in Botswana Pula (BWP)
- Departure time must be in the future

### Editing a Trip

1. Find the trip in the trips list
2. Click the **Edit** icon (pencil) next to the trip
3. Modify the fields as needed
4. Click **"Save"**

### Deleting/Cancelling a Trip

1. Find the trip in the trips list
2. Click the **Delete** icon (trash) next to the trip
3. Confirm deletion
4. **Note**: If the trip has bookings, it will be cancelled (not deleted) and users will be notified

### Updating Trip Status

1. Find the trip in the trips list
2. Click the status dropdown
3. Select new status:
   - **Scheduled**: Trip is scheduled
   - **Boarding**: Passengers are boarding
   - **Departed**: Bus has departed
   - **Cancelled**: Trip is cancelled
4. Status is updated immediately

### Filtering Trips

- Use the status filter dropdown to filter trips by status
- Click refresh button to reload trips
- Search bar allows searching by route or other details

## Route Management

### Creating a Route

1. Navigate to **Routes** section
2. Click **"Create Route"** button
3. Fill in the form:
   - **Origin**: Starting city/location
   - **Destination**: Ending city/location
   - **Distance (km)**: Distance in kilometers (optional)
   - **Duration (minutes)**: Travel duration in minutes (optional)
   - **Base Price**: Base ticket price in BWP
4. Click **"Save"**

**Notes:**
- Origin and destination must be different
- Base price is used as default for trip prices
- Distance and duration are used for display and calculations

### Editing a Route

1. Find the route in the routes list
2. Click the **Edit** icon (pencil) next to the route
3. Modify the fields as needed
4. Click **"Save"**

### Deleting a Route

1. Find the route in the routes list
2. Click the **Delete** icon (trash) next to the route
3. Confirm deletion
4. **Warning**: Deleting a route will affect all trips using that route

### Sorting Routes

- Click column headers to sort:
  - Origin/Destination
  - Distance
  - Base Price
- Click again to reverse sort order

## Booking Management

### Viewing Bookings

1. Navigate to **Bookings** section
2. View all bookings in a table format
3. Columns show:
   - Booking Reference
   - User Email
   - Route (Origin → Destination)
   - Travel Date
   - Seats
   - Total Price
   - Status
   - Booking Date

### Filtering Bookings

- Use status filter to filter by booking status:
  - **All**: Show all bookings
  - **Pending**: Awaiting payment
  - **Confirmed**: Payment successful
  - **Cancelled**: Cancelled bookings
  - **Refunded**: Refunded bookings

### Viewing Booking Details

1. Click on a booking to view details
2. View booking information:
   - Passenger details
   - Seat selections
   - Payment information
   - Booking reference
   - QR code

### Exporting Bookings

1. Click **"Export CSV"** button
2. CSV file downloads with booking data
3. Includes:
   - Booking reference
   - User information
   - Route details
   - Travel date
   - Seats
   - Price
   - Status

## QR Scanner

### Using the QR Scanner

1. Navigate to **Scanner** section
2. Grant camera permissions when prompted
3. Point camera at QR code on ticket
4. Scanner automatically reads QR code
5. Booking details displayed if valid

### QR Code Verification

- Valid QR code: Shows booking details
- Invalid QR code: Shows error message
- Expired ticket: Shows warning

### Manual Ticket Verification

1. Enter booking reference manually
2. Click "Verify"
3. Booking details displayed

**Use Cases:**
- Boarding passengers
- Verifying tickets at checkpoints
- Preventing duplicate ticket usage

## Settings

### Platform Settings

1. Navigate to **Settings** section
2. Configure platform settings:
   - **Platform Name**: Display name (default: GOGOBUS)
   - **Support Email**: Support contact email
   - **Support Phone**: Support contact phone
   - **Booking Fee**: Service fee per booking
   - **Payment Methods**: Enable/disable payment methods

3. Click **"Save"** to apply changes

## Common Tasks

### Daily Tasks

1. **Create Trips for Today/Tomorrow**
   - Navigate to Trips
   - Create trips for upcoming dates
   - Verify all details are correct

2. **Check Today's Bookings**
   - Navigate to Bookings
   - Filter by date
   - Review upcoming bookings

3. **Monitor Payment Status**
   - Check pending payments
   - Verify payment confirmations
   - Handle payment issues

### Weekly Tasks

1. **Review Routes**
   - Check route data is up-to-date
   - Update prices if needed
   - Add new routes as needed

2. **Export Booking Reports**
   - Export bookings for the week
   - Review revenue and statistics
   - Generate reports for management

### Monthly Tasks

1. **Review Statistics**
   - Check dashboard metrics
   - Analyze booking trends
   - Review revenue

2. **Update Pricing**
   - Review and update base prices
   - Adjust prices for seasonal changes
   - Update route information

## Troubleshooting

### Cannot Access Admin Dashboard

- Verify you have admin role in profile
- Contact system administrator
- Check browser console for errors

### Cannot Create Trip

- Verify route exists
- Check required fields are filled
- Ensure departure time is in the future

### Bookings Not Showing

- Check filter settings
- Verify bookings exist in database
- Refresh the page

### QR Scanner Not Working

- Grant camera permissions
- Use in well-lit area
- Ensure QR code is clear and visible

## Best Practices

1. **Trip Creation**
   - Create trips well in advance
   - Set realistic prices
   - Verify all details before saving

2. **Route Management**
   - Keep route information accurate
   - Update prices regularly
   - Maintain consistent naming

3. **Booking Management**
   - Review bookings daily
   - Handle cancellations promptly
   - Export data regularly for backups

4. **QR Verification**
   - Verify tickets before boarding
   - Check ticket validity
   - Prevent duplicate usage

## Support

For admin dashboard issues:
- **Email**: support@gogobus.co.bw
- **Phone**: +267 12 345 678
- **Documentation**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

**Last Updated:** January 2025
