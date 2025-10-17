// Match-3 headless engine (Phase 1: core mechanics only)
// Core responsibilities:
// - Board creation
// - Adjacent swap
// - Match detection (>= 3 in a row or column)
// - Resolve loop: clear, collapse, refill, and cascade until stable

export const TILE = { FRUIT: 'fruit', POWER: 'power' };

export const POWER = { HLINE: 'hline', VLINE: 'vline', RAINBOW: 'rainbow', BOOM: 'boom' };

// Seven total fruits; progression decides how many are enabled later.
export const DEFAULT_FRUITS = ['🍑', '🍓', '🍊', '🍋', '🍇', '🍉', '🍒'];

export function createRng(seed = 0) {
  let s = (seed >>> 0) || 0xdeadbeef;
  return () => {
    // LCG (Numerical Recipes)
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export function createBoard(
  rows = 8,
  cols = 8,
  fruits = DEFAULT_FRUITS,
  rng = Math.random
) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ type: TILE.FRUIT, kind: fruits[(rng() * fruits.length) | 0] }))
  );
  return { rows, cols, grid };
}

// Level progression: cap at 7 fruits, unlocked in steps
export function allowedFruitsForLevel(level = 1) {
  if (level >= 30) return DEFAULT_FRUITS.slice(0, 7);
  if (level >= 20) return DEFAULT_FRUITS.slice(0, 6); // adds 🍉
  if (level >= 10) return DEFAULT_FRUITS.slice(0, 5); // adds 🍇
  return DEFAULT_FRUITS.slice(0, 4); // 🍑🍓🍊🍋
}

// Session lifecycle and telemetry
export function createSession(level = 1, seed) {
  const rng = seed !== undefined ? createRng(seed) : Math.random;
  const fruits = allowedFruitsForLevel(level);
  const state = createBoard(8, 8, fruits, rng);
  return {
    level,
    fruits,
    rng,
    state,
    score: 0,
    movesUsed: 0,
    sessionStartMs: Date.now(),
    lastResumeMs: Date.now(),
    accumulatedMs: 0,
    paused: false,
  };
}

export function pause(session) {
  if (!session.paused) {
    session.accumulatedMs += Date.now() - session.lastResumeMs;
    session.paused = true;
  }
}

export function resume(session) {
  if (session.paused) {
    session.lastResumeMs = Date.now();
    session.paused = false;
  }
}

export function getElapsedMs(session) {
  return session.accumulatedMs + (session.paused ? 0 : (Date.now() - session.lastResumeMs));
}

// Level up by score threshold; increases fruit variety and re-rolls board
export function maybeLevelUp(session, scoreThreshold = 500) {
  if (session.score >= scoreThreshold) {
    session.level += 1;
    session.fruits = allowedFruitsForLevel(session.level);
    // Recreate board with potentially more fruits; keep same dimensions
    const { rows, cols } = session.state;
    session.state = createBoard(rows, cols, session.fruits, session.rng);
    return true;
  }
  return false;
}

export function areAdjacent(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

// Returns a Set of keys "r,c" to clear for all matches >= 3
export function findMatches(state) {
  const { rows, cols, grid } = state;
  const toClear = new Set();
  const runsH = [];
  const runsV = [];

  // Horizontal runs
  for (let r = 0; r < rows; r++) {
    let run = 1;
    for (let c = 1; c <= cols; c++) {
      const same = c < cols && sameFruit(grid[r][c], grid[r][c - 1]);
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = c - run; k < c; k++) toClear.add(`${r},${k}`);
          runsH.push({ r, c0: c - run, c1: c - 1, len: run });
        }
        run = 1;
      }
    }
  }

  // Vertical runs
  for (let c = 0; c < cols; c++) {
    let run = 1;
    for (let r = 1; r <= rows; r++) {
      const same = r < rows && sameFruit(grid[r][c], grid[r - 1][c]);
      if (same) {
        run++;
      } else {
        if (run >= 3) {
          for (let k = r - run; k < r; k++) toClear.add(`${k},${c}`);
          runsV.push({ c, r0: r - run, r1: r - 1, len: run });
        }
        run = 1;
      }
    }
  }

  // Composite shapes (T/L/cross): intersection of H and V runs
  const combos = [];
  for (const h of runsH) {
    for (const v of runsV) {
      if (h.r >= v.r0 && h.r <= v.r1 && v.c >= h.c0 && v.c <= h.c1) {
        const size = h.len + v.len - 1; // intersection counted once
        if (size >= 5) combos.push({ r: h.r, c: v.c, size, h, v });
      }
    }
  }

  return { toClear, runsH, runsV, combos };
}

