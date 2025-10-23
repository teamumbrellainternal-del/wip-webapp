#!/bin/bash

# Umbrella - Cloudflare Resource Setup Script
# This script bootstraps all necessary Cloudflare resources for development

set -e

echo "🌂 Umbrella - Cloudflare Setup"
echo "================================"
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: wrangler CLI is not installed"
    echo "   Install with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare"
    echo "   Run: wrangler login"
    exit 1
fi

echo "✅ Wrangler CLI found and authenticated"
echo ""

# Create D1 database
echo "📊 Creating D1 database..."
echo "Running: wrangler d1 create umbrella-dev-db"
wrangler d1 create umbrella-dev-db
echo ""

# Create KV namespace
echo "🗄️  Creating KV namespace..."
echo "Running: wrangler kv:namespace create KV --preview"
wrangler kv:namespace create KV --preview
echo ""

# Create R2 bucket
echo "📦 Creating R2 bucket..."
echo "Running: wrangler r2 bucket create umbrella-dev-media"
wrangler r2 bucket create umbrella-dev-media
echo ""

echo "✅ Setup complete!"
echo ""
echo "⚠️  NEXT STEPS:"
echo "1. Copy the IDs from above and update wrangler.toml"
echo "2. Run migrations: npm run migrate"
echo "3. Set up environment variables in .dev.vars"
echo "4. Configure Cloudflare Access for OAuth"
echo "5. Set secrets: wrangler secret put CLAUDE_API_KEY (etc.)"
echo ""
echo "📖 See docs/devops-build-config.md for detailed setup instructions"
