#!/bin/bash

# Color Me Same - Deployment Script
set -euo pipefail

echo "🎮 Color Me Same - Cloudflare Worker Deployment"
echo "============================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please login to Cloudflare..."
    wrangler login
fi

# Environment selection
echo ""
echo "Select deployment environment:"
echo "1) Development (preview)"
echo "2) Production"
read -p "Enter choice (1-2): " choice

case $choice in
    1)
        ENV="preview"
        echo "📦 Deploying to preview environment..."
        ;;
    2)
        ENV="production"
        echo "🚀 Deploying to production..."
        read -p "⚠️  Are you sure you want to deploy to production? (y/N): " confirm
        if [[ $confirm != "y" && $confirm != "Y" ]]; then
            echo "Deployment cancelled."
            exit 0
        fi
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

# Run tests first
echo ""
echo "🧪 Running tests..."
npm test || {
    echo "❌ Tests failed. Please fix before deploying."
    exit 1
}

# Check KV namespaces
echo ""
echo "🗄️  Checking KV namespaces..."
if ! wrangler kv:namespace list | grep -q "GAME_STATE"; then
    echo "Creating KV namespace..."
    wrangler kv:namespace create "GAME_STATE"
    wrangler kv:namespace create "GAME_STATE" --preview
    echo "⚠️  Please update wrangler.toml with the new namespace IDs!"
    exit 1
fi

# Deploy
echo ""
if [[ $ENV == "preview" ]]; then
    wrangler deploy --env preview
else
    wrangler deploy
fi

echo ""
echo "✅ Deployment complete!"
echo ""

# Get deployment URL
if [[ $ENV == "preview" ]]; then
    echo "🌐 Preview URL: https://color-me-same.preview.workers.dev"
else
    echo "🌐 Production URL: https://color-me-same.workers.dev"
    echo "🌐 Custom domain: https://color-me-same.franzai.com"
fi

# Tail logs
echo ""
read -p "Would you like to tail the logs? (y/N): " tail_logs
if [[ $tail_logs == "y" || $tail_logs == "Y" ]]; then
    wrangler tail
fi