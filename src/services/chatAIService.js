// src/services/chatAIService.js
// Service for handling AI chat responses in GOGOBUS

import { supabase } from './supabase';

/**
 * Simple AI responses for common bus booking queries
 * Replace with actual AI API calls (OpenAI, Anthropic, etc.) for production
 */
function generateLocalAIResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // Booking related
  if (message.includes('book') || message.includes('ticket') || message.includes('buy')) {
    return `To book a ticket:

1. Select your departure and destination cities
2. Choose your travel date
3. Pick the number of passengers
4. Click 'Search Buses' to see available options
5. Select your preferred bus and seat
6. Complete payment

Would you like me to help you with any specific route?`;
  }
  
  // Routes
  if (message.includes('route') || message.includes('where') || message.includes('destination')) {
    return `We operate routes across Botswana including:

• Gaborone ↔ Francistown
• Gaborone ↔ Maun  
• Gaborone ↔ Kasane
• Francistown ↔ Kasane
• And many more!

Use the 'Popular Routes' section on the home page or the search form to find your specific route.`;
  }
  
  // Prices
  if (message.includes('price') || message.includes('cost') || message.includes('how much') || message.includes('fare')) {
    return `Ticket prices vary by route and bus type. For example:

• Gaborone to Francistown: from P150
• Gaborone to Kasane: from P350

To see exact prices, please search for your specific route and date.`;
  }
  
  // Cancel/Refund
  if (message.includes('cancel') || message.includes('refund')) {
    return `To cancel a booking:

1. Go to 'My Tickets' in the menu
2. Find your booking
3. Click 'Cancel Booking'

Refund policy:
• 24+ hours before departure: Full refund
• 12-24 hours: 50% refund
• Less than 12 hours: No refund`;
  }
  
  // Schedule/Time
  if (message.includes('schedule') || message.includes('time') || message.includes('when') || message.includes('depart')) {
    return `Bus schedules vary by route. Most routes have multiple departures daily:

• Early morning: 5:00 AM - 7:00 AM
• Morning: 8:00 AM - 10:00 AM
• Afternoon: 2:00 PM - 4:00 PM
• Evening: 6:00 PM - 8:00 PM

Search for your specific route to see available departure times.`;
  }
  
  // Payment
  if (message.includes('pay') || message.includes('orange money') || message.includes('myzaka') || message.includes('card')) {
    return `We accept multiple payment methods:

• Orange Money
• MyZaka
• Bank cards (Visa/Mastercard)
• Cash at select stations

All online payments are secure and you'll receive a confirmation SMS immediately after booking.`;
  }
  
  // Contact/Human agent
  if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('human') || message.includes('agent')) {
    return `Need to speak with a human agent? Our support team is available:

📞 Phone: +267 123 4567
📧 Email: support@gogobus.co.bw
⏰ Hours: 7:00 AM - 9:00 PM daily

Or I can escalate this chat to a human agent right now. Would you like me to do that?`;
  }
  
  // Greeting
  if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message === 'yo') {
    return `Hello! 👋 Welcome to GoGoBus Support!

I'm here to help you with:
• Booking tickets
• Finding routes and schedules
• Payment questions
• Cancellations and refunds

How can I assist you today?`;
  }
  
  // Thanks
  if (message.includes('thank') || message.includes('thanks')) {
    return "You're welcome! 😊 Is there anything else I can help you with?";
  }
  
  // Default response
  return `I'd be happy to help! Here are some things I can assist with:

• **Booking tickets** - How to book, select seats, make payments
• **Routes & schedules** - Available destinations and departure times  
• **Prices** - Fare information for different routes
• **Cancellations** - How to cancel and refund policy

What would you like to know more about?`;
}

/**
 * Send a message and get an AI response
 * This handles the AI response generation and saves it to the database
 */
export async function sendMessageAndGetAIResponse(conversationId, userMessage, userId) {
  try {
    // Option 1: Use Supabase Edge Function (if deployed)
    // Uncomment this when you deploy the edge function
    /*
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body: {
        conversationId,
        messageContent: userMessage,
        userId,
      },
    });
    
    if (error) throw error;
    return data;
    */
    
    // Option 2: Generate response locally and save to database
    // This works without deploying an edge function
    const aiResponse = generateLocalAIResponse(userMessage);
    
    // Add a small delay to simulate AI "thinking"
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    // Get conversation to retrieve user_id for sender_id (required field)
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();
    
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
      .single();
    
    if (insertError) {
      console.error('Error inserting AI message:', insertError);
      throw insertError;
    }
    
    return { success: true, message };
    
  } catch (error) {
    console.error('Error in sendMessageAndGetAIResponse:', error);
    throw error;
  }
}

/**
 * Check if conversation should be escalated to human
 */
export function shouldEscalateToHuman(message) {
  const escalationTriggers = [
    'human', 'agent', 'person', 'representative', 'speak to someone',
    'talk to someone', 'real person', 'not helpful', 'escalate',
    'manager', 'supervisor', 'complaint'
  ];
  
  const lowerMessage = message.toLowerCase();
  return escalationTriggers.some(trigger => lowerMessage.includes(trigger));
}

export default {
  sendMessageAndGetAIResponse,
  shouldEscalateToHuman,
  generateLocalAIResponse,
};
