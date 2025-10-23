-- Umbrella MVP Migration 0003: Messaging System
-- Conversations and Messages (polling-based, no WebSocket)

-- Conversations table (message threads between users)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  participant_1_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TEXT,
  last_message_preview TEXT, -- First 100 chars of last message
  unread_count_p1 INTEGER DEFAULT 0, -- Unread count for participant 1
  unread_count_p2 INTEGER DEFAULT 0, -- Unread count for participant 2
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(participant_1_id, participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);

-- Messages table (2000 char limit, text + attachments)
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (LENGTH(content) <= 2000), -- D-043: 2000 char limit
  attachment_url TEXT, -- R2 URL for file attachments
  attachment_filename TEXT,
  attachment_size INTEGER,
  read BOOLEAN DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(conversation_id, read);
