# Violet AI & Analytics Systems Analysis

**Analysis Date:** 2026-01-26
**Analyst:** Claude (Opus 4.5)
**Repository:** wip-webapp (Umbrella MVP)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Violet AI Architecture](#violet-ai-architecture)
3. [Analytics Pipeline](#analytics-pipeline)
4. [Goals & Achievements (Gamification)](#goals--achievements-gamification)
5. [Data Available for AI Enhancement](#data-available-for-ai-enhancement)
6. [Extension Opportunities](#extension-opportunities)
7. [Technical Spec: Smart Gig Matcher](#technical-spec-smart-gig-matcher)

---

## Executive Summary

Umbrella's Violet AI assistant and analytics systems form the intelligence layer of the platform. Currently in **Release 1** with placeholder responses, the infrastructure is production-ready for real Claude API integration. Key findings:

| Component | Status | Maturity |
|-----------|--------|----------|
| Violet Chat UI | Complete | Production |
| Violet Backend | Complete | Production (placeholder mode) |
| Multi-turn Conversations | Complete | Production |
| Rate Limiting (50/day) | Complete | Production |
| Token Budgets (25k/month) | Complete | Production |
| Analytics Aggregation | Complete | Production |
| Goals System | Complete | Production |
| Achievement Auto-Unlock | **Missing** | Not Implemented |

---

## Violet AI Architecture

### 1. Full Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  VioletPage.tsx (Landing)                                               │
│  ├─ Displays 5 toolkit categories                                       │
│  ├─ 6 quick actions ("Book my next gig", "Help me finish a track")      │
│  ├─ Usage badge (X/50 prompts today)                                    │
│  └─ Navigate to: /violet/chat?prompt={encoded}                          │
│                                                                          │
│  VioletChatPage.tsx (Chat Interface)                                    │
│  ├─ Creates/loads conversation                                          │
│  ├─ Renders ChatMessage components (user + assistant)                   │
│  ├─ ChatInput with rate limit banner                                    │
│  └─ Optimistic UI updates                                               │
├─────────────────────────────────────────────────────────────────────────┤
│                           API SERVICE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  violetService (src/services/api.ts)                                    │
│  ├─ getUsage() → GET /v1/violet/usage                                   │
│  ├─ getConversations() → GET /v1/violet/conversations                   │
│  ├─ createConversation() → POST /v1/violet/conversations                │
│  ├─ getConversation(id) → GET /v1/violet/conversations/:id              │
│  └─ sendMessage(id, content) → POST /v1/violet/conversations/:id/messages│
├─────────────────────────────────────────────────────────────────────────┤
│                           BACKEND                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  Controllers (api/controllers/violet/index.ts)                          │
│  ├─ sendConversationMessage():                                          │
│  │   1. Validate message (max 2000 chars)                               │
│  │   2. Check rate limit (50/day via D1 query)                          │
│  │   3. Load last 30 messages for context                               │
│  │   4. Call ClaudeAPIService.generateResponseWithContext()             │
│  │   5. Store user message in D1                                        │
│  │   6. Store assistant message in D1                                   │
│  │   7. Update conversation metadata                                    │
│  │   8. Return both messages + remaining prompts                        │
│  │                                                                       │
│  ClaudeAPIService (api/services/claude.ts)                              │
│  ├─ checkDailyLimit(artistId) → Query violet_usage table                │
│  ├─ generateResponseWithContext():                                      │
│  │   ├─ RELEASE 1: Return placeholder from PLACEHOLDER_RESPONSES        │
│  │   └─ FUTURE: Call Claude API with conversation history               │
│  └─ trackUsage() → INSERT into violet_usage table                       │
├─────────────────────────────────────────────────────────────────────────┤
│                           DATABASE                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  violet_conversations                                                    │
│  ├─ id, artist_id, title, started_at, last_message_at, message_count   │
│                                                                          │
│  violet_messages                                                         │
│  ├─ id, conversation_id, role (user/assistant), content                │
│  ├─ tokens_used, mood, context, created_at                              │
│                                                                          │
│  violet_usage (rate limiting + analytics)                               │
│  ├─ id, artist_id, date (YYYY-MM-DD), prompt_count                     │
│  └─ feature_used, prompt_text, response_tokens, created_at              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2. Conversation Storage & Retrieval

**Storage Model:**
- Each conversation has a unique ID and belongs to one artist
- Messages stored chronologically with role distinction
- Auto-generated titles from first user message (50 chars)
- Soft-delete via `is_archived` flag

**Retrieval Strategy:**
- Last 30 messages loaded for AI context (MAX_CONTEXT_MESSAGES constant)
- Messages ordered by `created_at ASC` for chronological context
- Conversation list paginated (default 20, max 50 per page)

### 3. Prompt Engineering Patterns

**System Prompt Templates** (api/utils/violet-templates.ts):

| Context | Tone | Length | Focus |
|---------|------|--------|-------|
| `draft_message` | Warm, conversational | <500 words | Fan communication |
| `gig_inquiry` | Professional, confident | 150-300 words | Venue pitches |
| `songwriting` | Collaborative, creative | Flexible | Lyrics, themes |
| `career_advice` | Encouraging, practical | Flexible | Actionable guidance |
| `bio_generator` | Professional, engaging | 3-4 sentences | Third-person bio |
| `general` | Supportive, on-topic | Concise | Character consistency |

**Context Injection for Multi-turn:**
```typescript
// Previous messages injected as conversation history
const messages = previousMessages.map(msg => ({
  role: msg.role === 'assistant' ? 'assistant' : 'user',
  content: msg.content
}))
messages.push({ role: 'user', content: currentPrompt })

// System prompt separate from messages
const payload = {
  model: 'claude-haiku-4-5',
  system: systemPrompt,
  messages,
  max_tokens: 1024,
  temperature: 0.7
}
```

**Character Consistency Rules:**
- Always "You are Violet" - never mention Claude
- Maintain brand voice across all interactions
- Mood detection: professional (default), caring, playful

### 4. Rate Limiting & Token Budgets

**Daily Prompt Limit (D-062):**
- 50 prompts/day per artist
- Enforced at both middleware and service levels
- Resets at midnight UTC
- Storage: D1 `violet_usage` table (source of truth)
- Response: 429 with reset timestamp

**Monthly Token Budget (D-059):**
- 25,000 tokens/month per user
- Stored in Cloudflare KV: `token-usage:{userId}:{YYYY-MM}`
- 35-day TTL for automatic cleanup
- Used for bio/EPK/cover letter generation

**Rate Limit Implementation:**
```typescript
// Sliding window algorithm for general API
const currentWindow = Math.floor(Date.now() / 1000 / 60)
const key = `ratelimit:user:${userId}:${currentWindow}`

// Daily limit for Violet (D1-based)
const today = new Date().toISOString().split('T')[0]
const result = await db.prepare(
  `SELECT COUNT(*) FROM violet_usage WHERE artist_id = ? AND date = ?`
).bind(artistId, today).first()
```

### 5. Violet's Tools & Capabilities

**Current Capabilities (Release 1):**

| Tool | Context Type | Status | Description |
|------|-------------|--------|-------------|
| Message Drafting | `draft_message` | Placeholder | Fan communication templates |
| Gig Inquiry Writer | `gig_inquiry` | Placeholder | Venue pitch generation |
| Songwriting Assistant | `songwriting` | Placeholder | Lyric suggestions |
| Career Advisor | `career_advice` | Placeholder | Industry guidance |
| Bio Generator | `bio_generator` | Real API | Artist bio creation |
| Cover Letter | N/A | Real API | Gig application letters |
| EPK Generator | N/A | Real API | Electronic Press Kits |

**Toolkit Categories (UI):**
1. **Gigs & Bookings** (purple) - Apply, negotiate, schedule
2. **Creative Growth** (amber) - Songwriting, production tips
3. **Music Production** (blue) - Mixing, mastering advice
4. **Networking & Collaboration** (green) - Connection strategies
5. **Career Management** (pink) - Long-term planning

---

## Analytics Pipeline

### 1. Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    REAL-TIME DATA SOURCES                            │
├──────────────────────────────────────────────────────────────────────┤
│  gigs table                    → Completed gigs, payments            │
│  gig_applications table        → Application status, acceptance rate │
│  artists table                 → follower_count, avg_rating          │
│  violet_usage table            → AI prompt usage                     │
│  reviews table                 → Ratings, feedback                   │
│  user_connections table        → Network graph                       │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
                      ▼ (Midnight UTC)
┌──────────────────────────────────────────────────────────────────────┐
│                    CRON JOB: aggregateAnalytics()                    │
│                    /cron/analytics?force=true                        │
├──────────────────────────────────────────────────────────────────────┤
│  For each active artist (step_1_complete = 1):                       │
│    1. Get follower_count, avg_rating from artists table              │
│    2. Count yesterday's completed gigs                               │
│    3. Sum payment_amount as earnings                                 │
│    4. Insert/Update daily_metrics record                             │
│    5. Generate spotlight artists (KV cache)                          │
│    6. Log execution to cron_logs                                     │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    AGGREGATED DATA STORE                             │
│                    daily_metrics table                               │
├──────────────────────────────────────────────────────────────────────┤
│  Columns: id, artist_id, date, profile_views, gigs_completed,        │
│           earnings, avg_rating, follower_count, track_plays          │
│  Indexes: (artist_id, date DESC), (date)                             │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                                      │
├──────────────────────────────────────────────────────────────────────┤
│  GET /v1/analytics/dashboard                                         │
│    → Current month vs previous month comparison                      │
│    → Top 3 urgent gig opportunities                                  │
│                                                                       │
│  GET /v1/analytics?period=[month|year]                               │
│    → Detailed metrics with chart data                                │
│    → Peak values (revenue, gigs, fans)                               │
│                                                                       │
│  GET /v1/analytics/performance?period=[monthly|yearly]               │
│    → Chart data for GrowthPage visualization                         │
└─────────────────────┬────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    FRONTEND VISUALIZATION                            │
│                    GrowthPage.tsx                                    │
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │ Total Revenue   │  │ Gigs Completed  │  │ Fan Reach       │      │
│  │ +22% from last  │  │ 12 this month   │  │ +15% growth     │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘      │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Performance Grid (6 months)                                   │   │
│  │ Jan: $2,400 │ Feb: $2,800 │ Mar: $3,100 │ ...                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐     │
│  │ Your Goals   │  │ Achievements (unlocked/locked)           │     │
│  │ Progress bars│  │ Spotlight Artists (leaderboard)          │     │
│  └──────────────┘  └──────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

### 2. Tracked Metrics

| Metric | Source | Aggregation | Update Frequency |
|--------|--------|-------------|------------------|
| `earnings` | `gigs.payment_amount` | SUM per day | Midnight UTC |
| `gigs_completed` | `gigs + gig_applications` | COUNT per day | Midnight UTC |
| `profile_views` | **Not implemented** | Would need tracking | N/A |
| `follower_count` | `artists.follower_count` | Latest value | Midnight UTC |
| `avg_rating` | `artists.avg_rating` | Latest value | Midnight UTC |
| `track_plays` | **Not implemented** | Would need tracking | N/A |

### 3. Growth Calculations

```typescript
// Percentage change formula
const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// Period comparison
const currentMonth = SUM(earnings) WHERE date BETWEEN currentMonthStart AND currentMonthEnd
const previousMonth = SUM(earnings) WHERE date BETWEEN previousMonthStart AND previousMonthEnd
const growth = calculateGrowth(currentMonth, previousMonth)
```

---

## Goals & Achievements (Gamification)

### 1. Goals System

**Database Schema (goals table):**
```sql
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  goal_type TEXT CHECK (goal_type IN ('earnings', 'gigs', 'followers', 'tracks', 'custom')),
  target_date TEXT,
  completed BOOLEAN DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);
```

**Goal Types:**
- `earnings` - Revenue targets (e.g., "Earn $5,000")
- `gigs` - Performance count (e.g., "Complete 50 gigs")
- `followers` - Audience growth (e.g., "Reach 1,000 fans")
- `tracks` - Creative output (e.g., "Release 10 tracks")
- `custom` - User-defined milestones

**Progress Calculation:**
```typescript
const progress = Math.min(100, (current_value / target_value) * 100)
```

### 2. Achievements System

**Pre-populated Achievements (12 total):**

| Achievement | Category | Unlock Criteria | Points | Rarity |
|-------------|----------|-----------------|--------|--------|
| First Gig | gigs | 1 gig completed | 10 | Common |
| Veteran Performer | gigs | 10 gigs completed | 50 | Rare |
| Stage Legend | gigs | 50 gigs completed | 200 | Epic |
| First Grand | earnings | $1,000 total | 25 | Common |
| Money Maker | earnings | $5,000 total | 100 | Rare |
| Top Earner | earnings | $10,000 total | 250 | Epic |
| Getting Noticed | engagement | 100 profile views | 15 | Common |
| Rising Star | engagement | 500 profile views | 50 | Rare |
| All Set | profile | 100% profile complete | 20 | Common |
| Perfect Rating | milestone | 5.0 avg rating | 100 | Epic |
| Verified Artist | milestone | Verified status | 150 | Legendary |
| Early Adopter | milestone | First 1000 users | 50 | Rare |

**CRITICAL GAP: Achievement Auto-Unlock Not Implemented**

The `unlock_criteria` JSON field exists but there is NO backend logic to:
- Check criteria on relevant events (gig completion, payment, etc.)
- Automatically unlock achievements
- Update `user_achievements.progress` incrementally

### 3. Engagement Motivation Mechanisms

1. **Progressive Milestones** - Multi-tier achievements (1 → 10 → 50 gigs)
2. **Rarity System** - Common, Rare, Epic, Legendary badges
3. **Points Economy** - Rewards for unlocking (future: could enable perks)
4. **Social Proof** - Spotlight leaderboard shows top performers
5. **Goal Deadlines** - Target dates create urgency
6. **Visual Feedback** - Progress bars, gold/gray styling for unlocked/locked

---

## Data Available for AI Enhancement

### Rich User Data Sources

| Data Source | Fields | AI Use Case |
|-------------|--------|-------------|
| **artists** | name, bio, genres, location, price_range, rating, gigs_completed | Personalized responses, context injection |
| **gigs** | title, description, date, payment, genre_tags, venue info | Gig recommendations, application assistance |
| **gig_applications** | status, applied_at, artist feedback | Success pattern analysis |
| **reviews** | rating, comment, gig context | Reputation insights, improvement suggestions |
| **user_connections** | requester, recipient, status | Network graph, collaboration suggestions |
| **conversations** | participant IDs, message history | Communication style analysis |
| **violet_conversations** | full AI chat history | Learning from past interactions |
| **journal_entries** | song ideas, set plans, notes | Creative context, idea recall |
| **daily_metrics** | earnings, gigs, views trends | Performance insights, goal suggestions |
| **goals** | targets, progress, deadlines | Motivation, accountability |
| **tracks** | title, genre, play_count | Music analysis, promotion suggestions |

### Underutilized Data Opportunities

1. **Gig History Patterns** - Which venues accept this artist? At what rates?
2. **Network Graph** - Who are mutual connections? Collaboration opportunities?
3. **Communication Patterns** - What messages get responses? What's the average response time?
4. **Creative Journal** - What song ideas are in progress? What themes emerge?
5. **Time-Series Trends** - When does this artist perform best? Seasonal patterns?

---

## Extension Opportunities

### 1. New AI Capabilities

| Capability | Complexity | Value | Description |
|------------|------------|-------|-------------|
| **Smart Gig Matcher** | Medium | High | AI-powered gig recommendations based on artist profile, history, and success patterns |
| **Auto-Apply Draft** | Medium | High | Generate complete gig applications with cover letter |
| **Set List Generator** | Low | Medium | Suggest song order based on venue type, time slot, crowd energy |
| **Music Analysis** | High | Medium | Analyze uploaded tracks for mixing feedback |
| **Voice Mode** | High | Medium | Voice input/output for hands-free assistance |
| **Image Generation** | Medium | Medium | Create promotional graphics, album art concepts |
| **Smart Scheduling** | Medium | High | Optimize booking calendar, avoid conflicts |
| **Rate Negotiator** | Low | High | Suggest counter-offers based on market data |
| **Network Recommender** | Medium | Medium | Suggest connections based on genre, location, mutual connections |

### 2. Proactive vs. Reactive

**Current State: Reactive Only**
- User must initiate every conversation
- No push notifications from Violet
- No automated suggestions

**Proactive Opportunities:**
- "3 new gigs match your profile" (daily digest)
- "Your application to [venue] was viewed" (engagement trigger)
- "You're 80% to your monthly goal!" (motivation)
- "Based on your journal, here's a chord progression for that song idea"
- "Your rate is below market average for your genre" (pricing insight)

### 3. Integration with Other Features

| Feature | Integration Opportunity |
|---------|------------------------|
| **Gig Marketplace** | One-click apply with AI-generated cover letter |
| **Calendar** | "Block this date" from chat, suggest optimal booking windows |
| **Messaging** | Draft replies, summarize long threads |
| **Journal** | "Continue this song idea", recall past notes |
| **Analytics** | "Why did my earnings drop last month?" natural language queries |
| **Connections** | "Introduce me to [artist]" - draft introduction message |

---

## Technical Spec: Smart Gig Matcher

### Feature Overview

**Name:** Violet Smart Gig Matcher
**Priority:** P1 - High Value, Medium Complexity
**Estimated Effort:** 2-3 weeks
**Dependencies:** Real Claude API integration

### Problem Statement

Artists currently browse gigs manually with basic filters. They lack insight into:
- Which gigs they're most likely to be accepted for
- Which gigs align with their career goals
- Why certain applications succeed or fail

### Proposed Solution

An AI-powered recommendation system that:
1. Analyzes artist profile, history, and preferences
2. Scores gigs on compatibility and success likelihood
3. Provides personalized application advice
4. Learns from outcomes to improve over time

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                        │
├─────────────────────────────────────────────────────────────────────────┤
│  GigMatcherPage.tsx                                                     │
│  ├─ "For You" tab with AI-scored gigs                                  │
│  ├─ Match score badge (85% match)                                      │
│  ├─ "Why this gig?" expandable explanation                             │
│  └─ "Quick Apply with Violet" button                                   │
│                                                                          │
│  VioletChatPage.tsx (enhanced)                                          │
│  ├─ "Find me gigs" intent triggers matcher                             │
│  ├─ Conversational refinement ("prefer weekends", "min $500")          │
│  └─ Inline gig cards with apply actions                                │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  GET /v1/gigs/recommended                                               │
│    Query: limit, min_score                                              │
│    Returns: [{ gig, match_score, match_reasons, success_likelihood }]  │
│                                                                          │
│  POST /v1/violet/gig-analysis                                           │
│    Body: { gig_id }                                                     │
│    Returns: { analysis, suggested_rate, competition_level, tips }      │
│                                                                          │
│  POST /v1/gigs/:id/quick-apply                                          │
│    Body: { use_ai_cover_letter: true }                                  │
│    Returns: { application_id, cover_letter_draft }                     │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GIG MATCHER SERVICE                             │
│                         api/services/gig-matcher.ts                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  class GigMatcherService {                                              │
│                                                                          │
│    // Core matching algorithm                                           │
│    async getRecommendedGigs(artistId: string): Promise<ScoredGig[]> {  │
│      const artistProfile = await this.loadArtistProfile(artistId)      │
│      const artistHistory = await this.loadGigHistory(artistId)         │
│      const openGigs = await this.loadOpenGigs()                        │
│                                                                          │
│      const scoredGigs = openGigs.map(gig => ({                         │
│        gig,                                                              │
│        match_score: this.calculateMatchScore(gig, artistProfile),      │
│        match_reasons: this.generateReasons(gig, artistProfile),        │
│        success_likelihood: this.predictSuccess(gig, artistHistory)     │
│      }))                                                                 │
│                                                                          │
│      return scoredGigs.sort((a, b) => b.match_score - a.match_score)   │
│    }                                                                     │
│                                                                          │
│    // Scoring factors (0-100 scale)                                     │
│    calculateMatchScore(gig: Gig, profile: ArtistProfile): number {     │
│      let score = 0                                                       │
│                                                                          │
│      // Genre alignment (40 points max)                                 │
│      const genreMatch = this.calculateGenreOverlap(                    │
│        gig.genre_tags, profile.genres                                   │
│      )                                                                   │
│      score += genreMatch * 40                                           │
│                                                                          │
│      // Location proximity (20 points max)                              │
│      const distance = this.calculateDistance(                          │
│        gig.location, profile.location                                   │
│      )                                                                   │
│      score += Math.max(0, 20 - (distance / 50) * 20)                   │
│                                                                          │
│      // Rate alignment (20 points max)                                  │
│      const rateMatch = this.calculateRateAlignment(                    │
│        gig.payment_amount, profile.price_range_min, profile.price_range_max│
│      )                                                                   │
│      score += rateMatch * 20                                            │
│                                                                          │
│      // Experience level (10 points max)                                │
│      const expMatch = this.matchExperienceLevel(                       │
│        gig.venue_capacity, profile.gigs_completed                       │
│      )                                                                   │
│      score += expMatch * 10                                             │
│                                                                          │
│      // Historical success with similar venues (10 points max)         │
│      const historyBoost = this.calculateHistoricalSuccess(             │
│        gig.venue_id, profile.past_venues                                │
│      )                                                                   │
│      score += historyBoost * 10                                         │
│                                                                          │
│      return Math.round(score)                                           │
│    }                                                                     │
│                                                                          │
│    // Success prediction based on historical patterns                   │
│    predictSuccess(gig: Gig, history: GigHistory[]): number {           │
│      // Factors: past acceptance rate, venue type familiarity,         │
│      // competition level, timing patterns                              │
│    }                                                                     │
│                                                                          │
│    // AI-powered analysis for specific gig                              │
│    async analyzeGig(gigId: string, artistId: string): Promise<Analysis>│
│      const gig = await this.loadGig(gigId)                             │
│      const artist = await this.loadArtistProfile(artistId)             │
│      const competition = await this.getCompetitionLevel(gigId)         │
│                                                                          │
│      // Call Claude for natural language analysis                       │
│      const prompt = this.buildAnalysisPrompt(gig, artist, competition) │
│      const response = await this.claude.generateResponse({             │
│        prompt,                                                           │
│        promptType: 'gig_analysis',                                      │
│        artistId                                                          │
│      })                                                                  │
│                                                                          │
│      return {                                                            │
│        analysis: response.response,                                     │
│        suggested_rate: this.calculateSuggestedRate(gig, artist),       │
│        competition_level: competition,                                  │
│        tips: this.extractTips(response.response)                       │
│      }                                                                   │
│    }                                                                     │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Changes

```sql
-- New table for tracking recommendation outcomes
CREATE TABLE gig_recommendations (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  gig_id TEXT NOT NULL REFERENCES gigs(id) ON DELETE CASCADE,
  match_score INTEGER NOT NULL,
  recommended_at TEXT NOT NULL,
  clicked_at TEXT,
  applied_at TEXT,
  outcome TEXT CHECK (outcome IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TEXT NOT NULL,
  UNIQUE(artist_id, gig_id)
);

CREATE INDEX idx_rec_artist ON gig_recommendations(artist_id);
CREATE INDEX idx_rec_outcome ON gig_recommendations(outcome);

-- Track feature flags for A/B testing
ALTER TABLE artists ADD COLUMN ai_features_enabled INTEGER DEFAULT 1;
```

### New Claude Prompt Type

```typescript
// Add to api/services/claude.ts PROMPT_TEMPLATES
gig_analysis: `You are Violet, analyzing a gig opportunity for an artist.

Artist Profile:
- Name: {artist_name}
- Genres: {genres}
- Location: {location}
- Experience: {gigs_completed} gigs completed
- Typical Rate: ${price_range_min}-${price_range_max}
- Rating: {rating}/5 from {review_count} reviews

Gig Details:
- Title: {gig_title}
- Venue: {venue_name} ({venue_type})
- Date: {gig_date}
- Payment: ${payment_amount}
- Genre: {gig_genre}
- Competition: {applicant_count} other applicants

Provide a brief analysis covering:
1. Why this gig is/isn't a good fit
2. Suggested approach for the application
3. Any red flags or special opportunities
4. Recommended talking points for the cover letter

Keep it concise (150-200 words), actionable, and encouraging.`
```

### API Response Schema

```typescript
interface ScoredGig {
  gig: Gig
  match_score: number           // 0-100
  match_reasons: string[]       // ["Genre match: 90%", "Location: 5 miles"]
  success_likelihood: number    // 0-100 based on historical patterns
  competition_level: 'low' | 'medium' | 'high'
  suggested_action: 'apply_now' | 'consider' | 'skip'
}

interface GigAnalysis {
  analysis: string              // AI-generated narrative
  suggested_rate: number        // Based on market data
  competition_level: {
    applicant_count: number
    avg_competitor_rating: number
    avg_competitor_gigs: number
  }
  tips: string[]                // Extracted actionable items
  cover_letter_draft?: string   // Pre-generated if requested
}
```

### UI Components

```typescript
// New component: GigMatchCard.tsx
interface GigMatchCardProps {
  gig: Gig
  matchScore: number
  matchReasons: string[]
  successLikelihood: number
  onApply: () => void
  onAnalyze: () => void
}

// Displays:
// - Gig basic info
// - Match score badge with color coding (green >80, yellow 60-80, gray <60)
// - Expandable "Why this match?" section
// - "Quick Apply" and "Ask Violet" buttons
```

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recommendation CTR | >15% | Clicks / Impressions |
| Application Rate | >30% | Applications / Clicks |
| Acceptance Rate | >25% | Accepted / Applied (for high-match gigs) |
| User Satisfaction | >4.2/5 | Post-apply survey |
| Time to Apply | -50% | Avg time from view to submit |

### Rollout Plan

**Phase 1 (Week 1):**
- Implement `GigMatcherService` with scoring algorithm
- Add `/v1/gigs/recommended` endpoint
- Basic UI in marketplace with "For You" tab

**Phase 2 (Week 2):**
- Add Claude-powered gig analysis
- Implement "Quick Apply" with AI cover letter
- Track recommendation outcomes

**Phase 3 (Week 3):**
- Integrate with Violet chat ("Find me gigs" intent)
- Add proactive notifications for high-match gigs
- A/B test against control group

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Over-reliance on AI | Always show "Browse All Gigs" option |
| Filter bubble | Include "Discovery" section with diverse gigs |
| Rate limit impact | Recommendations cached, analysis on-demand |
| Cold start (new users) | Fall back to genre/location matching |

### Future Enhancements

1. **Learning Loop** - Use acceptance/rejection outcomes to improve model
2. **Venue Preferences** - Let venues indicate preferred artist types
3. **Collaborative Filtering** - "Artists like you also applied to..."
4. **Calendar Integration** - Filter by artist availability
5. **Rate Optimization** - Suggest optimal bid based on competition

---

## Appendix: File Reference

| Component | Path |
|-----------|------|
| Violet Landing | `src/pages/VioletPage.tsx` |
| Violet Chat | `src/pages/VioletChatPage.tsx` |
| Chat Components | `src/components/violet/` |
| Frontend Service | `src/services/api.ts` (violetService) |
| Backend Controller | `api/controllers/violet/index.ts` |
| Claude Service | `api/services/claude.ts` |
| AI Prompts Utility | `api/utils/ai-prompts.ts` |
| Violet Templates | `api/utils/violet-templates.ts` |
| Analytics Controller | `api/controllers/analytics/index.ts` |
| Analytics Cron | `api/controllers/cron/analytics.ts` |
| Growth Page | `src/pages/GrowthPage.tsx` |
| Types | `src/types/index.ts` |
| Analytics Migration | `db/migrations/0005_analytics.sql` |
| Achievements Migration | `db/migrations/0013_achievements.sql` |
| Violet Conversations Migration | `db/migrations/0014_violet_conversations.sql` |
