#!/bin/bash
set -euo pipefail

echo "🚀 Deploying Color Me Same to Cloudflare..."

# Build the React app
echo "📦 Building React app..."
npm run build

# Deploy to Cloudflare Workers
echo "☁️  Deploying to Cloudflare Workers..."
wrangler deploy

# Get the deployment URL
echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://color-me-same.franzai.com"

# Optional: Run smoke tests
echo "🧪 Running smoke test..."
curl -s -o /dev/null -w "%{http_code}" https://color-me-same.franzai.com | grep -q "200" && echo "✅ Site is responding!" || echo "❌ Site check failed"