// ============================================================
// GOGOBUS DPO PAY WEBHOOK HANDLER
// Supabase Edge Function to handle DPO Pay webhook callbacks
// Path: supabase/functions/payment-webhook-dpo/index.ts
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DPOWebhookPayload {
  TransactionToken?: string;
  TransactionRef?: string;
  CompanyRef?: string;
  Result?: string;
  ResultExplanation?: string;
  TransactionAmount?: string;
  TransactionCurrency?: string;
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
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET_DPO') ?? '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body (DPO sends XML)
    const bodyText = await req.text();
    
    // Log webhook for debugging
    const { data: webhookLog, error: logError } = await supabase
      .from('payment_webhooks')
      .insert({
        provider: 'dpo',
        event_type: 'payment_callback',
        raw_payload: bodyText,
        processed: false,
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to log webhook:', logError);
    }

    // Parse XML payload (simplified - in production, use proper XML parser)
    const payload = parseDPOXML(bodyText);

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      // DPO may provide signature verification - implement based on their docs
      // For now, we'll trust the payload if it has required fields
      if (!payload.TransactionToken && !payload.CompanyRef) {
        throw new Error('Invalid webhook payload');
      }
    }

    // Extract transaction reference
    const transactionRef = payload.CompanyRef || payload.TransactionRef;
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

    // Map DPO result code to payment status
    let status = 'pending';
    if (payload.Result === '000') {
      status = 'completed';
    } else if (payload.Result === '901') {
      status = 'failed';
    } else if (payload.Result === '904') {
      status = 'cancelled';
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status,
        provider_status: payload.ResultExplanation || payload.Result,
        provider_ref: payload.TransactionRef || payment.provider_ref,
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

/**
 * Simple XML parser for DPO webhook payload
 * In production, use a proper XML parser library
 */
function parseDPOXML(xmlString: string): DPOWebhookPayload {
  const payload: DPOWebhookPayload = {};

  // Extract TransactionToken
  const tokenMatch = xmlString.match(/<TransactionToken>(.*?)<\/TransactionToken>/);
  if (tokenMatch) payload.TransactionToken = tokenMatch[1];

  // Extract TransactionRef
  const refMatch = xmlString.match(/<TransactionRef>(.*?)<\/TransactionRef>/);
  if (refMatch) payload.TransactionRef = refMatch[1];

  // Extract CompanyRef
  const companyRefMatch = xmlString.match(/<CompanyRef>(.*?)<\/CompanyRef>/);
  if (companyRefMatch) payload.CompanyRef = companyRefMatch[1];

  // Extract Result
  const resultMatch = xmlString.match(/<Result>(.*?)<\/Result>/);
  if (resultMatch) payload.Result = resultMatch[1];

  // Extract ResultExplanation
  const explanationMatch = xmlString.match(/<ResultExplanation>(.*?)<\/ResultExplanation>/);
  if (explanationMatch) payload.ResultExplanation = explanationMatch[1];

  // Extract TransactionAmount
  const amountMatch = xmlString.match(/<TransactionAmount>(.*?)<\/TransactionAmount>/);
  if (amountMatch) payload.TransactionAmount = amountMatch[1];

  // Extract TransactionCurrency
  const currencyMatch = xmlString.match(/<TransactionCurrency>(.*?)<\/TransactionCurrency>/);
  if (currencyMatch) payload.TransactionCurrency = currencyMatch[1];

  return payload;
}
