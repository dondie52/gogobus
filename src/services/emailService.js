import { supabase } from './supabase';
import { logError, logInfo, logWarn } from '../utils/logger';

/**
 * Email service
 * Handles sending booking confirmation emails
 */
const emailService = {
  /**
   * Send booking confirmation email
   * @param {Object} bookingData - Booking information
   * @param {string} bookingData.bookingId - Booking ID
   * @param {string} bookingData.customerEmail - Customer email address
   * @param {string} bookingData.customerName - Customer name
   * @param {string} bookingData.origin - Trip origin
   * @param {string} bookingData.destination - Trip destination
   * @param {string} bookingData.departureTime - Departure time
   * @param {Array} bookingData.seats - Selected seats
   * @param {number} bookingData.totalAmount - Total booking amount
   * @param {string} bookingData.bookingRef - Booking reference
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async sendBookingConfirmation(bookingData) {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Attempting to send booking confirmation email',data:{bookingId:bookingData.bookingId,customerEmail:bookingData.customerEmail,hasEmail:!!bookingData.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
      // #endregion

      if (!bookingData.customerEmail) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'No customer email provided',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        logWarn('Cannot send booking confirmation: no email provided');
        return { success: false, error: 'No email address provided' };
      }

      // Skip email sending in development if function might not exist
      // This prevents CORS console errors when the edge function isn't deployed
      if (import.meta.env.DEV && !import.meta.env.VITE_ENABLE_EMAIL_SERVICE) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Skipping email in development (function may not exist)',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        return { success: false, error: 'Email service disabled in development', warning: true };
      }

      // Call Supabase edge function to send email
      // If edge function doesn't exist or CORS fails, we'll silently continue
      // This is non-blocking - booking success doesn't depend on email
      let data, error;
      try {
        // Suppress console errors for CORS/404 by wrapping in a promise that catches all errors
        const invokePromise = supabase.functions.invoke('send-booking-email', {
          body: {
            bookingId: bookingData.bookingId,
            customerEmail: bookingData.customerEmail,
            customerName: bookingData.customerName || 'Customer',
            origin: bookingData.origin,
            destination: bookingData.destination,
            departureTime: bookingData.departureTime,
            seats: bookingData.seats || [],
            totalAmount: bookingData.totalAmount,
            bookingRef: bookingData.bookingRef || bookingData.bookingId,
          },
        });
        
        // Add timeout to prevent hanging on CORS errors
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email service timeout')), 5000)
        );
        
        const result = await Promise.race([invokePromise, timeoutPromise]);
        data = result.data;
        error = result.error;
      } catch (invokeError) {
        // Handle CORS, network, or timeout errors gracefully
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Edge function invoke exception (CORS/network/timeout)',data:{errorMessage:invokeError?.message,errorName:invokeError?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        // Silently handle - email function may not be deployed
        // Don't log to console to avoid noise - email is optional
        return { success: false, error: 'Email service unavailable', warning: true };
      }

      if (error) {
        // Edge function might not exist - log and continue
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Edge function error (may not exist)',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        // Don't log to console to avoid CORS error noise - email is optional
        // Don't fail the booking if email fails - just return silently
        return { success: false, error: 'Email service unavailable', warning: true };
      }

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Email sent successfully',data:{bookingId:bookingData.bookingId,customerEmail:bookingData.customerEmail},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      logInfo('Booking confirmation email sent', { bookingId: bookingData.bookingId, email: bookingData.customerEmail });
      return { success: true, data };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Email sending exception',data:{errorMessage:error?.message,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
      // #endregion
      logError('Error sending booking confirmation email', error);
      // Don't fail the booking if email fails
      return { success: false, error: error.message, warning: true };
    }
  },
};

export default emailService;
