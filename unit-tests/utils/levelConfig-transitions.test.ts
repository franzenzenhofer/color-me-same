import { describe, it, expect } from 'vitest';
import { getLevelConfig } from '../../src/utils/levelConfig';

describe('Level Configuration Transitions', () => {
  it('should ensure all levels can generate required moves within grid limits', () => {
    const testLevels = [1, 9, 10, 11, 15, 18, 19, 20, 25, 32, 33, 40, 50];
    
    for (const level of testLevels) {
      const config = getLevelConfig(level);
      const maxPossibleMoves = config.gridSize * config.gridSize * (config.colors - 1);
      const canGenerate = config.requiredMoves <= maxPossibleMoves;
      
      expect(canGenerate).toBe(true);
      
      // Log for visibility
      console.log(
        `Level ${level}: ${config.gridSize}x${config.gridSize} grid, ` +
        `${config.colors} colors, ${config.requiredMoves} moves ` +
        `(max possible: ${maxPossibleMoves})`
      );
    }
  });
  
  it('should transition from 3x3 to 4x4 at level 19', () => {
    const level18 = getLevelConfig(18);
    const level19 = getLevelConfig(19);
    
    expect(level18.gridSize).toBe(3);
    expect(level19.gridSize).toBe(4);
    expect(level18.requiredMoves).toBe(18); // Max for 3x3 with 3 colors
    expect(level19.requiredMoves).toBe(19); // Continues progression
  });
  
  it('should transition from 4x4 to 5x5 at level 33', () => {
    const level32 = getLevelConfig(32);
    const level33 = getLevelConfig(33);
    
    expect(level32.gridSize).toBe(4);
    expect(level33.gridSize).toBe(5);
    expect(level32.requiredMoves).toBe(32); // Max for 4x4 with 3 colors
    expect(level33.requiredMoves).toBe(33); // Continues progression
  });
  
  it('should never require more moves than mathematically possible', () => {
    // Test levels 1-100
    for (let level = 1; level <= 100; level++) {
      const config = getLevelConfig(level);
      const maxPossibleMoves = config.gridSize * config.gridSize * (config.colors - 1);
      
      expect(config.requiredMoves).toBeLessThanOrEqual(maxPossibleMoves);
    }
  });
  
  it('should have continuous move progression without drops', () => {
    let previousMoves = 0;
    
    // Check levels 1-50 for continuous progression
    for (let level = 1; level <= 50; level++) {
      const config = getLevelConfig(level);
      
      // Moves should never decrease
      expect(config.requiredMoves).toBeGreaterThanOrEqual(previousMoves);
      
      previousMoves = config.requiredMoves;
    }
  });
});