-- Umbrella MVP Migration 0010: Cron Job Logging
-- Tracks execution of scheduled cron jobs

-- Cron execution logs (tracks daily analytics aggregation runs)
CREATE TABLE IF NOT EXISTS cron_logs (
  id TEXT PRIMARY KEY,
  job_name TEXT NOT NULL, -- e.g., 'analytics_aggregation'
  start_time TEXT NOT NULL, -- ISO timestamp
  end_time TEXT, -- ISO timestamp (null if still running)
  duration_ms INTEGER, -- Execution time in milliseconds
  records_processed INTEGER DEFAULT 0, -- Number of records processed
  errors_count INTEGER DEFAULT 0, -- Number of errors encountered
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT, -- Error details if failed
  metadata TEXT, -- JSON for additional context
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job ON cron_logs(job_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cron_logs_status ON cron_logs(status);
CREATE INDEX IF NOT EXISTS idx_cron_logs_created ON cron_logs(created_at DESC);
