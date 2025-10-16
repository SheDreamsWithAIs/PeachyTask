// Simple goal configuration per level. Adjust as desired.
// Returns an array of { emoji, remaining } picked from the current fruits.

import levels from './levels.json';

export function getLevelConfig(level) {
  // choose the config with the highest level <= requested level
  let chosen = levels[0];
  for (const cfg of levels) {
    if (cfg.level <= level && cfg.level >= chosen.level) chosen = cfg;
  }
  return chosen;
}

export function getGoalsForLevel(level, fallbackFruits) {
  const cfg = getLevelConfig(level);
  const goals = (cfg?.goals || []).map(g => ({ emoji: g.emoji, remaining: g.amount }));
  if (goals.length > 0) return goals;
  // Fallback if config missing
  const defaults = Array.isArray(fallbackFruits) && fallbackFruits.length > 0 ? fallbackFruits : ['🍑','🍓','🍊','🍋'];
  return defaults.slice(0, 3).map((emoji, idx) => ({ emoji, remaining: [8,7,6][idx] || 6 }));
}

export function getFruitsForLevel(level, currentFruits) {
  const cfg = getLevelConfig(level);
  return cfg?.fruits || currentFruits;
}


