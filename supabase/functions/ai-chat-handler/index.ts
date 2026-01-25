import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONFIDENCE_THRESHOLD = 0.7;

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

interface ChatMessage {
  sender_type: 'user' | 'admin' | 'ai';
  content: string;
}

interface RequestBody {
  conversationId: string;
  userId: string;
  userMessage: string;
  conversationHistory: ChatMessage[];
}

/**
 * Build context about the user
 */
async function buildContext(supabase: ReturnType<typeof createClient>, userId: string) {
  const context = {
    user: null as { name: string; phone: string | null; email: string | null } | null,
    bookings: [] as Array<{
      reference: string;
      status: string;
      route: string;
      date: string | null;
    }>,
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
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        booking_reference,
        status,
        schedule:schedules(
          departure_time,
          route:routes(origin, destination)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (bookings) {
      context.bookings = bookings.map((b: any) => ({
        reference: b.booking_reference,
        status: b.status,
        route: b.schedule?.route
          ? `${b.schedule.route.origin} to ${b.schedule.route.destination}`
          : 'Unknown route',
        date: b.schedule?.departure_time || null,
      }));
    }
  } catch (error) {
    console.error('Error building context:', error);
  }

  return context;
}

/**
 * Format context for the AI prompt
 */
function formatContextForPrompt(context: Awaited<ReturnType<typeof buildContext>>): string {
  let contextStr = '\n\n--- User Context ---\n';

  if (context.user) {
    contextStr += `Customer Name: ${context.user.name}\n`;
  }

  const now = new Date();
  const upcomingTrips = context.bookings.filter(
    (b) => b.date && new Date(b.date) > now && b.status !== 'cancelled'
  );
  const pastTrips = context.bookings.filter((b) => b.date && new Date(b.date) <= now);

  if (upcomingTrips.length > 0) {
    contextStr += `\nUpcoming Trips (${upcomingTrips.length}):\n`;
    upcomingTrips.forEach((trip, i) => {
      const date = trip.date ? new Date(trip.date).toLocaleDateString('en-GB') : 'Unknown';
      contextStr += `${i + 1}. ${trip.route} on ${date} - Ref: ${trip.reference} - Status: ${trip.status}\n`;
    });
  }

  if (pastTrips.length > 0) {
    contextStr += `\nRecent Past Trips (${Math.min(pastTrips.length, 3)}):\n`;
    pastTrips.slice(0, 3).forEach((trip, i) => {
      const date = trip.date ? new Date(trip.date).toLocaleDateString('en-GB') : 'Unknown';
      contextStr += `${i + 1}. ${trip.route} on ${date} - Ref: ${trip.reference}\n`;
    });
  }

  if (context.bookings.length === 0) {
    contextStr += 'No booking history found.\n';
  }

  contextStr += '--- End Context ---\n';
  return contextStr;
}

/**
 * Format conversation history for the AI
 */
function formatConversationHistory(messages: ChatMessage[]): string {
  if (!messages || messages.length === 0) return '';

  return messages
    .map((msg) => {
      const role = msg.sender_type === 'user' ? 'Customer' : 'Support';
      return `${role}: ${msg.content}`;
    })
    .join('\n');
}

/**
 * Analyze AI response for confidence and escalation signals
 */
function analyzeResponse(response: string): {
  confidence: number;
  shouldEscalate: boolean;
  cleanResponse: string;
} {
  let confidence = 0.85;
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
  const uncertaintyCount = uncertaintyPhrases.filter((phrase) =>
    lowerResponse.includes(phrase)
  ).length;

  if (uncertaintyCount > 0) {
    confidence -= uncertaintyCount * 0.15;
    if (confidence < 0.5) {
      shouldEscalate = true;
    }
  }

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    confidence,
    shouldEscalate,
    cleanResponse,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { conversationId, userId, userMessage, conversationHistory } =
      (await req.json()) as RequestBody;

    if (!userId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Build user context
    const context = await buildContext(supabase, userId);
    const contextStr = formatContextForPrompt(context);
    const historyStr = formatConversationHistory(conversationHistory || []);

    // Prepare the prompt
    const fullPrompt = `${SYSTEM_PROMPT}${contextStr}

Previous conversation:
${historyStr || 'No previous messages.'}

Customer's new message: ${userMessage}

Please provide a helpful response:`;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    // Try multiple model names in order of preference
    const modelNames = ['gemini-1.5-flash-latest', 'gemini-pro', 'gemini-1.0-pro'];
    let responseText: string | null = null;
    let lastError: Error | null = null;
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(fullPrompt);
        responseText = result.response.text();
        break; // Success, exit loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.log(`Model ${modelName} failed, trying next...`, error);
        continue; // Try next model
      }
    }
    
    if (!responseText) {
      throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Analyze the response
    const analysis = analyzeResponse(responseText);

    return new Response(
      JSON.stringify({
        response: analysis.cleanResponse,
        confidence: analysis.confidence,
        shouldEscalate: analysis.shouldEscalate || analysis.confidence < CONFIDENCE_THRESHOLD,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Chat Handler Error:', error);

    return new Response(
      JSON.stringify({
        response:
          "I apologize, but I'm having trouble processing your request. Let me connect you with our support team.",
        confidence: 0,
        shouldEscalate: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
