import { supabase } from './supabase';
import { logError, logInfo } from '../utils/logger';
import aiChatService from './aiChatService';
import chatAIService from './chatAIService';

/**
 * Chat Service
 * Handles live chat operations for customer support
 * Now with AI-powered responses using Google Gemini
 */
const chatService = {
  /**
   * Get or create a conversation for the current user
   * Returns existing open conversation or creates a new one
   */
  async getOrCreateConversation(userId) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:15',message:'getOrCreateConversation called',data:{userId,userIdType:typeof userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    try {
      // Check auth.uid() to compare with userId
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:18',message:'Checking auth session before query',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:21',message:'Session check result',data:{hasSession:!!sessionData?.session,userId:sessionData?.session?.user?.id,authUid:sessionData?.session?.user?.id,matchesUserId:sessionData?.session?.user?.id===userId,sessionError:sessionError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // First, try to find an existing open conversation
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:25',message:'Searching for existing conversation',data:{userId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:35',message:'Existing conversation search result',data:{hasExisting:!!existing,hasError:!!fetchError,errorCode:fetchError?.code,errorMessage:fetchError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      if (existing && !fetchError) {
        return { data: existing, error: null };
      }

      // If no open conversation exists, create a new one
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:42',message:'Attempting to create new conversation',data:{userId,userIdType:typeof userId,insertData:{user_id:userId,status:'open'}},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          status: 'open',
        })
        .select()
        .single();

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:52',message:'Create conversation result',data:{hasConversation:!!newConversation,hasError:!!createError,errorCode:createError?.code,errorMessage:createError?.message,errorDetails:createError?.details,errorHint:createError?.hint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (createError) {
        logError('Error creating conversation', createError);
        return { data: null, error: createError };
      }

      return { data: newConversation, error: null };
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:60',message:'getOrCreateConversation exception',data:{errorMessage:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      logError('Error in getOrCreateConversation', error);
      return { data: null, error };
    }
  },

  /**
   * Get all conversations (for admin)
   */
  async getAllConversations(filters = {}) {
    // #region agent log
    // #endregion
    try {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // #region agent log
      // #endregion

      const { data, error } = await query;

      // #region agent log
      // #endregion

      if (error) {
        logError('Error fetching conversations', error);
        // #region agent log
        // #endregion
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Get user IDs from conversations
      const userIds = [...new Set(data.map(conv => conv.user_id))];

      // #region agent log
      // #endregion

      // Fetch profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, avatar_url')
        .in('id', userIds);

      // #region agent log
      // #endregion

      if (profilesError) {
        logError('Error fetching profiles', profilesError);
      }

      // Create a map of user_id -> profile
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // #region agent log
      // #endregion

      // Get unread counts and attach profiles for each conversation
      const conversationsWithUnread = await Promise.all(
        (data || []).map(async (conv) => {
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('sender_type', 'user')
            .eq('is_read', false);

          return {
            ...conv,
            user: profileMap.get(conv.user_id) || null,
            unread_count: count || 0,
          };
        })
      );

      // #region agent log
      // #endregion

      return { data: conversationsWithUnread, error: null };
    } catch (error) {
      logError('Error in getAllConversations', error);
      // #region agent log
      // #endregion
      return { data: null, error };
    }
  },

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        logError('Error fetching messages', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in getMessages', error);
      return { data: null, error };
    }
  },

  /**
   * Send a message
   */
  async sendMessage(conversationId, senderId, content, senderType = 'user') {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          content: content.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        logError('Error sending message', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in sendMessage', error);
      return { data: null, error };
    }
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId, readerType) {
    try {
      // Mark messages from the other party as read
      const senderTypeToMark = readerType === 'admin' ? 'user' : 'admin';

      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', senderTypeToMark)
        .eq('is_read', false);

      if (error) {
        logError('Error marking messages as read', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      logError('Error in markMessagesAsRead', error);
      return { error };
    }
  },

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId) {
    try {
      // Get all user's conversations
      const { data: conversations, error: convError } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_id', userId);

      if (convError || !conversations?.length) {
        return { count: 0, error: convError };
      }

      const conversationIds = conversations.map((c) => c.id);

      // Count unread admin messages
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('sender_type', 'admin')
        .eq('is_read', false);

      if (error) {
        logError('Error getting unread count', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      logError('Error in getUnreadCount', error);
      return { count: 0, error };
    }
  },

  /**
   * Get total unread count for admin (all conversations)
   */
  async getAdminUnreadCount() {
    try {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_type', 'user')
        .eq('is_read', false);

      if (error) {
        logError('Error getting admin unread count', error);
        return { count: 0, error };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      logError('Error in getAdminUnreadCount', error);
      return { count: 0, error };
    }
  },

  /**
   * Close a conversation
   */
  async closeConversation(conversationId, closedBy) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_by: closedBy,
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        logError('Error closing conversation', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in closeConversation', error);
      return { data: null, error };
    }
  },

  /**
   * Reopen a conversation
   */
  async reopenConversation(conversationId) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .update({
          status: 'open',
          closed_at: null,
          closed_by: null,
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        logError('Error reopening conversation', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in reopenConversation', error);
      return { data: null, error };
    }
  },

  /**
   * Subscribe to new messages in a conversation
   */
  subscribeToMessages(conversationId, callback) {
    const subscription = supabase
      .channel(`chat_messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Subscribe to all conversations (for admin)
   */
  subscribeToConversations(callback) {
    const subscription = supabase
      .channel('chat_conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Subscribe to all messages (for admin)
   */
  subscribeToAllMessages(callback) {
    const subscription = supabase
      .channel('all_chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return subscription;
  },

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  },

  // ============================================
  // AI Chat Integration Methods
  // ============================================

  /**
   * Send a message and get AI response
   * This is the main method for AI-powered chat
   */
  async sendMessageWithAI(conversationId, userId, content) {
    try {
      // 1. Save user message first
      const { data: userMessage, error: sendError } = await this.sendMessage(
        conversationId,
        userId,
        content,
        'user'
      );

      if (sendError) {
        return { 
          userMessage: null, 
          aiMessage: null, 
          error: sendError,
          escalated: false,
        };
      }

      // 2. Get conversation history for context
      const { data: history } = await this.getMessages(conversationId);

      // 3. Try Google Gemini AI first (if configured), otherwise use local AI
      let aiResult;
      const hasGeminiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
      
      if (hasGeminiKey) {
        // Try Google Gemini AI
        aiResult = await aiChatService.generateResponse(
          conversationId,
          userId,
          content,
          history || []
        );
        
        // If Gemini fails, fall back to local AI
        if (!aiResult.success) {
          logInfo('Gemini AI failed, falling back to local AI', { error: aiResult.error });
          // Fall through to local AI
        } else {
          // Gemini succeeded, use its response
          const { data: aiMessage, error: aiError } = await this.saveAIResponse(
            conversationId,
            aiResult.response,
            aiResult.confidence
          );

          // Check if we should escalate
          if (aiResult.shouldEscalate) {
            await this.escalateToAdmin(conversationId);
            logInfo('Conversation escalated to admin', { 
              conversationId, 
              confidence: aiResult.confidence 
            });
          }

          return {
            userMessage,
            aiMessage,
            error: aiError,
            escalated: aiResult.shouldEscalate,
            confidence: aiResult.confidence,
          };
        }
      }
      
      // Use local pattern-matching AI (fallback or primary if no Gemini key)
      try {
        const localAIResult = await chatAIService.sendMessageAndGetAIResponse(
          conversationId,
          content,
          userId
        );
        
        if (localAIResult.success && localAIResult.message) {
          // Check if should escalate
          const shouldEscalate = chatAIService.shouldEscalateToHuman(content);
          
          if (shouldEscalate) {
            await this.escalateToAdmin(conversationId);
            logInfo('Conversation escalated to admin (local AI)', { conversationId });
          }
          
          return {
            userMessage,
            aiMessage: localAIResult.message,
            error: null,
            escalated: shouldEscalate,
            confidence: 0.8, // Local AI has decent confidence
          };
        } else {
          throw new Error('Local AI service returned no message');
        }
      } catch (localAIError) {
        logError('Local AI service failed', localAIError);
        // Last resort: escalate to admin
        await this.escalateToAdmin(conversationId);
        return {
          userMessage,
          aiMessage: null,
          error: localAIError,
          escalated: true,
        };
      }
    } catch (error) {
      logError('Error in sendMessageWithAI', error);
      return { 
        userMessage: null, 
        aiMessage: null, 
        error,
        escalated: false,
      };
    }
  },

  /**
   * Save an AI-generated response to the database
   */
  async saveAIResponse(conversationId, content, confidence) {
    try {
      // Use a system sender ID for AI messages (null sender_id with 'ai' type)
      // We'll use the conversation's user_id as a placeholder since sender_id is required
      const { data: conv } = await supabase
        .from('chat_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single();

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: conv?.user_id, // Required field, using user_id as placeholder
          sender_type: 'ai',
          content: content.trim(),
          is_read: true, // AI messages are immediately "read"
          ai_confidence: confidence,
        })
        .select()
        .single();

      if (error) {
        logError('Error saving AI response', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in saveAIResponse', error);
      return { data: null, error };
    }
  },

  /**
   * Escalate a conversation to human admin
   */
  async escalateToAdmin(conversationId) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .update({
          is_ai_handled: false,
          escalated_to_admin: true,
          escalated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        logError('Error escalating conversation', error);
        return { data: null, error };
      }

      logInfo('Conversation escalated to admin', { conversationId });
      return { data, error: null };
    } catch (error) {
      logError('Error in escalateToAdmin', error);
      return { data: null, error };
    }
  },

  /**
   * Check if a conversation is being handled by AI
   */
  async isAIHandled(conversationId) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('is_ai_handled, escalated_to_admin')
        .eq('id', conversationId)
        .single();

      if (error) {
        return { isAIHandled: true, escalated: false, error };
      }

      return {
        isAIHandled: data?.is_ai_handled ?? true,
        escalated: data?.escalated_to_admin ?? false,
        error: null,
      };
    } catch (error) {
      logError('Error in isAIHandled', error);
      return { isAIHandled: true, escalated: false, error };
    }
  },

  /**
   * Get escalated conversations (for admin dashboard)
   */
  async getEscalatedConversations() {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('escalated_to_admin', true)
        .eq('status', 'open')
        .order('escalated_at', { ascending: false });

      if (error) {
        logError('Error fetching escalated conversations', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      logError('Error in getEscalatedConversations', error);
      return { data: null, error };
    }
  },

  /**
   * Take over a conversation from AI (for admin)
   */
  async takeOverFromAI(conversationId, adminId) {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .update({
          is_ai_handled: false,
          escalated_to_admin: true,
          escalated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) {
        logError('Error taking over conversation', error);
        return { data: null, error };
      }

      // Send a system message indicating admin takeover
      await this.sendMessage(
        conversationId,
        adminId,
        "A support agent has joined the conversation. How can I help you?",
        'admin'
      );

      return { data, error: null };
    } catch (error) {
      logError('Error in takeOverFromAI', error);
      return { data: null, error };
    }
  },
};

export default chatService;
