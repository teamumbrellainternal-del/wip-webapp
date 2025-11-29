# API Contract - Umbrella MVP

**Version:** 1.0
**Last Updated:** 2025-11-15
**Status:** Ready for Development

---

## Overview

This document defines the complete API contract for the Umbrella MVP, covering all 50+ endpoints across authentication, profiles, marketplace, messaging, tools, analytics, and AI features. This contract serves as the **single source of truth** for both frontend and backend teams during parallel development.

### Base Configuration

- **Base URL:** `https://api.umbrella.app`
- **API Version:** `/v1/`
- **Authentication:** Clerk JWT tokens (via `Authorization: Bearer <token>` header)
- **Content Type:** `application/json`

### Authentication Flow

The API uses **Clerk** for authentication with Apple/Google OAuth:

1. Frontend initiates OAuth flow via Clerk SDK
2. Clerk handles OAuth callback and creates user session
3. Frontend receives Clerk session token
4. All API requests include token in `Authorization` header
5. Backend validates token via Clerk webhook and session middleware

---

## Common Patterns

### Request Headers

```http
Authorization: Bearer <clerk_session_token>
Content-Type: application/json
```

### Success Response Format

```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "field_name",
      "issue": "Specific validation issue"
    }
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|------------|-----------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters or body |
| 401 | `UNAUTHORIZED` | Invalid or missing authentication token |
| 403 | `FORBIDDEN` | Authenticated but insufficient permissions |
| 404 | `NOT_FOUND` | Requested resource does not exist |
| 409 | `CONFLICT` | Request conflicts with current resource state |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests (Violet AI only) |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | External service unavailable |

---

## 1. Authentication Endpoints

### POST /v1/auth/webhook

**Description:** Clerk webhook handler - creates/updates user when Clerk events occur

**Authentication:** Webhook signature verification (Svix headers)

**Request Headers:**
```http
svix-id: <webhook_id>
svix-timestamp: <timestamp>
svix-signature: <signature>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "user.created" | "user.updated" | "user.deleted",
  "data": {
    "id": "clerk_user_id",
    "email_addresses": [
      {
        "email_address": "artist@example.com"
      }
    ],
    "external_accounts": [
      {
        "provider": "oauth_apple" | "oauth_google",
        "id": "provider_user_id"
      }
    ]
  }
}
```

**Response (200):**
```json
{
  "data": {
    "message": "User created successfully",
    "userId": "uuid_v4"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` - Missing webhook headers or invalid signature
- `500 INTERNAL_ERROR` - Database error

---

### GET /v1/auth/session

**Description:** Check current session validity and get user info

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "uuid_v4",
      "clerk_id": "clerk_user_id",
      "oauth_provider": "apple" | "google",
      "oauth_id": "provider_user_id",
      "email": "artist@example.com",
      "onboarding_complete": true,
      "created_at": "2025-11-15T12:00:00Z",
      "updated_at": "2025-11-15T12:00:00Z"
    },
    "valid": true
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `401 UNAUTHORIZED` - Invalid or expired token
- `404 NOT_FOUND` - User not found in database

---

### POST /v1/auth/logout

**Description:** Clear user session

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** This endpoint always returns success (idempotent)

---

### POST /v1/auth/refresh

**Description:** Refresh session token

**Authentication:** Required (Bearer token)

**Request Headers:**
```http
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "token": "new_jwt_token",
    "expires_at": "2025-11-22T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `401 UNAUTHORIZED` - Invalid or expired token
- `404 NOT_FOUND` - User not found

---

## 2. Onboarding Endpoints

### POST /v1/onboarding/artists/step1

**Description:** Submit Step 1 - Identity & Basics

**Authentication:** Required

**Request Body:**
```json
{
  "legal_name": "John Smith",
  "stage_name": "DJ Johnny",
  "location_city": "San Francisco",
  "location_state": "CA",
  "location_zip": "94102",
  "phone": "+14155551234",
  "influences": ["Daft Punk", "Deadmau5"],
  "primary_genre": "electronic",
  "secondary_genres": ["house", "techno"]
}
```

**Validation Rules:**
- `stage_name`: Required, 1-100 characters
- `location_city`: Required
- `location_state`: Required, 2-letter state code
- `location_zip`: Required, 5-digit ZIP
- `phone`: Required, E.164 format
- `primary_genre`: Required
- `influences`: Optional array

**Response (200):**
```json
{
  "data": {
    "step": 1,
    "completed": true,
    "next_step": "/onboarding/artists/step2"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` - Invalid or missing required fields
- `409 CONFLICT` - Step 1 already completed (allow re-submission)

---

### POST /v1/onboarding/artists/step2

**Description:** Submit Step 2 - Links & Story

**Authentication:** Required

**Request Body:**
```json
{
  "social_links": {
    "instagram": "https://instagram.com/djjohnny",
    "spotify": "https://open.spotify.com/artist/...",
    "youtube": "https://youtube.com/@djjohnny"
  },
  "story_outsource_tasks": "Booking, social media management",
  "story_unique_sound": "Blend of French house and modern techno",
  "story_dream_venue": "Red Rocks Amphitheatre",
  "story_inspiration": "The energy of live crowds",
  "story_creative_time": "Late night, 10pm-2am",
  "story_pain_point": "Finding fair-paying gigs"
}
```

**Validation Rules:**
- `social_links`: Required, minimum 3 platforms
- All story fields: Optional but encouraged, max 500 characters each

**Response (200):**
```json
{
  "data": {
    "step": 2,
    "completed": true,
    "next_step": "/onboarding/artists/step3"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/onboarding/artists/step3

**Description:** Submit Step 3 - Creative Profile Tags

**Authentication:** Required

**Request Body:**
```json
{
  "artist_type": ["dj", "producer"],
  "equipment": ["Pioneer CDJ-3000", "Allen & Heath mixer"],
  "daw": "Ableton Live",
  "platforms_used": ["Spotify", "SoundCloud", "Bandcamp"],
  "subscriptions": ["Splice", "LANDR"],
  "struggles": ["marketing", "time_management"]
}
```

**Response (200):**
```json
{
  "data": {
    "step": 3,
    "completed": true,
    "next_step": "/onboarding/artists/step4"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/onboarding/artists/step4

**Description:** Submit Step 4 - Your Numbers

**Authentication:** Required

**Request Body:**
```json
{
  "largest_show_capacity": 500,
  "flat_rate": 1500.00,
  "hourly_rate": 200.00,
  "time_split_creative": 70,
  "time_split_logistics": 30,
  "available_dates": ["2025-12-01", "2025-12-15", "2026-01-05"]
}
```

**Validation Rules:**
- `largest_show_capacity`: Required, positive integer
- `flat_rate`: Required, positive number
- `hourly_rate`: Required, positive number
- `time_split_creative` + `time_split_logistics`: Must equal 100
- `available_dates`: Optional, max 3 dates, ISO 8601 format

**Response (200):**
```json
{
  "data": {
    "step": 4,
    "completed": true,
    "next_step": "/onboarding/artists/step5"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/onboarding/artists/step5

**Description:** Submit Step 5 - Quick Questions (Final step)

**Authentication:** Required

**Request Body:**
```json
{
  "currently_making_music": true,
  "confident_online_presence": false,
  "struggle_finding_niche": true,
  "know_where_find_gigs": false,
  "paid_fairly": false,
  "understand_royalties": true
}
```

**Response (201):**
```json
{
  "data": {
    "step": 5,
    "completed": true,
    "onboarding_complete": true,
    "redirect_url": "/dashboard",
    "artist_id": "uuid_v4"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** This endpoint marks `users.onboarding_complete = true` and creates artist profile

---

### GET /v1/onboarding/artists/review

**Description:** Get all onboarding data for review before final submission

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "step1": { /* step 1 data */ },
    "step2": { /* step 2 data */ },
    "step3": { /* step 3 data */ },
    "step4": { /* step 4 data */ },
    "step5": { /* step 5 data */ },
    "progress": {
      "steps_completed": 5,
      "total_steps": 5,
      "percentage": 100
    }
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 3. Artist Profile Endpoints

### GET /v1/artists/:artistId

**Description:** Get public artist profile (6-tab system)

**Authentication:** Optional (public endpoint, enhanced data if authenticated)

**Path Parameters:**
- `artistId`: Artist UUID

**Response (200):**
```json
{
  "data": {
    "id": "uuid_v4",
    "user_id": "uuid_v4",
    "stage_name": "DJ Johnny",
    "legal_name": "John Smith",
    "pronouns": "he/him",
    "bio": "Electronic music producer and DJ...",
    "tagline": "Bringing the French touch to modern techno",
    "location_city": "San Francisco",
    "location_state": "CA",
    "location_zip": "94102",
    "verified": true,
    "primary_genre": "electronic",
    "secondary_genres": ["house", "techno"],
    "influences": ["Daft Punk", "Deadmau5"],
    "social_links": {
      "instagram": "https://instagram.com/djjohnny",
      "spotify": "https://open.spotify.com/artist/...",
      "website": "https://djjohnny.com"
    },
    "metrics": {
      "avg_rating": 4.8,
      "total_reviews": 42,
      "total_gigs": 156,
      "followers": 3843,
      "profile_views": 12450
    },
    "rates": {
      "flat_rate": 1500.00,
      "hourly_rate": 200.00,
      "travel_radius_miles": 50
    },
    "availability": {
      "booking_lead_time_days": 14,
      "available_dates": ["2025-12-01", "2025-12-15"]
    },
    "created_at": "2025-01-15T12:00:00Z",
    "updated_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `404 NOT_FOUND` - Artist not found

---

### PUT /v1/artists/:artistId

**Description:** Update own artist profile

**Authentication:** Required (must be profile owner)

**Path Parameters:**
- `artistId`: Artist UUID

**Request Body:** (All fields optional, partial update supported)
```json
{
  "bio": "Updated bio text...",
  "tagline": "New tagline",
  "flat_rate": 1800.00,
  "hourly_rate": 250.00,
  "social_links": {
    "instagram": "https://instagram.com/djjohnny"
  },
  "available_dates": ["2025-12-01", "2025-12-15", "2026-01-05"]
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid_v4",
    "updated_fields": ["bio", "tagline", "flat_rate"],
    "updated_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `403 FORBIDDEN` - Not profile owner
- `404 NOT_FOUND` - Artist not found
- `400 VALIDATION_ERROR` - Invalid field values

---

### POST /v1/artists/:artistId/tracks

**Description:** Add new track to portfolio

**Authentication:** Required (must be profile owner)

**Request Body:**
```json
{
  "title": "Summer Nights",
  "genre": "house",
  "duration_seconds": 245,
  "file_url": "r2://tracks/artist123/track456.mp3",
  "cover_art_url": "r2://tracks/artist123/cover456.jpg",
  "spotify_url": "https://open.spotify.com/track/...",
  "apple_music_url": "https://music.apple.com/...",
  "soundcloud_url": "https://soundcloud.com/...",
  "display_order": 1
}
```

**Validation Rules:**
- `title`: Required, 1-200 characters
- `duration_seconds`: Required, positive integer
- `file_url`: Required, must be valid R2 URL
- No limit on track count (constrained by 50GB storage quota)

**Response (201):**
```json
{
  "data": {
    "id": "uuid_v4",
    "artist_id": "uuid_v4",
    "title": "Summer Nights",
    "file_url": "r2://tracks/artist123/track456.mp3",
    "play_count": 0,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `403 FORBIDDEN` - Not profile owner
- `413 PAYLOAD_TOO_LARGE` - Storage quota exceeded

---

### GET /v1/artists/:artistId/tracks

**Description:** Get all tracks for artist

**Authentication:** Optional

**Query Parameters:**
- `limit`: Optional, default 50
- `offset`: Optional, default 0

**Response (200):**
```json
{
  "data": {
    "tracks": [
      {
        "id": "uuid_v4",
        "title": "Summer Nights",
        "genre": "house",
        "duration_seconds": 245,
        "file_url": "r2://tracks/artist123/track456.mp3",
        "cover_art_url": "r2://tracks/artist123/cover456.jpg",
        "play_count": 1247,
        "display_order": 1,
        "created_at": "2025-11-15T12:00:00Z"
      }
    ],
    "total": 12,
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/artists/:artistId/reviews

**Description:** Invite someone to leave a review (via email)

**Authentication:** Required (must be profile owner)

**Request Body:**
```json
{
  "reviewer_email": "fan@example.com",
  "reviewer_name": "Jane Doe",
  "gig_id": "uuid_v4",
  "message": "Thanks for coming to my show! Would love to hear your feedback."
}
```

**Response (201):**
```json
{
  "data": {
    "invite_token": "random_token",
    "reviewer_email": "fan@example.com",
    "review_url": "https://umbrella.app/review/random_token",
    "expires_at": "2025-12-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Sends email with review link to `reviewer_email`

---

### GET /v1/artists/:artistId/reviews

**Description:** Get all reviews for artist

**Authentication:** Optional

**Query Parameters:**
- `limit`: Optional, default 50
- `offset`: Optional, default 0
- `min_rating`: Optional, filter by minimum rating (1-5)

**Response (200):**
```json
{
  "data": {
    "reviews": [
      {
        "id": "uuid_v4",
        "artist_id": "uuid_v4",
        "reviewer_name": "Jane Doe",
        "reviewer_email": "fan@example.com",
        "rating": 5,
        "comment": "Amazing performance! Great energy.",
        "gig_id": "uuid_v4",
        "created_at": "2025-11-15T12:00:00Z"
      }
    ],
    "statistics": {
      "total": 42,
      "average_rating": 4.8,
      "rating_distribution": {
        "5": 30,
        "4": 10,
        "3": 2,
        "2": 0,
        "1": 0
      }
    },
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/artists/:artistId/follow

**Description:** Follow an artist

**Authentication:** Required

**Response (201):**
```json
{
  "data": {
    "artist_id": "uuid_v4",
    "follower_user_id": "uuid_v4",
    "following": true,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `409 CONFLICT` - Already following this artist

---

### DELETE /v1/artists/:artistId/follow

**Description:** Unfollow an artist

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "artist_id": "uuid_v4",
    "follower_user_id": "uuid_v4",
    "following": false
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 4. Marketplace Endpoints

### GET /v1/gigs

**Description:** List and filter gigs

**Authentication:** Optional (enhanced results if authenticated)

**Query Parameters:**
- `genre`: Optional, filter by genre
- `location_city`: Optional
- `location_state`: Optional
- `date_from`: Optional, ISO 8601 date
- `date_to`: Optional, ISO 8601 date
- `min_payment`: Optional, minimum payment amount
- `max_payment`: Optional, maximum payment amount
- `urgent_only`: Optional, boolean (gigs within 7 days, <50% filled)
- `limit`: Optional, default 20
- `offset`: Optional, default 0
- `sort`: Optional, default "random" (random shuffle for exploration)

**Response (200):**
```json
{
  "data": {
    "gigs": [
      {
        "id": "uuid_v4",
        "venue_id": "uuid_v4",
        "venue_name": "The Fillmore",
        "title": "Electronic Night",
        "description": "Weekly electronic music showcase",
        "date": "2025-12-15",
        "start_time": "21:00",
        "end_time": "02:00",
        "location_city": "San Francisco",
        "location_state": "CA",
        "location_address": "1805 Geary Blvd",
        "location_zip": "94115",
        "genre": "electronic",
        "payment_amount": 1500.00,
        "payment_type": "flat",
        "capacity_total": 10,
        "capacity_filled": 3,
        "urgency_flag": false,
        "status": "open",
        "created_at": "2025-11-01T12:00:00Z"
      }
    ],
    "total": 156,
    "limit": 20,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Default sort is random shuffle (D-014) to encourage exploration

---

### GET /v1/gigs/:gigId

**Description:** Get single gig details

**Authentication:** Optional

**Path Parameters:**
- `gigId`: Gig UUID

**Response (200):**
```json
{
  "data": {
    "id": "uuid_v4",
    "venue_id": "uuid_v4",
    "venue_name": "The Fillmore",
    "venue_rating": 4.7,
    "venue_review_count": 89,
    "title": "Electronic Night",
    "description": "Weekly electronic music showcase featuring local and touring DJs",
    "date": "2025-12-15",
    "start_time": "21:00",
    "end_time": "02:00",
    "location_city": "San Francisco",
    "location_state": "CA",
    "location_address": "1805 Geary Blvd",
    "location_zip": "94115",
    "genre": "electronic",
    "payment_amount": 1500.00,
    "payment_type": "flat",
    "capacity_total": 10,
    "capacity_filled": 3,
    "urgency_flag": false,
    "status": "open",
    "requirements": "Must provide own equipment, 45-60 minute set",
    "application_count": 12,
    "created_at": "2025-11-01T12:00:00Z",
    "updated_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `404 NOT_FOUND` - Gig not found

---

### POST /v1/gigs/:gigId/apply

**Description:** Apply to gig (single-click, sends profile + rates)

**Authentication:** Required

**Path Parameters:**
- `gigId`: Gig UUID

**Request Body:** (Optional additional message)
```json
{
  "message": "I'd love to play this gig! I have experience with similar events..."
}
```

**Response (201):**
```json
{
  "data": {
    "application_id": "uuid_v4",
    "gig_id": "uuid_v4",
    "artist_id": "uuid_v4",
    "status": "pending",
    "message": "I'd love to play this gig!...",
    "applied_at": "2025-11-15T12:00:00Z",
    "confirmation_sent": {
      "email": true,
      "sms": true
    }
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Automatically sends email + SMS to both artist and venue (D-079)

**Errors:**
- `403 FORBIDDEN` - Artist has not completed onboarding
- `409 CONFLICT` - Already applied to this gig
- `404 NOT_FOUND` - Gig not found or no longer open

---

### POST /v1/gigs/:gigId/favorite

**Description:** Favorite/save a gig for later

**Authentication:** Required

**Response (201):**
```json
{
  "data": {
    "gig_id": "uuid_v4",
    "artist_id": "uuid_v4",
    "favorited": true,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### DELETE /v1/gigs/:gigId/favorite

**Description:** Unfavorite a gig

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "gig_id": "uuid_v4",
    "artist_id": "uuid_v4",
    "favorited": false
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### GET /v1/artists/discover

**Description:** Browse and discover other artists

**Authentication:** Optional

**Query Parameters:**
- `genre`: Optional, filter by primary genre
- `location_city`: Optional
- `location_state`: Optional
- `verified_only`: Optional, boolean
- `available_now`: Optional, boolean (has available dates)
- `limit`: Optional, default 20
- `offset`: Optional, default 0
- `sort`: Optional, default "random"

**Response (200):**
```json
{
  "data": {
    "artists": [
      {
        "id": "uuid_v4",
        "stage_name": "DJ Johnny",
        "verified": true,
        "primary_genre": "electronic",
        "location_city": "San Francisco",
        "location_state": "CA",
        "bio_preview": "Electronic music producer and DJ...",
        "avg_rating": 4.8,
        "total_gigs": 156,
        "followers": 3843,
        "flat_rate": 1500.00,
        "hourly_rate": 200.00,
        "available_dates": ["2025-12-01", "2025-12-15"]
      }
    ],
    "total": 423,
    "limit": 20,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 5. Messaging Endpoints

### GET /v1/conversations

**Description:** List all conversations (polling every 5 seconds)

**Authentication:** Required

**Query Parameters:**
- `unread_only`: Optional, boolean
- `limit`: Optional, default 50
- `offset`: Optional, default 0

**Response (200):**
```json
{
  "data": {
    "conversations": [
      {
        "id": "uuid_v4",
        "participant_1_id": "uuid_v4",
        "participant_2_id": "uuid_v4",
        "other_user": {
          "id": "uuid_v4",
          "name": "Jane Doe",
          "avatar_url": "r2://avatars/user123.jpg"
        },
        "last_message_preview": "Thanks for reaching out!",
        "last_message_at": "2025-11-15T11:45:00Z",
        "unread_count_self": 2,
        "created_at": "2025-11-10T12:00:00Z"
      }
    ],
    "total": 15,
    "unread_total": 3
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Frontend should poll this endpoint every 5 seconds for new messages

---

### GET /v1/conversations/:convId

**Description:** Get conversation thread with all messages

**Authentication:** Required (must be participant)

**Path Parameters:**
- `convId`: Conversation UUID

**Query Parameters:**
- `limit`: Optional, default 100
- `offset`: Optional, default 0
- `since`: Optional, ISO 8601 timestamp (only get messages after this time)

**Response (200):**
```json
{
  "data": {
    "conversation": {
      "id": "uuid_v4",
      "participant_1_id": "uuid_v4",
      "participant_2_id": "uuid_v4",
      "created_at": "2025-11-10T12:00:00Z"
    },
    "messages": [
      {
        "id": "uuid_v4",
        "conversation_id": "uuid_v4",
        "sender_id": "uuid_v4",
        "sender_name": "DJ Johnny",
        "content": "Hey! Are you available for a booking on Dec 15?",
        "attachment_url": null,
        "attachment_filename": null,
        "read": true,
        "created_at": "2025-11-15T11:30:00Z"
      },
      {
        "id": "uuid_v4",
        "conversation_id": "uuid_v4",
        "sender_id": "uuid_v4",
        "sender_name": "Jane Doe",
        "content": "Thanks for reaching out! Yes, I'm available. Let's discuss details.",
        "attachment_url": "r2://attachments/conv123/contract.pdf",
        "attachment_filename": "contract.pdf",
        "attachment_size": 245678,
        "read": false,
        "created_at": "2025-11-15T11:45:00Z"
      }
    ],
    "total": 12,
    "limit": 100,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `403 FORBIDDEN` - Not a participant in this conversation
- `404 NOT_FOUND` - Conversation not found

---

### POST /v1/conversations

**Description:** Create new conversation (or return existing)

**Authentication:** Required

**Request Body:**
```json
{
  "participant_id": "uuid_v4",
  "initial_message": "Hi! I'd like to book you for a gig..."
}
```

**Response (201):**
```json
{
  "data": {
    "conversation_id": "uuid_v4",
    "participant_1_id": "uuid_v4",
    "participant_2_id": "uuid_v4",
    "created": true,
    "message_sent": true,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** If conversation already exists, returns existing conversation and sends message

---

### POST /v1/conversations/:convId/messages

**Description:** Send message in conversation

**Authentication:** Required (must be participant)

**Request Body:**
```json
{
  "content": "Sounds good! Here's the contract for review.",
  "attachment_url": "r2://attachments/conv123/contract.pdf",
  "attachment_filename": "contract.pdf",
  "attachment_size": 245678
}
```

**Validation Rules:**
- `content`: Required, 1-2000 characters (D-043)
- `attachment_url`: Optional, must be valid R2 URL
- Total message size (content + attachment): Max 50MB

**Response (201):**
```json
{
  "data": {
    "message_id": "uuid_v4",
    "conversation_id": "uuid_v4",
    "sender_id": "uuid_v4",
    "content": "Sounds good! Here's the contract for review.",
    "attachment_url": "r2://attachments/conv123/contract.pdf",
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `400 VALIDATION_ERROR` - Message exceeds 2000 characters or attachment too large
- `403 FORBIDDEN` - Not a participant
- `404 NOT_FOUND` - Conversation not found

**Note:** No rate limits on in-app messaging (D-087), no spam prevention in MVP (D-088)

---

### POST /v1/conversations/:convId/book-artist

**Description:** Pre-fill booking inquiry message (Book Artist flow)

**Authentication:** Required (must be participant)

**Request Body:**
```json
{
  "gig_details": {
    "date": "2025-12-15",
    "venue": "The Fillmore",
    "payment": 1500.00,
    "duration": "45-60 minutes"
  }
}
```

**Response (201):**
```json
{
  "data": {
    "message_id": "uuid_v4",
    "content": "Hi! I'd like to book you for a gig on 2025-12-15 at The Fillmore. Payment: $1500. Duration: 45-60 minutes. Are you available?",
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** This endpoint implements the "Book Artist" flow (D-076) with pre-filled inquiry

---

## 6. File Management Endpoints

### POST /v1/files/upload/request-url

**Description:** Generate signed R2 upload URL for direct client upload

**Authentication:** Required

**Request Body:**
```json
{
  "filename": "press-photo.jpg",
  "content_type": "image/jpeg",
  "file_size": 2456789,
  "category": "press_photo"
}
```

**Validation Rules:**
- `file_size`: Must be within remaining storage quota (50GB per artist)
- `content_type`: Must be allowed type (images, audio, video, documents)
- Allowed types: `image/jpeg`, `image/png`, `image/heic`, `audio/mpeg`, `audio/wav`, `audio/flac`, `video/mp4`, `video/quicktime`, `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

**Response (200):**
```json
{
  "data": {
    "upload_id": "uuid_v4",
    "upload_url": "https://r2.cloudflare.com/bucket/files/artist123/file456?signature=...",
    "r2_key": "files/artist123/file456",
    "expires_at": "2025-11-15T12:15:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `413 PAYLOAD_TOO_LARGE` - File size exceeds remaining quota
- `400 VALIDATION_ERROR` - Invalid file type

**Note:** Upload URL expires in 15 minutes (D-026)

---

### POST /v1/files/upload/confirm

**Description:** Confirm successful upload and save metadata to D1

**Authentication:** Required

**Request Body:**
```json
{
  "upload_id": "uuid_v4",
  "r2_key": "files/artist123/file456",
  "folder_id": "uuid_v4"
}
```

**Response (201):**
```json
{
  "data": {
    "file_id": "uuid_v4",
    "artist_id": "uuid_v4",
    "filename": "press-photo.jpg",
    "file_size": 2456789,
    "file_type": "image/jpeg",
    "category": "press_photo",
    "r2_key": "files/artist123/file456",
    "folder_id": "uuid_v4",
    "storage_used": 15678901234,
    "storage_quota": 53687091200,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### GET /v1/files

**Description:** List all files for authenticated artist

**Authentication:** Required

**Query Parameters:**
- `folder_id`: Optional, filter by folder
- `category`: Optional, filter by category
- `limit`: Optional, default 100
- `offset`: Optional, default 0

**Response (200):**
```json
{
  "data": {
    "files": [
      {
        "id": "uuid_v4",
        "filename": "press-photo.jpg",
        "file_size": 2456789,
        "file_type": "image/jpeg",
        "category": "press_photo",
        "r2_key": "files/artist123/file456",
        "folder_id": "uuid_v4",
        "created_at": "2025-11-15T12:00:00Z"
      }
    ],
    "storage": {
      "used_bytes": 15678901234,
      "quota_bytes": 53687091200,
      "used_gb": 14.6,
      "quota_gb": 50.0,
      "percentage": 29.2
    },
    "total": 87,
    "limit": 100,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### DELETE /v1/files/:fileId

**Description:** Delete file and free storage quota

**Authentication:** Required (must be file owner)

**Response (200):**
```json
{
  "data": {
    "file_id": "uuid_v4",
    "deleted": true,
    "storage_freed": 2456789,
    "storage_used": 15676444445
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 7. Broadcast & Contact Management

### POST /v1/broadcasts

**Description:** Send fan blast via email and/or SMS (text-only in MVP)

**Authentication:** Required

**Request Body:**
```json
{
  "contact_list_ids": ["uuid_v4", "uuid_v4"],
  "subject": "New track release!",
  "body": "Hey fans! I just released a new track...",
  "delivery_method": "both",
  "scheduled_at": null
}
```

**Validation Rules:**
- `body`: Required, max 1600 characters (SMS concatenation limit)
- `delivery_method`: Required, one of "email", "sms", "both"
- `subject`: Required for email, max 200 characters
- Text-only in MVP (D-049), no images/attachments

**Response (201):**
```json
{
  "data": {
    "broadcast_id": "uuid_v4",
    "artist_id": "uuid_v4",
    "subject": "New track release!",
    "recipient_count": 3885,
    "delivery_method": "both",
    "status": "sent",
    "sent_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Only sends to contacts with `email_opted_in=true` and/or `sms_opted_in=true`

---

### GET /v1/broadcasts/history

**Description:** List past broadcast messages

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "broadcasts": [
      {
        "id": "uuid_v4",
        "subject": "New track release!",
        "recipient_count": 3885,
        "delivery_method": "both",
        "status": "sent",
        "sent_at": "2025-11-15T12:00:00Z"
      }
    ],
    "total": 23
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### GET /v1/contacts

**Description:** List contact segments (fan lists)

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "contact_lists": [
      {
        "id": "uuid_v4",
        "name": "All Fans",
        "description": "All contacts",
        "member_count": 3843,
        "created_at": "2025-01-15T12:00:00Z"
      },
      {
        "id": "uuid_v4",
        "name": "VIP List",
        "description": "Super fans and VIPs",
        "member_count": 42,
        "created_at": "2025-03-20T12:00:00Z"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/contacts/import

**Description:** Import contacts to a list (CSV upload)

**Authentication:** Required

**Request Body:**
```json
{
  "list_id": "uuid_v4",
  "contacts": [
    {
      "email": "fan1@example.com",
      "phone": "+14155551234",
      "name": "Jane Doe",
      "email_opted_in": true,
      "sms_opted_in": false
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "imported": 150,
    "failed": 5,
    "duplicates": 10,
    "list_id": "uuid_v4",
    "new_member_count": 3993
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 8. Analytics Endpoints

### GET /v1/analytics/dashboard

**Description:** Get artist analytics (daily batch, updated midnight UTC)

**Authentication:** Required

**Query Parameters:**
- `date_from`: Optional, ISO 8601 date (default: 30 days ago)
- `date_to`: Optional, ISO 8601 date (default: today)

**Response (200):**
```json
{
  "data": {
    "current": {
      "total_earnings": 45600.00,
      "gig_count": 156,
      "profile_views": 12450,
      "follower_count": 3843,
      "track_plays": 89234,
      "avg_rating": 4.8
    },
    "trends": {
      "earnings_change_percent": 15.3,
      "gigs_change_percent": 8.2,
      "views_change_percent": 22.1,
      "followers_change_percent": 12.5
    },
    "daily_metrics": [
      {
        "date": "2025-11-15",
        "profile_views": 456,
        "gigs_completed": 2,
        "earnings": 3000.00,
        "followers": 3843,
        "track_plays": 1234
      }
    ],
    "last_updated": "2025-11-15T00:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Metrics update daily at midnight UTC (D-008), not real-time

---

### GET /v1/analytics/spotlight

**Description:** Get spotlight artists (random verified with >4.5 rating)

**Authentication:** Optional

**Response (200):**
```json
{
  "data": {
    "spotlight_artists": [
      {
        "id": "uuid_v4",
        "stage_name": "DJ Johnny",
        "verified": true,
        "primary_genre": "electronic",
        "avg_rating": 4.8,
        "total_gigs": 156,
        "followers": 3843,
        "avatar_url": "r2://avatars/artist123.jpg"
      }
    ],
    "total": 10,
    "refreshed_at": "2025-11-15T00:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Spotlight list refreshed daily at midnight UTC (D-068)

---

### GET /v1/analytics/goals

**Description:** List artist-defined goals

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "goals": [
      {
        "id": "uuid_v4",
        "artist_id": "uuid_v4",
        "title": "Reach 5000 followers",
        "description": "Grow fan base to 5K",
        "goal_type": "followers",
        "target_value": 5000,
        "current_value": 3843,
        "progress_percent": 76.9,
        "target_date": "2026-01-01",
        "completed": false,
        "created_at": "2025-01-15T12:00:00Z"
      }
    ],
    "total": 5
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/analytics/goals

**Description:** Create new goal

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Book 200 gigs",
  "description": "Reach 200 total gigs by end of year",
  "goal_type": "gigs",
  "target_value": 200,
  "target_date": "2025-12-31"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid_v4",
    "artist_id": "uuid_v4",
    "title": "Book 200 gigs",
    "target_value": 200,
    "current_value": 156,
    "progress_percent": 78.0,
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### PUT /v1/analytics/goals/:goalId

**Description:** Update goal progress (manual update)

**Authentication:** Required

**Request Body:**
```json
{
  "current_value": 165,
  "completed": false
}
```

**Response (200):**
```json
{
  "data": {
    "id": "uuid_v4",
    "current_value": 165,
    "progress_percent": 82.5,
    "completed": false,
    "updated_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### DELETE /v1/analytics/goals/:goalId

**Description:** Delete goal

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "id": "uuid_v4",
    "deleted": true
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 9. Violet AI Endpoints

### POST /v1/violet/generate

**Description:** Send prompt to Violet AI (Claude API)

**Authentication:** Required

**Request Body:**
```json
{
  "feature_used": "draft_message",
  "prompt": "Write a fan blast announcing my new track release",
  "context": {
    "track_title": "Summer Nights",
    "genre": "house",
    "release_date": "2025-12-01"
  }
}
```

**Validation Rules:**
- Rate limit: 50 prompts per day per artist (D-062)
- `feature_used`: Required, one of: "draft_message", "gig_inquiry", "songwriting", "career_advice"
- `prompt`: Required, max 2000 characters

**Response (200):**
```json
{
  "data": {
    "prompt_id": "uuid_v4",
    "response": "Hey everyone! I'm excited to announce my new house track 'Summer Nights' dropping December 1st...",
    "usage": {
      "prompts_used_today": 24,
      "prompts_remaining": 26,
      "resets_at": "2025-11-16T00:00:00Z"
    },
    "tokens_used": 1234
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Errors:**
- `429 RATE_LIMIT_EXCEEDED` - Exceeded 50 prompts/day limit
- `400 VALIDATION_ERROR` - Invalid feature or prompt too long

**Note:** Real AI generation via Claude API (D-046), not canned responses

---

### GET /v1/violet/usage

**Description:** Get Violet usage stats for today

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "date": "2025-11-15",
    "prompts_used": 24,
    "prompts_limit": 50,
    "prompts_remaining": 26,
    "resets_at": "2025-11-16T00:00:00Z",
    "feature_breakdown": {
      "draft_message": 10,
      "gig_inquiry": 8,
      "songwriting": 4,
      "career_advice": 2
    }
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### GET /v1/violet/rate-limit

**Description:** Check rate limit status without consuming a prompt

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "prompts_remaining": 26,
    "limit_exceeded": false,
    "resets_at": "2025-11-16T00:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 10. Creative Studio (Journal)

### GET /v1/journals

**Description:** List journal entries

**Authentication:** Required

**Query Parameters:**
- `type`: Optional, filter by "text" or "video"
- `limit`: Optional, default 50
- `offset`: Optional, default 0

**Response (200):**
```json
{
  "data": {
    "entries": [
      {
        "id": "uuid_v4",
        "artist_id": "uuid_v4",
        "title": "Studio Session Notes",
        "type": "mixed",
        "content": [
          {
            "type": "text",
            "data": "Today I worked on the new track..."
          },
          {
            "type": "video",
            "data": {
              "url": "r2://journal/artist123/video456.mp4",
              "thumbnail": "r2://journal/artist123/thumb456.jpg"
            }
          }
        ],
        "created_at": "2025-11-15T12:00:00Z",
        "updated_at": "2025-11-15T12:00:00Z"
      }
    ],
    "total": 34
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### POST /v1/journals

**Description:** Create new journal entry (block-based editor)

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Studio Session Notes",
  "type": "mixed",
  "content": [
    {
      "type": "text",
      "data": "Today I worked on the new track..."
    },
    {
      "type": "video",
      "data": {
        "url": "r2://journal/artist123/video456.mp4",
        "thumbnail": "r2://journal/artist123/thumb456.jpg"
      }
    }
  ]
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid_v4",
    "artist_id": "uuid_v4",
    "title": "Studio Session Notes",
    "type": "mixed",
    "created_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

## 11. Search

### GET /v1/search

**Description:** Global search for artists and gigs

**Authentication:** Optional

**Query Parameters:**
- `q`: Required, search query
- `type`: Optional, "artists" or "gigs" or "all" (default: "all")
- `limit`: Optional, default 20
- `offset`: Optional, default 0

**Response (200):**
```json
{
  "data": {
    "artists": [
      {
        "id": "uuid_v4",
        "stage_name": "DJ Johnny",
        "verified": true,
        "primary_genre": "electronic",
        "location_city": "San Francisco",
        "avg_rating": 4.8,
        "match_score": 0.95
      }
    ],
    "gigs": [
      {
        "id": "uuid_v4",
        "title": "Electronic Night",
        "venue_name": "The Fillmore",
        "date": "2025-12-15",
        "location_city": "San Francisco",
        "genre": "electronic",
        "match_score": 0.88
      }
    ],
    "total_artists": 15,
    "total_gigs": 8
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Search scope is artists + gigs only (D-071), no venue search

---

## 12. Settings & Account

### GET /v1/settings

**Description:** Get user settings

**Authentication:** Required

**Response (200):**
```json
{
  "data": {
    "user_id": "uuid_v4",
    "email": "artist@example.com",
    "oauth_provider": "apple",
    "notifications": {
      "email_enabled": true,
      "sms_enabled": true,
      "marketing_emails": false
    },
    "privacy": {
      "profile_visibility": "public",
      "show_location": true,
      "show_rates": true
    }
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

---

### PUT /v1/settings

**Description:** Update user settings

**Authentication:** Required

**Request Body:** (All fields optional)
```json
{
  "notifications": {
    "email_enabled": true,
    "sms_enabled": false
  },
  "privacy": {
    "show_rates": false
  }
}
```

**Response (200):**
```json
{
  "data": {
    "updated_fields": ["notifications.sms_enabled", "privacy.show_rates"],
    "updated_at": "2025-11-15T12:00:00Z"
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Email and OAuth provider are read-only (D-099)

---

### DELETE /v1/settings/account

**Description:** Self-service account deletion (GDPR/CCPA compliant)

**Authentication:** Required

**Request Body:**
```json
{
  "confirm_email": "artist@example.com",
  "reason": "No longer using platform"
}
```

**Response (200):**
```json
{
  "data": {
    "user_id": "uuid_v4",
    "deleted": true,
    "deleted_at": "2025-11-15T12:00:00Z",
    "data_retention_days": 30
  },
  "meta": {
    "timestamp": "2025-11-15T12:00:00Z"
  }
}
```

**Note:** Hard delete after 30-day grace period (D-102)

---

## Appendix A: Field Validation Rules

### Common Validations

| Field Type | Validation Rules |
|-----------|-----------------|
| Email | RFC 5322 format, max 255 characters |
| Phone | E.164 format (e.g., +14155551234) |
| URL | Valid HTTP/HTTPS URL, max 2000 characters |
| UUID | Valid UUID v4 format |
| Date | ISO 8601 format (YYYY-MM-DD) |
| DateTime | ISO 8601 format with timezone (YYYY-MM-DDTHH:MM:SSZ) |
| Currency | Positive number, 2 decimal places, max $1,000,000 |
| Rating | Integer 1-5 inclusive |
| Percentage | Integer 0-100 inclusive |

### String Length Limits

| Field | Min Length | Max Length |
|-------|-----------|-----------|
| stage_name | 1 | 100 |
| bio | 0 | 2000 |
| tagline | 0 | 200 |
| message content | 1 | 2000 |
| broadcast body | 1 | 1600 |
| review comment | 0 | 1000 |
| genre | 1 | 50 |
| city name | 1 | 100 |

### File Size Limits

| File Type | Max Size |
|-----------|---------|
| Images | 10 MB |
| Audio | 50 MB |
| Video | 50 MB |
| Documents | 10 MB |

### Storage Quotas

- **Per Artist:** 50 GB total (D-026)
- **Track Uploads:** Unlimited count (constrained by quota)

---

## Appendix B: Rate Limits

### Violet AI (D-062)

- **Limit:** 50 prompts per day per artist
- **Reset:** Midnight UTC
- **Exceeded Response:** `429 RATE_LIMIT_EXCEEDED`

### Other Endpoints

- **No rate limits in MVP** (D-087)
- Monitor for abuse post-launch
- Consider adding if spam detected

---

## Appendix C: Authentication Details

### Clerk Session Flow

1. Frontend: User clicks "Sign in with Apple/Google"
2. Clerk SDK: Initiates OAuth flow
3. OAuth Provider: User approves consent
4. Clerk: Exchanges code for token, creates session
5. Frontend: Receives Clerk session token
6. Frontend: Stores token, includes in all API requests
7. Backend: Validates token on each request via middleware
8. Backend: Checks `users.onboarding_complete` flag
9. Backend: Redirects to onboarding if incomplete (D-006)

### Session Management

- **Token Type:** Clerk JWT (not custom JWT)
- **Token Lifetime:** 7 days (managed by Clerk)
- **Refresh:** Automatic via Clerk SDK
- **Storage:** Browser localStorage/sessionStorage
- **Header:** `Authorization: Bearer <token>`

---

## Appendix D: Webhook Events

### Clerk Webhooks

The API receives webhooks from Clerk for user lifecycle events:

#### user.created
- Triggered when new user signs up via OAuth
- Creates `users` record in D1
- Sets `onboarding_complete = false`

#### user.updated
- Triggered when user email changes
- Updates `users.email` in D1

#### user.deleted
- Triggered when user deleted in Clerk
- Cascades delete to all user data (GDPR compliant)

---

## Appendix E: Data Model Reference

See `docs/database-schema.md` for complete data model documentation including:

- 20+ database tables
- Foreign key relationships
- Indexes for performance
- TypeScript model interfaces
- Validation constraints

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-15 | Initial API contract for MVP |

---

**Document Status:** ✅ Ready for Development

**Next Steps:**
1. Frontend team: Implement API client with TypeScript types
2. Backend team: Implement endpoints according to contract
3. QA: Create test cases for each endpoint
4. DevOps: Set up API monitoring and alerting

**Questions or Clarifications:** Contact technical lead or create issue in project repo.
