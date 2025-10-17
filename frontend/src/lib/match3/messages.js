// Centralized randomized copy for nudges and win/lose modals.

export const nudgesWin = [
  'Nice warmup. Ready to crush a quick task?',
  'Momentum is yours—pick one small task next.',
  'You’ve got this! Jump back to your top task.',
  'Great focus—channel it into a 2-minute task.',
  'Tiny step, big momentum. Back to tasks?',
];

export const nudgesLose = [
  'Fresh start, fresh focus—try a tiny task?',
  'Shake it off. One quick task to regain momentum?',
  'No worries—reset your board or knock out a 2‑minute task.',
];

export const wins = [
  'Level complete! Peachy progress.',
  'Sweet match! Nice win!',
  'You’re on a roll!',
  'Victory!',
];

export const losses = [
  'Tough board. Fresh start, fresh focus.',
  'No worries—reset and keep the flow.',
  'Every miss teaches. Try a new board or a quick task.',
];

export function getRandomMessage(list) {
  if (!list || list.length === 0) return '';
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}


