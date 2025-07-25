// Generate tutorial patterns using reverse clicks

// Helper to apply REVERSE click (subtract instead of add)
function applyReverseClick(grid, row, col, colors = 3) {
  const n = grid.length;
  const newGrid = grid.map(row => [...row]);
  
  // + pattern
  const deltas = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
  
  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      // Subtract 1 (mod colors)
      newGrid[nr][nc] = (newGrid[nr][nc] - 1 + colors) % colors;
    }
  }
  
  return newGrid;
}

// Generate Level 2 pattern
console.log("Generating Level 2 pattern (2 clicks)...");
let grid2 = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

// Apply reverse clicks in the order they'll be solved
grid2 = applyReverseClick(grid2, 1, 1); // Second click will be center
console.log("After reverse click (1,1):", JSON.stringify(grid2));

grid2 = applyReverseClick(grid2, 0, 0); // First click will be top-left
console.log("After reverse click (0,0):", JSON.stringify(grid2));
console.log("This is the initial pattern for Level 2");
console.log("Solution: click (0,0) then (1,1)");

// Generate Level 3 pattern
console.log("\n\nGenerating Level 3 pattern (3 clicks)...");
let grid3 = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

// Apply reverse clicks
grid3 = applyReverseClick(grid3, 2, 2); // Third click
console.log("After reverse click (2,2):", JSON.stringify(grid3));

grid3 = applyReverseClick(grid3, 1, 1); // Second click
console.log("After reverse click (1,1):", JSON.stringify(grid3));

grid3 = applyReverseClick(grid3, 0, 0); // First click
console.log("After reverse click (0,0):", JSON.stringify(grid3));
console.log("This is the initial pattern for Level 3");
console.log("Solution: click (0,0) then (1,1) then (2,2)");