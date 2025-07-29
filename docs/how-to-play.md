# How to Play

## Goal
🟥🟩🟥  →  🟩🟩🟩 ✅  
🟩🟥🟩  →  🟩🟩🟩  
🟥🟩🟥  →  🟩🟩🟩  
Make all tiles the same color!

## Click Pattern
```
    ⬆️
⬅️  👆  ➡️
    ⬇️
```
Click affects 5 tiles in a cross pattern

## Color Cycle
🟥 → 🟩 → 🟦 → 🟥  
Colors cycle in order

## Examples

### Basic Click
🟥🟥🟥  →  🟥🟩🟥  
🟥🟩🟥  →  🟩🟥🟩  
🟥🟥🟥  →  🟥🟩🟥  

### Corner vs Center
**Corner (3 tiles)**  
👆→·  
↓ · ·  
· · ·  

**Center (5 tiles)**  
· ↑ ·  
←👆→  
· ↓ ·  

## Strategy

### 1. Count Colors First
5 red, 4 green? Make them all green (fewer moves)

### 2. Click Power
Center = 5 tiles, Edge = 4 tiles, Corner = 3 tiles

### 3. Shared Tiles
Adjacent clicks share 1 tile - it flips twice (cancels)

### 4. Work Backwards
Picture the winning board. Count what needs to change

## Level Progression
**L1-9**: 🟥🟩 (2 colors)  
**L10-18**: 🟥🟩🟦 (3 colors)  
**L19-27**: 🟥🟩🟦🟨 (4 colors)  
**L28+**: Bigger grids (4×4, 5×5)

## Common Patterns & Min-Moves

### Checkerboard (hardest) = 5 clicks
🟥🟩🟥    👆⬜👆    🟩🟩🟩  
🟩🟥🟩 → ⬜👆⬜ → 🟩🟩🟩  
🟥🟩🟥    👆⬜👆    🟩🟩🟩  
**4 corners + center**

### Lines (row/column) = 1-3 clicks
🟩🟩🟩    ⬜⬜⬜  
🟥🟥🟥 → ⬜👆⬜  
🟩🟩🟩    ⬜⬜⬜  
**Click center of each bad line**

### L-Shape = 2 clicks
🟩🟥🟥    ⬜⬜⬜  
🟩🟥🟥 → ⬜👆⬜  
🟩🟩🟥    ⬜⬜👆  
**Click elbow, then opposite arm**

### Single Off-Color = 1 click
🟥🟥🟥    ⬜⬜⬜  
🟥🟩🟥 → ⬜👆⬜  
🟥🟥🟥    ⬜⬜⬜  
**Click it once. Done.**

### Full Row/Col Mis-colored = ⌈len/2⌉ clicks
🟥🟥🟥    👆⬜👆  
🟩🟩🟩 → ⬜⬜⬜  
🟩🟩🟩    ⬜⬜⬜  
**Click every second tile along row/column**

## Advanced Techniques

### The Parity Principle
For 2 colors: Count wrong tiles. Even = even clicks, odd = odd clicks

### Tile Influence Zones
Corner affects 3, edge affects 4, center affects 5 tiles

### Color Frequency
With 3+ colors: Target the most common color

## Quick Tips
✅ For 2 colors: Target the minority color  
✅ Start with high-impact moves (center/edges)  
✅ Save corners for precision fixes  
✅ Adjacent clicks cancel shared tiles  
✅ Plan 2-3 moves ahead  

## Scoring
⭐⭐⭐ = Optimal moves  
⭐⭐ = Good  
⭐ = Complete  
Points: Base (1000) + Efficiency + Speed