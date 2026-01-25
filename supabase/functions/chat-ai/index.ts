// supabase/functions/chat-ai/index.ts
// Supabase Edge Function for GOGOBUS AI Chat Support

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple AI responses for common bus booking queries
// Replace this with actual AI API (OpenAI, Anthropic, etc.) for production
function generateAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()
  
  // Booking related
  if (message.includes('book') || message.includes('ticket') || message.includes('buy')) {
    return "To book a ticket:\n\n1. Select your departure and destination cities\n2. Choose your travel date\n3. Pick the number of passengers\n4. Click 'Search Buses' to see available options\n5. Select your preferred bus and seat\n6. Complete payment\n\nWould you like me to help you with any specific route?"
  }
  
  // Routes
  if (message.includes('route') || message.includes('where') || message.includes('destination')) {
    return "We operate routes across Botswana including:\n\n• Gaborone ↔ Francistown\n• Gaborone ↔ Maun\n• Gaborone ↔ Kasane\n• Francistown ↔ Kasane\n• And many more!\n\nUse the 'Popular Routes' section on the home page or the search form to find your specific route."
  }
  
  // Prices
  if (message.includes('price') || message.includes('cost') || message.includes('how much') || message.includes('fare')) {
    return "Ticket prices vary by route and bus type. For example:\n\n• Gaborone to Francistown: from P150\n• Gaborone to Kasane: from P350\n\nTo see exact prices, please search for your specific route and date. Prices are shown before you complete your booking."
  }
  
  // Cancel/Refund
  if (message.includes('cancel') || message.includes('refund')) {
    return "To cancel a booking:\n\n1. Go to 'My Tickets' in the menu\n2. Find your booking\n3. Click 'Cancel Booking'\n\nRefund policy:\n• 24+ hours before departure: Full refund\n• 12-24 hours: 50% refund\n• Less than 12 hours: No refund\n\nNeed help with a specific booking? Please provide your ticket number."
  }
  
  // Schedule/Time
  if (message.includes('schedule') || message.includes('time') || message.includes('when') || message.includes('depart')) {
    return "Bus schedules vary by route. Most routes have multiple departures daily:\n\n• Early morning: 5:00 AM - 7:00 AM\n• Morning: 8:00 AM - 10:00 AM\n• Afternoon: 2:00 PM - 4:00 PM\n• Evening: 6:00 PM - 8:00 PM\n\nSearch for your specific route to see available departure times."
  }
  
  // Payment
  if (message.includes('pay') || message.includes('orange money') || message.includes('myzaka') || message.includes('card')) {
    return "We accept multiple payment methods:\n\n• Orange Money\n• MyZaka\n• Bank cards (Visa/Mastercard)\n• Cash at select stations\n\nAll online payments are secure and you'll receive a confirmation SMS immediately after booking."
  }
  
  // Contact/Help
  if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('human') || message.includes('agent')) {
    return "Need to speak with a human agent? Our support team is available:\n\n📞 Phone: +267 123 4567\n📧 Email: support@gogobus.co.bw\n⏰ Hours: 7:00 AM - 9:00 PM daily\n\nOr I can escalate this chat to a human agent right now. Would you like me to do that?"
  }
  
  // Greeting
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message === 'yo') {
    return "Hello! 👋 Welcome to GoGoBus Support!\n\nI'm here to help you with:\n• Booking tickets\n• Finding routes and schedules\n• Payment questions\n• Cancellations and refunds\n\nHow can I assist you today?"
  }
  
  // Thanks
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! 😊 Is there anything else I can help you with? Feel free to ask about bookings, routes, or any other questions."
  }
  
  // Default response
  return "I'd be happy to help! Here are some things I can assist with:\n\n• **Booking tickets** - How to book, select seats, make payments\n• **Routes & schedules** - Available destinations and departure times\n• **Prices** - Fare information for different routes\n• **Cancellations** - How to cancel and refund policy\n\nWhat would you like to know more about?"
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversationId, messageContent, userId } = await req.json()

    if (!conversationId || !messageContent) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId or messageContent' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role for inserting AI messages
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get conversation to retrieve user_id for sender_id (required field)
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single()

    // Generate AI response
    const aiResponse = generateAIResponse(messageContent)

    // Save AI response to database
    const { data: message, error: insertError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: conv?.user_id || userId, // Required field, using user_id as placeholder
        sender_type: 'ai',
        content: aiResponse,
        is_read: true, // AI messages are immediately "read"
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting AI message:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save AI response', details: insertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
