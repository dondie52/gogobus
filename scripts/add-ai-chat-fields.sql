-- ============================================
-- GOGOBUS AI Chat Fields Migration
-- ============================================
-- This migration adds fields to support AI-powered chat responses

-- ============================================
-- Add AI fields to chat_conversations
-- ============================================

-- Add is_ai_handled field (default true - AI handles new conversations)
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS is_ai_handled BOOLEAN DEFAULT TRUE;

-- Add escalated_to_admin field (default false)
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS escalated_to_admin BOOLEAN DEFAULT FALSE;

-- Add escalated_at timestamp
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS escalated_at TIMESTAMPTZ;

-- ============================================
-- Add AI fields to chat_messages
-- ============================================

-- Add ai_confidence field for AI responses (0.0 to 1.0)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2);

-- ============================================
-- Update sender_type constraint to include 'ai'
-- ============================================

-- First, drop the existing constraint
ALTER TABLE chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_sender_type_check;

-- Add new constraint that includes 'ai'
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_sender_type_check 
CHECK (sender_type IN ('user', 'admin', 'ai'));

-- ============================================
-- Add index for escalated conversations (for admin dashboard)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_chat_conversations_escalated 
ON chat_conversations(escalated_to_admin) 
WHERE escalated_to_admin = TRUE;

-- ============================================
-- Add RLS policy for AI messages
-- ============================================

-- AI messages are visible to both users and admins (same as admin messages)
-- No additional policies needed since existing policies cover sender_type

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON COLUMN chat_conversations.is_ai_handled IS 'Whether the conversation is currently being handled by AI';
COMMENT ON COLUMN chat_conversations.escalated_to_admin IS 'Whether the conversation has been escalated to a human admin';
COMMENT ON COLUMN chat_conversations.escalated_at IS 'Timestamp when conversation was escalated to admin';
COMMENT ON COLUMN chat_messages.ai_confidence IS 'AI confidence score (0.0-1.0) for AI-generated messages';
