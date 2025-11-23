# Connect Real Email Service

This folder contains implementation details for connecting the real Resend email service to the service factory.

## 📋 Feature Overview

**PRD:** `../PRD_CONNECT_REAL_EMAIL_SERVICE.md`

**Objective:** Connect the existing real Resend email service implementation to the service factory, enabling production email delivery when `USE_MOCKS = "false"` and `RESEND_API_KEY` is configured.

## 🎯 Implementation Status

- [ ] Factory imports updated
- [ ] Union type created
- [ ] Factory logic updated
- [ ] Service status function updated
- [ ] Tests written and passing
- [ ] Documentation updated

## 📁 Related Files

- **PRD:** `../../PRD_CONNECT_REAL_EMAIL_SERVICE.md`
- **Service Factory:** `../../api/mocks/index.ts`
- **Mock Service:** `../../api/mocks/resend.ts`
- **Real Service:** `../../api/services/resend.ts`
- **Config:** `../../wrangler.toml`

## 🖥️ Environment Setup

See `../CLAUDE_CODE_ENVIRONMENT_SETUP.md` for complete environment configuration instructions.

## 🚀 Quick Start

1. Review the PRD: `../../PRD_CONNECT_REAL_EMAIL_SERVICE.md`
2. Follow the environment setup guide: `../CLAUDE_CODE_ENVIRONMENT_SETUP.md`
3. Implement according to PRD steps
4. Test queue system thoroughly
5. Run tests: `npm run test`
6. Verify: `npm run type-check && npm run lint`

## ⚠️ Important Notes

- Factory requires `RESEND_API_KEY` and `DB` binding
- Failed email queue system must work correctly
- All tests can use mocked API responses (no real API calls needed)

