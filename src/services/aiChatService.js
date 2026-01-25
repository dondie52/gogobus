import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';
import bookingService from './bookingService';
import { logError, logInfo } from '../utils/logger';

/**
 * AI Chat Service
 * Handles AI-powered chat responses using Google Gemini
 */

const CONFIDENCE_THRESHOLD = 0.7;
const ESCALATION_KEYWORDS = [
  'speak to human',
  'talk to human',
  'real person',
  'human agent',
  'customer service',
  'speak to someone',
  'talk to someone',
  'human support',
  'live agent',
  'representative',
];

// System prompt for the AI
const SYSTEM_PROMPT = `You are GoGoBus AI Support Assistant, a helpful and friendly customer service agent for GoGoBus, a bus booking platform in Botswana.

Your role is to:
1. Help customers with booking inquiries, ticket questions, and travel information
2. Provide information about routes, schedules, and pricing
3. Assist with account-related questions
4. Guide users through the booking process

Important guidelines:
- Be friendly, professional, and concise
- If you're unsure about specific booking details, prices, or real-time availability, acknowledge this and suggest the user check the app or contact support
- For refunds, cancellations, or complex issues, indicate that a human agent can assist
- Keep responses under 200 words unless more detail is needed
- Use Botswana Pula (BWP/P) for currency references

When you cannot confidently answer a question or the user needs human assistance, include the phrase "[ESCALATE]" at the end of your response.

Current context will be provided about the user and their bookings to help personalize responses.`;

/**
 * Initialize Gemini client
 * Uses environment variable for API key
 */
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
  if (!apiKey) {
    logError('Google AI API key not configured');
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Build context about the user for personalized AI responses
 */
const buildContext = async (userId) => {
  const context = {
    user: null,
    bookings: [],
    upcomingTrips: [],
    pastTrips: [],
  };

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, email')
      .eq('id', userId)
      .single();

    if (profile) {
      context.user = {
        name: profile.full_name || 'Customer',
        phone: profile.phone_number,
        email: profile.email,
      };
    }

    // Get user bookings
    const bookings = await bookingService.getUserBookings(userId);
    if (bookings && bookings.length > 0) {
      const now = new Date();
      
      context.bookings = bookings.slice(0, 5).map(b => ({
        reference: b.booking_reference,
        status: b.status,
        route: b.schedule?.route ? 
          `${b.schedule.route.origin} to ${b.schedule.route.destination}` : 'Unknown route',
        date: b.schedule?.departure_time,
        seats: b.seat_numbers,
        amount: b.total_amount,
      }));

      // Separate upcoming and past trips
      context.upcomingTrips = context.bookings.filter(b => 
        b.date && new Date(b.date) > now && b.status !== 'cancelled'
      );
      context.pastTrips = context.bookings.filter(b => 
        b.date && new Date(b.date) <= now
      );
    }
  } catch (error) {
    logError('Error building user context', error);
  }

  return context;
};

/**
 * Format context for the AI prompt
 */
const formatContextForPrompt = (context) => {
  let contextStr = '\n\n--- User Context ---\n';
  
  if (context.user) {
    contextStr += `Customer Name: ${context.user.name}\n`;
  }
  
  if (context.upcomingTrips.length > 0) {
    contextStr += `\nUpcoming Trips (${context.upcomingTrips.length}):\n`;
    context.upcomingTrips.forEach((trip, i) => {
      const date = trip.date ? new Date(trip.date).toLocaleDateString('en-GB') : 'Unknown';
      contextStr += `${i + 1}. ${trip.route} on ${date} - Ref: ${trip.reference} - Status: ${trip.status}\n`;
    });
  }
  
  if (context.pastTrips.length > 0) {
    contextStr += `\nRecent Past Trips (${Math.min(context.pastTrips.length, 3)}):\n`;
    context.pastTrips.slice(0, 3).forEach((trip, i) => {
      const date = trip.date ? new Date(trip.date).toLocaleDateString('en-GB') : 'Unknown';
      contextStr += `${i + 1}. ${trip.route} on ${date} - Ref: ${trip.reference}\n`;
    });
  }
  
  if (context.bookings.length === 0) {
    contextStr += 'No booking history found.\n';
  }
  
  contextStr += '--- End Context ---\n';
  return contextStr;
};

/**
 * Format conversation history for the AI
 */
const formatConversationHistory = (messages) => {
  if (!messages || messages.length === 0) return '';
  
  // Get last 10 messages for context
  const recentMessages = messages.slice(-10);
  
  return recentMessages.map(msg => {
    const role = msg.sender_type === 'user' ? 'Customer' : 'Support';
    return `${role}: ${msg.content}`;
  }).join('\n');
};

/**
 * Check if user is requesting human support
 */
