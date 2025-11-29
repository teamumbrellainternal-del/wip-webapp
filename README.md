# Umbrella MVP

Artist marketplace connecting musicians with venues. Built on Cloudflare's edge infrastructure.

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npm run dev           # Frontend (port 5173)
npm run dev:worker    # Backend Worker (port 8787)

# Build & deploy
npm run build
npm run deploy
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Workers
- **Database**: D1 (SQLite at edge)
- **Storage**: R2 (S3-compatible)
- **Auth**: Clerk (Google OAuth)

## Project Structure

```
api/                 # Cloudflare Worker API
├── controllers/     # Route handlers
├── middleware/      # Auth, CORS, error handling
├── routes/          # Route definitions
└── README.md        # API documentation

db/                  # Database
├── migrations/      # SQL migrations
└── README.md        # Schema documentation

src/                 # React frontend
├── components/      # UI components
├── pages/           # Page components
├── hooks/           # Custom hooks
└── README.md        # Frontend documentation

.github/workflows/   # CI/CD
└── README.md        # Deployment documentation
```

## Environment Setup

Copy `.dev.vars.example` to `.dev.vars` and fill in:

```bash
CLERK_SECRET_KEY=sk_...
CLERK_PUBLISHABLE_KEY=pk_...
CLAUDE_API_KEY=sk-ant-...
# See api/middleware/README.md for full auth setup
```

## Key Features

- **Artist Onboarding** - 4-step profile creation
- **Marketplace** - Browse gigs with filters
- **Messaging** - Direct artist-venue communication
- **AI Assistant (Violet)** - Claude-powered artist help
- **File Management** - Media storage via R2

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run dev:worker` | Start backend dev server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run migrate` | Run database migrations |
| `npm run type-check` | TypeScript validation |

## Documentation

Each folder contains its own README with relevant documentation:
- `api/README.md` - API endpoints and architecture
- `api/middleware/README.md` - Authentication (Clerk) setup
- `db/README.md` - Database schema and migrations
- `src/README.md` - Frontend architecture
- `.github/workflows/README.md` - CI/CD and deployment

Archived docs from previous development: `_archive/`
