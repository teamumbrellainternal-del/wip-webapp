# Claude Code Implementation Folders

This directory contains feature-specific folders for implementing service integrations using Claude Code.

## 📁 Folder Structure

```
claude/
├── README.md                                    # This file
├── CLAUDE_CODE_ENVIRONMENT_SETUP.md             # Environment setup guide
├── setup-real-r2-storage/                      # R2 Storage feature
│   └── README.md
├── connect-real-ai-service/                     # AI Service feature
│   └── README.md
├── connect-real-sms-service/                    # SMS Service feature
│   └── README.md
└── connect-real-email-service/                  # Email Service feature
    └── README.md
```

## 🎯 Features

### 1. Setup Real R2 Storage Service
**Folder:** `setup-real-r2-storage/`  
**PRD:** `../PRD_SETUP_REAL_R2_STORAGE.md`  
**Status:** Ready for implementation

### 2. Connect Real AI Service (Violet)
**Folder:** `connect-real-ai-service/`  
**PRD:** `../PRD_CONNECT_REAL_AI_SERVICE.md`  
**Status:** Ready for implementation

### 3. Connect Real SMS Service
**Folder:** `connect-real-sms-service/`  
**PRD:** `../PRD_CONNECT_REAL_SMS_SERVICE.md`  
**Status:** Ready for implementation

### 4. Connect Real Email Service
**Folder:** `connect-real-email-service/`  
**PRD:** `../PRD_CONNECT_REAL_EMAIL_SERVICE.md`  
**Status:** Ready for implementation

## 🚀 Getting Started

### Step 0: Branch Management ⚠️ IMPORTANT

**Before starting, read:** [`BRANCH_MANAGEMENT.md`](./BRANCH_MANAGEMENT.md)

Claude Code works with the default branch (`main`) unless you specify otherwise. Since the PRDs and feature folders may be on a different branch, you need to:

1. **Commit PRDs to git** (if not already committed)
2. **Merge PRDs to main** (or specify branch in prompt)
3. **Specify branch in Claude Code prompt** if working on feature branch

**Quick check:**
```bash
# Check current branch
git branch --show-current

# Check if PRDs exist on main
git ls-tree -r main --name-only | grep PRD_
```

### Step 1: Environment Setup

**Read the comprehensive setup guide:**
- [`CLAUDE_CODE_ENVIRONMENT_SETUP.md`](./CLAUDE_CODE_ENVIRONMENT_SETUP.md)

This guide covers:
- System requirements
- Cloudflare account setup
- Wrangler CLI installation and authentication
- Project dependencies
- Testing environment
- Pre-implementation checklist

### Step 2: Choose a Feature

Each feature folder contains:
- **README.md:** Feature-specific overview and quick start
- **Links to PRD:** Full implementation requirements
- **Status tracking:** Implementation checklist

### Step 3: Review PRD

Each PRD includes:
- **Executive Summary:** High-level overview
- **Requirements:** Functional and non-functional requirements
- **Technical Specifications:** Interface definitions and architecture
- **🖥️ Claude Code Environment Setup:** Environment requirements for implementation
- **Implementation Steps:** Step-by-step guide
- **Testing Requirements:** Comprehensive test cases
- **Acceptance Criteria:** Definition of done

### Step 4: Implement

Follow the PRD step-by-step, running tests frequently:
```bash
npm run type-check
npm run lint
npm run test
```

## 📚 Documentation

### Main Guides
- **Branch Management:** [`BRANCH_MANAGEMENT.md`](./BRANCH_MANAGEMENT.md) ⚠️ **Read First**
- **Environment Setup:** [`CLAUDE_CODE_ENVIRONMENT_SETUP.md`](./CLAUDE_CODE_ENVIRONMENT_SETUP.md)
- **Service Factory Pattern:** `../api/mocks/README.md`
- **API Configuration:** `../docs/api-configuration.md`
- **Production Setup:** `../PRODUCTION_SETUP.md`

### PRDs
- **R2 Storage:** `../PRD_SETUP_REAL_R2_STORAGE.md`
- **AI Service:** `../PRD_CONNECT_REAL_AI_SERVICE.md`
- **SMS Service:** `../PRD_CONNECT_REAL_SMS_SERVICE.md`
- **Email Service:** `../PRD_CONNECT_REAL_EMAIL_SERVICE.md`

## ✅ Pre-Implementation Checklist

Before starting any feature:

- [ ] Read `CLAUDE_CODE_ENVIRONMENT_SETUP.md`
- [ ] Complete environment setup checklist
- [ ] Review the feature's PRD
- [ ] Review the feature's README.md
- [ ] Verify all dependencies installed
- [ ] Run `npm run type-check` (should pass)
- [ ] Run `npm run test` (should pass)
- [ ] Create feature branch: `git checkout -b feature/[feature-name]`

## 🎓 Implementation Notes

### Common Patterns

All features follow the same pattern:
1. **Update Factory Imports:** Uncomment real service import
2. **Create Union Type:** Add type alias for service interface
3. **Update Factory Logic:** Implement conditional service selection
4. **Update Service Status:** Modify status function
5. **Write Tests:** Create comprehensive test suite
6. **Verify:** Run all checks

### Testing Strategy

- **Unit Tests:** Mock service creation functions
- **Integration Tests:** Mock API calls (`global.fetch`)
- **No Real API Calls:** All tests use mocked responses
- **Backward Compatible:** Mock service remains default

### Key Considerations

- **Backward Compatibility:** Must not break existing code
- **Type Safety:** Union types ensure compatibility
- **Error Handling:** Graceful fallback to mock
- **Testing:** Comprehensive test coverage
- **Documentation:** Clear and accurate docs

## 🔗 Related Files

### Service Factory
- **Main File:** `../api/mocks/index.ts`
- **Mock Services:** `../api/mocks/[service].ts`
- **Real Services:** `../api/services/[service].ts`

### Configuration
- **Environment:** `../wrangler.toml`
- **Package:** `../package.json`
- **TypeScript:** `../tsconfig.json`

### Tests
- **Unit:** `../tests/unit/services/`
- **Integration:** `../tests/integration/`
- **E2E:** `../tests/e2e/`

## 📞 Support

If you encounter issues:

1. **Check Environment Setup:** Review `CLAUDE_CODE_ENVIRONMENT_SETUP.md`
2. **Review PRD:** Check the feature's PRD for details
3. **Check Existing Patterns:** Review `../api/mocks/index.ts` for email service (already connected)
4. **Run Diagnostics:** `npm run type-check && npm run lint && npm run test`
5. **Check Documentation:** Review project docs in `../docs/`

---

**Last Updated:** 2025-01-22  
**Maintained By:** Development Team

