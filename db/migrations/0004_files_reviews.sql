-- Umbrella MVP Migration 0004: Files & Reviews
-- File metadata (R2 storage) and Artist Reviews

-- Files table (metadata only, blobs stored in R2)
CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  r2_key TEXT NOT NULL, -- R2 object key
  category TEXT CHECK (category IN ('press_photo', 'music', 'video', 'document', 'other')),
  folder_id TEXT, -- Optional folder organization
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_files_artist ON files(artist_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON files(artist_id, category);
CREATE INDEX IF NOT EXISTS idx_files_folder ON files(folder_id);

-- Folders table (manual file organization)
CREATE TABLE IF NOT EXISTS folders (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_folder_id TEXT REFERENCES folders(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_artist ON folders(artist_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_folder_id);

-- Storage quotas table (50GB per artist)
CREATE TABLE IF NOT EXISTS storage_quotas (
  artist_id TEXT PRIMARY KEY REFERENCES artists(id) ON DELETE CASCADE,
  used_bytes INTEGER DEFAULT 0,
  limit_bytes INTEGER DEFAULT 53687091200, -- 50GB in bytes
  updated_at TEXT NOT NULL
);

-- Reviews table (no moderation in MVP)
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  reviewer_user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- NULL if invited via email
  reviewer_email TEXT, -- If invited via email (non-platform user)
  reviewer_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  gig_id TEXT REFERENCES gigs(id) ON DELETE SET NULL, -- Optional link to specific gig
  invite_token TEXT, -- Unique token for email invitations
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, reviewer_user_id, gig_id),
  UNIQUE(artist_id, reviewer_email, gig_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_artist ON reviews(artist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(artist_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_gig ON reviews(gig_id);
CREATE INDEX IF NOT EXISTS idx_reviews_token ON reviews(invite_token);

-- Timeline/Journey entries (career milestones)
CREATE TABLE IF NOT EXISTS timeline_entries (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- ISO date
  title TEXT NOT NULL,
  description TEXT,
  entry_type TEXT CHECK (entry_type IN ('gig', 'release', 'milestone', 'other')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timeline_artist ON timeline_entries(artist_id);
CREATE INDEX IF NOT EXISTS idx_timeline_date ON timeline_entries(artist_id, date DESC);
