import { describe, it, expect } from 'vitest';
import { getTutorialPattern, isTutorialLevel, getTutorialCompleteMessage } from '../tutorialPatterns';

describe('Tutorial Patterns', () => {
  describe('getTutorialPattern', () => {
    it('should return correct pattern for level 1', () => {
      const pattern = getTutorialPattern(1);
      
      expect(pattern).toBeTruthy();
      expect(pattern!.level).toBe(1);
      expect(pattern!.solution).toHaveLength(1);
      expect(pattern!.solution[0]).toEqual({ row: 1, col: 1 }); // Center tile
      
      // Check initial grid has only center tile different
      const grid = pattern!.initialGrid;
      expect(grid[1][1]).toBe(1); // Center is different
      expect(grid[0][0]).toBe(0); // All others are 0
      expect(grid[0][1]).toBe(0);
      expect(grid[0][2]).toBe(0);
      expect(grid[1][0]).toBe(0);
      expect(grid[1][2]).toBe(0);
      expect(grid[2][0]).toBe(0);
      expect(grid[2][1]).toBe(0);
      expect(grid[2][2]).toBe(0);
    });
    
    it('should return correct pattern for level 2', () => {
      const pattern = getTutorialPattern(2);
      
      expect(pattern).toBeTruthy();
      expect(pattern!.level).toBe(2);
      expect(pattern!.solution).toHaveLength(2);
      expect(pattern!.solution[0]).toEqual({ row: 1, col: 1 });
      expect(pattern!.solution[1]).toEqual({ row: 0, col: 1 });
      
      // Check cross pattern
      const grid = pattern!.initialGrid;
      expect(grid[0][1]).toBe(1); // Top
      expect(grid[1][0]).toBe(1); // Left
      expect(grid[1][1]).toBe(0); // Center
      expect(grid[1][2]).toBe(1); // Right
      expect(grid[2][1]).toBe(1); // Bottom
    });
    
    it('should return correct pattern for level 3', () => {
      const pattern = getTutorialPattern(3);
      
      expect(pattern).toBeTruthy();
      expect(pattern!.level).toBe(3);
      expect(pattern!.solution).toHaveLength(3);
      expect(pattern!.solution[0]).toEqual({ row: 0, col: 0 });
      expect(pattern!.solution[1]).toEqual({ row: 0, col: 2 });
      expect(pattern!.solution[2]).toEqual({ row: 1, col: 1 });
      
      // Check varied color pattern
      const grid = pattern!.initialGrid;
      expect(grid[0][0]).toBe(1);
      expect(grid[0][2]).toBe(1);
      expect(grid[1][1]).toBe(2);
      expect(grid[2][0]).toBe(1);
      expect(grid[2][2]).toBe(1);
    });
    
    it('should return null for non-tutorial levels', () => {
      expect(getTutorialPattern(4)).toBeNull();
      expect(getTutorialPattern(10)).toBeNull();
      expect(getTutorialPattern(100)).toBeNull();
    });
    
    it('should have solvable patterns', () => {
      // All tutorial patterns should result in all zeros
      for (let level = 1; level <= 3; level++) {
        const pattern = getTutorialPattern(level);
        expect(pattern).toBeTruthy();
        
        const targetGrid = pattern!.targetGrid;
        for (const row of targetGrid) {
          for (const cell of row) {
            expect(cell).toBe(0);
          }
        }
      }
    });
  });
  
  describe('isTutorialLevel', () => {
    it('should return true for levels 1-3', () => {
      expect(isTutorialLevel(1)).toBe(true);
      expect(isTutorialLevel(2)).toBe(true);
      expect(isTutorialLevel(3)).toBe(true);
    });
    
    it('should return false for non-tutorial levels', () => {
      expect(isTutorialLevel(0)).toBe(false);
      expect(isTutorialLevel(4)).toBe(false);
      expect(isTutorialLevel(10)).toBe(false);
      expect(isTutorialLevel(100)).toBe(false);
    });
  });
  
  describe('getTutorialCompleteMessage', () => {
    it('should return correct messages for tutorial levels', () => {
      expect(getTutorialCompleteMessage(1)).toBe('Great! Basics learned!');
      expect(getTutorialCompleteMessage(2)).toBe('Nice! + pattern mastered!');
      expect(getTutorialCompleteMessage(3)).toBe('Perfect! Ready to play!');
    });
    
    it('should return empty string for non-tutorial levels', () => {
      expect(getTutorialCompleteMessage(4)).toBe('');
      expect(getTutorialCompleteMessage(10)).toBe('');
    });
  });
});