export function swapIfValid(
  state,
  a,
  b,
  fruits = DEFAULT_FRUITS,
  rng = Math.random
) {
  if (!areAdjacent(a, b)) return { swapped: false, cleared: 0, cascades: 0 };

  const A = state.grid[a.r][a.c];
  const B = state.grid[b.r][b.c];

  // If either is a power tile, detonate immediately per Bejeweled-style rules
  if (A?.type === TILE.POWER || B?.type === TILE.POWER) {
    const clearedA = A?.type === TILE.POWER ? applyPowerAt(state, a.r, a.c, fruitKindOrNull(B)) : new Set();
    const clearedB = B?.type === TILE.POWER ? applyPowerAt(state, b.r, b.c, fruitKindOrNull(A)) : new Set();
    const union = new Set([...clearedA, ...clearedB]);
    const { totalCleared, cascadeCount, countsByKind } = resolveAll(state, { toClear: union, runsH: [], runsV: [], combos: [] }, fruits, rng);
    return { swapped: true, cleared: totalCleared, cascades: cascadeCount, countsByKind };
  }

  // Perform tentative swap
  state.grid[a.r][a.c] = B;
  state.grid[b.r][b.c] = A;

  const initial = findMatches(state);
  if (initial.toClear.size === 0) {
    // Revert swap
    state.grid[a.r][a.c] = A;
    state.grid[b.r][b.c] = B;
    return { swapped: false, cleared: 0, cascades: 0 };
  }

  // Resolve until stable, prefer placing power-up at the swap target (b) or source (a)
  const preferred = [b, a];
  const { totalCleared, cascadeCount, countsByKind } = resolveAll(state, initial, fruits, rng, preferred);
  return { swapped: true, cleared: totalCleared, cascades: cascadeCount, countsByKind };
}

// Session-aware swap: updates score and movesUsed; returns engine swap result
export function sessionSwap(session, a, b) {
  const res = swapIfValid(session.state, a, b, session.fruits, session.rng);
  if (res.swapped) {
    // Simple score: 10 points per cleared tile
    session.score += res.cleared * 10;
    session.movesUsed += 1;
  }
  return res;
}

export function resolveAll(state, initial, fruits = DEFAULT_FRUITS, rng = Math.random, preferredPositions) {
  let totalCleared = 0;
  let cascadeCount = 0;
  const countsByKind = Object.create(null);

  // Clear provided set first (with power placements if any)
  if (initial && initial.toClear && initial.toClear.size > 0) {
    const placements = pickPowerPlacements(state, initial.runsH || [], initial.runsV || [], initial.combos || [], preferredPositions);
    const step = clearCollapseRefill(state, initial.toClear, fruits, rng, placements);
    totalCleared += step.cleared;
    mergeCounts(countsByKind, step.countsByKind);
    cascadeCount++;
  }

  // Then loop until no matches
  for (;;) {
    const matches = findMatches(state);
    if (matches.toClear.size === 0) break;
    const placements = pickPowerPlacements(state, matches.runsH, matches.runsV, matches.combos || [], undefined);
    const step = clearCollapseRefill(state, matches.toClear, fruits, rng, placements);
    totalCleared += step.cleared;
    mergeCounts(countsByKind, step.countsByKind);
    cascadeCount++;
  }

  return { totalCleared, cascadeCount, countsByKind };
}

