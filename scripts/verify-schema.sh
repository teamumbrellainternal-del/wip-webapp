#!/bin/bash
# ============================================================================
# UMBRELLA MVP - SCHEMA VERIFICATION SCRIPT
# ============================================================================
# Purpose: Validate D1 database schema integrity after migrations
# Usage: ./scripts/verify-schema.sh [--local|--remote]
#
# This script verifies:
# - All expected tables exist
# - All indexes are created
# - Foreign key constraints are properly defined
# - Check constraints are in place
# - Table counts match expectations
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="${DB_NAME:-umbrella-dev-db}"
USE_LOCAL="${1:-}"

# Determine if using local or remote
if [[ "$USE_LOCAL" == "--local" ]]; then
  D1_CMD="wrangler d1 execute $DB_NAME --local --command"
  echo -e "${BLUE}Verifying LOCAL D1 database schema: $DB_NAME${NC}\n"
elif [[ "$USE_LOCAL" == "--remote" ]]; then
  D1_CMD="wrangler d1 execute $DB_NAME --remote --command"
  echo -e "${BLUE}Verifying REMOTE D1 database schema: $DB_NAME${NC}\n"
else
  D1_CMD="wrangler d1 execute $DB_NAME --local --command"
  echo -e "${YELLOW}No flag specified, defaulting to --local${NC}"
  echo -e "${BLUE}Verifying LOCAL D1 database schema: $DB_NAME${NC}\n"
fi

# Error counter
ERRORS=0
WARNINGS=0

# Helper function to run D1 command
run_query() {
  local query="$1"
  eval "$D1_CMD \"$query\"" 2>/dev/null || echo "QUERY_ERROR"
}

# Helper function to check if table exists
check_table() {
  local table_name="$1"
  local result=$(run_query "SELECT name FROM sqlite_master WHERE type='table' AND name='$table_name';")

  if [[ "$result" == *"$table_name"* ]]; then
    echo -e "${GREEN}✓${NC} Table '$table_name' exists"
    return 0
  else
    echo -e "${RED}✗${NC} Table '$table_name' is MISSING"
    ((ERRORS++))
    return 1
  fi
}

# Helper function to check if index exists
check_index() {
  local index_name="$1"
  local result=$(run_query "SELECT name FROM sqlite_master WHERE type='index' AND name='$index_name';")

  if [[ "$result" == *"$index_name"* ]]; then
    echo -e "${GREEN}✓${NC} Index '$index_name' exists"
    return 0
  else
    echo -e "${RED}✗${NC} Index '$index_name' is MISSING"
    ((ERRORS++))
    return 1
  fi
}

# Helper function to count table columns
check_column_count() {
  local table_name="$1"
  local expected_count="$2"
  local result=$(run_query "PRAGMA table_info($table_name);")

  # Count lines in result (each line is a column)
  local actual_count=$(echo "$result" | grep -c "^" || echo "0")

  if [[ "$actual_count" -ge "$expected_count" ]]; then
    echo -e "${GREEN}✓${NC} Table '$table_name' has $actual_count columns (expected >= $expected_count)"
    return 0
  else
    echo -e "${YELLOW}⚠${NC} Table '$table_name' has $actual_count columns (expected >= $expected_count)"
    ((WARNINGS++))
    return 1
  fi
}

echo "============================================================================"
echo "SECTION 1: CORE TABLES VERIFICATION"
echo "============================================================================"

# Expected tables (23 total)
TABLES=(
  "users"
  "artists"
  "artist_followers"
  "tracks"
  "gigs"
  "gig_applications"
  "gig_favorites"
  "conversations"
  "messages"
  "files"
  "folders"
  "storage_quotas"
  "reviews"
  "timeline_entries"
  "daily_metrics"
  "goals"
  "violet_usage"
  "contact_lists"
  "contact_list_members"
  "broadcast_messages"
  "journal_entries"
)

for table in "${TABLES[@]}"; do
  check_table "$table"
done

