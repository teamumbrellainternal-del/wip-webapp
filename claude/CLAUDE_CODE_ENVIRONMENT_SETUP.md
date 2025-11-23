# Claude Code Environment Setup Guide

This guide explains how to configure Claude Code's environment to implement the four service integration features at a production-grade level.

## 📋 Overview

**⚠️ IMPORTANT: Read [`BRANCH_MANAGEMENT.md`](./BRANCH_MANAGEMENT.md) first** to understand how Claude Code handles branches and ensure PRDs are accessible.

This guide covers the setup required for Claude Code to implement:

1. **Setup Real R2 Storage Service** (`claude/setup-real-r2-storage`)
2. **Connect Real AI Service** (`claude/connect-real-ai-service`)
3. **Connect Real SMS Service** (`claude/connect-real-sms-service`)
4. **Connect Real Email Service** (`claude/connect-real-email-service`)

---

## 🛠️ Prerequisites

### 1. System Requirements

- **Operating System:** macOS, Linux, or Windows (WSL recommended for Windows)
- **Node.js:** Version 20.0.0 or higher
- **npm:** Version 10.0.0 or higher
- **Git:** Latest version for version control

### 2. Cloudflare Account Setup

#### Create Cloudflare Account

1. Sign up at <https://dash.cloudflare.com/sign-up>
2. Verify your email address
3. Complete account setup

#### Install Wrangler CLI

```bash
# Option 1: Global installation (recommended)
npm install -g wrangler

# Option 2: Local installation (already in project)
npm install wrangler --save-dev
```

#### Authenticate Wrangler

```bash
# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

**Expected Output:**

```
You are logged in as: your-email@example.com
Account ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Get Account ID

1. Go to <https://dash.cloudflare.com>
2. Select your account
3. Copy the Account ID from the right sidebar
4. Save it for later use (needed for R2 bucket creation)

### 3. Project Setup

#### Clone/Navigate to Project

```bash
cd /Users/renesultan/Desktop/umbrella/wip-webapp
```

#### Install Dependencies

```bash
npm install
```

#### Verify Installation

```bash
# Check TypeScript compilation
npm run type-check

# Check linting
npm run lint

# Run tests
npm run test
```

All commands should complete without errors.

---

## 🔧 Environment Configuration

### 1. Local Development Environment

#### D1 Database Setup

```bash
# Create local D1 database (if not already created)
npm run db:create

# Run migrations
npm run migrate

# Verify database is accessible
wrangler d1 execute umbrella-dev-db --local --command "SELECT 1"
```

#### KV Namespace Setup

```bash
# Create KV namespace (if not already created)
npm run kv:create
```

#### R2 Bucket Setup (for R2 Storage feature)

```bash
# Create dev R2 bucket
npm run r2:create

# Or manually:
wrangler r2 bucket create umbrella-dev-media

# List buckets to verify
wrangler r2 bucket list
```

### 2. Wrangler Configuration

#### Verify `wrangler.toml`

Ensure the following sections exist in `wrangler.toml`:

```toml
[vars]
USE_MOCKS = "true"
ENVIRONMENT = "development"

[[d1_databases]]
binding = "DB"
database_name = "umbrella-dev-db"
database_id = "4fbcb5f8-5fe5-4bb1-b56f-0de1e80d6e8a"
migrations_dir = "db/migrations"

[[kv_namespaces]]
binding = "KV"
id = "04fceb9a09054bbd991d5252a9a169cf"
```

#### R2 Bucket Binding (for R2 Storage feature)

Add to `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "BUCKET"
bucket_name = "umbrella-dev-media"
```

### 3. Testing Environment