function clearCollapseRefill(state, toClear, fruits, rng, placements) {
  const { rows, cols, grid } = state;
  let cleared = 0;
  const countsByKind = Object.create(null);

  // If we have power placements, ensure the chosen cells are NOT cleared
  const skip = new Set();
  if (placements && placements.length) {
    for (const p of placements) skip.add(`${p.r},${p.c}`);
  }

  // Pre-place powers at their target positions and mark to skip clearing
  if (placements && placements.length) {
    for (const p of placements) {
      grid[p.r][p.c] = { type: TILE.POWER, kind: p.kind };
    }
  }

  // Clear
  for (const key of toClear) {
    const [r, c] = key.split(',').map(Number);
    if (skip.has(key)) continue;
    const cell = grid[r][c];
    if (cell) {
      if (cell.type === TILE.FRUIT) {
        countsByKind[cell.kind] = (countsByKind[cell.kind] || 0) + 1;
      }
      grid[r][c] = null;
      cleared++;
    }
  }

  // Collapse each column down
  for (let c = 0; c < cols; c++) {
    // Anchor newly created power-ups in this step within their columns
    const anchorRows = new Set();
    if (placements && placements.length) {
      for (const p of placements) if (p.c === c) anchorRows.add(p.r);
    }

    const newCol = Array(rows).fill(null);
    // Keep anchored items in place
    for (const r of anchorRows) newCol[r] = grid[r][c];

    // Gather non-anchored existing cells from bottom to top
    const stack = [];
    for (let r = rows - 1; r >= 0; r--) {
      const cell = grid[r][c];
      if (!cell) continue;
      if (anchorRows.has(r)) continue;
      stack.push(cell);
    }
    // Write downwards, skipping anchored rows
    let write = rows - 1;
    while (write >= 0) {
      if (anchorRows.has(write)) { write--; continue; }
      const cell = stack.shift();
      if (cell) newCol[write] = cell; else break;
      write--;
    }
    // Fill remaining gaps with new fruits (still skipping anchors)
    while (write >= 0) {
      if (anchorRows.has(write)) { write--; continue; }
      newCol[write] = { type: TILE.FRUIT, kind: fruits[(rng() * fruits.length) | 0] };
      write--;
    }
    // Commit column
    for (let r = 0; r < rows; r++) grid[r][c] = newCol[r];
  }

  return { cleared, countsByKind };
}

function sameFruit(a, b) {
  return !!a && !!b && a.type === TILE.FRUIT && b.type === TILE.FRUIT && a.kind === b.kind;
}

function fruitKindOrNull(cell) {
  return cell && cell.type === TILE.FRUIT ? cell.kind : null;
}

function pickPowerPlacements(state, runsH, runsV, combos, preferredPositions) {
  // Determine where to spawn power tiles from runs; remove duplicates preferring RAINBOW over lines
  const chosen = new Map(); // key -> {r,c,kind}

  const assign = (r, c, kind) => {
    const key = `${r},${c}`;
    const existing = chosen.get(key);
    if (!existing || (kind === POWER.RAINBOW && existing.kind !== POWER.RAINBOW) || (kind === POWER.BOOM)) {
      chosen.set(key, { r, c, kind });
    }
  };

  const prefer = Array.isArray(preferredPositions) ? preferredPositions : [];
  const inRunH = (run, pos) => pos && pos.r === run.r && pos.c >= run.c0 && pos.c <= run.c1;
  const inRunV = (run, pos) => pos && pos.c === run.c && pos.r >= run.r0 && pos.r <= run.r1;

  // Handle composite shapes first (T/L/cross)
  const hConsumed = new Set();
  const vConsumed = new Set();
  for (const combo of combos || []) {
    // size 6 or 7 -> BOOM; size 5 -> RAINBOW
    const kind = combo.size >= 6 ? POWER.BOOM : POWER.RAINBOW;
    assign(combo.r, combo.c, kind);
    hConsumed.add(`${combo.h.r},${combo.h.c0},${combo.h.c1}`);
    vConsumed.add(`${combo.v.c},${combo.v.r0},${combo.v.r1}`);
  }

  for (const run of runsH) {
    const key = `${run.r},${run.c0},${run.c1}`;
    if (hConsumed.has(key)) continue;
    if (run.len >= 5) {
      const isBoom = run.len >= 6;
      const targetKind = isBoom ? POWER.BOOM : POWER.RAINBOW;
      let placed = false;
      for (const pos of prefer) {
        if (inRunH(run, pos)) { assign(pos.r, pos.c, targetKind); placed = true; break; }
      }
      if (!placed) {
        const center = Math.floor((run.c0 + run.c1) / 2);
        assign(run.r, center, targetKind);
      }
    } else if (run.len === 4) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunH(run, pos)) { assign(pos.r, pos.c, POWER.HLINE); placed = true; break; }
      }
      if (!placed) assign(run.r, run.c1, POWER.HLINE);
    }
  }
  for (const run of runsV) {
    const key = `${run.c},${run.r0},${run.r1}`;
    if (vConsumed.has(key)) continue;
    if (run.len >= 5) {
      const isBoom = run.len >= 6;
      const targetKind = isBoom ? POWER.BOOM : POWER.RAINBOW;
      let placed = false;
      for (const pos of prefer) {
        if (inRunV(run, pos)) { assign(pos.r, pos.c, targetKind); placed = true; break; }
      }
      if (!placed) {
        const center = Math.floor((run.r0 + run.r1) / 2);
        assign(center, run.c, targetKind);
      }
    } else if (run.len === 4) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunV(run, pos)) { assign(pos.r, pos.c, POWER.VLINE); placed = true; break; }
      }
      if (!placed) assign(run.r1, run.c, POWER.VLINE);
    }
  }

  return Array.from(chosen.values());
}

