import { describe, it, expect } from 'vitest';
import {
  TILE,
  POWER,
  DEFAULT_FRUITS,
  createBoard,
  findMatches,
  swapIfValid,
  createSession,
  sessionSwap,
  allowedFruitsForLevel,
  hasValidSwap,
  resetBoard,
} from '../../match3/engine';

function makeStateFromKinds(kinds) {
  const rows = kinds.length;
  const cols = kinds[0].length;
  return {
    rows,
    cols,
    grid: kinds.map(row => row.map(k => (k === null ? null : { type: TILE.FRUIT, kind: k }))),
  };
}

describe('engine core', () => {
  it('detects horizontal and vertical matches', () => {
    const s = makeStateFromKinds([
      ['A','A','A','B'],
      ['B','C','C','C'],
      ['B','B','C','D'],
    ]);
    const res = findMatches(s);
    expect(res.toClear.size).toBe(6);
  });

  it('performs a valid swap and clears', () => {
    // Swapping (0,0)<->(0,1) forms vertical AAA in column 1
    const s = makeStateFromKinds([
      ['A','B','C'],
      ['D','A','E'],
      ['E','A','F'],
    ]);
    const result = swapIfValid(s, {r:0,c:0}, {r:0,c:1}, ['A','B','C','D','E','F'], Math.random);
    expect(result.swapped).toBe(true);
    expect(result.cleared).toBeGreaterThan(0);
  });
});

describe('progression and telemetry', () => {
  it('caps fruits at 7 and unlocks by level', () => {
    expect(allowedFruitsForLevel(1).length).toBe(4);
    expect(allowedFruitsForLevel(10).length).toBe(5);
    expect(allowedFruitsForLevel(20).length).toBe(6);
    expect(allowedFruitsForLevel(30).length).toBe(7);
  });

  it('sessionSwap increments score and moves on success', () => {
    const session = createSession(1);
    // force a simple board
    session.state = makeStateFromKinds([
      ['A','A','B'],
      ['B','A','B'],
      ['C','C','C'],
    ]);
    const beforeMoves = session.movesUsed;
    const res = sessionSwap(session, {r:0,c:2}, {r:1,c:2});
    expect(res.swapped).toBe(true);
    expect(session.movesUsed).toBe(beforeMoves + 1);
    expect(session.score).toBeGreaterThan(0);
  });
});

describe('dead-board detection and reset', () => {
  it('hasValidSwap returns false on constructed dead board', () => {
    const s = makeStateFromKinds([
      ['A','B','C'],
      ['B','C','A'],
      ['C','A','B'],
    ]);
    expect(hasValidSwap(s)).toBe(false);
  });

  it('resetBoard produces a solvable board', () => {
    const session = createSession(1);
    session.state = makeStateFromKinds([
      ['A','B','C'],
      ['B','C','A'],
      ['C','A','B'],
    ]);
    const ok = resetBoard(session, true);
    expect(ok).toBe(true);
    expect(hasValidSwap(session.state)).toBe(true);
  });
});