# Count total tables
TOTAL_TABLES=$(run_query "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
echo -e "\n${BLUE}Total tables in database:${NC} $TOTAL_TABLES (expected >= 21)"

echo -e "\n============================================================================"
echo "SECTION 2: INDEX VERIFICATION"
echo "============================================================================"

# Critical indexes (subset of 60+ indexes)
INDEXES=(
  # User indexes
  "idx_users_oauth"
  "idx_users_email"
  # Artist indexes
  "idx_artists_user_id"
  "idx_artists_verified"
  "idx_artists_genre"
  "idx_artists_location"
  "idx_artists_rating"
  # Track indexes
  "idx_tracks_artist_id"
  "idx_tracks_order"
  "idx_tracks_genre"
  # Gig indexes
  "idx_gigs_date"
  "idx_gigs_location"
  "idx_gigs_genre"
  "idx_gigs_status"
  "idx_gigs_urgency"
  "idx_gigs_venue"
  # Conversation indexes
  "idx_conversations_p1"
  "idx_conversations_p2"
  "idx_conversations_updated"
  # Message indexes
  "idx_messages_conversation"
  "idx_messages_sender"
  "idx_messages_read"
  # File indexes
  "idx_files_artist"
  "idx_files_category"
  "idx_files_folder"
  # Review indexes
  "idx_reviews_artist"
  "idx_reviews_rating"
  "idx_reviews_token"
  # Analytics indexes
  "idx_metrics_artist_date"
  "idx_metrics_date"
  "idx_violet_artist_date"
  # Social indexes
  "idx_followers_artist"
  "idx_followers_user"
  "idx_favorites_gig"
  "idx_favorites_artist"
)

for index in "${INDEXES[@]}"; do
  check_index "$index"
done

# Count total indexes
TOTAL_INDEXES=$(run_query "SELECT COUNT(*) FROM sqlite_master WHERE type='index';")
echo -e "\n${BLUE}Total indexes in database:${NC} $TOTAL_INDEXES (expected >= 60)"

echo -e "\n============================================================================"
echo "SECTION 3: TABLE STRUCTURE VERIFICATION"
echo "============================================================================"

# Check column counts for key tables
check_column_count "users" 6
check_column_count "artists" 50  # 40+ attributes
check_column_count "tracks" 12
check_column_count "gigs" 17
check_column_count "messages" 8
check_column_count "files" 8
check_column_count "reviews" 9
check_column_count "daily_metrics" 9

echo -e "\n============================================================================"
echo "SECTION 4: CONSTRAINT VERIFICATION"
echo "============================================================================"

# Check foreign keys
echo -e "${BLUE}Checking foreign key constraints...${NC}"
FK_CHECK=$(run_query "PRAGMA foreign_keys;")
if [[ "$FK_CHECK" == *"1"* ]]; then
  echo -e "${GREEN}✓${NC} Foreign keys are ENABLED"
else
  echo -e "${RED}✗${NC} Foreign keys are DISABLED"
  ((ERRORS++))
fi

# Verify specific constraints by testing table schema
echo -e "\n${BLUE}Checking CHECK constraints...${NC}"

# Users: oauth_provider CHECK constraint
USERS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='users';")
if [[ "$USERS_SCHEMA" == *"CHECK"*"oauth_provider"* ]]; then
  echo -e "${GREEN}✓${NC} users.oauth_provider has CHECK constraint"
else
  echo -e "${RED}✗${NC} users.oauth_provider CHECK constraint is MISSING"
  ((ERRORS++))
fi

# Messages: content length CHECK constraint
MESSAGES_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='messages';")
if [[ "$MESSAGES_SCHEMA" == *"CHECK"*"LENGTH"*"2000"* ]]; then
  echo -e "${GREEN}✓${NC} messages.content has 2000 char CHECK constraint"
else
  echo -e "${RED}✗${NC} messages.content CHECK constraint is MISSING"
  ((ERRORS++))
fi

# Reviews: rating CHECK constraint
REVIEWS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='reviews';")
if [[ "$REVIEWS_SCHEMA" == *"CHECK"*"rating"* ]]; then
  echo -e "${GREEN}✓${NC} reviews.rating has CHECK constraint"
else
  echo -e "${RED}✗${NC} reviews.rating CHECK constraint is MISSING"
  ((ERRORS++))
fi

# Gigs: payment_type CHECK constraint
GIGS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='gigs';")
if [[ "$GIGS_SCHEMA" == *"CHECK"*"payment_type"* ]]; then
  echo -e "${GREEN}✓${NC} gigs.payment_type has CHECK constraint"
else
  echo -e "${RED}✗${NC} gigs.payment_type CHECK constraint is MISSING"
  ((ERRORS++))
fi

echo -e "\n============================================================================"
echo "SECTION 5: UNIQUE CONSTRAINT VERIFICATION"
echo "============================================================================"

# Check for unique constraints in table definitions
echo -e "${BLUE}Checking UNIQUE constraints...${NC}"

# Users: UNIQUE(oauth_provider, oauth_id)
if [[ "$USERS_SCHEMA" == *"UNIQUE"*"oauth_provider"*"oauth_id"* ]]; then
  echo -e "${GREEN}✓${NC} users has UNIQUE(oauth_provider, oauth_id)"
else
  echo -e "${RED}✗${NC} users UNIQUE constraint is MISSING"
  ((ERRORS++))
fi

# Artists: UNIQUE(user_id)
ARTISTS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='artists';")
if [[ "$ARTISTS_SCHEMA" == *"UNIQUE"*"user_id"* ]]; then
  echo -e "${GREEN}✓${NC} artists has UNIQUE(user_id)"
else
  echo -e "${RED}✗${NC} artists UNIQUE constraint is MISSING"
  ((ERRORS++))
fi

# Conversations: UNIQUE(participant_1_id, participant_2_id)
CONVERSATIONS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='conversations';")
if [[ "$CONVERSATIONS_SCHEMA" == *"UNIQUE"* ]]; then
  echo -e "${GREEN}✓${NC} conversations has UNIQUE constraint"
else
  echo -e "${RED}✗${NC} conversations UNIQUE constraint is MISSING"
  ((ERRORS++))
fi

# Gig Applications: UNIQUE(gig_id, artist_id)
APPLICATIONS_SCHEMA=$(run_query "SELECT sql FROM sqlite_master WHERE type='table' AND name='gig_applications';")
if [[ "$APPLICATIONS_SCHEMA" == *"UNIQUE"* ]]; then
  echo -e "${GREEN}✓${NC} gig_applications has UNIQUE constraint"
else
  echo -e "${RED}✗${NC} gig_applications UNIQUE constraint is MISSING"
  ((ERRORS++))
fi

echo -e "\n============================================================================"
echo "SECTION 6: DATA INTEGRITY TESTS"
echo "============================================================================"

echo -e "${BLUE}Testing basic data operations...${NC}"

# Test 1: Can insert and query a user
TEST_USER_ID="test_verify_user_$(date +%s)"
INSERT_RESULT=$(run_query "INSERT INTO users (id, oauth_provider, oauth_id, email, onboarding_complete, created_at, updated_at) VALUES ('$TEST_USER_ID', 'google', 'test_123', 'test@example.com', 0, datetime('now'), datetime('now'));" || echo "INSERT_ERROR")

if [[ "$INSERT_RESULT" != "INSERT_ERROR" ]]; then
  echo -e "${GREEN}✓${NC} Can insert user record"

  # Query it back
  QUERY_RESULT=$(run_query "SELECT id FROM users WHERE id='$TEST_USER_ID';")
  if [[ "$QUERY_RESULT" == *"$TEST_USER_ID"* ]]; then
    echo -e "${GREEN}✓${NC} Can query user record"
  else
    echo -e "${RED}✗${NC} Cannot query user record"
    ((ERRORS++))
  fi

  # Clean up
  run_query "DELETE FROM users WHERE id='$TEST_USER_ID';" > /dev/null 2>&1
else
  echo -e "${RED}✗${NC} Cannot insert user record"
  ((ERRORS++))
fi

# Test 2: Foreign key enforcement
echo -e "\n${BLUE}Testing foreign key enforcement...${NC}"
INVALID_FK_RESULT=$(run_query "INSERT INTO artists (id, user_id, stage_name, created_at, updated_at) VALUES ('test_artist_invalid', 'nonexistent_user', 'Test Artist', datetime('now'), datetime('now'));" 2>&1 || echo "FK_ERROR")

if [[ "$INVALID_FK_RESULT" == *"FOREIGN KEY constraint failed"* ]] || [[ "$INVALID_FK_RESULT" == *"FK_ERROR"* ]]; then
  echo -e "${GREEN}✓${NC} Foreign key constraints are enforced"
else
  echo -e "${YELLOW}⚠${NC} Foreign key constraints may not be fully enforced"
  ((WARNINGS++))
fi

echo -e "\n============================================================================"
echo "VERIFICATION SUMMARY"
echo "============================================================================"

if [[ $ERRORS -eq 0 ]] && [[ $WARNINGS -eq 0 ]]; then
  echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC}"
  echo -e "${GREEN}Database schema is valid and ready for use.${NC}"
  exit 0
elif [[ $ERRORS -eq 0 ]]; then
  echo -e "${YELLOW}⚠ $WARNINGS WARNING(S) FOUND${NC}"
  echo -e "${YELLOW}Schema is functional but has minor issues.${NC}"
  exit 0
else
  echo -e "${RED}✗ $ERRORS ERROR(S) FOUND${NC}"
  echo -e "${RED}Schema validation FAILED. Please review errors above.${NC}"
  if [[ $WARNINGS -gt 0 ]]; then
    echo -e "${YELLOW}Additionally, $WARNINGS warning(s) were found.${NC}"
  fi
  exit 1
fi