#### Verify Test Setup

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run all tests
npm run test
```

All tests should pass or show expected failures (not related to service integration).

#### Mock API Setup

For testing without real API calls:

- **Vitest:** Already configured
- **Mock Fetch:** Can use `vi.fn()` to mock `global.fetch`
- **Mock Services:** Mock services already exist in `api/mocks/`

---

## 🔑 API Keys & Secrets (Optional for Implementation)

**Note:** Claude Code can implement all features using mocked API responses. Real API keys are only needed for production deployment, not for implementation.

### If You Want to Test with Real APIs

#### 1. Resend (Email Service)

```bash
# Get API key from https://resend.com/api-keys
# Set as secret (for production only)
wrangler secret put RESEND_API_KEY --env production
```

#### 2. Twilio (SMS Service)

```bash
# Get credentials from https://console.twilio.com
wrangler secret put TWILIO_ACCOUNT_SID --env production
wrangler secret put TWILIO_AUTH_TOKEN --env production
wrangler secret put TWILIO_PHONE_NUMBER --env production
```

#### 3. Anthropic (AI Service)

```bash
# Get API key from https://console.anthropic.com
# Check which env var name is used (ANTHROPIC_API_KEY or CLAUDE_API_KEY)
wrangler secret put ANTHROPIC_API_KEY --env production
# OR
wrangler secret put CLAUDE_API_KEY --env production
```

#### 4. Cloudflare R2 (Storage Service)

- No API keys needed
- R2 bucket binding configured in `wrangler.toml`
- Bucket created via `wrangler r2 bucket create`

---

## 📁 Project Structure

Ensure Claude Code has access to:

```
wip-webapp/
├── api/
│   ├── mocks/
│   │   ├── index.ts          # Service factory (main file to modify)
│   │   ├── resend.ts         # Mock email service
│   │   ├── twilio.ts         # Mock SMS service
│   │   ├── claude.ts         # Mock AI service
│   │   └── r2.ts             # Mock storage service
│   ├── services/
│   │   ├── resend.ts         # Real email service (already implemented)
│   │   ├── twilio.ts         # Real SMS service (already implemented)
│   │   ├── claude.ts         # Real AI service (already implemented)
│   │   └── r2.ts             # Real storage service (to be created)
│   └── storage/
│       └── r2.ts             # R2 helper functions
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── wrangler.toml             # Environment configuration
└── package.json              # Dependencies
```

---

## ✅ Pre-Implementation Checklist

Before Claude Code starts implementing, verify:

### General Setup

- [ ] Node.js 20+ installed (`node --version`)
- [ ] npm 10+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] Project dependencies installed (`npm install` completed)
- [ ] TypeScript compilation works (`npm run type-check` passes)
- [ ] Tests run successfully (`npm run test` works)

### Cloudflare Setup

- [ ] Cloudflare account created and verified
- [ ] Wrangler CLI installed (`wrangler --version`)
- [ ] Wrangler authenticated (`wrangler login` completed)
- [ ] Account ID available (`wrangler whoami` shows Account ID)
- [ ] Can access Cloudflare dashboard

### Local Environment

- [ ] D1 database accessible (`wrangler d1 execute` works)
- [ ] Migrations applied (`npm run migrate` completed)
- [ ] KV namespace accessible
- [ ] Can run `wrangler dev` successfully

### R2 Storage Specific (for R2 feature)

- [ ] R2 bucket created (`wrangler r2 bucket list` shows bucket)
- [ ] R2 bucket binding added to `wrangler.toml`
- [ ] Can access R2 bucket via Wrangler

### Code Access

- [ ] Can read all files in `api/mocks/`
- [ ] Can read all files in `api/services/`
- [ ] Can read `wrangler.toml`
- [ ] Can create new files in `api/services/`
- [ ] Can create new files in `tests/`
- [ ] Can modify `api/mocks/index.ts`

### Testing

- [ ] Vitest configured and working
- [ ] Can mock `global.fetch` in tests
- [ ] Can create test files
- [ ] Test helpers available (if any)

---

## 🚀 Implementation Workflow

### For Each Feature

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/[feature-name]
   ```

2. **Verify Environment**
   - Run pre-implementation checklist
   - Ensure all dependencies available

3. **Implement Feature**
   - Follow PRD step-by-step
   - Write tests as you go
   - Run tests frequently

4. **Verify Implementation**

   ```bash
   npm run type-check
   npm run lint
   npm run test
   ```

5. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat(services): [feature description]"
   ```

---

## 🐛 Troubleshooting

### Wrangler Authentication Issues

```bash
# Re-authenticate
wrangler logout
wrangler login
```

### D1 Database Not Found

```bash
# Create database
npm run db:create

# Apply migrations
npm run migrate
```

### R2 Bucket Creation Fails

```bash
# Check account permissions
wrangler whoami

# Verify R2 is enabled in account
# Go to Cloudflare dashboard → R2 → Check if enabled
```

### TypeScript Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

### Test Failures

```bash
# Run tests with verbose output
npm run test -- --reporter=verbose

# Check specific test file
npm run test tests/unit/services/[service-name].test.ts
```

---

## 📚 Additional Resources

### Documentation

- **Cloudflare Workers:** <https://developers.cloudflare.com/workers/>
- **Cloudflare R2:** <https://developers.cloudflare.com/r2/>
- **Wrangler CLI:** <https://developers.cloudflare.com/workers/wrangler/>
- **D1 Database:** <https://developers.cloudflare.com/d1/>

### API Documentation

- **Resend:** <https://resend.com/docs>
- **Twilio:** <https://www.twilio.com/docs>
- **Anthropic Claude:** <https://docs.anthropic.com>

### Project Documentation

- **Service Factory Pattern:** `api/mocks/README.md`
- **API Configuration:** `docs/api-configuration.md`
- **Production Setup:** `PRODUCTION_SETUP.md`

---

## 🎯 Quick Start Commands

```bash
# 1. Verify environment
npm run type-check && npm run lint && npm run test

# 2. Start development server
npm run dev:worker

# 3. Create R2 bucket (for R2 feature)
wrangler r2 bucket create umbrella-dev-media

# 4. Run migrations
npm run migrate

# 5. Create feature branch
git checkout -b feature/[feature-name]
```

---

## 📝 Notes

- **No Real API Keys Required:** Claude Code can implement all features using mocked API responses
- **Local Testing:** All features can be tested locally without external services
- **Production Deployment:** Real API keys only needed when deploying to production
- **Incremental Implementation:** Each feature can be implemented independently
- **Backward Compatible:** All changes maintain backward compatibility with existing code

---

**Last Updated:** 2025-01-22
**Maintained By:** Development Team
