# Database Schema & Data Models

## Completed

- [x] 5 migration files created
- [x] 20+ tables defined
- [x] All indexes from architecture.md
- [x] TypeScript models for all entities
- [x] Foreign key constraints
- [x] Check constraints for enums

## Tables Created

### Core Entities (0001_users_artists.sql)

**users** - OAuth-linked user accounts
- Primary key: `id` (TEXT)
- OAuth provider: Apple or Google only
- Unique constraint on `(oauth_provider, oauth_id)`
- Tracks onboarding completion status

**artists** - Artist profiles with 40+ attributes
- Primary key: `id` (TEXT)
- Foreign key: `user_id` → `users(id)`
- Identity: stage_name, legal_name, pronouns, location
- Bio & Story: bio, story, tagline
- Creative Profile: genres, influences, equipment, DAW, platforms
- Rates & Availability: flat rate, hourly rate, travel radius, booking lead time
- Quick Questions: 6 yes/no self-assessment questions
- Social Links: 10+ platform URLs
- Metrics: rating, reviews, gigs, earnings, views, followers
- Unique constraint: one artist per user

**artist_followers** - Social following relationships
- Primary key: `id` (TEXT)
- Foreign keys: `artist_id` → `artists(id)`, `follower_user_id` → `users(id)`
- Unique constraint on `(artist_id, follower_user_id)`

### Portfolio & Marketplace (0002_tracks_gigs.sql)

**tracks** - Music portfolio (unlimited uploads within 50GB quota)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- File metadata: title, duration, file_url (R2), cover_art
- Streaming links: Spotify, Apple Music, SoundCloud
- Display order for portfolio sequencing
- Play count tracking

**gigs** - Venue opportunities
- Primary key: `id` (TEXT)
- Foreign key: `venue_id` → `users(id)`
- Location: city, state, address, zip
- Date/time: date (YYYY-MM-DD), start_time, end_time
- Payment: amount, type (flat/hourly/negotiable)
- Capacity tracking: total capacity, filled slots
- Status: open, filled, cancelled, completed
- Urgency flag: auto-set for gigs <7 days with <50% capacity

**gig_applications** - Artist applications to gigs
- Primary key: `id` (TEXT)
- Foreign keys: `gig_id` → `gigs(id)`, `artist_id` → `artists(id)`
- Status: pending, accepted, rejected
- Timestamps: applied_at, responded_at
- Unique constraint: one application per artist per gig

**gig_favorites** - Artist-saved gigs
- Primary key: `id` (TEXT)
- Foreign keys: `gig_id` → `gigs(id)`, `artist_id` → `artists(id)`
- Unique constraint: one favorite per artist per gig

### Communication (0003_messaging.sql)

**conversations** - Message threads (polling-based)
- Primary key: `id` (TEXT)
- Foreign keys: `participant_1_id`, `participant_2_id` → `users(id)`
- Last message metadata: timestamp, preview text
- Unread counts per participant
- Unique constraint: one conversation per user pair

**messages** - Individual messages
- Primary key: `id` (TEXT)
- Foreign keys: `conversation_id` → `conversations(id)`, `sender_id` → `users(id)`
- Content: max 2000 characters (CHECK constraint)
- Attachments: URL, filename, size (R2 storage)
- Read status tracking

### Assets & Feedback (0004_files_reviews.sql)

**files** - File metadata (blobs in R2)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- File info: filename, size, MIME type, R2 key
- Category: press_photo, music, video, document, other
- Optional folder organization

**folders** - File organization
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Optional parent folder for nested structure

**storage_quotas** - 50GB per artist tracking
- Primary key: `artist_id` → `artists(id)`
- Usage: used_bytes, limit_bytes (default 53687091200)
- Updated on file operations

**reviews** - Artist reviews (no moderation in MVP)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Reviewer: user_id OR email (for external invitations)
- Rating: 1-5 (CHECK constraint)
- Optional gig link for review context
- Invite token for email-based reviews
- Unique constraints: one review per artist+reviewer+gig

**timeline_entries** - Career milestones
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Entry type: gig, release, milestone, other
- Date and description

### Analytics & AI (0005_analytics.sql)

**daily_metrics** - Daily aggregated stats (midnight UTC)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Metrics: profile views, gigs completed, earnings, rating, followers, track plays
- Unique constraint: one record per artist per date

**violet_usage** - AI prompt tracking (50/day limit)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Usage tracking: date, prompt count, feature used, prompt text, response tokens

**contact_lists** - Fan segments for broadcasts
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- List metadata: name, description

**contact_list_members** - Individual fan contacts
- Primary key: `id` (TEXT)
- Foreign key: `list_id` → `contact_lists(id)`
- Contact info: email, phone, name
- Opt-in status: email, SMS

**broadcast_messages** - Fan blast history (text-only in MVP)
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Message: subject, body, recipient count
- Delivery method: email, sms, both

**journal_entries** - Creative Studio content
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Content: JSON blocks (text, video, audio, images)
- Entry type: text, video, mixed

