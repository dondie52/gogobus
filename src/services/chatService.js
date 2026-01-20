import { supabase } from './supabase';
import { logError } from '../utils/logger';

/**
 * Chat Service
 * Handles live chat operations for customer support
 */
const chatService = {
  /**
   * Get or create a conversation for the current user
   * Returns existing open conversation or creates a new one
   */
  async getOrCreateConversation(userId) {
    try {
      // First, try to find an existing open conversation
      const { data: existing, error: fetchError } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existing && !fetchError) {
        return { data: existing, error: null };
      }

      // If no open conversation exists, create a new one
      const { data: newConversation, error: createError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          status: 'open',
        })
        .select()
        .single();

      if (createError) {
        logError('Error creating conversation', createError);
        return { data: null, error: createError };
      }

      return { data: newConversation, error: null };
    } catch (error) {
      logError('Error in getOrCreateConversation', error);
      return { data: null, error };
    }
  },

  /**
   * Get all conversations (for admin)
   */
  async getAllConversations(filters = {}) {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:54',message:'getAllConversations called',data:{filters},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:69',message:'Before Supabase query execution',data:{filterStatus:filters.status},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      const { data, error } = await query;

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:72',message:'Supabase query result',data:{hasData:!!data,dataLength:data?.length||0,hasError:!!error,errorMessage:error?.message,errorCode:error?.code,errorDetails:error?.details,firstItem:data?.[0]||null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      if (error) {
        logError('Error fetching conversations', error);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:75',message:'Query error detected',data:{errorMessage:error.message,errorCode:error.code,errorDetails:error.details},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Get user IDs from conversations
      const userIds = [...new Set(data.map(conv => conv.user_id))];

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:87',message:'Fetching profiles',data:{userIds,userIdsCount:userIds.length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      // Fetch profiles for all users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, avatar_url')
        .in('id', userIds);

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:95',message:'Profile query result',data:{hasProfiles:!!profiles,profilesCount:profiles?.length||0,hasError:!!profilesError,errorMessage:profilesError?.message,errorCode:profilesError?.code,profiles:profiles||[]},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      if (profilesError) {
        logError('Error fetching profiles', profilesError);
      }

      // Create a map of user_id -> profile
      const profileMap = new Map((profiles || []).map(p => [p.id, p]));

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:95',message:'Before processing unread counts',data:{conversationsCount:data?.length||0,profilesCount:profiles?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
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
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:112',message:'getAllConversations returning',data:{conversationsCount:conversationsWithUnread?.length||0,firstConversation:conversationsWithUnread?.[0]||null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      return { data: conversationsWithUnread, error: null };
    } catch (error) {
      logError('Error in getAllConversations', error);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'chatService.js:116',message:'Exception caught in getAllConversations',data:{errorMessage:error.message,errorStack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
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
};

export default chatService;
