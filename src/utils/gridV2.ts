/**
 * Pure functional grid utilities based on mathematical model
 */

/**
 * Apply a click to the grid following the game rules:
 * - Normal tile: affects + pattern (self and 4 neighbors)
 * - Power tile: affects 3x3 area
 * - Locked tiles are not affected
 * 
 * This is a pure function - returns a new grid without modifying the input
 */
export function applyClick(
  grid: number[][],
  row: number,
  col: number,
  colors: number,
  isPowerTile: boolean,
  lockedTiles: Map<string, number>
): number[][] {
  const n = grid.length;
  const newGrid = grid.map(row => [...row]); // Deep copy
  
  // Define affected cells based on tile type
  const deltas = isPowerTile
    ? [[-1,-1], [-1,0], [-1,1], [0,-1], [0,0], [0,1], [1,-1], [1,0], [1,1]] // 3x3
    : [[0,0], [-1,0], [1,0], [0,-1], [0,1]]; // + pattern
  
  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    
    // Check bounds
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      const key = `${nr}-${nc}`;
      // Check if tile is locked
      const lockCount = lockedTiles.get(key) || 0;
      if (lockCount === 0) {
        newGrid[nr][nc] = (newGrid[nr][nc] + 1) % colors;
      }
    }
  }
  
  return newGrid;
}

/**
 * Apply a REVERSE click (subtract 1 instead of add 1)
 * This is used during puzzle generation to scramble from solved state
 */
export function applyReverseClick(
  grid: number[][],
  row: number,
  col: number,
  colors: number,
  isPowerTile: boolean,
  lockedTiles: Map<string, number>
): number[][] {
  const n = grid.length;
  const newGrid = grid.map(row => [...row]); // Deep copy
  
  // Define affected cells based on tile type
  const deltas = isPowerTile
    ? [[-1,-1], [-1,0], [-1,1], [0,-1], [0,0], [0,1], [1,-1], [1,0], [1,1]] // 3x3
    : [[0,0], [-1,0], [1,0], [0,-1], [0,1]]; // + pattern
  
  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    
    // Check bounds
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      const key = `${nr}-${nc}`;
      // Check if tile is locked
      const lockCount = lockedTiles.get(key) || 0;
      if (lockCount === 0) {
        // Subtract 1 (mod colors) - this is the inverse operation
        newGrid[nr][nc] = (newGrid[nr][nc] - 1 + colors) % colors;
      }
    }
  }
  
  return newGrid;
}

/**
 * Check if the grid is in a winning state (all tiles same color)
 */
export function isWinningState(grid: number[][]): boolean {
  if (!grid.length || !grid[0].length) return false;
  const targetColor = grid[0][0];
  return grid.every(row => row.every(cell => cell === targetColor));
}

/**
 * Create a deep copy of the grid
 */
export function cloneGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row]);
}

/**
 * Convert grid position to string key
 */
export function posToKey(row: number, col: number): string {
  return `${row}-${col}`;
}

/**
 * Convert string key to grid position
 */
export function keyToPos(key: string): { row: number; col: number } {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
}

/**
 * Get all valid positions in a grid
 */
export function getAllPositions(size: number): { row: number; col: number }[] {
  const positions: { row: number; col: number }[] = [];
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
}

/**
 * Shuffle an array in-place using Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}