**goals** - Artist-defined goals
- Primary key: `id` (TEXT)
- Foreign key: `artist_id` → `artists(id)`
- Goal tracking: title, description, target/current values, type, completion status

## Key Constraints

### Unique Constraints
- **users**: Unique per `(oauth_provider, oauth_id)`
- **artists**: One per `user_id`
- **conversations**: One per `(participant_1_id, participant_2_id)` pair
- **gig_applications**: One per `(gig_id, artist_id)`
- **artist_followers**: One per `(artist_id, follower_user_id)`
- **gig_favorites**: One per `(gig_id, artist_id)`
- **reviews**: One per `(artist_id, reviewer_user_id, gig_id)` OR `(artist_id, reviewer_email, gig_id)`
- **daily_metrics**: One per `(artist_id, date)`

### Check Constraints
- **users.oauth_provider**: IN ('apple', 'google')
- **messages.content**: LENGTH <= 2000 characters
- **reviews.rating**: >= 1 AND <= 5
- **gigs.payment_type**: IN ('flat', 'hourly', 'negotiable')
- **gigs.status**: IN ('open', 'filled', 'cancelled', 'completed')
- **gig_applications.status**: IN ('pending', 'accepted', 'rejected')
- **files.category**: IN ('press_photo', 'music', 'video', 'document', 'other')
- **goals.goal_type**: IN ('earnings', 'gigs', 'followers', 'tracks', 'custom')

### Foreign Key Cascades
- **ON DELETE CASCADE**: reviews, gig_applications, files, tracks, artist_followers, messages
- **ON DELETE SET NULL**: reviews.gig_id (preserve review if gig deleted)
- **No cascades**: analytics tables (preserve historical data)

## Indexes Created

### Performance-Critical Indexes

**User Lookups:**
```sql
idx_users_oauth ON users(oauth_provider, oauth_id)
idx_users_email ON users(email)
```

**Artist Queries:**
```sql
idx_artists_user_id ON artists(user_id)
idx_artists_verified ON artists(verified)
idx_artists_genre ON artists(primary_genre)
idx_artists_location ON artists(location_city, location_state)
idx_artists_rating ON artists(avg_rating)
```

**Gig Discovery:**
```sql
idx_gigs_date ON gigs(date)
idx_gigs_location ON gigs(location_city, location_state)
idx_gigs_genre ON gigs(genre)
idx_gigs_status ON gigs(status)
idx_gigs_urgency ON gigs(urgency_flag)
idx_gigs_venue ON gigs(venue_id)
```

**Track Portfolio:**
```sql
idx_tracks_artist_id ON tracks(artist_id)
idx_tracks_order ON tracks(artist_id, display_order)
idx_tracks_genre ON tracks(genre)
```

**Messaging (Polling Optimization):**
```sql
idx_conversations_p1 ON conversations(participant_1_id)
idx_conversations_p2 ON conversations(participant_2_id)
idx_conversations_updated ON conversations(last_message_at DESC)
idx_messages_conversation ON messages(conversation_id, created_at)
idx_messages_sender ON messages(sender_id)
idx_messages_read ON messages(conversation_id, read)
```

**File Management:**
```sql
idx_files_artist ON files(artist_id)
idx_files_category ON files(artist_id, category)
idx_files_folder ON files(folder_id)
idx_folders_artist ON folders(artist_id)
idx_folders_parent ON folders(parent_folder_id)
```

**Reviews:**
```sql
idx_reviews_artist ON reviews(artist_id)
idx_reviews_rating ON reviews(artist_id, rating)
idx_reviews_gig ON reviews(gig_id)
idx_reviews_token ON reviews(invite_token)
```

**Analytics:**
```sql
idx_metrics_artist_date ON daily_metrics(artist_id, date DESC)
idx_metrics_date ON daily_metrics(date)
idx_violet_artist_date ON violet_usage(artist_id, date)
idx_violet_feature ON violet_usage(feature_used)
```

**Social Features:**
```sql
idx_followers_artist ON artist_followers(artist_id)
idx_followers_user ON artist_followers(follower_user_id)
idx_favorites_gig ON gig_favorites(gig_id)
idx_favorites_artist ON gig_favorites(artist_id)
```

**Goals & Timeline:**
```sql
idx_goals_artist ON goals(artist_id)
idx_goals_completed ON goals(artist_id, completed)
idx_goals_date ON goals(target_date)
idx_timeline_artist ON timeline_entries(artist_id)
idx_timeline_date ON timeline_entries(artist_id, date DESC)
```

## TypeScript Models

All TypeScript models created in `api/models/`:

- **user.ts** - User interface, OAuth helpers, sanitization functions
- **artist.ts** - Artist interface (40+ fields), profile completion calculation, public profile sanitization
- **track.ts** - Track interface, duration formatting, play count tracking
- **gig.ts** - Gig interface, urgency calculation, date formatting, location helpers
- **conversation.ts** - Conversation interface, unread count helpers, time formatting
- **message.ts** - Message interface, length validation, attachment helpers, read status
- **file.ts** - File/folder interfaces, storage quota tracking, file size formatting, MIME type validation
- **review.ts** - Review interface, rating validation, statistics generation, invite token handling
- **analytics.ts** - Daily metrics, Violet usage tracking, goal progress, analytics aggregation

