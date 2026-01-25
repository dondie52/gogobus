import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import styles from './LiveChatWidget.module.css';

const LiveChatWidget = () => {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const subscriptionRef = useRef(null);
  const messagesListRef = useRef(null);
  const buttonRef = useRef(null);
  const widgetRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversation and messages
  const loadChat = useCallback(async () => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:28',message:'loadChat called',data:{hasUser:!!user,userId:user?.id,userIdType:typeof user?.id,isOpen},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!user?.id) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:31',message:'loadChat early return - no user',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get or create conversation
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:40',message:'Calling getOrCreateConversation',data:{userId:user.id,userIdType:typeof user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const { data: conv, error: convError } = await chatService.getOrCreateConversation(user.id);
      
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:44',message:'getOrCreateConversation result',data:{hasConv:!!conv,convId:conv?.id,hasError:!!convError,errorCode:convError?.code,errorMessage:convError?.message,errorDetails:convError?.details},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (convError) {
        console.error('Error loading conversation:', convError);
        setError(`Failed to load chat: ${convError.message || 'Unknown error'}`);
        return;
      }

      if (!conv) {
        setError('Failed to create conversation. Please try again.');
        return;
      }

      setConversation(conv);
      setIsEscalated(conv?.escalated_to_admin || false);

      // Load messages
      const { data: msgs, error: msgsError } = await chatService.getMessages(conv.id);
      
      if (msgsError) {
        console.error('Error loading messages:', msgsError);
        // Don't return - conversation exists, just no messages yet
      }

      setMessages(msgs || []);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:75',message:'Messages loaded and set',data:{msgCount:msgs?.length||0,msgsSample:msgs?.slice(0,3)?.map(m=>({id:m?.id,content:m?.content?.substring(0,50),sender_type:m?.sender_type,created_at:m?.created_at,hasContent:!!m?.content,contentType:typeof m?.content}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion

      // Mark admin/AI messages as read when opening
      if (isOpen && conv?.id) {
        await chatService.markMessagesAsRead(conv.id, 'user');
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error in loadChat:', err);
      setError('An unexpected error occurred. Please try again.');
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

        // Stop AI typing indicator when AI responds
        if (newMsg.sender_type === 'ai') {
          setAiTyping(false);
        }

        // Handle read status
        if (isOpen && (newMsg.sender_type === 'admin' || newMsg.sender_type === 'ai')) {
          chatService.markMessagesAsRead(conversation.id, 'user');
        } else if (!isOpen && (newMsg.sender_type === 'admin' || newMsg.sender_type === 'ai')) {
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

  // Debug: Check DOM structure after render
  useEffect(() => {
    if (isOpen && messages.length > 0 && messagesListRef.current) {
      // #region agent log
      const messagesListEl = messagesListRef.current;
      const childCount = messagesListEl.children.length;
      const childTypes = Array.from(messagesListEl.children).map((el, idx) => ({
        index: idx,
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent?.substring(0, 50),
        childCount: el.children.length,
        innerHTML: el.innerHTML?.substring(0, 100)
      }));
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:149',message:'DOM structure check',data:{messagesListExists:!!messagesListEl,childCount,childTypes,groupedMessagesCount:groupMessagesByDate(messages).length,messagesListTextContent:messagesListEl.textContent?.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'L'})}).catch(()=>{});
      // #endregion
    }
  }, [isOpen, messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message with AI response
  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    if (!user?.id) {
      alert('Please log in to send messages.');
      return;
    }

    setError(null);
    
    // Get or create conversation if needed
    let currentConversation = conversation;
    if (!currentConversation?.id) {
      setLoading(true);
      try {
        const { data: conv, error: convError } = await chatService.getOrCreateConversation(user.id);
        
        if (convError || !conv) {
          const errorMsg = convError?.message || 'Unknown error';
          setError(`Unable to start chat: ${errorMsg}`);
          setLoading(false);
          return;
        }
        
        setConversation(conv);
        currentConversation = conv;
      } catch (err) {
        console.error('Error creating conversation:', err);
        setError('Unable to start chat. Please try again.');
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }

    if (!currentConversation?.id) {
      setError('Unable to send message. Please refresh and try again.');
      return;
    }

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setAiTyping(true);

    try {
      // Try AI-powered message sending first
      const result = await chatService.sendMessageWithAI(
        currentConversation.id,
        user.id,
        messageContent
      );

      if (result.error && !result.userMessage) {
        console.warn('AI message failed, using fallback:', result.error);
        
        // Fallback: send as regular message without AI
        const { error: fallbackError } = await chatService.sendMessage(
          currentConversation.id,
          user.id,
          messageContent,
          'user'
        );
        
        if (fallbackError) {
          console.error('Fallback send also failed:', fallbackError);
          setNewMessage(messageContent);
          setError('Failed to send message. Please try again.');
        }
      }

      // Update escalation status
      if (result.escalated) {
        setIsEscalated(true);
      }
    } catch (err) {
      console.error('Error in handleSend:', err);
      
      // Last resort fallback
      try {
        await chatService.sendMessage(currentConversation.id, user.id, messageContent, 'user');
      } catch (fallbackErr) {
        console.error('All send attempts failed:', fallbackErr);
        setNewMessage(messageContent);
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setSending(false);
      setAiTyping(false);
    }
  };

  // Request human support
  const handleRequestHuman = async () => {
    if (!conversation?.id) return;
    
    setSending(true);
    try {
      await chatService.escalateToAdmin(conversation.id);
      setIsEscalated(true);
      
      // Add a system message locally
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          sender_type: 'ai',
          content: "I've connected you with our support team. A human agent will respond shortly.",
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error('Error requesting human support:', err);
      setError('Failed to connect to support. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Toggle chat open/close
  const toggleChat = () => {
    setIsOpen(!isOpen);
    setError(null);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  // Close/minimize floating button
  const handleCloseButton = (e) => {
    e.stopPropagation();
    setIsButtonVisible(false);
  };

  // Show floating button (slide in from edge)
  const handleShowButton = () => {
    setIsButtonVisible(true);
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    // Don't start drag if clicking the minimize button
    if (e.target.closest(`.${styles.minimizeButton}`)) return;
    
    if (e.button !== 0) return; // Only left mouse button
    e.preventDefault();
    setIsDragging(true);
    const rect = buttonRef.current?.getBoundingClientRect();
    const widgetRect = widgetRef.current?.getBoundingClientRect();
    if (rect && widgetRect) {
      // Store the offset from mouse to button center
      setDragStart({
        x: e.clientX - (rect.left + rect.width / 2),
        y: e.clientY - (rect.top + rect.height / 2),
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !buttonRef.current || !widgetRef.current) return;
      
      const widgetRect = widgetRef.current.getBoundingClientRect();
      const buttonSize = 60;

      // Calculate new position: mouse position minus drag offset, relative to widget
      const mouseX = e.clientX - widgetRect.left;
      const mouseY = e.clientY - widgetRect.top;
      
      const newX = mouseX - dragStart.x - buttonSize / 2;
      const newY = mouseY - dragStart.y - buttonSize / 2;

      // Constrain to widget bounds
      const maxX = Math.max(0, widgetRect.width - buttonSize);
      const maxY = Math.max(0, widgetRect.height - buttonSize);
      
      setButtonPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:319',message:'groupMessagesByDate called',data:{msgCount:msgs?.length,msgsSample:msgs?.slice(0,2)?.map(m=>({id:m?.id,content:m?.content?.substring(0,50),sender_type:m?.sender_type,created_at:m?.created_at}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const groups = [];
    let currentDate = null;

    msgs.forEach((msg) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:325',message:'Processing message in groupMessagesByDate',data:{msgId:msg?.id,hasContent:!!msg?.content,contentLength:msg?.content?.length,contentPreview:msg?.content?.substring(0,30),hasCreatedAt:!!msg?.created_at,createdAt:msg?.created_at,senderType:msg?.sender_type,msgKeys:Object.keys(msg||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      const msgDate = formatDate(msg.created_at);
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:328',message:'Date comparison in grouping',data:{msgDate,currentDate,willAddDateDivider:msgDate!==currentDate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msgDate });
      }
      const messageGroup = { type: 'message', ...msg };
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:334',message:'Adding message to groups',data:{groupType:messageGroup.type,hasId:!!messageGroup.id,hasContent:!!messageGroup.content,hasSenderType:!!messageGroup.sender_type,groupKeys:Object.keys(messageGroup)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      groups.push(messageGroup);
    });

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:339',message:'groupMessagesByDate result',data:{totalGroups:groups.length,dateGroups:groups.filter(g=>g.type==='date').length,messageGroups:groups.filter(g=>g.type==='message').length,groupsSample:groups.slice(0,3).map(g=>({type:g.type,date:g.date,id:g.id,content:g.content?.substring(0,30)||'no content'}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return groups;
  };

  // Get sender label for message
  const getSenderLabel = (senderType) => {
    switch (senderType) {
      case 'ai':
        return 'AI Assistant';
      case 'admin':
        return 'Support Agent';
      default:
        return null;
    }
  };

  // Don't render if not logged in
  if (!user) return null;

  const groupedMessages = groupMessagesByDate(messages);
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:350',message:'Before render - messages state',data:{messagesCount:messages.length,messagesSample:messages.slice(0,2).map(m=>({id:m?.id,content:m?.content?.substring(0,50),sender_type:m?.sender_type})),groupedCount:groupedMessages.length,isOpen,loading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
  // #endregion
  const isSendButtonDisabled = !newMessage.trim() || sending || loading || aiTyping;

  return (
    <div ref={widgetRef} className={styles.chatWidget}>
      {/* Slide-in button when minimized */}
      {!isButtonVisible && !isOpen && (
        <button
          className={styles.slideInButton}
          onClick={handleShowButton}
          aria-label="Show chat"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                <circle cx="8.5" cy="14.5" r="1.5" />
                <circle cx="15.5" cy="14.5" r="1.5" />
              </svg>
            </div>
            <div>
              <h3 className={styles.headerTitle}>
                {isEscalated ? 'GoGoBus Support' : 'GoGoBus AI Support'}
              </h3>
              <span className={styles.headerStatus}>
                <span className={`${styles.statusDot} ${isEscalated ? styles.humanStatus : styles.aiStatus}`} />
                {isEscalated 
                  ? 'Connected to support team' 
                  : aiTyping 
                    ? 'AI is typing...' 
                    : 'AI-powered instant support'}
              </span>
            </div>
          </div>
          <button className={styles.closeButton} onClick={toggleChat} aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">×</button>
          </div>
        )}

        {/* Messages */}
        <div className={styles.messagesContainer}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <span>Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.welcomeMessage}>
              <div className={styles.welcomeIcon}>🤖</div>
              <h4>Hi {userProfile?.full_name?.split(' ')[0] || 'there'}!</h4>
              <p>I&apos;m your AI assistant. Ask me anything about bookings, routes, or tickets. I&apos;ll help you right away!</p>
              <div className={styles.quickActions}>
                <button 
                  className={styles.quickAction}
                  onClick={() => setNewMessage('How do I book a ticket?')}
                >
                  How to book?
                </button>
                <button 
                  className={styles.quickAction}
                  onClick={() => setNewMessage('What routes are available?')}
                >
                  View routes
                </button>
                <button 
                  className={styles.quickAction}
                  onClick={() => setNewMessage('Help with my booking')}
                >
                  My bookings
                </button>
              </div>
            </div>
          ) : (
            <div ref={messagesListRef} className={styles.messagesList}>
              {groupedMessages.map((item, index) => {
                // #region agent log
                fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:432',message:'Rendering grouped item',data:{index,itemType:item.type,itemId:item.id,hasContent:!!item.content,contentPreview:item.content?.substring(0,30),senderType:item.sender_type,itemKeys:Object.keys(item||{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'I'})}).catch(()=>{});
                // #endregion
                if (item.type === 'date') {
                  // #region agent log
                  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:458',message:'Rendering date divider',data:{index,date:item.date,dateDividerClass:styles.dateDivider},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'J'})}).catch(()=>{});
                  // #endregion
                  return (
                    <div key={`date-${index}`} className={styles.dateDivider}>
                      <span>{item.date}</span>
                    </div>
                  );
                }
                // #region agent log
                const messageClasses = `${styles.message} ${
                  item.sender_type === 'user' 
                    ? styles.userMessage 
                    : item.sender_type === 'ai'
                      ? styles.aiMessage
                      : styles.adminMessage
                }`;
                fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LiveChatWidget.jsx:470',message:'Rendering message',data:{index,itemId:item.id,senderType:item.sender_type,messageClasses,hasContent:!!item.content,contentLength:item.content?.length,createdAt:item.created_at,formattedTime:formatTime(item.created_at)},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'K'})}).catch(()=>{});
                // #endregion
                return (
                  <div
                    key={item.id}
                    className={messageClasses}
                  >
                    {item.sender_type !== 'user' && (
                      <span className={styles.senderLabel}>
                        {item.sender_type === 'ai' ? '🤖' : '👤'} {getSenderLabel(item.sender_type)}
                      </span>
                    )}
                    <div className={styles.messageBubble}>
                      <p>{item.content}</p>
                      <span className={styles.messageTime}>{formatTime(item.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              {aiTyping && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <span className={styles.senderLabel}>🤖 AI Assistant</span>
                  <div className={styles.messageBubble}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Human support button */}
        {!isEscalated && messages.length > 0 && (
          <div className={styles.humanSupportBar}>
            <button 
              className={styles.humanSupportButton}
              onClick={handleRequestHuman}
              disabled={sending}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Talk to human agent
            </button>
          </div>
        )}

        {/* Input */}
        <form className={styles.inputContainer} onSubmit={handleSend}>
          <input
            ref={inputRef}
            type="text"
            className={styles.messageInput}
            placeholder={
              loading 
                ? 'Loading chat...' 
                : aiTyping 
                  ? 'AI is thinking...' 
                  : 'Type your message...'
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending || loading || aiTyping}
          />
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isSendButtonDisabled}
            aria-label="Send message"
          >
            {sending || aiTyping ? (
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
      {isButtonVisible && (
        <div
          ref={buttonRef}
          className={`${styles.floatingButtonContainer} ${isOpen ? styles.hidden : ''}`}
          style={{
            transform: buttonPosition.x !== 0 || buttonPosition.y !== 0 
              ? `translate(${buttonPosition.x}px, ${buttonPosition.y}px)` 
              : undefined,
          }}
        >
          <button
            className={`${styles.floatingButton} ${isDragging ? styles.dragging : ''}`}
            onClick={(e) => {
              if (!isDragging) {
                toggleChat();
              }
            }}
            onMouseDown={handleMouseDown}
            aria-label="Open chat"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
            </svg>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            className={styles.minimizeButton}
            onClick={handleCloseButton}
            aria-label="Minimize chat"
            title="Minimize"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LiveChatWidget;