function mergeCounts(target, source) {
  if (!source) return;
  for (const k of Object.keys(source)) target[k] = (target[k] || 0) + source[k];
}

function applyPowerAt(state, r, c, targetFruitKind) {
  const { rows, cols, grid } = state;
  const tile = grid[r][c];
  const cleared = new Set();
  if (!tile || tile.type !== TILE.POWER) return cleared;

  const add = (rr, cc) => {
    if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) cleared.add(`${rr},${cc}`);
  };

  // Clear the power tile itself
  add(r, c);

  switch (tile.kind) {
    case POWER.HLINE: {
      for (let cc = 0; cc < cols; cc++) add(r, cc);
      break;
    }
    case POWER.VLINE: {
      for (let rr = 0; rr < rows; rr++) add(rr, c);
      break;
    }
    case POWER.RAINBOW: {
      const target = targetFruitKind ?? inferNeighborFruit(state, r, c);
      if (target) {
        for (let rr = 0; rr < rows; rr++) {
          for (let cc = 0; cc < cols; cc++) {
            const cell = grid[rr][cc];
            if (cell && cell.type === TILE.FRUIT && cell.kind === target) add(rr, cc);
          }
        }
      } else {
        // If no target, clear the entire board of fruits (fallback minimal behavior)
        for (let rr = 0; rr < rows; rr++) for (let cc = 0; cc < cols; cc++) add(rr, cc);
      }
      break;
    }
    case POWER.BOOM: {
      // Clear the entire board (fruits and powers)
      for (let rr = 0; rr < rows; rr++) {
        for (let cc = 0; cc < cols; cc++) add(rr, cc);
      }
      break;
    }
  }
  return cleared;
}

function inferNeighborFruit(state, r, c) {
  const { rows, cols, grid } = state;
  let bestKind = null;
  let bestCount = -1;
  const bump = (kind) => {
    const counts = bump.counts || (bump.counts = new Map());
    const v = (counts.get(kind) || 0) + 1;
    counts.set(kind, v);
    if (v > bestCount) {
      bestCount = v;
      bestKind = kind;
    }
  };
  for (const [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) {
      const cell = grid[rr][cc];
      if (cell && cell.type === TILE.FRUIT) bump(cell.kind);
    }
  }
  return bestKind;
}

// Determine if any valid swap exists that would create a match
export function hasValidSwap(state) {
  const { rows, cols, grid } = state;
  const trySwap = (r1, c1, r2, c2) => {
    const A = grid[r1][c1];
    const B = grid[r2][c2];
    grid[r1][c1] = B; grid[r2][c2] = A;
    const m = findMatches(state);
    grid[r1][c1] = A; grid[r2][c2] = B;
    return m.toClear && m.toClear.size > 0;
  };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols && trySwap(r, c, r, c + 1)) return true;
      if (r + 1 < rows && trySwap(r, c, r + 1, c)) return true;
    }
  }
  return false;
}

// Reset or reshuffle the board until it has at least one valid swap
export function resetBoard(session, preserveLevel = true) {
  const fruits = preserveLevel ? session.fruits : allowedFruitsForLevel(session.level);
  // Create a fresh board and ensure solvable
  for (let i = 0; i < 100; i++) {
    session.state = createBoard(session.state.rows, session.state.cols, fruits, session.rng);
    // Optionally resolve initial automatic matches to avoid free clears on spawn
    const initial = findMatches(session.state);
    if (initial.toClear.size > 0) {
      // Clear them but do not award score/moves; just stabilize the board
      resolveAll(session.state, initial, fruits, session.rng);
    }
    if (hasValidSwap(session.state)) return true;
  }
  return false;
}