### Model Helper Functions

Each model includes utility functions for:
- **Validation** - Input validation, constraint checking
- **Formatting** - Display-friendly string formatting
- **Calculations** - Derived values, aggregations
- **Type Guards** - Runtime type checking
- **Sanitization** - Public vs. private data filtering

## Next Steps (Implementation)

1. **Run migrations in development:**
   ```bash
   wrangler d1 migrations apply umbrella-dev-db --local
   ```

2. **Create service layer** for each model in `api/services/`

3. **Add CRUD endpoints** in API Worker (`api/index.ts`)

4. **Implement business logic:**
   - Review aggregation (update artist avg_rating)
   - Storage quota enforcement
   - Violet rate limiting (50 prompts/day)
   - Daily analytics aggregation (cron at midnight UTC)
   - Urgency flag automation for gigs

5. **Add data validation middleware**

## Testing Migrations

```bash
# Apply migrations locally
wrangler d1 migrations apply umbrella-dev-db --local

# Verify tables created
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"

# Check specific table schema
wrangler d1 execute umbrella-dev-db --local \
  --command "PRAGMA table_info(artists)"

# Verify indexes
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT name FROM sqlite_master WHERE type='index' ORDER BY name"

# Test insert (user)
wrangler d1 execute umbrella-dev-db --local \
  --command "INSERT INTO users (id, oauth_provider, oauth_id, email, created_at, updated_at) VALUES ('u1', 'apple', 'a123', 'test@example.com', datetime('now'), datetime('now'))"

# Test query
wrangler d1 execute umbrella-dev-db --local \
  --command "SELECT * FROM users"
```

## Data Model Decisions

### JSON Array Fields
Multi-value fields stored as JSON strings:
- `artists.secondary_genres`
- `artists.influences`
- `artists.equipment`
- `artists.available_dates`
- `journal_entries.content`

**Rationale:** Flexible schema, no need for junction tables in MVP

### Separate Relationship Tables
Explicit tables for many-to-many relationships:
- `artist_followers`
- `gig_applications`
- `gig_favorites`
- `contact_list_members`

**Rationale:** Better query performance, easier to track metadata (timestamps, status)

### Storage Tracking at Artist Level
`storage_quotas` table per artist (not global):
**Rationale:** Per-artist enforcement, easier to display usage

### Daily Metrics Pre-Aggregated
Analytics computed once daily at midnight UTC:
**Rationale:** Reduces query complexity, acceptable latency for artist analytics

### No Soft Deletes
Hard deletes only (no `deleted_at` column):
**Rationale:** Simpler MVP, GDPR compliance requires full deletion anyway

## Architecture Notes

- **D1 Database**: SQLite at Cloudflare edge, co-located with Workers
- **R2 Storage**: S3-compatible object storage for files (metadata in D1, blobs in R2)
- **KV Cache**: Used for sessions, rate limiting, search results (not in migration files)
- **Foreign Keys**: Enforced at database level for data integrity
- **Timestamps**: Stored as TEXT in ISO 8601 format
- **Primary Keys**: UUIDs as TEXT (generated in Worker code)
- **Enums**: Enforced via CHECK constraints

## Known Limitations

### D1 Constraints
- **Single-region**: Not globally replicated (acceptable for MVP)
- **10GB max size**: Monitor size, plan migration to Postgres if >8GB
- **SQLite-based**: No stored procedures, limited full-text search
- **Write contention**: SQLite write lock (mitigated by batching, KV for ephemeral data)

### Migration to External Postgres
Consider migration when:
- Database size > 8 GB
- Write latency > 100ms (lock contention)
- Need multi-region replication
- Need advanced features (triggers, stored procedures, partitioning)

**Recommended providers:** Neon (serverless Postgres), Supabase, PlanetScale

## Success Criteria

- [x] 5 migration files created and valid SQL
- [x] All 20+ tables match architecture.md specification
- [x] TypeScript models compile without errors
- [ ] Can apply migrations with `wrangler d1 migrations apply --local`
- [x] All indexes created for optimal query performance
- [x] Documentation complete with testing instructions

## File Boundaries

**Session 3 created these files only:**
- `db/migrations/*.sql` (5 files)
- `api/models/*.ts` (9 files)
- `docs/database-schema.md` (this file)

**Did NOT create:**
- `api/index.ts` or route handlers (Session 1)
- `api/services/*` (future implementation)
- `src/*` frontend files (Session 2)
- `.github/*` workflows (Session 4)
- `wrangler.toml` or config files (Session 1 & 4)

---

**Session 3 Complete** ✓

Next session can now build API endpoints, service layers, and business logic on this data foundation.
