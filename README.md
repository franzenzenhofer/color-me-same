# Color Me Same - Cloudflare Worker Game

A challenging puzzle game where you make all tiles the same color, built as a Cloudflare Worker with edge computing capabilities.

## 🎮 Game Features

- **5 Difficulty Levels**: From 3x3 Easy to 6x6 Expert
- **Special Tiles**: Power tiles (3x3 effect) and Locked tiles
- **Power-ups**: Wildcard, Freeze, and Reset abilities
- **BFS Solver**: Server-side optimal solution calculation
- **Leaderboards**: Global high scores stored in KV
- **Daily Puzzles**: Consistent daily challenges for all players
- **Real-time Multiplayer**: WebSocket support via Durable Objects
- **PWA Support**: Installable with offline play

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/color-me-same.git
cd color-me-same

# Install dependencies
npm install

# Authenticate with Cloudflare
wrangler login

# Start development server
npm run dev
```

Visit `http://localhost:8787` to play locally.

### Deployment

1. **Create KV Namespace**:
```bash
wrangler kv:namespace create "GAME_STATE"
wrangler kv:namespace create "GAME_STATE" --preview
```

2. **Update wrangler.toml** with your KV namespace IDs:
```toml
[[kv_namespaces]]
binding = "GAME_STATE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"
```

3. **Deploy to Cloudflare**:
```bash
# Production deployment
npm run deploy

# Preview deployment
npm run deploy:preview
```

## 🏗️ Architecture

### Cloudflare Worker
- **Main Worker**: Handles API routes, game logic, and static asset serving
- **Durable Objects**: Manages real-time game sessions and multiplayer
- **KV Storage**: Stores leaderboards, user progress, and daily puzzles

### API Endpoints

- `POST /api/generate` - Generate new puzzle
- `POST /api/solve` - Get optimal solution
- `POST /api/move` - Apply move and return new state
- `GET /api/leaderboard/:difficulty` - Get top scores
- `POST /api/score` - Submit score

### Game Logic
- **BFS Solver**: Breadth-first search with memoization
- **Reverse Generation**: Puzzles generated from solved state
- **Move Validation**: Server-side validation prevents cheating
- **Score Calculation**: Based on efficiency, time, and difficulty

## 🎯 Game Rules

1. **Objective**: Make all tiles the same color
2. **Clicking**: Changes tile and adjacent tiles (cross pattern)
3. **Power Tiles** (⚡): Affect 3x3 area
4. **Locked Tiles** (🔒): Cannot be clicked, unlock over time
5. **Optimal Play**: Try to match the BFS solution move count

## 🛠️ Development

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Watch mode
npm test -- --watch
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Performance Monitoring

```bash
# Tail production logs
npm run tail

# View analytics
wrangler analytics
```

## 📦 Project Structure

```
color-me-same/
├── src/
│   ├── worker.js         # Main Worker entry
│   ├── game-logic.js     # Core game algorithms
│   ├── templates.js      # HTML templates
│   └── durable-objects/  # Multiplayer logic
├── public/              # Static assets
├── tests/               # Test suites
├── scripts/             # Deployment scripts
├── wrangler.toml        # Cloudflare config
└── package.json
```

## 🌐 Custom Domain Setup

1. Add custom route in `wrangler.toml`:
```toml
[[routes]]
pattern = "color-me-same.yourdomain.com/*"
zone_name = "yourdomain.com"
```

2. Deploy and configure DNS in Cloudflare dashboard

## 🔧 Environment Variables

Set in `wrangler.toml` or dashboard:

```toml
[vars]
ENVIRONMENT = "production"
SENTRY_DSN = "your-sentry-dsn"
POSTHOG_API_KEY = "your-posthog-key"
```

## 📈 Analytics Integration

The game tracks:
- Player retention (D1, D7, D30)
- Average session length
- Puzzle completion rates
- Power-up usage patterns
- Device and browser stats

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎮 Play Now

- **Production**: https://color-me-same.franzai.com
- **Preview**: https://preview.color-me-same.pages.dev

## 🐛 Known Issues

- Mobile haptic feedback requires HTTPS
- WebSocket connections limited to 1000 concurrent
- KV storage has 1MB value limit

## 🚀 Roadmap

- [ ] Level editor with shareable URLs
- [ ] Tournament mode
- [ ] Mobile app (React Native)
- [ ] AI opponent mode
- [ ] Custom themes
- [ ] Achievement system

---

Built with ❤️ using Cloudflare Workers