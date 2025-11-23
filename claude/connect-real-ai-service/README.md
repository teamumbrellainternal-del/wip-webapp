# Connect Real AI Service (Violet)

This folder contains implementation details for connecting the real Claude AI service to the service factory.

## 📋 Feature Overview

**PRD:** `../PRD_CONNECT_REAL_AI_SERVICE.md`

**Objective:** Connect the existing real Claude AI service implementation to the service factory, enabling production AI generation when `USE_MOCKS = "false"` and `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) is configured.

## 🎯 Implementation Status

- [ ] Factory imports updated
- [ ] Union type created
- [ ] Factory logic updated
- [ ] useRealAPI flag set correctly
- [ ] Service status function updated
- [ ] Tests written and passing
- [ ] Documentation updated

## 📁 Related Files

- **PRD:** `../../PRD_CONNECT_REAL_AI_SERVICE.md`
- **Service Factory:** `../../api/mocks/index.ts`
- **Mock Service:** `../../api/mocks/claude.ts`
- **Real Service:** `../../api/services/claude.ts`
- **Config:** `../../wrangler.toml`

## 🖥️ Environment Setup

See `../CLAUDE_CODE_ENVIRONMENT_SETUP.md` for complete environment configuration instructions.

## 🚀 Quick Start

1. Review the PRD: `../../PRD_CONNECT_REAL_AI_SERVICE.md`
2. Follow the environment setup guide: `../CLAUDE_CODE_ENVIRONMENT_SETUP.md`
3. Verify API key name (ANTHROPIC_API_KEY vs CLAUDE_API_KEY)
4. Implement according to PRD steps
5. Run tests: `npm run test`
6. Verify: `npm run type-check && npm run lint`

## ⚠️ Important Notes

- **CRITICAL:** Must set `useRealAPI: true` when creating real service
- Verify which API key name is used in the codebase
- All tests can use mocked API responses (no real API calls needed)

