-- Umbrella MVP Migration 0009: Onboarding Step Tracking
-- Add step completion tracking fields to artists table for incremental onboarding

-- Add step completion tracking fields
ALTER TABLE artists ADD COLUMN step_1_complete BOOLEAN DEFAULT 0;
ALTER TABLE artists ADD COLUMN step_2_complete BOOLEAN DEFAULT 0;
ALTER TABLE artists ADD COLUMN step_3_complete BOOLEAN DEFAULT 0;
ALTER TABLE artists ADD COLUMN step_4_complete BOOLEAN DEFAULT 0;
ALTER TABLE artists ADD COLUMN step_5_complete BOOLEAN DEFAULT 0;

-- Create index for querying incomplete onboarding
CREATE INDEX IF NOT EXISTS idx_artists_onboarding_complete
  ON artists(step_1_complete, step_2_complete, step_3_complete, step_4_complete, step_5_complete);
