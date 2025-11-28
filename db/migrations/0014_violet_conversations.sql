-- Umbrella MVP Migration 0014: Violet AI Conversations
-- Conversation threads and messages for the Violet AI chat interface

-- Conversation threads (groups messages into chat sessions)
CREATE TABLE IF NOT EXISTS violet_conversations (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT,                    -- Auto-generated from first user prompt
  started_at TEXT NOT NULL,      -- ISO 8601 timestamp
  last_message_at TEXT NOT NULL, -- ISO 8601 timestamp (updated on each message)
  message_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_violet_conv_artist ON violet_conversations(artist_id);
CREATE INDEX IF NOT EXISTS idx_violet_conv_last_msg ON violet_conversations(last_message_at DESC);

-- Individual messages within conversations
CREATE TABLE IF NOT EXISTS violet_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES violet_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  tokens_used INTEGER,           -- Tokens used for assistant responses
  mood TEXT,                     -- 'professional', 'caring', 'playful' (assistant only)
  context TEXT,                  -- 'gig_inquiry', 'songwriting', 'general', etc.
  created_at TEXT NOT NULL       -- ISO 8601 timestamp
);

CREATE INDEX IF NOT EXISTS idx_violet_msg_conv ON violet_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_violet_msg_created ON violet_messages(created_at);

