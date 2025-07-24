/**
 * Color Me Same - Enhanced Cloudflare Worker
 * Serves React app and handles API endpoints
 */

import { Router } from 'itty-router';
import { generatePuzzle, solvePuzzle, applyMove, isWinningState } from './game-logic.js';

const router = Router();

// Import manifest for production assets
import manifestJSON from '__STATIC_CONTENT_MANIFEST';
const manifest = JSON.parse(manifestJSON || '{}');

// API Routes
router.post('/api/generate', async (request) => {
  const { difficulty = 'easy' } = await request.json();
  const puzzle = await generatePuzzle(difficulty);
  
  return new Response(JSON.stringify(puzzle), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.post('/api/solve', async (request) => {
  const { grid, power, locked, colors } = await request.json();
  const solution = await solvePuzzle(grid, power, locked, colors);
  
  return new Response(JSON.stringify(solution), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.post('/api/move', async (request) => {
  const { grid, row, col, power, locked, colors } = await request.json();
  const result = applyMove(grid, row, col, power, locked, colors);
  const won = isWinningState(result.grid);
  
  return new Response(JSON.stringify({ ...result, won }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

router.get('/api/leaderboard/:difficulty', async (request, env) => {
  const { difficulty } = request.params;
  const leaderboard = await env.GAME_STATE.get(`leaderboard:${difficulty}`, { type: 'json' });
  
  return new Response(JSON.stringify(leaderboard || []), {
    headers: { 'Content-Type': 'application/json' },
  });
});

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
  
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard.splice(100);
  
  await env.GAME_STATE.put(key, JSON.stringify(leaderboard));
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Serve static assets and React app
router.get('/*', async (request, env, ctx) => {
  const url = new URL(request.url);
  
  // In development, proxy to Vite dev server
  if (env.ENVIRONMENT === 'development') {
    return fetch(`http://localhost:3000${url.pathname}`);
  }
  
  // In production, serve from KV/R2
  try {
    // Try exact path first
    let asset = await env.__STATIC_CONTENT.get(url.pathname);
    
    // If not found and no extension, try index.html (SPA routing)
    if (!asset && !url.pathname.includes('.')) {
      asset = await env.__STATIC_CONTENT.get('index.html');
    }
    
    if (asset) {
      const headers = {
        'Content-Type': getMimeType(url.pathname),
        'Cache-Control': url.pathname === '/index.html' 
          ? 'public, max-age=0, must-revalidate' 
          : 'public, max-age=31536000, immutable',
      };
      
      return new Response(asset.body, { headers });
    }
  } catch (e) {
    console.error('Error serving asset:', e);
  }
  
  return new Response('Not found', { status: 404 });
});

function getMimeType(pathname) {
  const ext = pathname.split('.').pop()?.toLowerCase();
  const types = {
    'js': 'application/javascript',
    'mjs': 'application/javascript',
    'css': 'text/css',
    'html': 'text/html',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'svg': 'image/svg+xml',
    'json': 'application/json',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
  };
  return types[ext] || 'text/plain';
}

// WebSocket support for multiplayer
export class GameSession {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/websocket') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      const [client, server] = Object.values(new WebSocketPair());
      await this.handleSession(server, request);
      
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }
    
    return new Response('Not found', { status: 404 });
  }

  async handleSession(websocket, request) {
    websocket.accept();
    const sessionId = crypto.randomUUID();
    
    this.sessions.set(sessionId, {
      websocket,
      playerId: null,
      roomId: null,
    });
    
    websocket.addEventListener('message', async (msg) => {
      const data = JSON.parse(msg.data);
      const session = this.sessions.get(sessionId);
      
      switch (data.type) {
        case 'join':
          session.playerId = data.playerId;
          session.roomId = data.roomId;
          
          // Broadcast to room
          this.broadcastToRoom(data.roomId, {
            type: 'player-joined',
            playerId: data.playerId,
          }, sessionId);
          break;
          
        case 'move':
          // Broadcast moves to room
          this.broadcastToRoom(session.roomId, {
            type: 'move',
            playerId: session.playerId,
            row: data.row,
            col: data.col,
          }, sessionId);
          break;
      }
    });
    
    websocket.addEventListener('close', () => {
      const session = this.sessions.get(sessionId);
      if (session?.roomId) {
        this.broadcastToRoom(session.roomId, {
          type: 'player-left',
          playerId: session.playerId,
        }, sessionId);
      }
      this.sessions.delete(sessionId);
    });
  }

  broadcastToRoom(roomId, data, excludeSessionId) {
    for (const [id, session] of this.sessions) {
      if (session.roomId === roomId && id !== excludeSessionId) {
        if (session.websocket.readyState === WebSocket.OPEN) {
          session.websocket.send(JSON.stringify(data));
        }
      }
    }
  }
}

export default {
  fetch: router.handle,
};