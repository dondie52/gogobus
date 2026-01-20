import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import styles from './LiveChatWidget.module.css';

const LiveChatWidget = () => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation and messages
  const loadChat = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Get or create conversation
      const { data: conv, error: convError } = await chatService.getOrCreateConversation(user.id);
      if (convError) {
        console.error('Error loading conversation:', convError);
        return;
      }

      setConversation(conv);

      // Load messages
      const { data: msgs, error: msgsError } = await chatService.getMessages(conv.id);
      if (msgsError) {
        console.error('Error loading messages:', msgsError);
        return;
      }

      setMessages(msgs || []);

      // Mark admin messages as read when opening
      if (isOpen) {
        await chatService.markMessagesAsRead(conv.id, 'user');
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error in loadChat:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isOpen]);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!user?.id) return;

    const { count } = await chatService.getUnreadCount(user.id);
    setUnreadCount(count);
  }, [user?.id]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversation?.id) return;

    subscriptionRef.current = chatService.subscribeToMessages(
      conversation.id,
      (newMsg) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        // If chat is open and message is from admin, mark as read
        if (isOpen && newMsg.sender_type === 'admin') {
          chatService.markMessagesAsRead(conversation.id, 'user');
        } else if (!isOpen && newMsg.sender_type === 'admin') {
          setUnreadCount((prev) => prev + 1);
        }

        scrollToBottom();
      }
    );

    return () => {
      if (subscriptionRef.current) {
        chatService.unsubscribe(subscriptionRef.current);
      }
    };
  }, [conversation?.id, isOpen, scrollToBottom]);

  // Initial load
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
    }
  }, [user?.id, loadUnreadCount]);

  // Load chat when opened
  useEffect(() => {
    if (isOpen && user?.id) {
      loadChat();
    }
  }, [isOpen, user?.id, loadChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation?.id || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const { error } = await chatService.sendMessage(
        conversation.id,
        user.id,
        messageContent,
        'user'
      );

      if (error) {
        console.error('Error sending message:', error);
        setNewMessage(messageContent); // Restore message on error
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date for message grouping
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.created_at);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate });
      }
      groups.push({ type: 'message', ...msg });
    });

    return groups;
  };

  // Don't render if not logged in
  if (!user) return null;

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className={styles.chatWidget}>
      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className={styles.headerTitle}>GoGoBus Support</h3>
              <span className={styles.headerStatus}>
                <span className={styles.statusDot} />
                We typically reply in minutes
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={toggleChat} aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>👋</div>
              <h4>Hi {userProfile?.full_name?.split(' ')[0] || 'there'}!</h4>
              <p>How can we help you today? Send us a message and we&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <div className={styles.messagesList}>
              {groupedMessages.map((item, index) =>
                item.type === 'date' ? (
                  <div key={`date-${index}`} className={styles.dateDivider}>
                    <span>{item.date}</span>
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className={`${styles.message} ${
                      item.sender_type === 'user' ? styles.userMessage : styles.adminMessage
                    }`}
                  >
                    <div className={styles.messageBubble}>
                      <p>{item.content}</p>
                      <span className={styles.messageTime}>{formatTime(item.created_at)}</span>
                    </div>
                  </div>
                )
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <form className={styles.inputContainer} onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className={styles.messageInput}
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending || loading}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={!newMessage.trim() || sending || loading}
            aria-label="Send message"
          >
            {sending ? (
              <div className={styles.sendingSpinner} />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Floating Button */}
      <button
        className={`${styles.floatingButton} ${isOpen ? styles.hidden : ''}`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveChatWidget;
