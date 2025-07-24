#!/bin/bash
set -euo pipefail

echo "🚀 Deploying Color Me Same to Cloudflare..."

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📊 Current version: $CURRENT_VERSION"

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

# Commit any version changes
if [[ $(git status --porcelain) ]]; then
    echo "📝 Committing version changes..."
    git add .
    git commit -m "chore: bump version to v$CURRENT_VERSION"
fi

# Tag the release
echo "🏷️  Tagging release v$CURRENT_VERSION..."
git tag -a "v$CURRENT_VERSION" -m "Release v$CURRENT_VERSION" 2>/dev/null || echo "Tag already exists"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin master --follow-tags

echo "✅ Successfully deployed v$CURRENT_VERSION to Cloudflare Workers and GitHub!"
echo "🔗 GitHub: https://github.com/franzenzenhofer/color-me-same"