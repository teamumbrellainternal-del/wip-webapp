# consolidated-eng-spec

# UMBRELLA MVP - CONSOLIDATED ENGINEERING SPECIFICATION v2.0

**Version:** 2.0 - Design Decisions Finalized

**Last Updated:** [Date]

**Scope:** Artist flow only (Fans, Venues, Collectives marked “Coming Soon”)

**Status:** Ready for Development

---

## DOCUMENT PURPOSE

This specification consolidates all design decisions from Figma mockups, founder conversations, and finalized product decisions into a single source of truth. Version 2.0 incorporates all P0 design decisions and clarifies MVP boundaries vs. post-MVP features. It describes **what** the platform does and **how** users interact with it—not the technical implementation.

---

## TABLE OF CONTENTS

1. [MVP Scope & Boundaries](about:blank#mvp-scope--boundaries)
2. [Design Decisions (Finalized)](about:blank#design-decisions-finalized)
3. [User Flows](about:blank#user-flows)
4. [Screen-by-Screen Specifications](about:blank#screen-by-screen-specifications)
5. [Data Model (Conceptual)](about:blank#data-model-conceptual)
6. [Feature Matrix](about:blank#feature-matrix)
7. [Navigation & Sitemap](about:blank#navigation--sitemap)
8. [Post-MVP Considerations](about:blank#post-mvp-considerations)

---

## MVP SCOPE & BOUNDARIES

### ✅ IN SCOPE FOR MVP

**Core User Experience:**
- Artist authentication via Apple/Google OAuth only (Cloudflare Access)
- Artist onboarding (5-step flow, all steps required)
- Artist profile creation and management (6-tab profile system)
- Artist dashboard with basic metrics (daily batch updates)
- Marketplace for discovering gigs and other artists (browse/filter with infinite scroll)
- In-app messaging system between users (no rate limits)
- Violet AI toolkit with Claude API integration (50 prompts/day limit)

**Artist Tools:**
- SMS/Email blast tool for fan communication (text-only messages)
- Cloud storage for file management (manual upload, no AI analysis)
- Video/text journal (Creative Studio with block-based editor)

**Communication Infrastructure:**
- SMS delivery via Twilio (outbound blast + booking confirmations)
- Email delivery via Resend (outbound blast + booking confirmations + platform notifications)
- In-app messaging between platform users (text + file attachments, 2000 char limit)

**Authentication:**
- Apple OAuth (via Cloudflare Access)
- Google OAuth (via Cloudflare Access)
- ~~Email/password authentication~~ *(Removed - see D-001)*

**Booking & Applications:**
- “Book Artist” flow: Opens message composer with pre-filled inquiry
- “Apply to Gig” flow: Single-click apply sends profile + rates to venue
- Booking confirmations: Email + SMS to both parties
- Gig completion: Either party can mark complete

**Search & Discovery:**
- Global search: Artists + Gigs
- Marketplace sorting: Random shuffle (explore different opportunities)
- Infinite scroll for listings
- Manual filtering only (no AI matching)

**Content Management:**
- Track upload: No limit (constrained by 50GB storage quota)
- Track playback: Inline audio player on profile
- Media posts: Manual upload only (no social media import)
- Reviews: Artists can invite anyone via email to leave review

**Account Management:**
- Settings access: Profile avatar dropdown → Settings
- Credential changes: Read-only (OAuth-based, email tied to provider)
- Account deletion: Self-service automatic deletion

**Metrics & Analytics:**
- Update frequency: Daily batch at midnight UTC
- Metrics shown: Total earnings, gig count, profile views, follower count
- Spotlight artists: Random verified artists with >4.5 rating
- Fan reach: Platform followers only

**Compliance:**
- Minimal compliance (Terms + Privacy Policy links)
- Cookie disclosure: Simple banner “This website uses cookies”
- No GDPR-specific features in v1.0

---

### 🚫 OUT OF SCOPE FOR MVP

**User Types:**
- Venue onboarding and dashboard (show “Coming Soon” only)
- Collective onboarding and dashboard (show “Coming Soon” only)
- Fan full experience (show “Coming Soon” only)

**AI Features:**
- File AI analysis (genre detection, scene recognition, OCR)
- Automated matching algorithms
- AI-powered compatibility scores
- Revenue optimization predictions
- Tour routing optimization

**Financial Features:**
- P&L tracking
- Revenue forecasting
- ROI predictions
- Cash flow management
- Break-even calculators
- Premium/paid tiers *(Free forever model - see D-110)*

**Advanced Features:**
- Push notifications
- Real-time WebSocket messaging (polling acceptable)
- Advanced analytics exports
- Payment processing integration
- Transactional booking flows
- Two-way SMS replies
- Social media content import
- Review moderation system
- Spam/abuse prevention automation
- Message rate limiting
- Broadcast message attachments (images/files)
- Email/password authentication
- Public roadmap

**Content Safety (MVP):**
- Automated spam detection *(Post-MVP - see D-088)*
- Review moderation *(Post-MVP - see D-034)*
- Profanity filtering *(Post-MVP)*

---

### ⚡ CLARIFICATIONS

**Authentication:**
- **Apple and Google OAuth only** via Cloudflare Access (D-001)
- No email/password fallback
- Incomplete onboarding: User redirected to Step 1 on return (D-006)
- Onboarding exit: Allowed, but progress not saved - restart from beginning (D-004)

**Violet AI Implementation:**
- Exists as toolkit navigation system (10 categories, 30+ sub-tools)
- “Ask Violet to Draft”: Real AI generation via Claude API with prompt templates (D-046)
- “Start Creating Together”: Opens intent picker modal (D-058)
- Usage limit: 50 prompts per day per artist (D-062)
- Focus: Tool organization + prompt-based assistance, not autonomous agent

**Metrics Dashboard:**
- Daily batch updates at midnight UTC (D-008)
- Shows: Total earnings (user-reported), gig count, profile views, follower count
- Fan Reach: Platform followers only, no social media aggregation (D-070)
- Spotlight Artists: Random verified artists with >4.5 rating (D-068)
- Does NOT show: Financial forecasting, profit margins, ROI calculations

**Marketplace:**
- Default sort: Random shuffle to encourage exploration (D-014)
- Infinite scroll for listings (D-017)
- Browse and filter gigs by genre, location, date, price
- Browse and filter artists by genre, location, availability
- “Urgent” badge: Gigs within 7 days with <50% capacity filled (D-010)
- “New Opportunities” on dashboard: Latest 3 gigs from marketplace (D-011)
- NO algorithmic matching or compatibility scoring
- Manual search and discovery only

**Artist Profile:**
- Edit mode: Separate /profile/edit route (D-022)
- Profile actions menu: “Edit Profile” if own, “Share/Report” if viewing other’s (D-023)
- Track playback: Inline audio player (D-024)
- Track upload limit: None (constrained by 50GB storage) (D-026)
- Media posts: Manual upload only in MVP (D-028)
- Reviews: Artists can invite anyone via email (D-032)
- No review moderation in MVP (D-034)

**File Storage:**
- Upload audio, images, videos, documents
- Organize into manual folders
- Display file metadata (size, date, type)
- 50GB quota per artist
- NO automated AI categorization or analysis

**Messaging:**
- Character limit: 2000 characters per message (D-043)
- No rate limits on in-app messaging (D-087)
- No spam/abuse prevention in MVP (D-088)
- Text + file attachments only

**Artist Toolbox:**
- Access: Header navigation item “Tools” (D-044)
- Message Fans: Text-only broadcasts in MVP (D-049)
- My Files: Manual upload and organization
- Creative Studio: Block-based journal editor

**Booking & Applications:**
- “Book Artist”: Opens message composer with pre-filled booking inquiry (D-076)
- “Apply to Gig”: Single-click apply sends profile + rates (D-077)
- Booking confirmation: Email + SMS to both parties (D-079)
- Gig completion: Either party can mark complete (D-080)

**Search:**
- Global search scope: Artists + Gigs only (D-071)
- No venue search (venues not in MVP scope)

**Account Settings:**
- Access: Profile avatar dropdown → Settings (D-098)
- Credential changes: Read-only (OAuth-based, email tied to provider) (D-099)
- Account deletion: Self-service automatic deletion (D-102)

**Legal & Compliance:**
- Minimal compliance: Terms of Service + Privacy Policy pages (D-103)
- Cookie disclosure: Simple banner “This website uses cookies” (D-106)
- No GDPR-specific features in v1.0

**Business Model:**
- Free forever (D-110)
- No premium features or paid tiers
- No public roadmap (D-109)

---

## DESIGN DECISIONS (FINALIZED)

This section documents all critical product decisions made during the scoping phase. Each decision is tagged with its ID for traceability.

### Authentication & Onboarding

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-001** | Use only Apple/Google OAuth via Cloudflare Access; remove email/password auth | Reduces complexity, leverages Cloudflare Access JWT validation, eliminates password reset flows |
| **D-003** | All 5 onboarding steps required (enforce progression) | Ensures data quality and complete artist profiles; high-quality input = better platform experience |
| **D-004** | Allow exit from onboarding but restart from beginning on return | Simplifies state management; no partial progress saving in MVP |
| **D-006** | Redirect incomplete OAuth users to Step 1 on return | Consistent with D-004; ensures complete onboarding before dashboard access |

### Dashboard & Metrics

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-008** | Daily batch updates at midnight UTC for all metrics | Reduces database load and Worker CPU costs; real-time not critical for MVP |
| **D-010** | “Urgent” badge: Gigs within 7 days with <50% capacity filled | Rule-based logic; balances urgency with venue capacity needs |
| **D-011** | “New Opportunities”: Show latest 3 gigs from marketplace | Simple, non-personalized; avoids empty states from failed matching |
| **D-012** | Same as D-011 (no separate logic for opportunities selection) | Consistency with D-011 |

### Marketplace

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-014** | Default gig sort: Random shuffle | Encourages exploration of diverse venues; prevents payment-driven sorting bias |
| **D-017** | Infinite scroll for marketplace listings | Mobile-friendly UX; modern pattern for content discovery |

### Artist Profile

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-022** | Separate /profile/edit route for editing | Clean separation of public view vs. edit mode; easier permission logic |
| **D-023** | Profile actions menu: “Edit Profile” if own, “Share/Report” if other’s | Context-aware actions; prevents confusion |
| **D-024** | Track playback: Inline audio player | Faster UX; no navigation overhead for quick previews |
| **D-026** | No track upload limit (constrained by 50GB storage quota) | Natural constraint; avoids arbitrary limits |
| **D-028** | Media posts: Manual upload only (no social media import) | Reduces MVP complexity; defers Instagram/TikTok API integration to post-MVP |
| **D-032** | Reviews: Artists can invite anyone via email | Maximizes review quantity; trust via community validation |
| **D-034** | No review moderation in MVP | Minimal overhead; rely on community reporting if issues arise post-launch |

### Messaging

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-043** | Message character limit: 2000 characters | Prevents excessive messages; aligns with SMS-like conciseness |
| **D-087** | No rate limits on in-app messaging | Low spam risk in vetted artist community; simplifies MVP |
| **D-088** | No spam/abuse prevention in MVP | Monitor manually; add flag-based system post-MVP if needed |

### Artist Toolbox

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-044** | Toolbox access: Header navigation item “Tools” | Prominent placement; always accessible |
| **D-046** | “Ask Violet to Draft”: Real AI generation via Claude API | Delivers on Violet value prop; manageable cost with 50 prompt/day limit |
| **D-049** | Broadcast messages: Text-only in MVP | Simplifies email templates; avoids attachment spam issues |

### Violet AI

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-058** | “Start Creating Together”: Opens intent picker modal | Guides user to relevant toolkit feature; clearer than direct chat |
| **D-062** | Violet usage limit: 50 prompts/day per artist | Cost control; generous for typical use while preventing abuse |

### Analytics & Growth

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-068** | Spotlight artists: Random verified artists with >4.5 rating | No complex algorithm; highlights quality artists |
| **D-070** | Fan Reach: Platform followers only | Avoids social media API dependencies; clear metric definition |
| **D-071** | Global search scope: Artists + Gigs | Core discovery needs; venues not in MVP scope |

### Booking & Payments

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-076** | “Book Artist”: Opens message composer with pre-filled inquiry | No complex booking form; flexible conversation-based booking |
| **D-077** | “Apply to Gig”: Single-click apply sends profile + rates | Minimal friction; venues get full artist info immediately |
| **D-079** | Booking confirmation: Email + SMS to both parties | Multi-channel confirmation; reduces missed bookings |
| **D-080** | Gig completion: Either party can mark complete | Flexible; enables analytics even if one party is unresponsive |

### Account Settings

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-098** | Settings access: Profile avatar dropdown → Settings | Standard UX pattern; easy discovery |
| **D-099** | Credential changes: Read-only (OAuth-based) | Email tied to OAuth provider; no password to change |
| **D-102** | Account deletion: Self-service automatic deletion | GDPR/CCPA best practice; user autonomy |

### Legal & Compliance

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-103** | Minimal compliance: Terms + Privacy Policy only | US-focused MVP; upgrade before EU expansion |
| **D-106** | Cookie disclosure: Simple banner “This website uses cookies” | Minimal legal requirement; no consent mechanism needed for essential cookies |

### Business Model

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-109** | No public roadmap | Focus on MVP execution; gather user feedback post-launch before committing to features |
| **D-110** | Free forever, no premium tiers | Artist-friendly model; future monetization via venue commission or other channels |

---

## USER FLOWS

### Flow 1: Sign Up & Onboarding (New Artist)

**Entry Point:** Landing page or direct link to platform

**Steps:**
1. User lands on authentication screen
2. Selects “Sign Up” with Apple or Google OAuth *(D-001: Email/password removed)*
3. OAuth provider authenticates user
4. System creates user account with email from OAuth provider
5. Navigate to role selection screen
6. Select “ARTISTS” role (only option enabled; Fans/Venues/Collectives show “Coming Soon”)
7. **Onboarding Step 1** - Identity & Basics *(D-003: All steps required)*
- Enter: Full name (pre-filled from OAuth), artist name, location (city/state/zip), phone number
- Add: Inspirations (artist names as tags)
- Select: Genre icons (visual selection)
- Cannot skip this step
8. **Onboarding Step 2** - Links & Your Story
- Connect minimum 3 social platforms (Instagram, Spotify, YouTube, TikTok, Twitter, SoundCloud, Apple Music, Facebook, Bandcamp, Website)
- Answer qualitative questions:
- Tasks you’d outsource
- What makes your sound unique
- Dream performance venue
- Biggest inspiration
- Favorite time to create
- Platform pain point to solve
- Cannot skip this step
9. **Onboarding Step 3** - Creative Profile Tags
- Select tags across 7 categories (artist type, genres, equipment, DAW, platforms, subscriptions, struggles)
- Cannot skip this step
10. **Onboarding Step 4** - Your Numbers
- Set largest show capacity, flat rate, hourly rate, time split (creative vs. logistics)
- Select up to 3 available dates for future gigs
- Cannot skip this step
11. **Onboarding Step 5** - Quick Questions (6 Yes/No toggles)
- Do you currently make music?
- Do you feel confident presenting yourself online?
- Do you struggle with finding your creative niche?
- Do you know where to find gigs that match your level?
- Have you been paid fairly for performing?
- Do you understand royalties and streaming payouts?
- Cannot skip this step
12. Submit onboarding
13. Navigate to Artist Dashboard

**Data Captured:**
- ~40 data points across identity, social presence, creative profile, rates, availability, and self-assessment

**Exit Points:**
- User can click “Back” at any step to revise previous answers
- User CAN exit onboarding mid-flow *(D-004: Progress not saved, restart from Step 1 on return)*
- If OAuth user returns before completing onboarding: *(D-006: Redirected to Step 1)*

**Validation Rules:**
- All steps required; no progression without completing current step
- Minimum 3 social links required in Step 2
- At least one genre selection required in Step 1

---

### Flow 2: Sign In (Returning Artist)

**Entry Point:** Authentication screen

**Steps:**
1. User lands on authentication screen
2. Selects Apple or Google OAuth provider *(D-001: No email/password option)*
3. OAuth provider authenticates user
4. System validates Cloudflare Access JWT
5. Check onboarding status:
- If complete: Navigate to Artist Dashboard
- If incomplete: *(D-006: Redirect to Step 1 of onboarding)*

**Exit Points:**
- None (OAuth handles password reset via provider)

---

### Flow 3: Browse & Discover Gigs

**Entry Point:** Dashboard or direct navigation to Marketplace

**Steps:**
1. From Dashboard, click “Find Gigs” quick action OR “View All” in opportunities section
2. Navigate to Marketplace - Find Gigs tab
3. View gig listing cards showing:
- Venue name, gig title, date/time, capacity, location
- Venue rating and review count
- Genre tags
- Payment offered
- “Urgent” badge *(D-010: Gigs within 7 days with <50% capacity filled)*
4. Use search bar to search venues, locations, or gig types *(D-071: Search scope = gigs)*
5. Apply filter chips (genre, date range, price range) OR click “Filters” for advanced options
6. Scroll to load more results *(D-017: Infinite scroll)*
- Default sort: *(D-014: Random shuffle)*
- No pagination controls
7. Click gig card to view details in right sidebar panel
8. Click “Favorite” icon to save gig for later
9. Click venue name to navigate to venue profile (when available)
10. Click “Apply” button to apply to gig *(D-077: Single-click apply flow)*

**Actions Available:**
- **Apply to gig:** *(D-077: Single-click sends profile + rates to venue)*
- Favorite gig for later
- View venue details
- Share gig (method TBD)

**Note:**
- *(D-014: Random shuffle)* encourages exploration of diverse venues
- *(D-017: Infinite scroll)* for mobile-friendly UX
- No algorithmic matching or recommendations

---

### Flow 4: Browse & Discover Artists

**Entry Point:** Dashboard or Marketplace

**Steps:**
1. From Dashboard, click “Find Collaborators” quick action
2. Navigate to Marketplace - Discover Artists tab
3. View artist listing cards showing:
- Artist name and stage name
- Verification badge (if verified)
- Primary genre
- Distance from user (if location sharing enabled)
- Bio preview
- Rating, follower count, gigs completed
- Price range
4. Use search bar to search artists, genres, locations *(D-071: Search scope = artists)*
5. Apply filter chips (Near Me, Available Now, Verified, specific genres) OR click “Filters”
6. Scroll to load more results *(D-017: Infinite scroll)*
- Default sort: *(D-014: Random shuffle)*
7. Click artist card to view profile preview in right sidebar
8. Click artist card again to navigate to full artist profile
9. From profile, can:
- Follow artist
- Send message *(D-076: Opens message composer with pre-filled booking inquiry)*
- View full portfolio *(D-024: Inline track playback)*
- Read reviews *(D-032: Anyone can be invited to review)*
- View timeline/journey

**Actions Available:**
- Follow/unfollow artist
- Message artist (opens conversation)
- View full profile
- Favorite artist

---

### Flow 5: View Artist Profile (Public View)

**Entry Point:** Marketplace artist listing, search results, or direct link

**Steps:**
1. Navigate to artist profile (6-tab system)
2. **Overview Tab** (default):
- View hero section: avatar, name, verification badge, location
- Metrics: followers *(D-070: Platform followers only)*, tracks, rating, endorsements
- Social links (website, Facebook, Instagram, TikTok, tip jar)
- Profile actions: *(D-023: “Edit Profile” if own, “Share/Report” if viewing other’s)*
- Read bio (expandable)
- See Violet suggestion banner (e.g., “Profile 85% complete - add 2 more tracks”)
- Preview portfolio (3 tracks shown) *(D-024: Inline playback)*
- View endorsement badges with counts
3. **Portfolio Tab**:
- View complete music portfolio *(D-026: No upload limit)*
- All tracks with metadata (title, type, duration, play count)
- *(D-024: Inline audio player on each track)*
- Actions: Play track, favorite, share
4. **Explore Tab**:
- Browse recent posts (media gallery)
- *(D-028: Manual upload only, no social media import)*
- View images and videos posted by artist
- Video posts show duration overlay
- Click post to open in lightbox/detail view
5. **Journey Tab**:
- View career timeline in reverse chronological order
- Timeline entries show event type, title, description, date
- *(D-080: Either party can mark gigs complete)*
6. **Reviews Tab**:
- Read client reviews from venues, collaborators
- *(D-032: Artists can invite anyone via email to leave review)*
- *(D-034: No moderation in MVP)*
- Each review shows: reviewer name/avatar, star rating, date, review text
7. **Opportunities Tab**:
- View personalized growth opportunities
- *(D-011: Latest 3 gigs from marketplace)*
- Actions: Save opportunity, Apply *(D-077: Single-click apply)*

**Actions Available from Profile:**
- Follow artist
- *(D-076: Book artist → Opens message composer with pre-filled booking inquiry)*
- Share profile
- View/play tracks *(D-024: Inline audio player)*
- Send message *(D-043: 2000 character limit)*
- Navigate between tabs
- *(D-022: If own profile, “Edit Profile” button navigates to /profile/edit)*

---

### Flow 6: Edit Artist Profile

**Entry Point:** Own profile → “Edit Profile” button OR Profile avatar dropdown → Settings

**Steps:**
1. *(D-022: Navigate to /profile/edit route)*
2. View editable sections:
- Basic info (artist name, location, bio)
- Social links (add/remove/update)
- Rates (flat rate, hourly rate)
- Availability dates
- Profile photo upload
3. Make changes to any section
4. Click “Save Changes” button
5. System validates changes
6. Updates database and profile completion percentage
7. Return to public profile view with success toast

**Data Editable:**
- Artist name, location, phone number, bio
- Social platform links
- Rates (flat rate, hourly rate)
- Availability dates (up to 3)
- Profile photo
- *(D-099: Email/credentials read-only - tied to OAuth provider)*

**Actions Available:**
- Save changes (optimistic UI update)
- Cancel (return to public view without saving)
- Upload new profile photo
- Delete account *(D-102: Self-service automatic deletion)*

---

### Flow 7: Use Artist Toolbox

**Entry Point:** *(D-044: Header navigation item “Tools”)*

**Steps:**
1. Click “Tools” in main navigation header
2. Toolbox page/modal opens, showing:
- Message Fans
- My Files
- Creative Studio
3. Select desired tool
4. Tool opens in new view or expanded section

**Tool Options:**
- **Message Fans:** SMS/Email blast to fan lists *(D-049: Text-only in MVP)*
- **My Files:** Cloud storage file manager *(D-026: No upload limit, constrained by 50GB quota)*
- **Creative Studio:** Video/text journal with block editor

---

### Flow 8: Send Fan Broadcast Message

**Entry Point:** Tools → Message Fans

**Steps:**
1. Open Message Fans tool
2. View contact list segments:
- Fans (main list)
- Guest Lists
- VIPs
- Attending (event-specific)
3. Search for specific lists (search bar provided)
4. Select one or more lists (checkbox/toggle selection)
5. Recipient count updates automatically based on selections
6. *(D-046: Click “Ask Violet to Draft” for AI-assisted message composition via Claude API)*
7. Enter subject line
8. Compose message body in textarea *(D-049: Text-only in MVP)*
9. Character/word count displays automatically
10. Choose action:
- **Save Draft:** Saves message for later editing
- **Schedule Send:** Opens datetime picker to schedule delivery
- **Send Now:** Sends immediately to selected recipients

**Data Requirements:**
- Contact lists with counts
- Contact opt-in status (required for TCPA compliance)
- Message draft storage
- Scheduled message queue (if scheduling)

**Compliance Considerations:**
- Only send to opted-in contacts
- Include unsubscribe mechanism (email)
- STOP/HELP handling (SMS)

**Limitations:**
- *(D-049: Text-only broadcasts in MVP - no images or attachments)*
- *(Post-MVP: Add image support for email blasts)*

---

### Flow 9: Manage Files

**Entry Point:** Tools → My Files

**Steps:**
1. Open My Files tool
2. View file manager interface showing:
- Storage usage (e.g., “3.5 GB / 50GB used”)
- Progress bar visualization
- File categories in left sidebar:
- All Files (with count)
- Press Photos
- Music & Audio
- Videos
- Documents
3. Browse files in grid or list view (toggle available)
4. Search files by name using search bar
5. Upload new files:
- Click upload zone OR drag-and-drop files
- Supported types: images (JPG, PNG, HEIC), audio (MP3, WAV, FLAC), video (MP4, MOV), documents (PDF, DOCX)
- Max file size: 50MB per file
- *(D-026: No upload limit, constrained by 50GB total quota)*
6. Organize files:
- Click “➕ New Folder” to create folders
- Move files between folders (drag-drop or context menu)
- Rename files (context menu)
- Delete files (context menu)
7. View file details:
- Click file to preview OR download
- Metadata shown: filename, size, upload date
8. Share files (if supported—implementation TBD)

**File Categories:**
- Automatically sorted by type (image, audio, video, document)
- Manual folder organization also supported
- *(D-028: No AI-powered categorization or analysis)*

**Storage Quota:**
- 50GB per artist
- System tracks total usage across all files
- Upload blocked when quota reached
- User notified of remaining storage

---

### Flow 10: Create Journal Entry (Creative Studio)

**Entry Point:** Tools → Creative Studio

**Steps:**
1. Open Creative Studio tool
2. View unified entry editor with 3 tabs:
- Song Ideas
- Set Planning
- General Notes
3. Select entry type by clicking tab
4. Add content blocks using toolbar:
- **Text Note:** Add rich text block
- **Image:** Upload image (file picker opens) *(D-028: Manual upload only)*
- **Audio/Video:** Upload or embed media
- **Checklist:** Add checklist with tasks
5. Compose entry:
- Type in text blocks
- Upload media to media blocks
- Check/uncheck checklist items
- Reorder blocks (drag handles)
6. Entry auto-saves periodically (indicator: “Auto-saved” with checkmark in header)
7. View block count in footer (e.g., “4 blocks”)
8. Click “Save Entry” to finalize and close editor

**Entry Types:**
- **Song Ideas:** Capture lyric ideas, melodies, inspiration
- **Set Planning:** Plan setlists, rehearsal notes, performance logistics
- **General Notes:** Any other creative notes or journaling

**Block Types:**
- Text (plain or rich text)
- Image (uploaded files) *(D-028: Manual upload only)*
- Audio/Video (uploaded or embedded)
- Checklist (to-do items with check/uncheck)

**Data Stored:**
- Entry type
- Block array (JSON structure with type, content, order)
- Auto-save timestamps
- Creation and last modified dates

---

### Flow 11: Navigate Violet AI Toolkit

**Entry Point:** Dashboard → Violet tab OR *(D-058: “Start Creating Together” → Intent picker modal)*

**Steps:**
1. Navigate to Violet’s Toolkit screen
2. View hero section:
- “Meet Violet — Your AI Copilot”
- Feature grid showing quick actions (Book my next gig, Help me finish a track, Grow my fanbase, etc.)
- CTA buttons:
- *(D-058: “Start Creating Together” → Opens intent picker modal)*
- “Explore My Toolkit” → Scrolls to toolkit section
3. View left sidebar with toolkit categories:
- **Gigs & Bookings** (Popular badge)
- Expand to see: Find Perfect Venues, Negotiate Like a Pro, Brand Partnerships
- **Creative Growth** (Popular badge)
- Expand to see: Songwriting, Negotiate Like a Pro, Ticket Sales & Promos, Brand Partnerships
- **Songwriting Journal**
- **Vinyl Content Strategy** (Popular badge)
- **Fan Engagement**
- **Visual Branding**
- **Creative Challenges**
- **Music Production** (Popular badge)
- Expand to see: DAW Setup & Tips, Mixing & Mastering, Musical Theory, Samples & Loops Library, BPM & Rhythm, Finish Your Tracks
- **Networking & Collaboration** (Popular badge)
- Expand to see: Connect Locally, Find Partners, Find Mentors, Collaboration Groups, Industry Events
- **Career Management**
- Expand to see: Calendar Management, Goal Achievement, Email Marketing, Travel Opportunities, Long-term Strategy
4. Click category to expand/collapse sub-tools
5. Click sub-tool to navigate to specific feature
6. View “See Violet in Action” examples showing sample conversations
7. *(D-046: “Ask Violet to Draft” in Message Fans uses Claude API with prompt templates)*
8. *(D-062: Usage limited to 50 prompts per day per artist)*

**Toolkit Structure:**
- 10 main categories
- 30+ sub-tools across all categories
- “Popular” badges on high-usage categories/tools
- Hierarchical navigation (category → sub-tool → feature)

**Implementation Note:**
- Violet’s role is organizing tools and features
- *(D-046: AI generation via Claude API with prompt templates)*
- *(D-058: “Start Creating Together” opens intent picker modal, not direct chat)*
- *(D-062: 50 prompts/day limit for cost control)*

---

### Flow 12: Messaging Between Users

**Entry Point:** Dashboard messages widget, artist profile, marketplace

**Steps:**
1. Access messages from:
- Dashboard messages widget (shows recent conversations)
- Click “Messages” in main navigation
- *(D-076: Send message from artist profile → Opens message composer with pre-filled booking inquiry)*
2. View Messages & Collaboration screen:
- Left sidebar: Conversation list with preview
- Shows: participant name/avatar, context badge (Artist/Venue/Producer/Band), message preview, unread indicator, timestamp
- Main panel: Selected conversation thread
3. Select conversation from sidebar
4. View conversation thread:
- Messages display with sender avatar, text, timestamp
- Sent messages aligned right, received messages aligned left
- *(D-043: 2000 character limit per message)*
5. View “Quick conversation starters” (pre-written prompts):
- “What inspires your music?”
- “What’s your creative process?”
- “Favorite venue to perform at?”
- “Dream collab”
6. Compose new message:
- Type in message input field *(D-043: 2000 character limit)*
- (Optional) Attach file using paperclip icon
- (Optional) Use quick action buttons:
- Share Track (select from portfolio)
- Share Portfolio (generates link)
- Share Gig Flyer (select from calendar)
7. Send message:
- Press Enter OR click send button (arrow icon)
8. Message delivers to recipient
9. *(D-087: No rate limits on in-app messaging)*

**Conversation Contexts:**
- Artist-to-Artist
- Artist-to-Venue (when available)
- Artist-to-Producer
- Artist-to-Band/Collective

**Features:**
- Text messaging *(D-043: 2000 character limit)*
- File attachments (images, audio, documents)
- Quick sharing buttons (portfolio, tracks, gig info)
- Conversation starters (pre-written prompts)
- Unread indicators and badges
- *(D-087: No rate limits)*
- *(D-088: No spam/abuse prevention in MVP)*

**Not Included in MVP:**
- Two-way SMS replies (SMS is outbound only)
- Real-time typing indicators
- Read receipts
- Message editing/deletion
- Voice/video messages

---

### Flow 13: View Dashboard & Metrics

**Entry Point:** Post-authentication or main navigation

**Steps:**
1. Navigate to Dashboard (default landing after login)
2. View hero section:
- Welcome message: “Welcome back, [Artist Name]!”
- Subtitle: “Here’s what’s happening in your music world”
3. View top metrics cards (3 cards):
- **This Month:** Total earnings (user-reported), percentage change from last month
- **Gigs Booked:** Count of booked gigs, timeframe indicator
- **Profile Views:** View count, percentage change
- *(D-008: All metrics updated daily at midnight UTC)*
4. View “New Opportunities” section:
- *(D-011: Shows latest 3 gigs from marketplace)*
- Each card displays: venue name, gig title, date, payment, “Apply” button
- *(D-010: “Urgent” badges on gigs within 7 days with <50% capacity filled)*
- “View All” link to navigate to marketplace
5. View Messages widget (right sidebar):
- Shows 3 recent message previews
- Each preview: sender name, message snippet, timestamp
- Unread badges on new messages
- Click preview to open full conversation
6. View Recent Endorsements widget (right sidebar):
- Shows 3 recent endorsement badges
- Format: “Endorser Name: ‘Endorsement quote’”
- “View all endorsements” link to profile endorsements section
7. View Quick Actions widget (right sidebar):
- 3 action buttons:
- Find Gigs → navigate to marketplace
- Find Collaborators → navigate to artist discovery
- View Analytics → navigate to growth/analytics screen
8. View Violet prompt (bottom center):
- Icon and prompt: “What do you want help with today?”
- Subtext: “Ask me anything about gigs, collaborations, or growing your career”
- *(D-058: “Ask Violet” button → Opens intent picker modal)*
- *(D-062: 50 prompts/day limit)*

**Main Navigation Tabs:**
- Dashboard (current screen)
- Discover (marketplace)
- Messages
- Violet (AI toolkit) *(D-044: “Tools” in header navigation)*
- Growth (analytics)

**Header Elements:**
- Search icon (global search) *(D-071: Artists + Gigs)*
- Notification bell (notification panel)
- Profile avatar *(D-098: Dropdown → Settings)*
- “View My Profile” button → navigates to public profile view

**Data Displayed:**
- *(D-008: Daily batch updates at midnight UTC)*
- Current month earnings (user-reported or calculated)
- Percentage change from previous month
- Gigs booked count and timeframe
- Profile view count and trend
- *(D-011: Latest 3 gigs from marketplace)*
- 3 recent messages (unread prioritized)
- 3 recent endorsements
- Unread message count badge

---

### Flow 14: View Analytics & Growth

**Entry Point:** Dashboard quick actions OR main navigation → Growth

**Steps:**
1. Navigate to Growth & Analytics screen
2. View top metrics cards (4 cards):
- **Total Earnings:** Lifetime or period total, percentage change
- **Gigs Completed:** Total count, timeframe
- **Average Rating:** Star rating (1-5 scale), all-time average
- **Fan Reach:** *(D-070: Platform followers only)* - follower count, timeframe
- *(D-008: All metrics updated daily at midnight UTC)*
3. View Performance Analytics section:
- Toggle: Monthly / Yearly view
- Bar chart visualization:
- X-axis: Time periods (months or years)
- Y-axis: Revenue amounts
- Each bar shows revenue amount and gig count
- Summary stats below chart:
- Peak Revenue: Highest earning period
- Peak Gigs: Most gigs in a period
- Peak Fans: Highest fan reach in a period
4. View Your Goals section:
- Click “Set New Goal” to create new goal (modal opens)
- View existing goal cards (up to 4+ shown):
- Goal title (e.g., “Increase monthly revenue to $5,000”)
- Progress bar showing current vs. target
- Percentage complete
- Click goal card to edit or update progress
5. View Verified Status banner (bottom):
- Shows verification badge if earned
- Links to verification criteria:
- Identity Verified
- Performance History
- Quality Reviews
- Displays average rating
6. View Achievements sidebar (right):
- Shows earned and locked achievement badges:
- **Earned badges** (green): First Gig, Five Star Rating, Rising Star
- **Locked badges** (gray): Concert Hall, Monthly Regular, Collaboration Master
- Each badge shows:
- Icon
- Achievement name
- Requirement description
- Click badge for details (if interactive)
7. View Spotlight Artists section (right sidebar):
- “Top performers this week”
- *(D-068: Random verified artists with >4.5 rating)*
- 3 artist cards showing:
- Name, genre, rating, gig count, trophy icon
- Click artist to view profile
8. View Boost Your Growth section (right sidebar):
- 3 action cards:
- Find More Gigs → marketplace
- Get AI Insights → Violet *(D-062: 50 prompts/day)*
- Network & Collaborate → artist discovery

**Metric Definitions:**
- **Total Earnings:** Self-reported or calculated from gig data (NOT financial forecasting)
- **Gigs Completed:** Count of past gigs marked complete *(D-080: Either party can mark)*
- **Average Rating:** Mean of all venue/collaborator ratings
- **Fan Reach:** *(D-070: Platform followers only, not social media aggregation)*
- *(D-008: All metrics updated daily at midnight UTC)*

**Goals System:**
- User-created goals with targets
- Progress tracking (manual or automatic based on metrics)
- Visual progress bars with percentage complete
- Common goal types: revenue targets, fan growth, gig count, verification status

**Achievements:**
- Pre-defined badges for milestones
- Binary earned/locked state
- Requirements shown for locked achievements
- Gamification element to encourage engagement

**Not Included:**
- Financial forecasting
- ROI calculations
- Profit margin analysis
- Cash flow projections
- Year-over-year comparisons (unless simple percentage change)

---

### Flow 15: Apply to Gig (Single-Click)

**Entry Point:** Marketplace gig card “Apply” button

**Steps:**
1. User clicks “Apply” button on gig card
2. *(D-077: Single-click apply flow)*
3. System automatically sends to venue:
- Artist profile link
- Artist rates (flat rate + hourly rate)
- Artist availability dates
- Artist portfolio (track links)
- Message template: “I’m interested in this opportunity. Here’s my profile and rates.”
4. System creates booking request record with status “Applied”
5. Show success toast: “Application sent! [Venue Name] will review your profile.”
6. *(D-079: Email + SMS confirmation sent to both artist and venue)*
7. Venue receives notification with artist profile preview
8. Booking request appears in artist’s “Applied” list (tracking view)

**Data Sent:**
- Artist profile URL
- Flat rate and hourly rate
- Availability dates
- Portfolio track links
- Contact information (email, phone)

**Confirmation:**
- *(D-079: Email sent to artist)*
- *(D-079: SMS sent to artist)*
- *(D-079: Email sent to venue)*
- *(D-079: SMS sent to venue)*

---

### Flow 16: Book Artist (Message-Based)

**Entry Point:** Artist profile “Book Artist” button

**Steps:**
1. User clicks “Book Artist” button on artist profile
2. *(D-076: Opens message composer with pre-filled booking inquiry)*
3. Message composer opens with pre-filled template:
- Recipient: Artist name
- Subject: “Booking Inquiry”
- Body template: “Hi [Artist Name], I’d like to discuss booking you for [event/venue]. Here are the details…”
4. User edits message with specific booking details:
- Date and time
- Venue/event name
- Expected payment
- Additional requirements
5. User clicks “Send” *(D-043: 2000 character limit)*
6. Message delivers to artist in Messages section
7. Artist responds with availability and confirmation
8. Once both parties agree:
- Either party marks booking as confirmed
- *(D-079: Email + SMS confirmation sent to both parties)*
9. Booking appears in both parties’ calendars/dashboards
10. After gig date:
- *(D-080: Either party can mark gig as “Complete”)*
- Triggers review request *(D-032: Invite to leave review via email)*

**Communication:**
- All booking negotiation happens via in-app messaging *(D-087: No rate limits)*
- *(D-079: Email + SMS confirmations sent to both parties)*
- No payment processing in MVP (handled externally)

---

### Flow 17: Account Deletion

**Entry Point:** *(D-098: Profile avatar dropdown → Settings)*

**Steps:**
1. Click profile avatar in header
2. Select “Settings” from dropdown
3. Navigate to “Account” section
4. Click “Delete Account” button
5. *(D-102: Self-service automatic deletion)*
6. Confirmation modal appears:
- Warning: “This action is permanent and cannot be undone.”
- Checkbox: “I understand that all my data will be deleted”
- Input field: “Type DELETE to confirm”
7. User types “DELETE” and clicks “Confirm Deletion”
8. System immediately:
- Marks account as deleted
- Removes all profile data
- Deletes all files from R2 storage
- Removes from all contact lists
- Anonymizes all reviews authored by user
- Preserves reviews received (anonymizes reviewer name)
9. User logged out and redirected to landing page
10. Email confirmation sent: “Your Umbrella account has been deleted”

**Data Deletion:**
- User account and credentials
- Artist profile and all metadata
- Uploaded files (R2 storage)
- Journal entries
- Message history (user’s messages only)
- Favorites and saved items
- Analytics data

**Data Preserved (Anonymized):**
- Reviews written by user (reviewer shown as “Deleted User”)
- Reviews received by user (kept on other artists’ profiles)
- Booking history (for venue records, anonymized)

---

## SCREEN-BY-SCREEN SPECIFICATIONS

### Screen 1-3: Authentication - Sign In / Sign Up Portal

**Purpose:** Unified authentication entry point with OAuth only.

**Layout:**
- Split screen: Left carousel (value propositions) + Right form
- **Carousel (3 slides):**
- Slide 1: “Find Your Perfect Gig” - Connect with venues, get matched, verified partnerships
- Slide 2: “Build Your Network” - Collaborate with artists, producers, venues, grow audience
- Slide 3: “Grow Your Career” - Track progress, earn endorsements, unlock opportunities
- Progress dots (3 total) indicate current slide
- Checkmark list (same on all slides): Verified venue partnerships, Smart gig matching, Professional portfolio builder, Secure booking system
- **Sign In Form:**
- Umbrella logo + tagline: “Create Connect Discover”
- Heading: “Under one Umbrella.”
- Subheading: “Your all-in-one platform for artists, venues, and music lovers.”
- *(D-001: OAuth only - no email/phone input field)*
- Buttons: ~~“Log In”~~ / ~~“Sign Up”~~ (removed)
- OAuth buttons: **Apple** (prominent), **Google** (prominent)
- ~~GitHub, Facebook, Microsoft~~ (removed per D-001)
- Footer links: Terms of Service | Privacy Policy
- *(D-106: Cookie banner: “This website uses cookies”)*

**User Interactions:**
- Carousel auto-advances or manual navigation (dots clickable)
- **Apple OAuth button** → Cloudflare Access authentication → callback → profile check:
- If onboarding complete: → Dashboard
- *(D-006: If onboarding incomplete: → Step 1 of onboarding)*
- **Google OAuth button** → Same flow as Apple
- ~~“Forgot password?”~~ (removed per D-001)

**Data Captured:**
- OAuth provider (apple/google)
- OAuth ID (provider’s unique identifier)
- Email (from OAuth provider)
- Name (from OAuth provider)

**Transitions:**
- → /onboarding/role-selection (new OAuth user without profile)
- *(D-006: → /onboarding/artists/step1 if incomplete onboarding)*
- → /dashboard (returning user with complete profile)

**Validation Rules:**
- Cloudflare Access JWT validation server-side
- Email format validation (from OAuth)

**States:**
- Default (OAuth buttons ready)
- Loading (authentication in progress)
- Error (OAuth failed, invalid JWT)

**Updated per:**
- *(D-001: Remove email/password auth entirely)*
- *(D-106: Simple cookie disclosure)*

---

### Screen 4: Role Selection - Begin Your Journey

**Purpose:** User selects primary role to determine onboarding path.

**Layout:**
- Header:
- Umbrella icon
- Heading: “Begin Your Journey”
- Subheading: “Choose your role to unlock your personalized Umbrella experience.”
- 4 role cards (2x2 grid):
- **Artists** - “Own your stage” - “Get booked, connect with fans, grow your career” - ✅ ACTIVE
- **Fans** - “Discover everywhere” - “Find local venues, discover artists, build playlists, never miss a show” - COMING SOON badge
- **Venues** - “Fill your space” - “Connect with verified artists, book your perfect lineup” - COMING SOON badge
- **Collectives** - “Build together” - “Unite your crew, curate events, amplify your collective reach” - COMING SOON badge
- Footer: “← Back to Sign In” button *(D-001: Returns to OAuth screen)*

**User Interactions:**
- Click “Artists” card → navigate to artist onboarding (only enabled role for MVP)
- Click other cards → show “Coming Soon” message (no navigation)
- “← Back to Sign In” → return to authentication screen

**Data Captured:**
- User role selection (artist/fan/venue/collective)

**Transitions:**
- ← /auth (Back to Sign In)
- → /onboarding/artists/step1 (Artists selected)
- No action for Fans/Venues/Collectives (Coming Soon)

**States:**
- Only “Artists” card interactive
- Other cards show “Coming Soon” overlay

**MVP Note:**
- All non-Artist roles disabled but visible to indicate future features

---

### Screen 5: Onboarding Step 1 - Identity & Basics

**Purpose:** Collect foundational artist identity information.

**Layout:**
- Progress header: “← Step 1 of 5”
- Title: “Identity & Basics”
- Subtitle: “Tell us who you are as an artist”
- Alert banner (red border): “💡 The better your responses to this form, the better the platform will be able to help you grow!”
- Form fields:
- Full Name (pre-filled from OAuth) *(D-001: From Apple/Google)*
- Artist Name (stage name) **REQUIRED**
- Location: City dropdown | State dropdown | ZIP input **REQUIRED**
- Phone Number: (555) 123-4567 format (optional)
- Inspirations: Tag input - “Artist name - Press Enter to add each artist”
- Genre selection: 5 circular icons (Acoustic guitar, Microphone, Drums, Piano, Turntable) **REQUIRED**
- Footer: “← Back” (outline) | “Next →” (purple filled)

**User Interactions:**
- “←” arrow or “← Back” → return to role selection
- Text inputs → type data
- Location dropdowns → select from lists
- Inspirations field → type artist name, press Enter to create tag chip
- Genre icons → click to select (multi-select)
- “Next →” → *(D-003: All steps required - cannot skip)*
- Validate required fields
- Save data
- Navigate to step 2

**Data Captured:**
- full_name (string, required, pre-filled from OAuth)
- artist_name (string, required)
- city (string, required)
- state (string, required)
- zip (string, optional)
- phone_number (string, optional)
- inspirations (array of strings)
- genre_icons (array of genre identifiers, required)

**Validation:**
- Full name, artist name, city, state required
- At least one genre selection required
- Phone number format validation (if provided)

**Transitions:**
- ← /onboarding/role-selection
- → /onboarding/artists/step2

**Exit Behavior:**
- *(D-004: User can exit, but progress not saved)*
- *(D-006: On return, restart from Step 1)*

**Updated per:**
- *(D-001: Full name pre-filled from OAuth)*
- *(D-003: All steps required)*
- *(D-004: Progress not saved on exit)*

---

### Screen 6: Onboarding Step 2 - Links & Your Story

**Purpose:** Connect social platforms and collect qualitative artist information.

**Layout:**
- Progress header: “← Step 2 of 5”
- Progress dots: 1 filled (cyan), 1 active (purple), 3 empty
- Title: “Links & Your Story”
- Subtitle: “Share your online presence and vision”
- **Section 1: Connect Your Platforms**
- Subtitle: “Click on a platform to add your profile Link. (Add at least 3 links.)” **REQUIRED**
- 10 platform icons (2 rows x 5): Instagram, Spotify, YouTube, TikTok, Twitter (X), SoundCloud, Apple Music, Facebook, Bandcamp, Website
- **Section 2: Tell Us More** (6 questions with text inputs)
- “What tasks would you outsource if you could?”
- “What makes your sound unique?”
- “Dream performance venue or event”
- “Your biggest inspiration”
- “Favorite time to create”
- “If Umbrella could solve one pain point today, what should it be?”
- Footer: “← Back” | “Next →”

**User Interactions:**
- Platform icon click → opens input field to enter URL
- Platform icons highlight/fill when URL added
- Text inputs → type responses (optional)
- “← Back” → navigate to step 1 *(D-003: Can review previous answers)*
- “Next →” → *(D-003: Validate 3+ social links required)* → save → navigate to step 3

**Data Captured:**
- social_links (array of objects: {platform: string, url: string}) **Minimum 3 required**
- outsource_tasks (text, optional)
- sound_description (text, optional)
- dream_venue (text, optional)
- inspiration (text, optional)
- creative_time (text, optional)
- pain_point (text, optional)

**Validation:**
- At least 3 social platform URLs required *(D-003: Enforced)*
- URL format validation for each platform
- Text questions optional

**Transitions:**
- ← /onboarding/artists/step1
- → /onboarding/artists/step3

**Exit Behavior:**
- *(D-004: User can exit, but progress not saved)*
- *(D-006: On return, restart from Step 1)*

**Updated per:**
- *(D-003: Minimum 3 social links enforced)*
- *(D-004: Progress not saved on exit)*

---

### Screen 7: Onboarding Step 3 - Creative Profile Tags

**Purpose:** Multi-select tag-based profiling across 7 categories.

**Layout:**
- Progress header: “← Step 3 of 5”
- Progress dots: 2 filled, 1 active, 2 empty
- Title: “Your Creative Profile Tags”
- Subtitle: “Select all tags that fit your profile for each category”
- **7 Tag Categories:**
1. **Type of Artist:** DJ, Singer, Songwriter, Band, Instrumentalist, Producer, Engineer, Other
2. **Genre(s) you perform:** 20+ genre tags (Afro-House, Blues, Classical, Country, DJ, Drum & Bass, Electronic, Funk, Hip-Hop, House, Indie, Indie Rock, Jazz, Latin, Minimal Techno, Metal, Pop, R&B, Rock, Soul, Tech House, Techno, Other)
3. **Equipment You Use:** Piano, Guitar, Drums, Synth, Microphone, MIDI Controller, Audio Interface, Other
4. **Preferred DAW:** Ableton Live, Logic Pro, FL Studio, GarageBand, Pro Tools, Other
5. **Platforms You Use to Reach Your Audience:** Instagram, TikTok, Snapchat, Facebook, Personal Website, Discord, Reddit, Email/Text Lists, Physical Flyers, Other
6. **Creative Subscriptions & Services:** Splice, Canva, Adobe, Logic Pro, Beatport, Distrokid, TuneCore, Merch Ads, Google Ads, Paid Followers, Other
7. **What do you struggle with most when reaching new listeners?:** Live performances, Dropping new songs, Social media content, Other
- Footer: “← Back” | “Next →”

**User Interactions:**
- Click tag to toggle selection (purple highlight when selected)
- Multi-select enabled within each category
- “Other” tags may open text input for custom entry
- “← Back” → navigate to step 2
- “Next →” → *(D-003: All steps required)* → save selections → navigate to step 4

**Data Captured:**
- artist_types (array of strings)
- genres (array of strings)
- equipment (array of strings)
- preferred_daw (array of strings)
- audience_platforms (array of strings)
- subscriptions (array of strings)
- listener_struggles (array of strings)

**Validation:**
- All categories optional (no minimum selections required)
- Custom tags validated for length/format if “Other” selected

**Transitions:**
- ← /onboarding/artists/step2
- → /onboarding/artists/step4

**Exit Behavior:**
- *(D-004: User can exit, but progress not saved)*
- *(D-006: On return, restart from Step 1)*

**Updated per:**
- *(D-003: Step progression enforced)*
- *(D-004: Progress not saved on exit)*

---

### Screen 8: Onboarding Step 4 - Your Numbers

**Purpose:** Capture quantitative data about scale, rates, and availability.

**Layout:**
- Progress header: “← Step 4 of 5”
- Progress dots: 3 filled, 1 active, 1 empty
- Title: “Your Numbers”
- Subtitle: “Help us understand your scale and availability”
- **Form Sections:**
1. **Largest show you’ve played:**
- Slider: 0 to 1,000+
- Label: “What facility ticket sold at your biggest performance?”
2. **Your rates:**
- **Flat rate (per show/event):**
- Slider: $0 to $5,000+
- Label: “What’s your typical flat rate for a complete performance?”
- **Hourly rate:**
- Slider: $0/hr to $500+/hr
- Label: “What’s your hourly rate for sessions, studio time, or consulting?”
3. **How do you spend your time?:**
- Dual-handle slider: “Creative: 50%” ← → “Logistics: 50%”
- Labels: “More Creative” ← → “More Logistics”
4. **Upcoming availability:**
- Label: “Pick up to 3 future dates you’re available for gigs”
- Button: “Select dates” (opens date picker)
- Footer: “← Back” | “Next →”

**User Interactions:**
- Sliders → drag handles to adjust values
- Dual slider → adjust balance between creative/logistics time
- “Select dates” → opens date picker modal → select up to 3 dates → dates appear as chips
- “← Back” → navigate to step 3
- “Next →” → *(D-003: All steps required)* → save data → navigate to step 5

**Data Captured:**
- largest_show_capacity (integer, 0-1000+)
- flat_rate (integer, 0-5000+)
- hourly_rate (integer, 0-500+)
- time_split_creative (integer, 0-100 percentage)
- time_split_logistics (integer, 0-100 percentage, calculated as 100 - creative)
- available_dates (array of date objects, max 3)

**Validation:**
- All fields optional
- Creative + Logistics percentages must equal 100%
- Dates must be future dates
- Maximum 3 dates selectable

**Transitions:**
- ← /onboarding/artists/step3
- → /onboarding/artists/step5

**Exit Behavior:**
- *(D-004: User can exit, but progress not saved)*
- *(D-006: On return, restart from Step 1)*

**Updated per:**
- *(D-003: Step progression enforced)*
- *(D-004: Progress not saved on exit)*

---

### Screen 9: Onboarding Step 5 - Quick Questions

**Purpose:** Final yes/no questions to refine profile and identify pain points.

**Layout:**
- Progress header: “← Step 5 of 5”
- Progress dots: All 5 filled (cyan), final dot active
- Title: “Quick Questions”
- Subtitle: “Just a few yes or no questions to finish up”
- **6 Yes/No Toggles:**
1. “Do you currently make music?” - Yes | No
2. “Do you feel confident presenting yourself online?” - Yes | No
3. “Do you struggle with finding your creative niche?” - Yes | No
4. “Do you know where to find gigs that match your level?” - Yes | No
5. “Have you been paid fairly for performing?” - Yes | No
6. “Do you understand royalties and streaming payouts?” - Yes | No
- Footer: “← Back” | “Submit →”

**User Interactions:**
- Toggle buttons → select Yes or No for each question
- Only one option selectable per question
- “← Back” → navigate to step 4
- “Submit →” → *(D-003: Complete onboarding)* → save responses → navigate to Dashboard

**Data Captured:**
- makes_music (boolean)
- confident_online (boolean)
- struggles_niche (boolean)
- knows_gig_sources (boolean)
- paid_fairly (boolean)
- understands_royalties (boolean)
- onboarding_completed_at (timestamp)

**Validation:**
- All questions optional
- Default state if unanswered: null

**Transitions:**
- ← /onboarding/artists/step4
- → /dashboard (onboarding complete)

**Post-Submission:**
- User entity updated: onboarding_completed = true
- Profile completion percentage calculated
- Dashboard loads with new user state
- Welcome email sent *(D-079: Via Resend)*

**Exit Behavior:**
- *(D-004: User can exit, but progress not saved)*
- *(D-006: On return, restart from Step 1)*

**Updated per:**
- *(D-003: Step progression enforced)*
- *(D-004: Progress not saved on exit)*

---

### Screen 10: Dashboard - Main View

**Purpose:** Primary landing page showing earnings overview, opportunities, messages, endorsements, quick actions.

**Layout:**
- **Top Navigation Bar:**
- Umbrella logo (home link)
- Main tabs: Dashboard (active), Discover, Messages, Violet, Growth
- Right side:
- Search icon *(D-071: Global search - Artists + Gigs)*
- Notification bell
- Profile avatar *(D-098: Dropdown → Settings)*
- “View My Profile” button
- *(D-044: “Tools” navigation item for Artist Toolbox)*
- **Welcome Section:**
- Heading: “Welcome back, [Artist Name]!”
- Subheading: “Here’s what’s happening in your music world”
- **Metrics Cards (3 horizontal cards):**
1. “This Month” - $2,400 (dollar icon) - “+24% from last month”
2. “Gigs Booked” - 8 (calendar icon) - “This week”
3. “Profile Views” - 127 (trending icon) - “+18% this week”
- *(D-008: All metrics updated daily at midnight UTC)*
- **New Opportunities Section:**
- Heading: “New Opportunities” | “View All” link
- *(D-011: Shows latest 3 gigs from marketplace)*
- 3 opportunity cards:
- Venue name, gig title, date, payment amount
- *(D-010: “Urgent” badge if gig within 7 days with <50% capacity)*
- *(D-077: “Apply” button - single-click apply)*
- **Right Sidebar Widgets:**
- **Messages Widget:**
- Heading: “Messages” (with notification badge)
- 3 recent message previews: sender name, message snippet
- *(D-043: Message preview truncated to fit)*
- Click to open conversation
- **Recent Endorsements Widget:**
- Heading: “Recent Endorsements”
- 3 endorsement previews: endorser name, quote
- “View all endorsements” link (with trophy icon)
- **Quick Actions Widget:**
- Heading: “Quick Actions”
- 3 action buttons: Find Gigs, Find Collaborators, View Analytics
- **Violet Prompt (bottom center):**
- Violet avatar icon
- Text: “What do you want help with today?”
- Subtext: “Ask me anything about gigs, collaborations, or growing your career”
- *(D-058: “Ask Violet” button → Opens intent picker modal)*
- *(D-062: 50 prompts/day limit)*

**User Interactions:**
- Main tabs → navigate between Dashboard/Discover/Messages/Violet/Growth
- *(D-098: Profile avatar → Dropdown with “Settings” option)*
- “View My Profile” → navigate to public profile view
- Search icon → *(D-071: Global search for Artists + Gigs)*
- Notification bell → open notifications panel
- Metrics cards → clickable for drill-down (optional)
- Opportunity cards → click card or *(D-077: “Apply” button - single-click)*
- “View All” opportunities → navigate to marketplace gigs
- Message previews → open full conversation
- Endorsement previews → navigate to endorsements section
- Quick action buttons → navigate to respective features
- *(D-058: “Ask Violet” → Opens intent picker modal)*

**Data Displayed:**
- *(D-008: Current month earnings, daily batch update at midnight UTC)*
- Percentage change from previous month
- Gigs booked count and timeframe
- Profile view count and trend
- *(D-011: Latest 3 gig opportunities from marketplace)*
- *(D-010: “Urgent” badges on gigs within 7 days with <50% capacity)*
- 3 recent messages (unread prioritized)
- 3 recent endorsements
- Unread message count badge

**Transitions:**
- → /profile/view (View My Profile)
- → /marketplace/gigs (View All opportunities, Find Gigs)
- → /marketplace/artists (Find Collaborators)
- → /growth (View Analytics)
- → /messages (Messages widget)
- → /messages/[conversation_id] (Specific message preview)
- → /profile/endorsements (View all endorsements)
- → /gig/[id] (Opportunity card)
- *(D-058: → Violet intent picker modal - “Ask Violet”)*
- *(D-098: → /settings from profile dropdown)*
- *(D-044: → /tools from “Tools” navigation item)*

**States:**
- New user (0 gigs, 0 earnings) vs. active user
- Unread messages badge visibility
- Dynamic opportunity count
- *(D-008: Metrics update daily at midnight UTC)*

**Updated per:**
- *(D-008: Daily batch metrics updates)*
- *(D-010: Urgent badge logic - 7 days, <50% capacity)*
- *(D-011: Latest 3 gigs, non-personalized)*
- *(D-044: “Tools” in main navigation)*
- *(D-058: “Ask Violet” opens intent picker modal)*
- *(D-062: 50 prompts/day Violet limit)*
- *(D-071: Global search - Artists + Gigs)*
- *(D-077: Single-click apply on opportunity cards)*
- *(D-098: Profile dropdown → Settings)*

---

### Screen 11: Marketplace - Find Gigs

**Purpose:** Browse and filter available gig opportunities.

**Layout:**
- **Header:**
- “← Back to Dashboard” button
- Title: “Marketplace”
- Tabs: “Find Gigs” (active) | “Discover Artists”
- “Filters” button (top-right)
- **Search & Filter Bar:**
- Search input: “Search venues, locations, or gig types…” *(D-071: Gigs only)*
- Filter chips: Jazz, Rock, Acoustic, Opening Act, This Weekend, $500+ (active filters shown)
- “Filters” button (expands advanced filters)
- **Gig Listing Cards (vertical scroll):**
- *(D-017: Infinite scroll - no pagination controls)*
- *(D-014: Default sort = random shuffle)*
- Each card shows:
- Venue name
- Gig title
- Date and time
- Capacity (e.g., “200 cap”)
- Location
- Venue rating + review count (e.g., “4.8 (198 reviews)”)
- Genre tags
- Payment amount (e.g., “$800 per gig”)
- *(D-010: “Urgent” badge if gig within 7 days with <50% capacity)*
- Icons: Favorite (heart), Comment
- Button: *(D-077: “Apply” - single-click)*
- **Right Sidebar:**
- Placeholder panel: “Select a gig”
- Helper text: “Click on a listing to view details and apply”

**User Interactions:**
- “← Back to Dashboard” → navigate to dashboard
- “Discover Artists” tab → switch to artist discovery view
- Search input → filter gigs by keyword *(D-071: Gigs only)*
- Filter chips → toggle filter on/off (purple highlight when active)
- “Filters” button → open advanced filter modal
- Scroll down → *(D-017: Infinite scroll loads more results)*
- Gig card click → populate right sidebar with full gig details
- “Favorite” icon → save gig to favorites list
- “Comment” icon → view reviews/comments about venue or gig
- *(D-077: “Apply” button - single-click sends profile + rates to venue)*

**Data Displayed Per Gig:**
- venue_id, venue_name
- gig_title
- date, time
- capacity
- location (city/neighborhood)
- venue_rating_avg
- venue_review_count
- genre_tags (array)
- payment_amount
- *(D-010: urgency_flag if within 7 days and <50% capacity)*
- favorited_by_user (boolean)

**Filter Options:**
- Genre tags (multi-select)
- Date range (This Weekend, This Week, This Month, Custom)
- Price range (slider or presets like $500+, $1000+)
- Capacity range
- Location/distance
- *(D-010: Urgency filter - “Urgent gigs only”)*

**Search Behavior:**
- Searches venue name, gig title, location, genre tags
- Real-time filtering (debounced)
- *(D-014: Results shown in random shuffle order)*
- *(D-017: Infinite scroll - loads 20 gigs at a time)*
- No AI-powered matching or recommendations

**Transitions:**
- ← /dashboard
- → /marketplace/artists (tab switch)
- → /gig/[id] (gig card or “Select a gig” button)
- → /venue/[id] (venue name click, if venue profiles exist)

**States:**
- Empty state (no gigs match filters)
- Loading state (fetching gigs)
- Filter chips active/inactive
- Right sidebar empty vs. gig selected
- *(D-017: Loading indicator at bottom during infinite scroll)*

**Updated per:**
- *(D-010: Urgent badge = gig within 7 days with <50% capacity)*
- *(D-014: Default sort = random shuffle)*
- *(D-017: Infinite scroll instead of pagination)*
- *(D-071: Search scope = gigs only)*
- *(D-077: Single-click apply button)*

---

### Screen 12: Marketplace - Discover Artists

**Purpose:** Browse and search other artists for collaboration or discovery.

**Layout:**
- **Header:** [Same as Find Gigs screen]
- Tabs: “Find Gigs” | “Discover Artists” (active)
- **Search & Filter Bar:**
- Search input: “Search artists, genres, or locations…” *(D-071: Artists only)*
- Filter dropdown: “Filter by area…” (with icon)
- Filter chips: Near Me, Available Now, Verified, Jazz, Rock, Electronic, Classical (active filters)
- “Filters” button
- **Artist Listing Cards (vertical scroll):**
- *(D-017: Infinite scroll - no pagination controls)*
- *(D-014: Default sort = random shuffle)*
- Each card shows:
- Artist profile photo
- Artist name (stage name)
- Legal name in parentheses (optional)
- Verification badge (green checkmark if verified)
- Primary genre
- Distance from user (e.g., “0.8 miles”)
- Bio preview (2-3 lines)
- Stats: Rating (4.9★), Review count (107), Follower count (6,400), Gigs completed (41)
- Price range (e.g., “$400-800 per gig”)
- Icons: Favorite (heart), Comment
- **Right Sidebar:**
- Placeholder panel: “Select an artist”
- Helper text: “Click on an artist to view their profile and details”

**User Interactions:**
- “Find Gigs” tab → switch to gig listings
- Search input → filter artists by name, genre, location *(D-071: Artists only)*
- Filter dropdown → select geographic area
- Filter chips → toggle filters (Near Me, Available Now, Verified, genres)
- “Filters” button → open advanced filters
- Scroll down → *(D-017: Infinite scroll loads more results)*
- Artist card click → populate right sidebar with profile preview OR navigate to full profile
- “Favorite” icon → save artist to favorites
- “Comment” icon → view reviews about artist

**Data Displayed Per Artist:**
- artist_id
- artist_name (stage name)
- legal_name (optional)
- verification_status (boolean)
- primary_genre
- distance_from_user (calculated from location)
- bio_preview (truncated)
- rating_avg
- review_count
- follower_count *(D-070: Platform followers only)*
- gigs_completed
- price_range_min, price_range_max
- profile_photo

**Filter Options:**
- Near Me (location-based distance filter)
- Available Now (has available dates in near future)
- Verified (verified artists only)
- Genre (multi-select from full genre list)
- Distance radius (e.g., within 10 miles, 25 miles, 50 miles)
- Price range

**Search Behavior:**
- Searches artist name, bio, genres, location
- Real-time filtering
- *(D-014: Results shown in random shuffle order)*
- *(D-017: Infinite scroll - loads 20 artists at a time)*
- No AI matching or similarity scoring

**Transitions:**
- → /marketplace/gigs (tab switch)
- → /artist/[id] (artist card click)
- → /messages/new?recipient=[artist_id] *(D-076: Opens message composer with pre-filled booking inquiry)*

**States:**
- Empty state (no artists match filters)
- Loading state
- Verification badges visible/hidden
- Distance calculation depends on user location permission
- *(D-017: Loading indicator at bottom during infinite scroll)*

**Updated per:**
- *(D-014: Default sort = random shuffle)*
- *(D-017: Infinite scroll instead of pagination)*
- *(D-070: Follower count = platform followers only)*
- *(D-071: Search scope = artists only)*
- *(D-076: “Book Artist” opens message composer)*

---

### Screen 13-14: Artist Profile - 6-Tab System

**Purpose:** Public-facing artist profile with comprehensive information across 6 tabs.

**Common Header Elements (All Tabs):**
- “← Back to Dashboard” button
- “Share 85% complete” button (profile completion indicator with share action)
- *(D-023: Profile actions menu - “Edit Profile” if own, “Share/Report” if other’s)*

**Hero Section (Appears on All Tabs):**
- Profile avatar (left)
- Artist name
- Verification badge: “Wholesome” (green checkmark, if verified)
- Location: “New York, CA” (with pin icon)
- Metrics row:
- Followers count *(D-070: Platform followers only)*
- Tracks count *(D-026: No upload limit)*
- Rating (star icon)
- Endorsements count
- Social links display: Website, Facebook, Instagram, TikTok, Gift/Tip
- Action buttons:
- “Follow” (outline button)
- *(D-076: “Book Artist” → Opens message composer with pre-filled booking inquiry)*

**Tab Navigation:**
- Overview (default)
- Portfolio
- Explore
- Journey
- Reviews
- Opportunities

---

### Tab 1: Overview

**Purpose:** Summary view with bio, portfolio preview, endorsements.

**Content Sections:**
1. **Bio Section:**
- Heading: “Bio”
- Bio text (truncated)
- Link: “Expand bio →” (expands inline)
2. **Violet Suggestion Banner:**
- Purple wand icon
- Text: “Violet suggests: ‘Your profile is 85% complete - add 2 more tracks to boost visibility’”
- *(D-062: Violet suggestions count toward 50 prompts/day limit? TBD)*
3. **Portfolio Preview:**
- Heading: “Portfolio” | “View Full Portfolio →” link
- 3 track cards (horizontal):
- Album art thumbnail
- Track title
- Type: “Original” or “Collaboration”
- Duration (e.g., “3:47”)
- Play count (e.g., “12,500 plays”)
- *(D-024: Inline audio player on click)*
4. **Endorsements Section:**
- Heading: “Endorsements” | “View All →” link
- Badge tags (horizontal):
- “🔥 Dynamic Vocalist” - count: 17
- “🎵 Reliable Musician” - 8
- “🤝 Great Collaborator” - 16
- “🎸 Stage Presence” - 9

**User Interactions:**
- “Expand bio →” → show full bio text inline
- Track cards → *(D-024: Play audio inline)*
- “View Full Portfolio →” → navigate to Portfolio tab
- Endorsement badges → view detailed endorsements or filter reviews
- “View All →” → navigate to full endorsements view

**Data Displayed:**
- artist_bio (text, expandable)
- profile_completion_percentage (integer)
- tracks (preview of 3 most recent or featured)
- endorsement_badges (array with emoji, label, count)
- *(D-070: Followers = platform followers only)*

**Violet Suggestions:**
- Dynamic banner based on profile gaps
- Examples: “Add 2 more tracks”, “Connect your Spotify”, “Upload a profile photo”

**Updated per:**
- *(D-024: Inline audio player on tracks)*
- *(D-026: No upload limit for tracks)*
- *(D-070: Followers = platform only)*
- *(D-076: “Book Artist” → message composer)*

---

### Tab 2: Portfolio

**Purpose:** Display complete music portfolio.

**Content:**
- Heading: “Music Portfolio”
- Button: *(If own profile: “➕ Add Track”)*
- Track list (vertical, full width):
- *(D-026: No upload limit - all tracks shown)*
- Each track shows:
- Album art thumbnail
- Track title
- Type label: “Original” or “Collaboration”
- Duration
- Play count
- *(D-024: Inline audio player on click)*
- Action icons: Heart (favorite), Share

**User Interactions:**
- “➕ Add Track” → open track upload flow (if own profile)
- Track click → *(D-024: Play audio inline)*
- Heart icon → favorite/unfavorite track
- Share icon → open share menu (copy link, social media, etc.)

**Data Displayed:**
- tracks (array of all tracks)
- track_id, title, type, duration, play_count, album_art_url, audio_file_url
- *(D-026: Unlimited tracks, constrained by 50GB storage)*

**States:**
- Own profile view (shows “Add Track” button)
- Other artist profile view (no “Add Track” button)
- Empty state (no tracks uploaded)
- *(D-024: Audio player active state)*

**Updated per:**
- *(D-024: Inline audio playback)*
- *(D-026: No upload limit)*

---

### Tab 3: Explore

**Purpose:** Recent posts and media gallery.

**Content:**
- Heading: “Recent Posts”
- Media gallery (grid layout):
- *(D-028: Manual upload only - no social media import)*
- Image posts (square thumbnails)
- Video posts (square thumbnails with duration overlay, e.g., “0:24”)
- Each post clickable to open lightbox or detail view

**User Interactions:**
- Media thumbnail click → open in lightbox viewer or navigate to post detail
- Video posts → play video inline or in modal
- *(If own profile: Upload new post via “➕ Add Post” button)*

**Data Displayed:**
- posts (array)
- post_id, media_url, media_type (image/video), duration (if video), caption, thumbnail_url
- *(D-028: Manual uploads only, no auto-sync from social media)*

**States:**
- Empty state (no posts)
- Loading state (lazy load on scroll)
- *(If own profile: Upload button visible)*

**Updated per:**
- *(D-028: Manual upload only in MVP - no Instagram/TikTok import)*

---

### Tab 4: Journey

**Purpose:** Career timeline showing milestones and achievements.

**Content:**
- Heading: “Timeline”
- Timeline entries (vertical list, reverse chronological):
- Each entry shows:
- Icon (varies by event type: music note, microphone, trophy, etc.)
- Title (e.g., “Headlined DNA Lounge”)
- Description (e.g., “First sold-out 500-capacity show”)
- Date (e.g., “Dec 2024”)

**User Interactions:**
- Timeline entry click → expand details or navigate to related entity (gig, release)
- Scroll to load more history
- *(D-080: Either party can mark gigs complete - generates timeline event)*

**Data Displayed:**
- timeline_events (array)
- event_id, event_type (headline, release, collaboration, award, milestone), title, description, date, icon_type, related_id

**Event Types:**
- Headline (performing at venue)
- Release (single, album, EP drop)
- Collaboration (featured on track, joint project)
- Award (recognition, certification)
- Milestone (follower count, gig count achievements)
- *(D-080: Gig completions auto-generate timeline events)*

**States:**
- Empty state (no timeline entries)
- Auto-generated vs. manually added events

**Updated per:**
- *(D-080: Gig completion → auto-generates timeline event)*

---

### Tab 5: Reviews

**Purpose:** Client reviews and testimonials from venues, collaborators.

**Content:**
- Heading: “Client Reviews”
- Review cards (vertical list):
- *(D-032: Anyone can be invited via email to leave review)*
- *(D-034: No moderation in MVP)*
- Reviewer avatar (venue or person photo)
- Reviewer name (e.g., “The Blue Note SF”, “DNA Lounge”)
- Star rating (1-5 stars, visual display)
- Date (e.g., “Jan 2024”)
- Review text (full testimonial)

**User Interactions:**
- Venue name click → navigate to venue profile (if available)
- Scroll to load more reviews
- *(If own profile: “Invite Review” button - sends email invitation)*

**Data Displayed:**
- reviews (array)
- review_id, reviewer_id, reviewer_type (venue/artist/collaborator), reviewer_name, reviewer_avatar, rating (1-5), review_text, date, verified_booking (boolean)
- *(D-032: Review invitations sent via email - anyone can be invited)*
- *(D-034: No moderation - reviews appear immediately)*

**States:**
- Empty state (no reviews yet)
- Verified booking badge (may appear on reviews from confirmed gigs)

**Updated per:**
- *(D-032: Artists can invite anyone via email to leave review)*
- *(D-034: No review moderation in MVP)*

---

### Tab 6: Opportunities

**Purpose:** Personalized growth opportunities and recommendations.

**Content:**
- Heading: “Growth Opportunities”
- Opportunity cards (vertical list):
- *(D-011: Latest 3 gigs from marketplace)*
- Each card shows:
- Title (e.g., “Opening Act – The Fillmore”)
- Badge: *(D-010: “Urgent” if within 7 days with <50% capacity)* or “Quick”
- Description (e.g., “Opening for indie rock headliner. 1,200-capacity venue”)
- Date (if applicable)
- Buttons: “Save” (outline) | *(D-077: “Apply” - single-click)*

**User Interactions:**
- “Save” → save opportunity to saved list
- *(D-077: “Apply” → Single-click sends profile + rates to venue)*
- Card click → expand details or navigate to full opportunity page

**Data Displayed:**
- opportunities (array)
- opportunity_id, opportunity_type (gig/collaboration/content_recommendation), title, description, date, urgency_flag, source (marketplace/violet)
- *(D-011: Shows latest 3 gigs from marketplace)*
- *(D-010: Urgent flag if gig within 7 days with <50% capacity)*

**Opportunity Types:**
- Gigs (from marketplace)
- *(D-011: Simple, non-personalized - latest 3 gigs)*
- Collaboration requests (from other artists)
- Violet content recommendations (e.g., “Post acoustic rehearsal content”)

**States:**
- Empty state (no current opportunities)
- Dynamic badge visibility (Urgent, Quick)

**Updated per:**
- *(D-010: Urgent badge logic - 7 days, <50% capacity)*
- *(D-011: Latest 3 gigs, non-personalized)*
- *(D-077: Single-click apply)*

---

### Screen 15: Artist Toolbox

**Purpose:** Quick access hub for key artist tools.

**Access:** *(D-044: Header navigation item “Tools”)*

**Layout:**
- Page title: “Artist Toolbox”
- Tool grid (3 tools visible):
- “Message Fans” - Pink message icon - “Send updates to your audience”
- “My Files” - Blue folder icon - “Store and manage content”
- “Creative Studio” - Orange palette icon - “Your digital art space”

**User Interactions:**
- “Message Fans” → navigate to Message Fans tool
- “My Files” → navigate to file manager
- “Creative Studio” → navigate to Creative Studio editor

**Transitions:**
- → /tools/message-fans
- → /tools/files
- → /tools/studio

**Updated per:**
- *(D-044: Access via header navigation item “Tools” instead of modal)*

---

### Screen 16-17: Message Fans Tool

**Purpose:** SMS/Email blast to segmented fan lists.

**Layout:**
- **Page Header:**
- Back arrow: “←”
- Pink message icon
- Title: “Message Your Fans”
- Subtitle: “3,573 recipients selected”
- Close button: “×” (top-right)
- **Left Sidebar - Access Contacts:**
- Search input: “Search lists…”
- Contact list segments (cards or compact list):
- “Fans” - person icon - “3,843 contacts”
- “Guest Lists” - list icon - “156 contacts”
- “VIPs” - star icon - “42 contacts”
- “Attending” - checkmark icon - “89 contacts”
- Purple border or highlight indicates selected lists
- **Right Panel - Message Composer:**
- Button: *(D-046: “Ask Violet to Draft” - Real AI generation via Claude API)*
- Input: “Subject Line” - “Enter subject line…”
- Textarea: “Message” - “Write your message here…”
- *(D-049: Text-only in MVP - no image/attachment support)*
- *(D-043: Character counter: “0/2000 characters”)*
- **Footer Buttons:**
- “Save Draft” (outline, save icon)
- “Schedule Send” (outline, clock icon)
- “Send Now” (purple filled, send icon)

**User Interactions:**
- “←” or “×” → close tool, return to previous screen
- Search lists → filter contact segments
- List card click → toggle selection, update recipient count
- *(D-046: “Ask Violet to Draft” → Claude API call with prompt template → fills subject/body)*
- *(D-062: Violet usage counts toward 50 prompts/day limit)*
- Subject/Message inputs → type content *(D-043: 2000 char limit)*
- *(D-049: Text-only - no image upload or attachment in MVP)*
- “Save Draft” → save message, keep in drafts folder
- “Schedule Send” → open datetime picker modal → set send time → save scheduled message
- “Send Now” → confirm and send immediately to selected recipients

**Data Requirements:**
- contact_lists (array)
- list_id, list_name, contact_count, list_type (fans/guest_lists/vips/attending/custom)
- contacts (array)
- contact_id, email, phone, name, opted_in, list_ids (array)
- broadcast_message (object)
- message_id, subject, body, recipient_count, list_ids (array), status (draft/scheduled/sent), scheduled_at, sent_at

**Message Delivery:**
- SMS: via Twilio (outbound only)
- Email: via Resend (outbound + notifications)
- Ensure opt-in compliance (only send to opted-in contacts)
- Include unsubscribe link in emails

**States:**
- No lists selected (recipient count = 0)
- Multiple lists selected (cumulative count shown)
- Empty message composer
- Draft saved (confirmation message)
- Scheduled message (shows in scheduled queue)
- Sending in progress (loading state)
- Sent successfully (confirmation)

**Updated per:**
- *(D-043: 2000 character limit for messages)*
- *(D-046: “Ask Violet to Draft” - Real AI via Claude API)*
- *(D-049: Text-only broadcasts in MVP)*
- *(D-062: Violet usage counts toward 50 prompts/day)*

---

### Screen 18: My Files Tool

**Purpose:** Cloud storage and file management for artist media and documents.

**Layout:**
- **Page Header:**
- Back arrow: “←”
- Blue folder icon
- Title: “My Files”
- Subtitle: “3.5 GB / 50GB used”
- Progress bar (multicolor, showing storage usage)
- Close button: “×” (top-right)
- **Main Content Area:**
- Upload zone (center, when no files selected):
- Upload/cloud icon
- Text: “Drop files or click to upload”
- Subtext: “Images, audio, video, documents”
- Search bar (top-right): “Search files…”
- View toggles: Grid view | List view (icons)
- **Left Sidebar - File Categories:**
- Button: “➕ New Folder” (top)
- Category list:
- “All Files” - count badge: “54”
- “Press Photos” - “9”
- “Music & Audio” - “12”
- “Videos” - “3”
- “Documents” - “1”
- **File Grid (when “All Files” or category selected):**
- File cards showing:
- Thumbnail (image preview) OR icon (audio/document/video)
- Filename
- File size (e.g., “2.5 MB”)
- Upload date (e.g., “Jan 15, 2025”)
- *(D-028: Manual upload only - no auto-import from social media)*
- Example files shown:
- Profile-Photo-2024.jpg (image thumbnail)
- Midnight-Blues-Final-m… (music note icon, 57 MB)
- Live-Performance-Clip… (video thumbnail, 8.5 MB)
- Press-Kit-2025.pdf (PDF icon, 12 MB)
- Album-Cover-Draft.png (image thumbnail, 3.1 MB)
- Studio-Session-Mix.wav (music note icon, 45.4 MB)

**User Interactions:**
- “←” or “×” → close file manager
- Upload zone click → open file picker
- Drag-and-drop files → upload to current folder
- Search bar → filter files by name
- Grid/List view toggle → switch display mode
- “➕ New Folder” → create new folder (naming modal opens)
- Category click → filter files by type
- File click → open preview or download
- File right-click or menu → context actions (rename, move, delete, share)

**File Operations:**
- Upload (single or batch) *(D-026: No limit, constrained by 50GB)*
- Download (single or multiple)
- Rename
- Move to folder
- Delete (with confirmation)
- Share (if supported—implementation TBD)

**Data Requirements:**
- files (array)
- file_id, filename, file_type, file_size, file_url, folder_id, thumbnail_url, created_at, updated_at
- folders (array)
- folder_id, folder_name, parent_folder_id, file_count
- storage_quota (object)
- storage_used (bytes), storage_limit (bytes), percentage_used

**File Type Detection:**
- Based on file extension
- Categories: image (jpg/png/heic), audio (mp3/wav/flac), video (mp4/mov), document (pdf/docx)
- *(D-028: No AI analysis or auto-tagging)*

**States:**
- Empty state (no files uploaded)
- Upload in progress (progress bar per file)
- Category selected (filter applied)
- Search active (results filtered)
- Grid vs. List view
- Storage limit reached (disable uploads)

**Updated per:**
- *(D-026: No upload limit, constrained by 50GB storage)*
- *(D-028: Manual upload only - no AI categorization or social media import)*

---

### Screen 19-20: Creative Studio Tool

**Purpose:** Video/text journal with block-based editor for song ideas, set planning, notes.

**Layout:**
- **Page Header:**
- Back arrow: “←”
- Orange/yellow lightbulb icon
- Title: “Unified Entry”
- Status: “Auto-saved” (checkmark, top-right)
- Close button: “×” (top-right)
- **Tab Bar (Quick sort):**
- Tabs: “Song Ideas” | “Set Planning” | “General Notes”
- Active tab highlighted (orange)
- **Toolbar (Add:):**
- Buttons:
- “Text Note” (text icon)
- “Image” (image icon) *(D-028: Manual upload only)*
- “Audio/Video” (play icon) *(D-028: Manual upload only)*
- “Checklist” (checkbox icon)
- **Main Content Area:**
- **Empty State (no blocks added):**
- Illustration: Pencil/create icon with upward arrow
- Heading: “Start Creating”
- Subtext: “Click the buttons above to add text notes, images, checklists, or media to your entry.”
- **Active State (with content):**
- Content blocks stacked vertically:
- **Image Block:** Upload zone with “Click to upload image” and “PNG, JPG, up to 10MB”
- **Audio/Video Block:** Upload zone with “Embed audio or video” and “MP3s, M4a, or upload file”
- **Text Block:** Textarea with placeholder “Write your ideas, lyrics, or notes here…”
- **Checklist Block:** Checkbox items (e.g., “☑ Track ideas”) and “+ Add task” link
- **Footer:**
- Text: “4 blocks” (dynamic count)
- Button: “Save Entry” (orange filled)

**User Interactions:**
- “←” or “×” → close editor, return to journal list (with unsaved changes warning)
- Tab clicks → switch entry type (Song Ideas, Set Planning, General Notes)
- Toolbar buttons → add new block of selected type
- **Text Block:** Type in textarea
- **Image Block:** *(D-028: Click to upload - manual only, no social media import)*
- **Audio/Video Block:** *(D-028: Click to upload OR paste embed URL - manual only)*
- **Checklist Block:** Type task, press Enter to add new item, click checkbox to toggle complete
- Drag handles (if present) → reorder blocks
- Block menu (if present) → delete or duplicate block
- “Save Entry” → save and close editor, return to journal list

**Auto-Save:**
- Entry auto-saves every N seconds (configurable)
- “Auto-saved” indicator updates with timestamp

**Data Requirements:**
- journal_entries (array)
- entry_id, artist_id, entry_type (song_idea/set_plan/general_note), title (optional), blocks (JSON array), auto_saved_at, created_at, updated_at
- blocks (JSON structure within entry)
- block_type (text/image/audio/video/checklist), content, order (index)

**Block Types:**
- **Text:** Plain or rich text content
- **Image:** *(D-028: Uploaded image file with URL - manual only)*
- **Audio/Video:** *(D-028: Uploaded file OR embedded URL - manual only)*
- **Checklist:** Array of tasks with completion status

**States:**
- Empty entry (no blocks)
- Entry with multiple blocks
- Auto-save in progress (indicator)
- Unsaved changes (warning on close)

**Updated per:**
- *(D-028: Manual upload only for images/audio/video - no social media import)*

---

### Screen 21: Violet AI Toolkit

**Purpose:** Navigate Violet’s categorized AI tools and features.

**Layout:**
- **Header:**
- Back button: “← Dashboard”
- Title: “Violet’s Toolkit”
- Subheading: “Your AI copilot for everything music”
- Navigation pills: “Manager’s Mentor” | “Creative Partner”
- **Hero Section (right side):**
- Large Violet icon/avatar
- Heading: “Meet Violet — Your AI Copilot”
- Subheading: “From your next gig to your next song, I’ve got you covered.”
- CTA buttons:
- *(D-058: “Start Creating Together” → Opens intent picker modal)*
- “Explore My Toolkit” (secondary outline) → Scrolls to toolkit section
- Feature grid (6 icons):
- “Book my next gig” (calendar icon)
- “Help me finish a track” (music note icon)
- “Grow my fanbase” (megaphone icon)
- “Connect with artists” (users icon)
- “Structure TikTok posts” (video icon)
- “Manage my calendar” (calendar icon)
- **What Makes Violet Special Section:**
- 4 feature cards:
- “Your Strategic Manager” (purple brain icon) - “Books gigs, negotiates rates, handles your calendar”
- “Emotional Co-Pilot” (teal heart icon) - “Brainstorms lyrics and idea board for songwriting”
- “Caring Mentor & Friend” (pink heart icon) - “Offers guidance, keeps you motivated, celebrates wins”
- “Production Partner” (blue music icon) - “DAW tips, mixing guidance, sample recommendations”
- **Left Sidebar - Toolkit Categories:**
- **Section 1: Highlighted Tools** (with Popular tags)
- “Gigs & Bookings” (green icon, Popular)
- Expandable sub-tools: Find Perfect Venues (Popular), Negotiate Like a Pro, Brand Partnerships
- “Creative Growth” (purple icon, Popular)
- Expandable sub-tools: Songwriting (Popular), Negotiate Like a Pro, Ticket Sales & Promos, Brand Partnerships
- **Section 2: Other Tools**
- “Songwriting Journal” (orange icon)
- “Vinyl Content Strategy” (purple icon, Popular)
- “Fan Engagement” (green icon)
- “Visual Branding” (yellow icon)
- “Creative Challenges” (blue icon)
- “Music Production” (blue icon, Popular)
- Expandable sub-tools: DAW Setup & Tips, Mixing & Mastering, Musical Theory, Samples & Loops Library, BPM & Rhythm, Finish Your Tracks
- “Networking & Collaboration” (pink icon, Popular)
- Expandable sub-tools: Connect Locally (Popular), Find Partners, Find Mentors, Collaboration Groups, Industry Events
- “Career Management” (orange icon)
- Expandable sub-tools: Calendar Management, Goal Achievement, Email Marketing, Travel Opportunities, Long-term Strategy
- **See Violet in Action Section:**
- Heading: “See Violet in Action”
- 3 conversation example cards:
- User prompt as button (e.g., “I’m feeling stuck on this bridge section…”)
- Violet response preview
- Additional examples: “Find me a gig this weekend!”, “Help me roll out on TikTok”

**User Interactions:**
- “← Dashboard” → navigate to dashboard
- “Manager’s Mentor” / “Creative Partner” pills → filter toolkit view (TBD implementation)
- *(D-058: “Start Creating Together” → Opens intent picker modal)*
- “Explore My Toolkit” → scroll to toolkit section
- Feature grid icons → quick actions to specific tools
- Toolkit category click → expand/collapse sub-tools
- Sub-tool click → navigate to specific tool page (e.g., /violet/gigs/find-venues)
- Conversation example buttons → *(D-062: Start Violet prompt - counts toward 50/day limit)*

**Toolkit Structure:**
- 10 main categories
- 30+ sub-tools across categories
- Hierarchical navigation: Category → Sub-tool → Feature

**Data Requirements:**
- violet_toolkit_taxonomy (fixed structure)
- categories (array with key, label, icon, popular flag, subtools array)

**States:**
- Categories collapsed (default)
- Category expanded (shows sub-tools)
- “Popular” badges on high-usage tools
- *(D-062: Prompt counter visible - “23/50 prompts used today”)*

**Updated per:**
- *(D-046: “Ask Violet to Draft” uses Claude API with prompt templates)*
- *(D-058: “Start Creating Together” opens intent picker modal)*
- *(D-062: 50 prompts per day per artist limit)*

---

### Screen 22: Messages & Collaboration

**Purpose:** Unified messaging interface for conversations with venues, artists, collaborators.

**Layout:**
- **Header:**
- Back button: “← Back to Dashboard”
- Title: “Messages & Collaboration”
- **Left Sidebar - Conversations List:**
- Heading: “Conversations”
- Badge: “2 new”
- Conversation cards:
- Participant avatar
- Participant name
- Context badge: “Artist” / “Venue” / “Producer” / “Band”
- Message preview (truncated)
- Unread indicator (purple dot or count badge)
- Timestamp (relative, e.g., “1d”)
- **Main Chat Panel:**
- Header: Participant name, avatar, context badge
- *(D-076: If opened from “Book Artist” - pre-filled with booking inquiry template)*
- Message thread (vertical scroll):
- Received messages (left-aligned, gray bubble)
- Sent messages (right-aligned, purple bubble)
- Each message shows: text, timestamp
- *(D-043: 2000 character limit per message)*
- *(D-087: No rate limits on messaging)*
- **Quick Conversation Starters (above input):**
- Pill buttons: “What inspires your music?” (heart icon), “What’s your creative process?” (lightbulb icon), “Favorite venue to perform at?” (location icon), “Dream collab” (star icon)
- **Message Input Bar:**
- Attachment icon (paperclip)
- Text input: “Type your message…” *(D-043: 2000 char limit)*
- Action buttons:
- “Share Track” (music note icon)
- “Share Portfolio” (briefcase icon)
- “Share Gig Flyer” (calendar icon)
- Send button (purple circle with arrow)

**User Interactions:**
- “← Back to Dashboard” → navigate to dashboard
- Conversation card click → load thread in main panel
- Type message → *(D-043: 2000 character limit)* → send on Enter or click send button
- Quick starter pill click → populate input with prompt text
- Attachment icon → open file picker
- “Share Track” → select track from portfolio → insert link in message
- “Share Portfolio” → generate portfolio link → insert in message
- “Share Gig Flyer” → select gig → generate flyer → insert in message
- Send button → send message, add to thread
- *(D-087: No rate limits - send as many messages as needed)*
- *(D-088: No spam prevention in MVP)*

**Data Requirements:**
- conversations (array)
- conversation_id, participants (array of user_ids), context_type, last_message_preview, unread_count, updated_at
- messages (array)
- message_id, conversation_id, sender_id, content (text), attachments (array of URLs), timestamp, read_status

**Message Delivery:**
- In-app messaging (visible in platform)
- Email notification when new message received (via Resend)
- *(D-079: SMS notification for booking confirmations only)*

**States:**
- No conversation selected (empty main panel)
- Conversation selected (thread visible)
- Unread messages (badges on conversation cards)
- Typing in input (character count visible)
- Message sent (confirmation, message appears in thread)

**Features Included:**
- Text messaging *(D-043: 2000 char limit)*
- File attachments (images, documents)
- Quick sharing (tracks, portfolio, gig flyers)
- Conversation starters (pre-written prompts)
- Unread indicators
- *(D-087: No rate limits)*

**Features NOT Included in MVP:**
- Real-time typing indicators
- Read receipts
- Message editing/deletion
- Voice/video messages
- Two-way SMS replies (SMS is outbound only)
- *(D-088: No spam/abuse prevention)*

**Updated per:**
- *(D-043: 2000 character limit per message)*
- *(D-076: “Book Artist” opens message composer with pre-filled booking inquiry)*
- *(D-087: No rate limits on in-app messaging)*
- *(D-088: No spam/abuse prevention in MVP)*

---

### Screen 23: Growth & Analytics

**Purpose:** Performance dashboard showing metrics, goals, achievements.

**Layout:**
- **Header:**
- Back button: “← Back to Dashboard”
- Title: “Growth & Analytics”
- **Top Metrics Cards (4 cards):**
1. “Total Earnings” (purple bg) - $9,520 - “+32% from last month” - Dollar icon
2. “Gigs Completed” - 31 - “This month” - Calendar icon
3. “Average Rating” - 4.8 - “All-time average” - Star icon
4. “Fan Reach” - 840 - “This month” - Users icon *(D-070: Platform followers only)*
- *(D-008: All metrics updated daily at midnight UTC)*
- **Performance Analytics Section:**
- Heading: “Performance Analytics”
- Toggle: “Monthly” (active) / “Yearly”
- Bar chart (6 months visible):
- X-axis: Jan, Feb, Mar, Apr, May, Jun
- Y-axis: Revenue ($0-$3500 scale)
- Each bar shows:
- Revenue amount (e.g., “$3800”)
- Gig count (e.g., “Gigs 230”) with face icon
- Summary stats below chart:
- “Peak Revenue: $3900”
- “Peak Gigs: 14”
- “Peak Fans: 450”
- **Your Goals Section:**
- Heading: “Your Goals”
- Button: “Set New Goal” (with plus icon)
- Goal progress cards (4 goals):
- Title (e.g., “Increase monthly revenue to $5,000”)
- Progress bar: $3,300 of $5,000 (66% complete)
- **Verified Status Banner (bottom):**
- Checkmark icon (green)
- Text: “Your Verified Status”
- Subtext: “You’re a verified artist on Umbrella!”
- Links: “Identity Verified” / “Performance History” / “Quality Reviews”
- Badge: “4.8 avg rating”
- **Right Sidebar:**
- **Achievements Section:**
- Heading: “Achievements” (trophy icon)
- Achievement badges (6 visible):
- **Earned (green):** First Gig, Five Star Rating, Rising Star
- **Locked (gray):** Concert Hall, Monthly Regular, Collaboration Master
- Each badge shows: icon, name, requirement description
- **Spotlight Artists Section:**
- Heading: “Spotlight Artists”
- Subtext: “Top performers this week”
- *(D-068: Random verified artists with >4.5 rating)*
- 3 artist cards: name, genre, rating, gig count, trophy icon
- **Boost Your Growth Section:**
- Heading: “Boost Your Growth”
- 3 action cards: Find More Gigs (trending icon), Get AI Insights (star icon), Network & Collaborate (users icon)

**User Interactions:**
- “← Back to Dashboard” → navigate to dashboard
- “Monthly” / “Yearly” toggle → refresh chart data
- Chart bars hover → show detailed tooltip (revenue, gigs, date)
- “Set New Goal” → open goal creation modal
- Goal card click → edit goal or update progress
- Achievement badge click → view details or requirements
- Spotlight artist card click → navigate to artist profile
- “Find More Gigs” → navigate to marketplace
- “Get AI Insights” → navigate to Violet *(D-062: 50 prompts/day)*
- “Network & Collaborate” → navigate to artist discovery
- Verified status links → view verification details

**Data Displayed:**
- Analytics aggregated from:
- User-reported earnings (from completed gigs) *(D-008: Daily batch at midnight UTC)*
- Gig completion count *(D-080: Either party can mark complete)*
- Venue ratings (average)
- *(D-070: Fan reach = platform followers only)*
- Chart data: revenue and gig count per period (month or year)
- Peak values: highest revenue, gig count, fan reach
- Goals: user-created with target values, progress calculated
- Achievements: system-defined milestones with earned status
- *(D-068: Spotlight artists = random verified artists with >4.5 rating)*

**Metrics Definitions:**
- **Total Earnings:** Sum of user-reported gig payments (NOT financial forecasting)
- **Gigs Completed:** Count of gigs marked complete *(D-080: Either party can mark)*
- **Average Rating:** Mean of all venue ratings
- **Fan Reach:** *(D-070: Platform followers only, not social media aggregation)*
- *(D-008: All metrics updated daily at midnight UTC)*

**Goals System:**
- User creates goals with target values
- Progress calculated automatically from metrics OR manually updated
- Common goal types: revenue targets, fan growth, gig count, verification
- Percentage complete shown with visual progress bar

**Achievements:**
- Pre-defined milestones (e.g., First Gig, Five Star Rating, Rising Star, Concert Hall, Monthly Regular, Collaboration Master)
- Binary earned/locked state
- Requirements visible for locked achievements
- Gamification to drive engagement

**States:**
- Monthly vs. Yearly chart view
- Empty goals (no goals set)
- Empty achievements (no achievements earned yet)

**Not Included:**
- Financial forecasting
- ROI calculations
- Profit margin analysis
- Cash flow projections
- Year-over-year comparisons (unless simple percentage change)

**Updated per:**
- *(D-008: Daily batch metrics updates at midnight UTC)*
- *(D-062: Violet insights counts toward 50 prompts/day)*
- *(D-068: Spotlight = random verified artists with >4.5 rating)*
- *(D-070: Fan reach = platform followers only)*
- *(D-080: Either party can mark gigs complete)*

---

### Screen 24: Account Settings

**Purpose:** Manage account preferences, credentials, and deletion.

**Access:** *(D-098: Profile avatar dropdown → Settings)*

**Layout:**
- **Header:**
- Back button: “← Back to Dashboard”
- Title: “Account Settings”
- **Sections:**
1. **Profile Information:**
- Full name (read-only, from OAuth)
- Email *(D-099: Read-only, tied to OAuth provider)*
- Phone number (editable)
- Location (editable)
2. **Account Security:**
- *(D-099: OAuth-based - no password field)*
- “Connected Accounts” (Apple/Google badge with checkmark)
- Two-factor authentication (if OAuth provider supports)
3. **Notification Preferences:**
- Email notifications toggle (on/off)
- SMS notifications toggle (on/off)
- *(D-079: Booking confirmations always sent regardless)*
4. **Privacy:**
- Profile visibility (Public / Private)
- Show location in marketplace (toggle)
- Allow review invitations (toggle)
5. **Danger Zone:**
- “Delete Account” button (red)
- *(D-102: Self-service automatic deletion)*

**User Interactions:**
- Edit editable fields (phone, location)
- Toggle notification preferences
- Toggle privacy settings
- “Delete Account” → *(D-102: Opens confirmation modal → immediate deletion)*

**Data Editable:**
- Phone number
- Location
- Notification preferences
- Privacy settings
- *(D-099: Email and OAuth credentials read-only)*

**Account Deletion:**
- *(D-102: Self-service automatic deletion)*
- Confirmation modal with:
- Warning text
- “Type DELETE to confirm” field
- “Confirm Deletion” button
- Immediate deletion on confirmation
- All data removed (see Flow 17)

**Updated per:**
- *(D-098: Access via profile avatar dropdown)*
- *(D-099: Email/credentials read-only, tied to OAuth)*
- *(D-102: Self-service automatic deletion)*

---

### Screen 25: Intent Picker Modal (Violet)

**Purpose:** Help users select appropriate Violet toolkit feature.

**Trigger:** *(D-058: “Start Creating Together” button on Violet page)*

**Layout:**
- **Modal overlay (blurred background)**
- **Modal card:**
- Header:
- Violet icon
- Title: “What would you like help with?”
- Close button: “×” (top-right)
- **Intent categories (6 options):**
- “Find or book a gig” (calendar icon)
- “Finish a track or get songwriting help” (music icon)
- “Grow my fanbase” (megaphone icon)
- “Connect with other artists” (users icon)
- “Plan content for social media” (video icon)
- “Get career or business advice” (briefcase icon)
- **Or:**
- Text input: “Describe what you need help with…”
- Button: “Ask Violet” (purple)

**User Interactions:**
- Click intent category → navigates to relevant toolkit section
- Type free-form question → *(D-062: Counts as 1 prompt toward 50/day limit)* → Claude API call → response in chat interface
- Close button (×) → close modal, return to Violet page

**Routing:**
- “Find or book a gig” → /violet/gigs/find-venues
- “Finish a track…” → /violet/creative-growth/songwriting
- “Grow my fanbase” → /violet/fan-engagement
- “Connect with artists” → /violet/networking/connect-locally
- “Plan content…” → /violet/content-strategy
- “Get career advice” → /violet/career/long-term-strategy

**Updated per:**
- *(D-058: Modal opened by “Start Creating Together” button)*
- *(D-062: Free-form questions count toward 50 prompts/day)*

---

### Screen 26: Cookie Disclosure Banner

**Purpose:** Simple cookie usage disclosure.

**Layout:**
- Banner at bottom of page (fixed position)
- *(D-106: Simple disclosure text: “This website uses cookies”)*
- Button: “Okay” (dismisses banner)
- Link: “Learn More” (navigates to Privacy Policy)

**User Interactions:**
- “Okay” button → dismiss banner (set cookie to remember dismissal)
- “Learn More” → navigate to Privacy Policy page

**Updated per:**
- *(D-106: Simple disclosure, not full GDPR consent mechanism)*

---

## DATA MODEL (CONCEPTUAL)

*[Note: This section is unchanged from v1.0 except where design decisions affect data structure]*

### Updates Based on Design Decisions:

**User Entity:**
- *(D-001: OAuth provider (apple/google) REQUIRED, email/password fields REMOVED)*
- *(D-099: email field read-only, tied to OAuth provider)*
- *(D-102: deletion_requested_at timestamp for account deletion tracking)*

**Artist Entity:**
- *(D-003: onboarding_step_completed (1-5) for tracking progress - always restart from 1 if incomplete)*
- *(D-004: No partial progress saved - onboarding_completed = true only after step 5)*
- *(D-026: No track_upload_limit field - unlimited uploads)*
- *(D-028: social_media_sync_enabled = false for MVP)*
- *(D-070: follower_count = platform followers only, no social media aggregation)*

**Message Entity:**
- *(D-043: character_limit = 2000 enforced at application level)*
- *(D-087: No rate_limit fields - unlimited messaging)*

**Broadcast Message Entity:**
- *(D-046: violet_drafted (boolean) - indicates if AI-generated)*
- *(D-049: attachment_urls array = null for MVP, text-only)*

**Gig Entity:**
- *(D-010: urgency_flag = true if (date - today) <= 7 days AND capacity_filled < 50%)*
- *(D-077: application_type = ‘single_click’ (sends profile + rates automatically))*
- *(D-080: completed_by (artist_id or venue_id) - tracks who marked complete)*

**Review Entity:**
- *(D-032: invitation_email (email address) - tracks invited reviewers)*
- *(D-034: moderation_status = null for MVP - no moderation)*

**Violet Usage Entity (NEW):**
- artist_id (foreign key)
- prompt_date (date)
- prompt_count (integer)
- daily_limit = 50 *(D-062)*
- feature_used (string: ‘draft_message’, ‘intent_picker’, ‘toolkit_chat’, etc.)

**Analytics Entity:**
- *(D-008: batch_processed_at = daily at midnight UTC)*
- *(D-070: fan_reach = platform_followers only)*

**Spotlight Artist Entity (NEW):**
- artist_id (foreign key)
- week_start_date (date)
- selection_method = ‘random’ *(D-068)*
- min_rating = 4.5
- verified_status = true

---

## FEATURE MATRIX

*[Note: Updated from v1.0 with design decision outcomes]*

| Feature | MVP Status | Decision Reference | Notes |
| --- | --- | --- | --- |
| **AUTHENTICATION** |  |  |  |
| Email/password auth | 🚫 **Removed** | D-001 | Apple/Google OAuth only |
| Google OAuth | ✅ In scope | D-001 | Via Cloudflare Access |
| Apple OAuth | ✅ In scope | D-001 | Via Cloudflare Access |
| GitHub/Facebook/Microsoft OAuth | 🚫 Out of scope | D-001 | Removed from UI |
| Password reset flow | 🚫 **Removed** | D-001 | No passwords to reset |
| **ONBOARDING** |  |  |  |
| Role selection (4 roles shown) | ✅ In scope | - | Only Artist active, others “Coming Soon” |
| Artist 5-step onboarding | ✅ In scope | D-003 | All steps required, enforced progression |
| Step progression enforcement | ✅ In scope | D-003 | Cannot skip steps |
| Resume from partial progress | 🚫 **Removed** | D-004 | Progress not saved on exit |
| Restart from beginning on return | ✅ In scope | D-004, D-006 | If incomplete onboarding |
| Social platform connections (3+ required) | ✅ In scope | - | Minimum 3 links enforced |
| Profile completion tracking | ✅ In scope | - | 85% indicator visible |
| **DASHBOARD & NAVIGATION** |  |  |  |
| Main dashboard with metrics | ✅ In scope | D-008 | Daily batch updates at midnight UTC |
| Earnings tracking | ✅ In scope | D-008 | User-reported, daily updates |
| Gig count metrics | ✅ In scope | D-008 | Daily updates |
| Profile view metrics | ✅ In scope | D-008 | Daily updates |
| Opportunities widget | ✅ In scope | D-011 | Latest 3 gigs from marketplace |
| Urgent badges on opportunities | ✅ In scope | D-010 | Gigs within 7 days with <50% capacity |
| Personalized opportunities | 🚫 **Removed** | D-011 | Latest 3 gigs, non-personalized |
| Messages widget | ✅ In scope | - | 3 recent message previews |
| Endorsements widget | ✅ In scope | - | 3 recent endorsements |
| Quick actions widget | ✅ In scope | - | Find Gigs, Find Collaborators, View Analytics |
| Violet prompt | ✅ In scope | D-058, D-062 | Opens intent picker, 50 prompts/day |
| Real-time metrics updates | 🚫 **Removed** | D-008 | Daily batch at midnight UTC |
| **ARTIST PROFILE** |  |  |  |
| 6-tab profile system | ✅ In scope | - | Overview, Portfolio, Explore, Journey, Reviews, Opportunities |
| Public profile view | ✅ In scope | - | Accessible via URL |
| Edit mode (separate route) | ✅ In scope | D-022 | /profile/edit |
| Profile actions menu | ✅ In scope | D-023 | Edit if own, Share/Report if other’s |
| Profile completion indicator | ✅ In scope | - | 85% example shown |
| Bio (expandable) | ✅ In scope | - | “Expand bio” link |
| Social links display | ✅ In scope | - | Website, Facebook, Instagram, TikTok, tip jar |
| Verification badge | ✅ In scope | - | Green checkmark with label |
| Metrics (followers, tracks, rating, endorsements) | ✅ In scope | D-070 | Platform followers only |
| Follow/unfollow | ✅ In scope | - | “Follow” button |
| Book artist button | ✅ In scope | D-076 | Opens message composer with pre-filled inquiry |
| Portfolio tab (track listing) | ✅ In scope | D-024, D-026 | Inline playback, no upload limit |
| Inline track playback | ✅ In scope | D-024 | Audio player on each track |
| Track upload limit | 🚫 **Removed** | D-026 | Unlimited, constrained by 50GB storage |
| Add track functionality | ✅ In scope | D-026 | “➕ Add Track” button |
| Explore tab (media gallery) | ✅ In scope | D-028 | Manual upload only |
| Social media content import | 🚫 **Deferred to post-MVP** | D-028 | Manual upload only in MVP |
| Journey tab (timeline) | ✅ In scope | D-080 | Career milestones, gig completions |
| Reviews tab (testimonials) | ✅ In scope | D-032, D-034 | Email invitations, no moderation |
| Review invitations via email | ✅ In scope | D-032 | Artists can invite anyone |
| Review moderation | 🚫 **Deferred to post-MVP** | D-034 | No moderation in MVP |
| Opportunities tab (recommendations) | ✅ In scope | D-011 | Latest 3 gigs from marketplace |
| Endorsement badges | ✅ In scope | - | Emoji tags with counts |
| Violet suggestions | ✅ In scope | D-062 | Static banner, counts toward 50 prompts/day |
| **MARKETPLACE** |  |  |  |
| Find Gigs tab | ✅ In scope | - | Browse gig listings |
| Discover Artists tab | ✅ In scope | - | Browse artist profiles |
| Default sort order | ✅ In scope | D-014 | Random shuffle |
| Infinite scroll | ✅ In scope | D-017 | No pagination controls |
| Pagination controls | 🚫 **Removed** | D-017 | Infinite scroll instead |
| Search (venues, artists, genres) | ✅ In scope | D-071 | Artists + Gigs only |
| Global search scope | ✅ In scope | D-071 | Artists + Gigs (no venues) |
| Filter chips (genre, date, price) | ✅ In scope | - | Multi-select filters |
| Advanced filters button | ✅ In scope | - | Modal with additional options |
| Gig detail sidebar | ✅ In scope | - | Right panel on card click |
| Artist profile preview sidebar | ✅ In scope | - | Right panel on card click |
| Favorite gigs | ✅ In scope | - | Heart icon to save |
| Favorite artists | ✅ In scope | - | Heart icon to save |
| Apply to gig (single-click) | ✅ In scope | D-077 | Sends profile + rates automatically |
| Urgency badges | ✅ In scope | D-010 | Gigs within 7 days with <50% capacity |
| Distance calculation | ✅ In scope | - | “0.8 miles” shown, requires location permission |
| AI-powered matching | 🚫 Out of scope | - | Manual search/filter only |
| Compatibility scores | 🚫 Out of scope | - | No scoring system |
| **MESSAGING** |  |  |  |
| In-app messaging | ✅ In scope | D-043, D-087 | 2000 char limit, no rate limits |
| Message character limit | ✅ In scope | D-043 | 2000 characters |
| Rate limits on messaging | 🚫 **Removed** | D-087 | Unlimited messaging |
| Spam/abuse prevention | 🚫 **Deferred to post-MVP** | D-088 | No prevention in MVP |
| Conversation list | ✅ In scope | - | Left sidebar with previews |
| Context badges (Artist, Venue, Producer, Band) | ✅ In scope | - | Label on each conversation |
| Text messaging | ✅ In scope | D-043 | 2000 character limit |
| File attachments | ✅ In scope | - | Paperclip icon |
| Quick conversation starters | ✅ In scope | - | Pre-written prompts |
| Share track | ✅ In scope | - | Quick action button |
| Share portfolio | ✅ In scope | - | Quick action button |
| Share gig flyer | ✅ In scope | - | Quick action button |
| Unread indicators | ✅ In scope | - | Badges on conversations |
| Email notifications for new messages | ✅ In scope | - | Via Resend |
| Real-time messaging (WebSocket) | 🚫 Out of scope | - | Polling acceptable for MVP |
| Typing indicators | 🚫 Out of scope | - | Not shown in Figma |
| Read receipts | 🚫 Out of scope | - | Not shown in Figma |
| Message editing/deletion | 🚫 Out of scope | - | Not shown in Figma |
| Voice/video messages | 🚫 Out of scope | - | Not shown in Figma |
| Two-way SMS replies | 🚫 Out of scope | - | Outbound SMS only |
| Pre-filled booking inquiry | ✅ In scope | D-076 | “Book Artist” opens composer with template |
| **ARTIST TOOLBOX** |  |  |  |
| Toolbox access | ✅ In scope | D-044 | Header navigation item “Tools” |
| Message Fans tool | ✅ In scope | - | SMS/Email blast |
| My Files tool | ✅ In scope | - | Cloud storage |
| Creative Studio tool | ✅ In scope | - | Video/text journal |
| **MESSAGE FANS TOOL** |  |  |  |
| Contact list segmentation | ✅ In scope | - | Fans, Guest Lists, VIPs, Attending |
| Multi-select lists | ✅ In scope | - | Checkbox selection |
| Recipient count | ✅ In scope | - | Dynamic total |
| Subject line input | ✅ In scope | - | Text field |
| Message body textarea | ✅ In scope | D-049 | Text-only, no attachments |
| Character/word counter | ✅ In scope | - | Real-time display |
| Save draft | ✅ In scope | - | “Save Draft” button |
| Schedule send | ✅ In scope | - | “Schedule Send” button with datetime picker |
| Send now | ✅ In scope | - | “Send Now” button |
| “Ask Violet to Draft” | ✅ In scope | D-046, D-062 | Real AI via Claude API, counts toward 50/day |
| Text-only broadcasts | ✅ In scope | D-049 | No images or attachments |
| Image attachments in broadcasts | 🚫 **Deferred to post-MVP** | D-049 | Text-only in MVP |
| SMS delivery | ✅ In scope | - | Via Twilio |
| Email delivery | ✅ In scope | - | Via Resend |
| Opt-in compliance | ✅ In scope | - | Only send to opted-in contacts |
| Unsubscribe mechanism | ✅ In scope | - | Required in emails |
| **MY FILES TOOL** |  |  |  |
| File upload (drag-drop, click) | ✅ In scope | D-026 | No upload limit, 50GB quota |
| File type support (image, audio, video, document) | ✅ In scope | - | JPG, PNG, MP3, WAV, FLAC, MP4, MOV, PDF, DOCX |
| Storage quota display | ✅ In scope | D-026 | “3.5 GB / 50GB used” with progress bar |
| No upload limit | ✅ In scope | D-026 | Constrained by 50GB total quota |
| File categories (All Files, Press Photos, Music & Audio, Videos, Documents) | ✅ In scope | - | Left sidebar |
| Search files | ✅ In scope | - | Search bar |
| Grid/list view toggle | ✅ In scope | - | View icons |
| Create folders | ✅ In scope | - | “➕ New Folder” button |
| File metadata (name, size, date) | ✅ In scope | - | Displayed on cards |
| Thumbnails (images, videos) | ✅ In scope | - | Preview images |
| File download | ✅ In scope | - | Click to download |
| AI file analysis | 🚫 Out of scope | D-028 | No AI categorization |
| Auto-categorization | 🚫 Out of scope | D-028 | Manual folders only |
| Social media import | 🚫 **Deferred to post-MVP** | D-028 | Manual upload only in MVP |
| **CREATIVE STUDIO TOOL** |  |  |  |
| Unified entry editor | ✅ In scope | - | Block-based editor |
| Entry types (Song Ideas, Set Planning, General Notes) | ✅ In scope | - | 3 tabs |
| Text block | ✅ In scope | - | Textarea |
| Image block | ✅ In scope | D-028 | Manual upload only |
| Audio/video block | ✅ In scope | D-028 | Manual upload or embed |
| Checklist block | ✅ In scope | - | Task list with checkboxes |
| Block counter | ✅ In scope | - | “4 blocks” footer |
| Auto-save | ✅ In scope | - | “Auto-saved” indicator |
| Save entry | ✅ In scope | - | “Save Entry” button |
| **VIOLET AI TOOLKIT** |  |  |  |
| Toolkit navigation | ✅ In scope | - | 10 categories, 30+ sub-tools |
| Category expansion | ✅ In scope | - | Click to expand/collapse |
| Sub-tool navigation | ✅ In scope | - | Click to open specific tool |
| Popular badges | ✅ In scope | - | Highlight high-usage tools |
| Hero section | ✅ In scope | - | “Meet Violet” with feature grid |
| “Start Creating Together” | ✅ In scope | D-058 | Opens intent picker modal |
| Intent picker modal | ✅ In scope | D-058 | Guides to relevant toolkit feature |
| Conversation examples | ✅ In scope | - | Sample prompts shown |
| “Ask Violet” prompts | ✅ In scope | D-046, D-062 | Real AI via Claude API, 50/day limit |
| Daily prompt limit | ✅ In scope | D-062 | 50 prompts per day per artist |
| Full conversational AI chat | ⚠️ TBD | D-046 | Prompt-based assistance, not autonomous agent |
| **ANALYTICS & GROWTH** |  |  |  |
| Metrics cards (earnings, gigs, rating, fan reach) | ✅ In scope | D-008, D-070 | Daily updates, platform followers only |
| Daily batch updates | ✅ In scope | D-008 | Midnight UTC |
| Performance chart (monthly/yearly) | ✅ In scope | - | Bar chart with toggle |
| Peak values (revenue, gigs, fans) | ✅ In scope | - | Summary stats |
| Goals system | ✅ In scope | - | User-created goals with progress |
| “Set New Goal” | ✅ In scope | - | Button to create goal |
| Achievements | ✅ In scope | - | Earned and locked badges |
| Verified status banner | ✅ In scope | - | Verification display |
| Spotlight artists | ✅ In scope | D-068 | Random verified artists with >4.5 rating |
| Boost Your Growth actions | ✅ In scope | - | 3 action cards |
| Fan reach calculation | ✅ In scope | D-070 | Platform followers only |
| **BOOKING & PAYMENTS** |  |  |  |
| Book artist button | ✅ In scope | D-076 | Opens message composer with pre-filled inquiry |
| Apply to gig (single-click) | ✅ In scope | D-077 | Sends profile + rates automatically |
| Booking confirmations | ✅ In scope | D-079 | Email + SMS to both parties |
| Gig completion marking | ✅ In scope | D-080 | Either party can mark complete |
| **ACCOUNT SETTINGS** |  |  |  |
| Settings access | ✅ In scope | D-098 | Profile avatar dropdown → Settings |
| Credential changes | ✅ In scope | D-099 | Read-only (OAuth-based) |
| Account deletion | ✅ In scope | D-102 | Self-service automatic deletion |
| **LEGAL & COMPLIANCE** |  |  |  |
| Minimal compliance | ✅ In scope | D-103 | Terms + Privacy Policy only |
| Cookie disclosure | ✅ In scope | D-106 | Simple banner “This website uses cookies” |
| Full GDPR compliance | 🚫 **Deferred to post-MVP** | D-103 | Minimal for MVP |
| **BUSINESS MODEL** |  |  |  |
| Free forever | ✅ In scope | D-110 | No premium features |
| Premium/paid tiers | 🚫 **Never planned** | D-110 | Free forever model |
| Public roadmap | 🚫 **Not planned** | D-109 | No public roadmap |

---

## NAVIGATION & SITEMAP

*[Note: Updated from v1.0 with design decision outcomes]*

### Primary Navigation Structure

```
/ (Root)
├── /auth
│   └── / (Sign In / Sign Up Portal) [D-001: Apple/Google OAuth only]
│
├── /onboarding
│   ├── /role-selection (Begin Your Journey)
│   └── /artists (Artist Onboarding) [D-003: All steps required]
│       ├── /step1 (Identity & Basics) [D-004: No progress saved on exit]
│       ├── /step2 (Links & Your Story)
│       ├── /step3 (Creative Profile Tags)
│       ├── /step4 (Your Numbers)
│       └── /step5 (Quick Questions)
│
├── /dashboard (Main Dashboard) [D-008: Daily batch metrics at midnight UTC]
│   [D-011: Shows latest 3 gigs from marketplace]
│   [D-044: "Tools" navigation item in header]
│   [D-058: "Ask Violet" opens intent picker modal]
│
├── /marketplace
│   ├── /gigs (Find Gigs tab) [D-014: Random shuffle, D-017: Infinite scroll]
│   └── /artists (Discover Artists tab) [D-014: Random shuffle, D-017: Infinite scroll]
│
├── /artist
│   └── /[artist_id] (Artist Profile)
│       ├── ?tab=overview (default) [D-024: Inline track playback]
│       ├── ?tab=portfolio [D-026: No upload limit]
│       ├── ?tab=explore [D-028: Manual upload only]
│       ├── ?tab=journey [D-080: Gig completions appear here]
│       ├── ?tab=reviews [D-032: Email invitations, D-034: No moderation]
│       └── ?tab=opportunities [D-011: Latest 3 gigs]
│
├── /profile
│   ├── /view (View own profile - public view)
│   ├── /edit (Edit profile) [D-022: Separate route]
│   └── /endorsements (All endorsements)
│
├── /gig
│   └── /[gig_id] (Gig Detail) [D-077: Single-click apply]
│
├── /messages
│   ├── / (Messages & Collaboration) [D-043: 2000 char limit, D-087: No rate limits]
│   └── /[conversation_id] (Specific thread) [D-076: Pre-filled if from "Book Artist"]
│
├── /violet
│   ├── / (Violet's Toolkit) [D-058: Intent picker modal, D-062: 50 prompts/day]
│   ├── /gigs (Gigs & Bookings category)
│   │   ├── /find-venues (Find Perfect Venues)
│   │   ├── /negotiate (Negotiate Like a Pro)
│   │   └── /partnerships (Brand Partnerships)
│   ├── /creative-growth (Creative Growth category)
│   ├── /songwriting (Songwriting Journal)
│   ├── /content-strategy (Vinyl Content Strategy)
│   ├── /fan-engagement (Fan Engagement)
│   ├── /branding (Visual Branding)
│   ├── /challenges (Creative Challenges)
│   ├── /production (Music Production category)
│   ├── /networking (Networking & Collaboration category)
│   └── /career (Career Management category)
│
├── /growth (Growth & Analytics) [D-008: Daily batch, D-068: Random spotlight artists, D-070: Platform followers only]
│
├── /tools (Artist Toolbox) [D-044: Access via header "Tools"]
│   ├── /message-fans (Message Fans tool) [D-046: AI drafting via Claude, D-049: Text-only, D-062: Counts toward 50/day]
│   ├── /files (My Files tool) [D-026: No upload limit, 50GB quota, D-028: Manual only]
│   └── /studio (Creative Studio tool) [D-028: Manual upload only]
│       └── /entry/[entry_id] (Unified entry editor)
│
├── /settings (Account Settings) [D-098: Access via profile dropdown, D-099: Read-only credentials, D-102: Self-service deletion]
│
├── /track
│   └── /[track_id] (Track detail/player) [D-024: Inline playback preferred]
│
├── /post
│   └── /[post_id] (Media post detail) [D-028: Manual uploads only]
│
├── /terms (Terms of Service) [D-103: Minimal compliance]
├── /privacy (Privacy Policy) [D-103: Minimal compliance, D-106: Simple cookie disclosure]
│
└── /venue
    └── /[venue_id] (Venue profile - Coming Soon for MVP)
```

### Main Navigation Tabs (Header)

- **Dashboard** (default) [D-008: Daily metrics]
- **Discover** (Marketplace) [D-014: Random shuffle, D-017: Infinite scroll, D-071: Artists + Gigs search]
- **Messages** [D-043: 2000 char limit, D-087: No rate limits]
- **Violet** (AI Toolkit) [D-058: Intent picker, D-062: 50 prompts/day]
- **Growth** (Analytics) [D-068: Random spotlight, D-070: Platform followers only]
- **Tools** (Artist Toolbox) [D-044: New header navigation item]

### Top Right Header Elements

- **Search Icon:** [D-071: Global search - Artists + Gigs only]
- **Notification Bell:** Opens notification panel
- **Profile Avatar:** [D-098: Dropdown with “Settings” option]
- **“View My Profile” Button:** Navigates to /profile/view

### Footer Elements (Auth Screens)

- Terms of Service link [D-103: Minimal compliance]
- Privacy Policy link [D-103: Minimal compliance]
- [D-106: Cookie banner: “This website uses cookies” with “Okay” button]

---

## POST-MVP CONSIDERATIONS

This section documents features, enhancements, and technical debt that are explicitly deferred to post-MVP releases. These items were identified during scoping as valuable but not critical for the initial launch.

### Communication & Safety

**Spam & Abuse Prevention** *(D-088)*
- **Current State:** No spam/abuse prevention in MVP
- **Post-MVP Plan:**
- Implement flag-based reporting system (users report, CTO reviews)
- Add profanity filter for messages and reviews
- Implement rate limiting for messages (e.g., 10 messages/hour to unique recipients)
- Add shadow banning capability for repeat offenders
- Email/SMS abuse detection (monitor bounce rates, complaints)

**Review Moderation** *(D-034)*
- **Current State:** No review moderation in MVP
- **Post-MVP Plan:**
- Pre-publication review screening (automated + manual)
- Flag-based user reporting
- Admin dashboard for review moderation
- Appeal process for removed reviews
- Review quality scoring (helpful/not helpful votes)

**Broadcast Message Enhancements** *(D-049)*
- **Current State:** Text-only broadcasts in MVP
- **Post-MVP Plan:**
- Image attachments in email blasts
- File attachments (PDFs, audio clips)
- HTML email templates with rich formatting
- A/B testing for subject lines
- Open/click rate analytics
- Automatic resend to non-openers

### Content Management

**Social Media Integration** *(D-028)*
- **Current State:** Manual upload only in MVP
- **Post-MVP Plan:**
- Instagram content auto-sync (OAuth read access)
- TikTok content auto-sync
- YouTube video import
- Automatic cross-posting from Creative Studio to social media
- Social media analytics aggregation (follower growth, engagement rates)
- *(D-070: Once implemented, update “Fan Reach” to include social media followers)*

**File Management Enhancements**
- **Current State:** Basic upload/organize/download
- **Post-MVP Plan:**
- Thumbnail generation for videos (server-side)
- File versioning (track edits to images/documents)
- Trash/recycle bin (30-day retention before permanent deletion)
- Collaborative file sharing (invite others to view/edit folders)
- Public file links with expiration dates
- AI-powered file tagging and search (genre detection, scene recognition, OCR)

### Messaging & Collaboration

**Advanced Messaging Features**
- **Current State:** Basic text + file attachments
- **Post-MVP Plan:**
- Real-time WebSocket messaging (replace polling)
- Typing indicators
- Read receipts
- Message editing (within 5 minutes of sending)
- Message deletion (sender can delete within 1 hour)
- Voice messages (record + send)
- Video messages (record + send)
- Group conversations (multi-party threads)
- Two-way SMS replies (webhook handling for inbound SMS)

**Enhanced Communication**
- **Current State:** Basic email notifications
- **Post-MVP Plan:**
- Push notifications (web + mobile)
- Desktop notifications (browser)
- Digest emails (daily/weekly summary of activity)
- SMS notifications for critical events (booking confirmed, gig tomorrow)
- In-app notification center with history

### Search & Discovery

**Personalization & Matching**
- **Current State:** Random shuffle, manual filtering
- **Post-MVP Plan:**
- AI-powered gig matching (genre, location, availability, rates)
- Artist compatibility scoring (collaboration fit)
- Personalized “Recommended for You” sections
- Saved searches with notifications for new matches
- Search history and recent searches
- Advanced filters (equipment type, tour dates, rider requirements)

**Enhanced Search Features**
- **Current State:** Basic keyword search for Artists + Gigs
- **Post-MVP Plan:**
- Full-text search with typo tolerance
- Geolocation-based search (nearby artists/gigs)
- Venue search (when Venue user type launched)
- Track search (search by song title, lyrics, genre)
- Faceted search (filter by multiple criteria simultaneously)
- Search analytics (track popular searches, improve results)

### Violet AI Enhancements

**Conversational AI Expansion** *(D-046, D-062)*
- **Current State:** Prompt-based assistance with 50/day limit
- **Post-MVP Plan:**
- Full conversational memory across sessions
- Multi-step workflows (“First, let me check your calendar, then…”)
- Autonomous agent capabilities (book gigs on your behalf with approval)
- Voice interface for Violet (speak questions, hear responses)
- Personalized recommendations based on user behavior
- Proactive suggestions (“You haven’t posted in 3 weeks, want help creating content?”)
- Integration with external tools (Spotify, Ableton, Google Calendar)
- Unlimited prompts for verified artists (remove 50/day limit)

**Violet Analytics**
- **Current State:** Basic prompt counting
- **Post-MVP Plan:**
- Track most-used Violet features
- Measure Violet effectiveness (did recommendations lead to bookings?)
- User feedback on Violet responses (thumbs up/down)
- A/B testing for prompt templates

### Analytics & Insights

**Financial Features**
- **Current State:** User-reported earnings only
- **Post-MVP Plan:**
- P&L tracking (revenue - expenses)
- Revenue forecasting (predict next month’s earnings)
- ROI calculations (cost per gig, revenue per fan)
- Cash flow management (upcoming payments, outstanding invoices)
- Break-even calculators
- Tax document generation (1099 preparation)
- Integration with accounting software (QuickBooks, Xero)

**Advanced Analytics**
- **Current State:** Basic metrics (earnings, gigs, followers, rating)
- **Post-MVP Plan:**
- Funnel analysis (profile views → bookings → completions)
- Cohort analysis (track new artists over time)
- Year-over-year comparisons
- Benchmarking (compare your stats to similar artists)
- Geographic heatmaps (where your fans are)
- Engagement metrics (message response rate, booking conversion rate)
- Data export (CSV, PDF reports)
- Custom dashboards (choose which metrics to display)

### Booking & Payments

**Transactional Features**
- **Current State:** Message-based booking coordination
- **Post-MVP Plan:**
- In-platform booking confirmations with contracts
- Payment processing (deposits, final payments)
- Escrow service (hold payment until gig completed)
- Automatic invoicing (send invoice after gig)
- Refund handling (cancellation policies, dispute resolution)
- Integration with Stripe/PayPal
- Tiered commission structure (free booking, platform takes % of payment)

**Advanced Booking Features**
- **Current State:** Single-click apply sends profile + rates
- **Post-MVP Plan:**
- Calendar integration (sync gigs to Google/Apple Calendar)
- Availability calendar (block off unavailable dates)
- Rider management (upload technical riders, hospitality requirements)
- Contract templates (customizable booking agreements)
- Multi-gig booking (book artist for multiple dates at once)
- Booking pipeline tracking (applied → under review → confirmed → completed)
- Automated booking reminders (24 hours before gig)

### Legal & Compliance

**GDPR/CCPA Full Compliance** *(D-103)*
- **Current State:** Minimal compliance (Terms + Privacy Policy)
- **Post-MVP Plan:**
- Full GDPR compliance for EU expansion
- CCPA compliance for California users
- Cookie consent management (granular opt-in/opt-out)
- Data export (download all user data in machine-readable format)
- Data portability (transfer data to another platform)
- Right to be forgotten (full data deletion within 30 days)
- Data processing agreements (for third-party services)
- Privacy audit logs (track who accessed user data)
- Dedicated Data Protection Officer (DPO)

**Audit & Compliance Features**
- **Current State:** Basic activity logging
- **Post-MVP Plan:**
- Comprehensive audit logs (track all user actions)
- Compliance dashboard (monitor TCPA/CAN-SPAM/GDPR adherence)
- Automated compliance checks (flag potential violations)
- Age verification (ensure users are 18+)
- Content moderation tools (flag inappropriate content)
- Transparency reports (publish quarterly reports on takedowns, data requests)

### User Management

**Multi-Role Support**
- **Current State:** Artist role only
- **Post-MVP Plan:**
- Venue user type (full onboarding and dashboard)
- Fan user type (discover artists, follow, attend events)
- Collective user type (manage artist collectives)
- Multi-role accounts (user can be both Artist and Venue)
- Role switching UI (toggle between roles)
- Separate dashboards per role

**Team & Collaboration**
- **Current State:** Individual artist accounts only
- **Post-MVP Plan:**
- Team accounts (band members share one profile)
- Role-based permissions (manager can book, bandmate can edit profile)
- Manager/agent accounts (manage multiple artists)
- Delegated access (grant temporary access to collaborators)
- Activity logs (see who made which changes)

### Mobile Experience

**Native Mobile Apps**
- **Current State:** Responsive web app
- **Post-MVP Plan:**
- Native iOS app
- Native Android app
- Push notifications (mobile-specific)
- Offline mode (cache data for viewing without internet)
- Mobile-optimized file uploads (compress before upload)
- Camera integration (take photos directly from app)
- Mobile payment integration (Apple Pay, Google Pay)

### Platform Monetization

**Revenue Streams** *(Note: D-110 says “Free forever” but future revenue still needed)*
- **Current State:** Free for all users
- **Post-MVP Plan:**
- Commission on bookings (platform takes 5-10% of gig payment)
- Venue listing fees (venues pay to post premium gigs)
- Featured artist placements (pay to appear at top of search)
- Extended storage tiers (50GB free, pay for 100GB, 500GB, 1TB)
- Violet AI unlimited usage tier (pay for unlimited prompts)
- White-label licensing (sell platform to other industries)

### Technical Debt & Infrastructure

**Performance & Scalability**
- **Current State:** Daily batch metrics, polling for messages
- **Post-MVP Plan:**
- Real-time metrics updates (WebSocket)
- Caching strategy optimization (Redis for hot data)
- Database query optimization (add missing indexes)
- CDN optimization (edge caching for media files)
- Load testing and performance benchmarking
- Horizontal scaling (add more Workers/D1 instances)
- Database sharding (split data across multiple instances)

**Observability & Monitoring**
- **Current State:** Basic Cloudflare Analytics + console logs
- **Post-MVP Plan:**
- Distributed tracing (track requests across services)
- Application Performance Monitoring (APM) with Datadog/New Relic
- Custom metrics dashboard (business KPIs)
- Alerting system (PagerDuty/Opsgenie for critical errors)
- Log aggregation (centralized logging with ELK stack)
- User session recording (Fullstory, LogRocket)
- Error tracking with context (Sentry with user info)

**Developer Experience**
- **Current State:** Basic CI/CD with GitHub Actions
- **Post-MVP Plan:**
- Automated E2E testing (Playwright for critical flows)
- Visual regression testing (catch UI bugs)
- Staging environment (separate from production)
- Preview deployments (every PR gets a unique URL)
- Feature flags (toggle features without deploying)
- A/B testing framework (test variations of features)
- Developer documentation (API docs, architecture guides)
- Component library Storybook (document UI components)

### User Experience Enhancements

**Personalization**
- **Current State:** Static experience for all users
- **Post-MVP Plan:**
- Customizable dashboard (rearrange widgets)
- Saved filters (save common search filters)
- Preferred genres (auto-filter marketplace by preference)
- Notification preferences (granular control over alerts)
- Theme customization (dark mode, color schemes)
- Accessibility improvements (screen reader optimization, keyboard navigation)

**Gamification**
- **Current State:** Basic achievements
- **Post-MVP Plan:**
- Leaderboards (top earners, most booked, highest rated)
- Badges for milestones (100 gigs, 1000 followers, etc.)
- Challenges (complete X gigs this month for badge)
- Referral program (invite friends, earn rewards)
- Loyalty program (points for platform activity)

### Documentation & Support

**User Support**
- **Current State:** Minimal (Terms + Privacy Policy)
- **Post-MVP Plan:**
- Help center (FAQ, tutorials, video guides)
- In-app chat support (live chat with support team)
- Community forum (artists help each other)
- Onboarding tutorials (interactive walkthroughs)
- Email support ticketing system
- Phone support (premium tier)

**Developer Documentation**
- **Current State:** Basic README files
- **Post-MVP Plan:**
- API documentation (public API for integrations)
- Webhook documentation (for third-party integrations)
- SDK/client libraries (JavaScript, Python, Ruby)
- Integration guides (how to integrate with Spotify, Stripe, etc.)
- Changelog (public log of all platform changes)

---

### Summary of Post-MVP Items

**Total Deferred Features:** 80+

**By Category:**
- Communication & Safety: 15 features
- Content Management: 12 features
- Messaging & Collaboration: 14 features
- Search & Discovery: 10 features
- Violet AI: 10 features
- Analytics & Insights: 12 features
- Booking & Payments: 10 features
- Legal & Compliance: 8 features
- User Management: 7 features
- Mobile Experience: 7 features
- Platform Monetization: 6 features
- Technical Debt: 12 features
- UX Enhancements: 8 features
- Documentation & Support: 7 features

**Priority Levels for Post-MVP:**
- **P1 (Next Release - v1.1):** Social media integration, enhanced messaging, spam prevention, review moderation
- **P2 (Within 6 Months):** Payment processing, venue/fan user types, Violet AI enhancements, GDPR compliance
- **P3 (Within 1 Year):** Native mobile apps, advanced analytics, multi-role accounts, monetization features

---

## FINAL NOTES

### MVP Priorities (From Founder Decisions v2.0)

**Maximize Artist Flow:**
- Artist onboarding (5 steps required, no progress saved)
- Artist profile creation (6-tab system with inline playback)
- Artist dashboard (daily batch metrics at midnight UTC)
- Artist tools: Message Fans (text-only, AI drafting), My Files (unlimited uploads), Creative Studio (manual upload only)

**Authentication:**
- Apple OAuth only
- Google OAuth only
- Email/password **removed entirely**

**Communication:**
- SMS delivery (Twilio - outbound blast + booking confirmations)
- Email delivery (Resend - outbound blast + booking confirmations + platform notifications)
- In-app messaging (2000 char limit, no rate limits, no spam prevention)

**Simplified Dashboard:**
- Daily batch metrics at midnight UTC
- Latest 3 gigs from marketplace (non-personalized)
- No financial forecasting tools whatsoever

**File Management:**
- Unlimited uploads (constrained by 50GB quota)
- Manual upload only (no AI analysis, no social media import)
- Organize by type (audio, video, image, document) and manual folders

**No Matching Algorithm:**
- Random shuffle for marketplace listings
- Manual search and filtering only
- No AI-powered recommendations or compatibility scoring

**No Advanced Notifications:**
- Email notifications sufficient
- No push notifications
- SMS for booking confirmations only

**Minimal Compliance:**
- Terms of Service + Privacy Policy pages
- Simple cookie disclosure banner
- No GDPR-specific features

**Free Forever:**
- No premium features or paid tiers
- No public roadmap

**Coming Soon (Visible but Not Functional):**
- Fan user type
- Venue user type
- Collective user type

---

### Implementation Guidance v2.0

**Violet AI Clarification:**
- Violet exists as toolkit navigation system (10 categories, 30+ sub-tools)
- “Ask Violet to Draft” uses Claude API with prompt templates (real AI generation)
- “Start Creating Together” opens intent picker modal (guides to relevant toolkit feature)
- Usage limit: 50 prompts per day per artist
- Focus on prompt-based assistance, not autonomous agent behavior
- Conversational AI depth to be expanded post-MVP

**Metrics Dashboard:**
- Daily batch updates at midnight UTC (all metrics)
- Shows basic counts and trends
- Does NOT include financial forecasting, ROI predictions, or profit margin analysis
- Earnings are user-reported or calculated from completed gigs (not automated accounting)
- Fan Reach = platform followers only (no social media aggregation)

**Marketplace Discovery:**
- Random shuffle for default sort order (encourages exploration)
- Infinite scroll for listings (no pagination controls)
- Search and filter functionality only (genre, location, date, price)
- NO algorithmic matching, compatibility scoring, or “Recommended for you”
- Urgency badges are rule-based: gigs within 7 days with <50% capacity filled
- Latest 3 gigs shown on dashboard (non-personalized)

**File Storage:**
- Unlimited uploads (constrained by 50GB quota per artist)
- Basic upload, organize, download functionality
- No AI analysis, auto-categorization, or genre detection
- No social media content import in MVP
- Files organized by type (image/audio/video/document) and manual folders

**Communication:**
- **SMS:** Outbound only (blast to fans + booking confirmations via Twilio), no two-way replies
- **Email:** Outbound blast + booking confirmations + platform notifications (via Resend)
- **In-app messaging:** Text with file attachments, 2000 character limit, no rate limits, polling acceptable (no WebSocket required)
- **Broadcast messages:** Text-only in MVP (no images or attachments)

**Booking Flows:**
- “Book Artist” opens message composer with pre-filled booking inquiry template
- “Apply to Gig” is single-click: sends profile + rates automatically to venue
- Booking confirmations: Email + SMS sent to both artist and venue
- Gig completion: Either party can mark complete (generates timeline event)

**Reviews:**
- Artists can invite anyone via email to leave review (no restriction to verified bookings)
- No review moderation in MVP (reviews appear immediately)
- Flagging system or moderation deferred to post-MVP

**Account Management:**
- Settings access: Profile avatar dropdown → Settings
- Credentials read-only: Email and auth tied to OAuth provider (Apple/Google)
- Account deletion: Self-service automatic deletion (immediate, no grace period)

**Legal Compliance:**
- Minimal compliance for MVP: Terms of Service + Privacy Policy pages
- Simple cookie disclosure: “This website uses cookies” with “Okay” button
- Full GDPR compliance deferred to post-MVP (before EU expansion)

---

### Data Integrity v2.0

**User-Reported Data:**
- Largest show capacity (onboarding step 4)
- Flat rate and hourly rate (onboarding step 4)
- Earnings (from completed gigs, self-reported or entered manually)

**System-Calculated Data:**
- Profile completion percentage (based on filled fields)
- Gig count (from completed gigs in system)
- Average rating (from venue/collaborator reviews)
- Follower count (platform followers only - no social media aggregation)
- Track count (from uploaded tracks - no limit)
- File count (from uploaded files - no limit)
- Storage used (from file sizes - max 50GB)
- Daily batch updates at midnight UTC

**Third-Party Data:**
- OAuth provider user data (name, email from Apple/Google)
- *(Post-MVP: Social media follower counts, streaming stats)*

---

### Security & Privacy v2.0

**Authentication:**
- OAuth providers handle secure authentication (Apple, Google only)
- Cloudflare Access JWT validation server-side
- Session management with expiry (KV or Durable Objects)
- No password storage (OAuth only)

**Data Access:**
- Artists can only view/edit their own data
- Public profiles visible to all users
- Private data (earnings, contact lists, draft messages, files) only accessible to owner

**Compliance:**
- Opt-in required for contact lists (SMS/email)
- Unsubscribe mechanism in all emails
- STOP/HELP handling for SMS
- Terms of Service and Privacy Policy pages
- Simple cookie disclosure
- Account deletion: immediate, removes all data

---

## DOCUMENT VERSION CONTROL

**Version:** 2.0

**Last Updated:** [Date]

**Prepared By:** [Name]

**Approved By:** [Founder Name]

**Change Log:**
- v1.0: Initial consolidated specification from Figma analysis and founder conversations
- v2.0: Finalized all P0 design decisions (45 decisions documented), added POST-MVP CONSIDERATIONS section with 80+ deferred features, updated all flows and screens to reflect decisions, removed email/password auth entirely, clarified Violet AI scope, updated metrics strategy, refined booking/application flows, documented business model (free forever)

---

**END OF CONSOLIDATED ENGINEERING SPECIFICATION v2.0**