const isRequestingHuman = (message) => {
  const lowerMessage = message.toLowerCase();
  return ESCALATION_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Analyze AI response for confidence and escalation signals
 */
const analyzeResponse = (response) => {
  let confidence = 0.85; // Default confidence
  let shouldEscalate = false;
  let cleanResponse = response;
  
  // Check for explicit escalation marker
  if (response.includes('[ESCALATE]')) {
    shouldEscalate = true;
    confidence = 0.4;
    cleanResponse = response.replace('[ESCALATE]', '').trim();
  }
  
  // Check for uncertainty phrases
  const uncertaintyPhrases = [
    "i'm not sure",
    "i don't have access",
    "i cannot confirm",
    "you should contact",
    "please contact support",
    "i recommend speaking",
    "a human agent",
    "i don't know",
    "i'm unable to",
  ];
  
  const lowerResponse = response.toLowerCase();
  const uncertaintyCount = uncertaintyPhrases.filter(phrase => 
    lowerResponse.includes(phrase)
  ).length;
  
  if (uncertaintyCount > 0) {
    confidence -= uncertaintyCount * 0.15;
    if (confidence < 0.5) {
      shouldEscalate = true;
    }
  }
  
  // Ensure confidence is within bounds
  confidence = Math.max(0, Math.min(1, confidence));
  
  return {
    confidence,
    shouldEscalate,
    cleanResponse,
  };
};

/**
 * Generate AI response using Google Gemini
 */
const generateResponse = async (conversationId, userId, userMessage, conversationHistory = []) => {
  try {
    // Check if user is explicitly requesting human support
    if (isRequestingHuman(userMessage)) {
      return {
        success: true,
        response: "I understand you'd like to speak with a human agent. I'm connecting you with our support team now. They typically respond within a few minutes.",
        confidence: 1.0,
        shouldEscalate: true,
        isHumanRequest: true,
      };
    }

    // Check if we should use Edge Function (production) or client-side (development)
    const isProduction = import.meta.env.PROD;
    
    if (isProduction) {
      // Use Supabase Edge Function for production
      return await generateResponseViaEdgeFunction(conversationId, userId, userMessage, conversationHistory);
    }
    
    // Client-side generation for development
    const genAI = getGeminiClient();
    if (!genAI) {
      return {
        success: false,
        error: 'AI service not configured',
        shouldEscalate: true,
      };
    }

    // Build user context
    const context = await buildContext(userId);
    const contextStr = formatContextForPrompt(context);
    const historyStr = formatConversationHistory(conversationHistory);
    
    // Prepare the prompt
    const fullPrompt = `${SYSTEM_PROMPT}${contextStr}

Previous conversation:
${historyStr || 'No previous messages.'}

Customer's new message: ${userMessage}

Please provide a helpful response:`;

    // Generate response
    // Try multiple model names in order of preference
    const modelNames = ['gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
    let responseText = null;
    let lastError = null;
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        responseText = result.response.text();
        break; // Success, exit loop
      } catch (error) {
        lastError = error;
        logInfo(`Model ${modelName} failed, trying next...`, { error: error.message });
        continue; // Try next model
      }
    }
    
    if (!responseText) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }
    
    // Analyze the response
    const analysis = analyzeResponse(responseText);
    
    logInfo('AI response generated', { 
      confidence: analysis.confidence, 
      shouldEscalate: analysis.shouldEscalate 
    });

    return {
      success: true,
      response: analysis.cleanResponse,
      confidence: analysis.confidence,
      shouldEscalate: analysis.shouldEscalate || analysis.confidence < CONFIDENCE_THRESHOLD,
    };
  } catch (error) {
    logError('Error generating AI response', error);
    return {
      success: false,
      error: error.message,
      shouldEscalate: true,
      response: "I apologize, but I'm having trouble processing your request right now. Let me connect you with our support team.",
    };
  }
};

/**
 * Generate response via Supabase Edge Function (for production)
 */
const generateResponseViaEdgeFunction = async (conversationId, userId, userMessage, conversationHistory) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat-handler', {
      body: {
        conversationId,
        userId,
        userMessage,
        conversationHistory: conversationHistory.slice(-10),
      },
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      response: data.response,
      confidence: data.confidence,
      shouldEscalate: data.shouldEscalate,
    };
  } catch (error) {
    logError('Error calling AI Edge Function', error);
    return {
      success: false,
      error: error.message,
      shouldEscalate: true,
      response: "I apologize, but I'm having trouble right now. Let me connect you with our support team.",
    };
  }
};

/**
 * Check if conversation should be escalated based on confidence
 */
const shouldEscalate = (confidence, userMessage) => {
  // Always escalate if user requests human
  if (isRequestingHuman(userMessage)) {
    return true;
  }
  
  // Escalate if confidence is below threshold
  return confidence < CONFIDENCE_THRESHOLD;
};

const aiChatService = {
  generateResponse,
  buildContext,
  shouldEscalate,
  analyzeResponse,
  isRequestingHuman,
  CONFIDENCE_THRESHOLD,
};

export default aiChatService;
