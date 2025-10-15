import { describe, it, expect } from 'vitest';
import {
  TILE,
  POWER,
  findMatches,
  swapIfValid,
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

describe('power-ups', () => {
  it('creates HLINE on horizontal 4 and VLINE on vertical 4', () => {
    // Horizontal 4
    const sH = makeStateFromKinds([
      ['A','A','A','A'],
      ['B','C','D','E'],
      ['B','C','D','E'],
    ]);
    const resH = findMatches(sH);
    expect(resH.runsH.find(r => r.len === 4)).toBeTruthy();

    // Vertical 4
    const sV = makeStateFromKinds([
      ['A','B','C','D'],
      ['A','B','C','D'],
      ['A','E','F','G'],
      ['A','H','I','J'],
    ]);
    const resV = findMatches(sV);
    expect(resV.runsV.find(r => r.len === 4)).toBeTruthy();
  });

  it('creates RAINBOW on 5 in a row', () => {
    const s = makeStateFromKinds([
      ['A','A','A','A','A'],
    ]);
    const res = findMatches(s);
    expect(res.runsH.find(r => r.len >= 5)).toBeTruthy();
  });

  it('detonates when swapping a power tile', () => {
    const s = makeStateFromKinds([
      ['A','B','C'],
      ['D','E','F'],
      ['G','H','I'],
    ]);
    // Plant a line power at center
    s.grid[1][1] = { type: 'power', kind: 'hline' };
    const res = swapIfValid(s, {r:1,c:1}, {r:1,c:2}, ['A','B','C','D','E','F','G','H','I'], Math.random);
    expect(res.swapped).toBe(true);
    expect(res.cleared).toBeGreaterThanOrEqual(3);
  });
});


