export const computeScore = (
  moves: number,
  optimal: number,
  time: number,
  timeLimit: number,
  difficultyBonus: number,
): number => {
  const efficiency = optimal ? Math.round((optimal / moves) * 100) : 100;
  const timeBonus = timeLimit ? Math.max(0, (Math.max(300, timeLimit) - time) * 5) : 1000;
  return 1000 + efficiency * 10 + timeBonus + difficultyBonus;
};

export const getDifficultyBonus = (difficulty: string): number => {
  switch (difficulty) {
    case 'easy': return 100;
    case 'medium': return 200;
    case 'hard': return 300;
    default: return 0;
  }
};