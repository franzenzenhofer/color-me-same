/**
 * Color Me Same - Cloudflare Worker
 * A puzzle game with server-side game logic and BFS solver
 */

import { Router } from 'itty-router';
import { generatePuzzle, solvePuzzle, applyMove, isWinningState } from './game-logic.js';
// import { html } from './templates.js';

const router = Router();

// Static assets are handled automatically by Cloudflare Workers
// SPA routing is handled by not_found_handling = "single-page-application"

// API: Generate new puzzle
router.post('/api/generate', async (request) => {
  const { difficulty = 'easy' } = await request.json();
  
  const puzzle = await generatePuzzle(difficulty);
  
  return new Response(JSON.stringify(puzzle), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// API: Solve puzzle (BFS solver)
router.post('/api/solve', async (request) => {
  const { grid, power, locked, colors } = await request.json();
  
  // Run solver in the Worker (could also use Durable Object for complex cases)
  const solution = await solvePuzzle(grid, power, locked, colors);
  
  return new Response(JSON.stringify(solution), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// API: Apply move
router.post('/api/move', async (request) => {
  const { grid, row, col, power, locked, colors } = await request.json();
  
  const result = applyMove(grid, row, col, power, locked, colors);
  const won = isWinningState(result.grid);
  
  return new Response(JSON.stringify({ ...result, won }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// API: Get leaderboard
router.get('/api/leaderboard/:difficulty', async (request, env) => {
  const { difficulty } = request.params;
  
  const leaderboard = await env.GAME_STATE.get(`leaderboard:${difficulty}`, { type: 'json' });
  
  return new Response(JSON.stringify(leaderboard || []), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// API: Submit score
router.post('/api/score', async (request, env) => {
  const { name, score, moves, time, difficulty } = await request.json();
  
  const key = `leaderboard:${difficulty}`;
  const leaderboard = await env.GAME_STATE.get(key, { type: 'json' }) || [];
  
  leaderboard.push({
    name,
    score,
    moves,
    time,
    timestamp: Date.now(),
  });
  
  // Keep top 100 scores
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.splice(100);
  
  await env.GAME_STATE.put(key, JSON.stringify(leaderboard));
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// All static assets and SPA routing are handled automatically by Cloudflare Workers
// with the [assets] configuration in wrangler.toml

// Helper function for MIME types

  //   const ext = filename.split('.').pop().toLowerCase();
  const types = {
    'js': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'json': 'application/json',
  };
  return types[ext] || 'text/plain';
}

// Durable Object for real-time game sessions
export class GameSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/websocket') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      const [client, server] = Object.values(new WebSocketPair());
      
      await this.handleSession(server);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    
    return new Response('Not found', { status: 404 });
  }

  async handleSession(websocket) {
    websocket.accept();
    this.sessions.push(websocket);
    
    websocket.addEventListener('message', async (msg) => {
      const data = JSON.parse(msg.data);
      
      // Broadcast moves to all connected clients
      if (data.type === 'move') {
        for (const session of this.sessions) {
          if (session !== websocket && session.readyState === WebSocket.OPEN) {
            session.send(JSON.stringify(data));
          }
        }
      }
    });
    
    websocket.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s !== websocket);
    });
  }
}

// Export default handler
export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx);
  },
};