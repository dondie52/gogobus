// ============================================================
// GOGOBUS ORANGE MONEY WEBHOOK HANDLER
// Supabase Edge Function to handle Orange Money webhook callbacks
// Path: supabase/functions/payment-webhook-orange/index.ts
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrangeMoneyWebhookPayload {
  order_id?: string;
  pay_token?: string;
  status?: string;
  amount?: number;
  currency?: string;
  message?: string;
  signature?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET_ORANGE') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body (Orange Money sends JSON)
    const payload: OrangeMoneyWebhookPayload = await req.json();
    
    // Log webhook for debugging
    const { data: webhookLog, error: logError } = await supabase
      .from('payment_webhooks')
      .insert({
        provider: 'orange',
        event_type: 'payment_callback',
        transaction_ref: payload.order_id,
        raw_payload: payload,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log webhook:', logError);
    }

    // Verify webhook signature if secret is configured
    if (webhookSecret && payload.signature) {
      // Implement signature verification based on Orange Money documentation
      // For now, we'll verify that required fields are present
      if (!payload.order_id || !payload.status) {
        throw new Error('Invalid webhook payload');
      }
    }

    // Extract transaction reference
    const transactionRef = payload.order_id;
    if (!transactionRef) {
      throw new Error('Missing transaction reference');
    }

    // Get payment from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, bookings(*)')
      .eq('transaction_ref', transactionRef)
      .single();

    if (paymentError || !payment) {
      throw new Error(`Payment not found: ${transactionRef}`);
    }

    // Map Orange Money status to payment status
    let status = 'pending';
    if (payload.status === 'SUCCESS' || payload.status === 'PAID') {
      status = 'completed';
    } else if (payload.status === 'FAILED' || payload.status === 'ERROR') {
      status = 'failed';
    } else if (payload.status === 'CANCELLED') {
      status = 'cancelled';
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        provider_status: payload.status || '',
        provider_ref: payload.pay_token || payment.provider_ref,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', payment.id);

    if (updateError) {
      throw new Error(`Failed to update payment: ${updateError.message}`);
    }

    // If payment completed, update booking and generate ticket
    if (status === 'completed') {
      // Update booking
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          payment_method: payment.payment_method,
          payment_reference: transactionRef,
        })
        .eq('id', payment.booking_id);

      // Generate ticket (ticket generation happens client-side, but we can trigger it)
      // In production, you might want to generate ticket server-side here
      // For now, the client will generate it when viewing the booking
    }

    // Mark webhook as processed
    if (webhookLog) {
      await supabase
        .from('payment_webhooks')
        .update({ processed: true })
        .eq('id', webhookLog.id);
    }

    return new Response(
      JSON.stringify({ success: true, status, transactionRef }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
