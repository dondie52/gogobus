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

      // Call Supabase edge function to send email
      // If edge function doesn't exist, we'll use a fallback approach
      const { data, error } = await supabase.functions.invoke('send-booking-email', {
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

      if (error) {
        // Edge function might not exist - log and continue
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'emailService.js:sendBookingConfirmation',message:'Edge function error (may not exist)',data:{errorMessage:error.message,errorName:error.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'M'})}).catch(()=>{});
        // #endregion
        logWarn('Email edge function not available or failed:', error.message);
        // Don't fail the booking if email fails - just log it
        return { success: false, error: error.message, warning: true };
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
