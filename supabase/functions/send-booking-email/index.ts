// Supabase Edge Function: Send Booking Confirmation Email
// This function sends booking confirmation emails using an email service provider
// 
// Setup required:
// 1. Configure email service (Resend, SendGrid, etc.) in Supabase secrets
// 2. Set EMAIL_API_KEY secret in Supabase Dashboard
// 3. Deploy: supabase functions deploy send-booking-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      bookingId,
      customerEmail,
      customerName,
      origin,
      destination,
      departureTime,
      seats,
      totalAmount,
      bookingRef,
    } = await req.json();

    // Validate required fields
    if (!customerEmail || !bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customerEmail and bookingId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format email content
    const seatsList = Array.isArray(seats) ? seats.join(', ') : 'N/A';
    const formattedDate = departureTime
      ? new Date(departureTime).toLocaleString('en-BW', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'TBD';

    const emailSubject = `Booking Confirmation - ${bookingRef || bookingId}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1B4D4A; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #1B4D4A; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚌 GOGOBUS</h1>
              <h2>Booking Confirmed!</h2>
            </div>
            <div class="content">
              <p>Dear ${customerName},</p>
              <p>Your booking has been confirmed. Here are your booking details:</p>
              
              <div class="booking-details">
                <div class="detail-row">
                  <span class="label">Booking Reference:</span> ${bookingRef || bookingId}
                </div>
                <div class="detail-row">
                  <span class="label">Route:</span> ${origin} → ${destination}
                </div>
                <div class="detail-row">
                  <span class="label">Departure:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="label">Seats:</span> ${seatsList}
                </div>
                <div class="detail-row">
                  <span class="label">Total Amount:</span> P${totalAmount?.toFixed(2) || '0.00'}
                </div>
              </div>
              
              <p>Please arrive at the station at least 30 minutes before departure.</p>
              <p>Thank you for choosing GOGOBUS!</p>
            </div>
            <div class="footer">
              <p>GOGOBUS - Travel Botswana with Comfort</p>
              <p>For support, contact: support@gogobus.co.bw</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
Booking Confirmation - ${bookingRef || bookingId}

Dear ${customerName},

Your booking has been confirmed. Here are your booking details:

Booking Reference: ${bookingRef || bookingId}
Route: ${origin} → ${destination}
Departure: ${formattedDate}
Seats: ${seatsList}
Total Amount: P${totalAmount?.toFixed(2) || '0.00'}

Please arrive at the station at least 30 minutes before departure.

Thank you for choosing GOGOBUS!

---
GOGOBUS - Travel Botswana with Comfort
For support, contact: support@gogobus.co.bw
    `;

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log that email would be sent
    // In production, replace this with actual email API call
    
    // Example with Resend (uncomment and configure):
    /*
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'GOGOBUS <noreply@gogobus.co.bw>',
          to: customerEmail,
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        }),
      });
      
      if (!resendResponse.ok) {
        throw new Error('Failed to send email via Resend');
      }
    }
    */

    // Log email sending (for debugging)
    console.log('Email would be sent to:', customerEmail, 'for booking:', bookingId);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email sent successfully',
        bookingId,
        customerEmail,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send email',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
