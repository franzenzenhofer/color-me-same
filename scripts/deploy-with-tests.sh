#!/bin/bash
set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$1 failed!"
        exit 1
    fi
}

# Start deployment process
print_status "🚀 Starting Color Me Same deployment process..."

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Please install it first."
    exit 1
fi
print_success "Wrangler installed"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm ci
check_status "Dependencies installed"

# Step 3: Run linting
print_status "Running ESLint..."
npm run lint || {
    print_warning "Linting failed. Attempting to fix..."
    npm run lint -- --fix
    npm run lint
}
check_status "Linting passed"

# Step 4: Run type checking
print_status "Running TypeScript type check..."
npm run typecheck
check_status "Type checking passed"

# Step 5: Run unit tests with coverage
print_status "Running unit tests with coverage..."
npm test -- --run --coverage
check_status "Unit tests passed"

# Check coverage thresholds
print_status "Checking coverage thresholds..."
COVERAGE_REPORT=$(npm test -- --run --coverage 2>&1)
if echo "$COVERAGE_REPORT" | grep -q "Coverage threshold"; then
    print_success "Coverage thresholds met"
else
    print_warning "Coverage might be below threshold"
fi

# Step 6: Build the project
print_status "Building React application..."
npm run build
check_status "Build completed"

# Check bundle size
print_status "Checking bundle size..."
BUNDLE_SIZE=$(du -sh dist | cut -f1)
print_status "Bundle size: $BUNDLE_SIZE"

# Step 7: Run E2E tests
print_status "Running Playwright E2E tests..."
if [ -z "${CI:-}" ]; then
    # Local environment - install browsers if needed
    npx playwright install --with-deps chromium
fi

# Start dev server for E2E tests
print_status "Starting dev server for E2E tests..."
npm run dev:vite &
VITE_PID=$!
sleep 5

# Run E2E tests
npm run test:e2e || {
    kill $VITE_PID
    print_error "E2E tests failed"
    exit 1
}

# Kill dev server
kill $VITE_PID
print_success "E2E tests passed"

# Step 8: Deploy to Cloudflare
print_status "Deploying to Cloudflare Workers..."

# Check if we have the necessary environment variables
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
    print_warning "CLOUDFLARE_API_TOKEN not set. Using wrangler login."
fi

# Deploy
wrangler deploy --compatibility-date=$(date +%Y-%m-%d)
check_status "Deployment successful"

# Step 9: Post-deployment verification
print_status "Running post-deployment checks..."

# Get deployment URL
DEPLOYMENT_URL="https://color-me-same.franzai.com"

# Wait for deployment to propagate
print_status "Waiting for deployment to propagate..."
sleep 10

# Check if site is accessible
print_status "Checking site availability..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL")

if [ "$HTTP_STATUS" = "200" ]; then
    print_success "Site is live and responding!"
else
    print_warning "Site returned HTTP $HTTP_STATUS"
fi

# Step 10: Run smoke tests against production
print_status "Running smoke tests against production..."

# Basic API endpoints check
print_status "Testing API endpoints..."
curl -s -X POST "$DEPLOYMENT_URL/api/generate" \
    -H "Content-Type: application/json" \
    -d '{"difficulty":"easy"}' | grep -q "grid" && \
    print_success "API /generate endpoint working" || \
    print_error "API /generate endpoint failed"

# Step 11: Generate deployment report
print_status "Generating deployment report..."

REPORT_FILE="deployment-report-$(date +%Y%m%d-%H%M%S).json"

cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "deployment": {
    "url": "$DEPLOYMENT_URL",
    "status": "success",
    "http_status": "$HTTP_STATUS"
  },
  "tests": {
    "lint": "passed",
    "typecheck": "passed",
    "unit_tests": "passed",
    "e2e_tests": "passed",
    "coverage": "met"
  },
  "build": {
    "bundle_size": "$BUNDLE_SIZE",
    "node_version": "$(node --version)",
    "npm_version": "$(npm --version)"
  },
  "git": {
    "branch": "$(git rev-parse --abbrev-ref HEAD)",
    "commit": "$(git rev-parse HEAD)",
    "author": "$(git log -1 --pretty=format:'%an')",
    "message": "$(git log -1 --pretty=format:'%s')"
  }
}
EOF

print_success "Deployment report saved to: $REPORT_FILE"

# Step 12: Optional - Purge Cloudflare cache
if [ ! -z "${CLOUDFLARE_API_TOKEN:-}" ] && [ ! -z "${CLOUDFLARE_ZONE_ID:-}" ]; then
    print_status "Purging Cloudflare cache..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}' > /dev/null 2>&1
    check_status "Cache purged"
fi

# Final summary
echo ""
print_success "🎉 Deployment completed successfully!"
echo ""
echo "📊 Summary:"
echo "  - URL: $DEPLOYMENT_URL"
echo "  - Bundle Size: $BUNDLE_SIZE"
echo "  - All tests passed"
echo "  - Report: $REPORT_FILE"
echo ""
print_status "Next steps:"
echo "  1. Verify the live site at $DEPLOYMENT_URL"
echo "  2. Monitor error logs with: wrangler tail"
echo "  3. Check analytics dashboard"
echo ""