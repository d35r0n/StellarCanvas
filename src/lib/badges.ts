export const BADGE_DEFS = [
  {
    id: 1,
    name: 'First Pixel',
    description: 'Paint your first pixel on the canvas',
  },
  { id: 2, name: 'Pixel Artist', description: 'Paint 10 pixels' },
  { id: 3, name: 'Pixel Master', description: 'Paint 100 pixels' },
  {
    id: 4,
    name: 'Top 10',
    description: 'Reach the top 10 on the leaderboard',
  },
] as const;

export const BADGE_THRESHOLDS: Record<number, string> = {
  1: 'First Pixel',
  2: 'Pixel Artist',
  3: 'Pixel Master',
};
