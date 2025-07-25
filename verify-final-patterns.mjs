// Verify the final tutorial patterns

// Helper to apply click
function simulateClick(grid, row, col, colors = 3) {
  const n = grid.length;
  const newGrid = grid.map(row => [...row]);
  
  // + pattern
  const deltas = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
  
  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
      newGrid[nr][nc] = (newGrid[nr][nc] + 1) % colors;
    }
  }
  
  return newGrid;
}

// Test Level 1
console.log("Testing Level 1 pattern...");
let grid1 = [
  [0, 2, 0],
  [2, 2, 2],
  [0, 2, 0]
];

console.log("Initial:", JSON.stringify(grid1));
grid1 = simulateClick(grid1, 1, 1); // center
console.log("After click (1,1):", JSON.stringify(grid1));
console.log("Expected: [[0,0,0],[0,0,0],[0,0,0]]");
console.log("✓ Level 1:", JSON.stringify(grid1) === JSON.stringify([[0,0,0],[0,0,0],[0,0,0]]) ? "PASS" : "FAIL");

// Test Level 2
console.log("\n\nTesting Level 2 pattern...");
let grid2 = [
  [2, 1, 0],
  [1, 2, 2],
  [0, 2, 0]
];

console.log("Initial:", JSON.stringify(grid2));

// Apply solution clicks
grid2 = simulateClick(grid2, 0, 0); // top-left
console.log("After click (0,0):", JSON.stringify(grid2));

grid2 = simulateClick(grid2, 1, 1); // center
console.log("After click (1,1):", JSON.stringify(grid2));
console.log("Expected: [[0,0,0],[0,0,0],[0,0,0]]");
console.log("✓ Level 2:", JSON.stringify(grid2) === JSON.stringify([[0,0,0],[0,0,0],[0,0,0]]) ? "PASS" : "FAIL");

// Test Level 3
console.log("\n\nTesting Level 3 pattern...");
let grid3 = [
  [2, 1, 0],
  [1, 2, 1],
  [0, 1, 2]
];

console.log("Initial:", JSON.stringify(grid3));

// Apply solution clicks
grid3 = simulateClick(grid3, 0, 0); // top-left
console.log("After click (0,0):", JSON.stringify(grid3));

grid3 = simulateClick(grid3, 1, 1); // center
console.log("After click (1,1):", JSON.stringify(grid3));

grid3 = simulateClick(grid3, 2, 2); // bottom-right
console.log("After click (2,2):", JSON.stringify(grid3));
console.log("Expected: [[0,0,0],[0,0,0],[0,0,0]]");
console.log("✓ Level 3:", JSON.stringify(grid3) === JSON.stringify([[0,0,0],[0,0,0],[0,0,0]]) ? "PASS" : "FAIL");