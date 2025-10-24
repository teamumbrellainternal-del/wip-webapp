-- Umbrella MVP Migration 0006: Delivery Queue System
-- Failed email/SMS delivery queue with retry tracking

-- Email delivery queue (for failed/retryable sends)
CREATE TABLE IF NOT EXISTS email_delivery_queue (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  template_type TEXT, -- 'welcome', 'booking_confirmation', 'message_notification', 'review_invitation', 'broadcast'

  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TEXT, -- ISO timestamp for next retry attempt
  last_error TEXT,

  -- Metadata
  artist_id TEXT, -- Optional, for tracking
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'failed', 'completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_delivery_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_artist ON email_delivery_queue(artist_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_delivery_queue(created_at DESC);

-- SMS delivery queue (for failed/retryable sends)
CREATE TABLE IF NOT EXISTS sms_delivery_queue (
  id TEXT PRIMARY KEY,
  to_phone TEXT NOT NULL,
  from_phone TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 1600), -- SMS limit
  message_type TEXT, -- 'booking_confirmation', 'broadcast', 'notification'

  -- Retry tracking
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TEXT, -- ISO timestamp for next retry attempt
  last_error TEXT,

  -- Metadata
  artist_id TEXT, -- Optional, for tracking
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'failed', 'completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sms_queue_status ON sms_delivery_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_sms_queue_artist ON sms_delivery_queue(artist_id);
CREATE INDEX IF NOT EXISTS idx_sms_queue_created ON sms_delivery_queue(created_at DESC);

-- Email delivery log (for tracking all sends - success and failure)
CREATE TABLE IF NOT EXISTS email_delivery_log (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'bounced', 'rejected')),
  error_message TEXT,
  external_id TEXT, -- Resend message ID
  artist_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_artist ON email_delivery_log(artist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_created ON email_delivery_log(created_at DESC);

-- SMS delivery log (for tracking all sends - success and failure)
CREATE TABLE IF NOT EXISTS sms_delivery_log (
  id TEXT PRIMARY KEY,
  to_phone TEXT NOT NULL,
  message_type TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'undelivered')),
  error_message TEXT,
  external_id TEXT, -- Twilio message SID
  artist_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sms_log_status ON sms_delivery_log(status);
CREATE INDEX IF NOT EXISTS idx_sms_log_artist ON sms_delivery_log(artist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_log_created ON sms_delivery_log(created_at DESC);

-- Unsubscribe list (for email opt-outs)
CREATE TABLE IF NOT EXISTS unsubscribe_list (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  reason TEXT,
  artist_id TEXT, -- If unsubscribing from specific artist
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_unsubscribe_email ON unsubscribe_list(email);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_artist ON unsubscribe_list(artist_id);
