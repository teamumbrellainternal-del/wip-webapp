-- Umbrella MVP Migration 0013: Achievements System
-- User achievements and badges for gamification

-- System-defined achievements (badges that users can unlock)
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Icon name (e.g., 'trophy', 'star', 'music')
  category TEXT CHECK (category IN ('gigs', 'earnings', 'engagement', 'profile', 'milestone')),
  unlock_criteria TEXT NOT NULL, -- JSON describing unlock conditions
  points INTEGER DEFAULT 0, -- Points awarded for unlocking
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')) DEFAULT 'common',
  created_at TEXT NOT NULL
);

-- Pre-populate system achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, category, unlock_criteria, points, rarity, created_at) VALUES
  ('ach_first_gig', 'First Gig', 'Complete your first gig', 'music', 'gigs', '{"type":"gigs_completed","value":1}', 10, 'common', datetime('now')),
  ('ach_10_gigs', 'Veteran Performer', 'Complete 10 gigs', 'trophy', 'gigs', '{"type":"gigs_completed","value":10}', 50, 'rare', datetime('now')),
  ('ach_50_gigs', 'Stage Legend', 'Complete 50 gigs', 'star', 'gigs', '{"type":"gigs_completed","value":50}', 200, 'epic', datetime('now')),
  ('ach_first_1k', 'First Grand', 'Earn your first $1,000', 'dollar-sign', 'earnings', '{"type":"total_earnings","value":1000}', 25, 'common', datetime('now')),
  ('ach_5k_earned', 'Money Maker', 'Earn $5,000 total', 'trending-up', 'earnings', '{"type":"total_earnings","value":5000}', 100, 'rare', datetime('now')),
  ('ach_10k_earned', 'Top Earner', 'Earn $10,000 total', 'crown', 'earnings', '{"type":"total_earnings","value":10000}', 250, 'epic', datetime('now')),
  ('ach_100_views', 'Getting Noticed', 'Reach 100 profile views', 'eye', 'engagement', '{"type":"profile_views","value":100}', 15, 'common', datetime('now')),
  ('ach_500_views', 'Rising Star', 'Reach 500 profile views', 'trending-up', 'engagement', '{"type":"profile_views","value":500}', 50, 'rare', datetime('now')),
  ('ach_profile_complete', 'All Set', 'Complete your profile 100%', 'check-circle', 'profile', '{"type":"profile_completion","value":100}', 20, 'common', datetime('now')),
  ('ach_5_star', 'Perfect Rating', 'Maintain a 5.0 average rating', 'star', 'milestone', '{"type":"avg_rating","value":5.0}', 100, 'epic', datetime('now')),
  ('ach_verified', 'Verified Artist', 'Get verified status', 'badge-check', 'milestone', '{"type":"verified","value":true}', 150, 'legendary', datetime('now')),
  ('ach_early_adopter', 'Early Adopter', 'Join Umbrella in the first 1000 users', 'rocket', 'milestone', '{"type":"user_number","value":1000}', 50, 'rare', datetime('now'));

CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- User achievements (tracks which achievements users have unlocked)
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TEXT NOT NULL,
  progress INTEGER DEFAULT 0, -- Current progress toward unlocking (0-100)
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_artist ON user_achievements(artist_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(artist_id, unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
