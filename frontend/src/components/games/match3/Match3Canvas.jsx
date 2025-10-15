'use client';

import { useEffect, useRef } from 'react';
import { areAdjacent, findMatches, TILE, POWER } from '../../../lib/match3/engine';

// Lightweight Pixi renderer for the match-3 board.
// Requirements for now:
// - Render current session.state.grid
// - Handle click-to-select and swap adjacent tiles via onSwap(a,b)
// - No animations yet; immediate redraw after swap

export default function Match3Canvas({ session, onSwap, onTrySwap, onDeadBoard, tileSize = 56, gap = 4 }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const pixiRef = useRef(null);
  const spritesRef = useRef([]);
  const selectedRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const PIXI = await import('pixi.js');
      if (!mounted) return;
      pixiRef.current = PIXI;

      const container = containerRef.current;
      const width = (tileSize + gap) * session.state.cols + gap;
      const height = (tileSize + gap) * session.state.rows + gap;

      const app = new PIXI.Application();
      const resolution = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
      await app.init({ width, height, resolution, antialias: true, backgroundAlpha: 0 });
      appRef.current = app;
      container.appendChild(app.canvas);

      drawBoard();

      function fit() {
        const cw = container.clientWidth || width;
        // Reserve square area to avoid tall vertical gaps; use available width
        const ch = Math.min(container.clientHeight || height, cw);
        const scale = Math.min(cw / width, ch / height, 1);
        app.stage.scale.set(scale, scale);
        const cssW = Math.floor(width * scale);
        const cssH = Math.floor(height * scale);
        app.canvas.style.width = `${cssW}px`;
        app.canvas.style.height = `${cssH}px`;
        // center canvas within container
        const offsetX = Math.max(0, Math.floor((cw - cssW) / 2));
        const offsetY = Math.max(0, Math.floor(((container.clientHeight || cssH) - cssH) / 2));
        app.canvas.style.marginLeft = `${offsetX}px`;
        app.canvas.style.marginTop = `${offsetY}px`;
      }

      fit();

      function handleResize() { fit(); }
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    })();

    return () => {
      mounted = false;
      try {
        if (appRef.current) {
          appRef.current.destroy();
          appRef.current = null;
        }
      } catch {}
      pixiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw whenever the grid reference changes (parent triggers this by re-render)
  useEffect(() => {
    if (appRef.current) drawBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state.grid]);

  function drawBoard() {
    const PIXI = pixiRef.current;
    const app = appRef.current;
    if (!PIXI || !app) return;

    app.stage.removeChildren();
    spritesRef.current = [];

    const layer = new PIXI.Container();
    app.stage.addChild(layer);

    for (let r = 0; r < session.state.rows; r++) {
      spritesRef.current[r] = [];
      for (let c = 0; c < session.state.cols; c++) {
        const x = gap + c * (tileSize + gap);
        const y = gap + r * (tileSize + gap);

        const cell = session.state.grid[r][c];

        // Tile container at (x,y)
        const tile = new PIXI.Container();
        tile.x = x;
        tile.y = y;
        tile.eventMode = 'static';
        tile.cursor = 'pointer';
        tile.on('pointertap', () => onTileClick(r, c));
        layer.addChild(tile);

        // Tile background
        const bg = new PIXI.Graphics();
        bg.roundRect(0, 0, tileSize, tileSize, 10);
        // Softer peach board tile with subtle stroke for contrast
        bg.fill({ color: 0xFFF7ED, alpha: 0.95 });
        bg.stroke({ width: 1, color: 0xF59E0B, alpha: 0.25 });
        tile.addChild(bg);

        // Content: show fruit emoji or power-up tag
        const label = new PIXI.Text({
          text: getDisplayText(cell),
          style: {
            fontFamily: 'system-ui, Arial, sans-serif',
            fontSize: 24,
            fill: 0x000000,
            align: 'center',
          },
        });
        label.x = tileSize / 2 - label.width / 2;
        label.y = tileSize / 2 - label.height / 2;
        tile.addChild(label);

        spritesRef.current[r][c] = { container: tile, bg, label };
      }
    }
    // Draw selection highlight if any
    if (selectedRef.current) {
      const { r, c } = selectedRef.current;
      const sprite = spritesRef.current[r]?.[c];
      if (sprite) {
        const sel = new PIXI.Graphics();
        sel.roundRect(0, 0, tileSize, tileSize, 10);
        sel.stroke({ width: 3, color: 0xFFA500, alpha: 1 });
        sprite.container.addChild(sel);
      }
    }
  }
  

  function onTileClick(r, c) {
    const current = selectedRef.current;
    if (!current) {
      selectedRef.current = { r, c };
      drawBoard();
      return;
    }
    if (current.r === r && current.c === c) {
      selectedRef.current = null;
      drawBoard();
      return;
    }
    const a = current;
    const b = { r, c };
    if (!areAdjacent(a, b)) {
      selectedRef.current = { r, c };
      drawBoard();
      return;
    }
    // Basic swap animation: animate tiles swapping positions, then invoke onTrySwap
    selectedRef.current = null;
    const sA = spritesRef.current[a.r]?.[a.c];
    const sB = spritesRef.current[b.r]?.[b.c];
    if (sA && sB) {
      const { x: ax, y: ay } = sA.container;
      const { x: bx, y: by } = sB.container;
      Promise.all([
        animateMove(sA, bx, by, 140),
        animateMove(sB, ax, ay, 140)
      ]).then(async () => {
        // Preview: does this swap create a match?
        const preview = previewSwapMatches(session, a, b);
        if (!preview.valid) {
          if (onTrySwap) {
            const res = await onTrySwap(a, b); // engine will reject and we will animate back here anyway
            if (!res?.swapped) {
              await Promise.all([
                animateMove(sA, ax, ay, 140),
                animateMove(sB, bx, by, 140)
              ]);
              drawBoard();
            }
          } else if (onSwap) {
            onSwap(a, b);
          }
          return;
        }

        // Predict where power-ups will be placed and keep those tiles fixed during preview animations
        const preferred = [b, a];
        const predictedPlacements = pickPreviewPowerPlacements(preview.runsH, preview.runsV, preferred);
        const fixedSet = new Set(predictedPlacements.map(p => `${p.r},${p.c}`));

        // Animate clears and simple drops for the first cascade only (shorter durations)
        await animateClear(preview.toClear, spritesRef, 90, fixedSet);
        await animateDrop(preview.toClear, spritesRef, tileSize, gap, 110, fixedSet);

        // Now apply engine resolution and redraw fully
        if (onTrySwap) await onTrySwap(a, b); else if (onSwap) onSwap(a, b);
      });
    } else {
      if (onTrySwap) onTrySwap(a, b); else if (onSwap) onSwap(a, b);
    }
  }

  return (
    <div ref={containerRef} />
  );
}

function animateMove(spritePair, toX, toY, duration = 120) {
  const target = spritePair.container;
  const fromX = target.x;
  const fromY = target.y;
  const dx = toX - fromX;
  const dy = toY - fromY;
  let start;
  return new Promise(resolve => {
    function step(ts) {
      if (start === undefined) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const ease = t < 0.5 ? 2*t*t : -1 + (4 - 2*t) * t; // simple easeInOut
      const nx = fromX + dx * ease;
      const ny = fromY + dy * ease;
      target.x = nx;
      target.y = ny;
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}

function previewSwapMatches(session, a, b) {
  const rows = session.state.rows;
  const cols = session.state.cols;
  // Build a shallow preview grid of cell objects
  const grid = session.state.grid.map(row => row.map(cell => cell ? { ...cell } : null));
  const tmp = { rows, cols, grid };
  const A = grid[a.r][a.c];
  const B = grid[b.r][b.c];
  grid[a.r][a.c] = B;
  grid[b.r][b.c] = A;
  const matches = findMatches(tmp);
  return { valid: matches.toClear.size > 0, toClear: matches.toClear, runsH: matches.runsH, runsV: matches.runsV };
}

function animateClear(toClear, spritesRef, duration = 150, fixedSet) {
  const promises = [];
  for (const key of toClear) {
    if (fixedSet && fixedSet.has(key)) continue; // don't clear predicted power-up tiles in preview
    const [r, c] = key.split(',').map(Number);
    const sprite = spritesRef.current?.[r]?.[c];
    if (!sprite) continue;
    promises.push(animateFadeScale(sprite, 0.6, 0, duration));
  }
  return Promise.all(promises);
}

function animateFadeScale(spritePair, scaleTo = 0.6, alphaTo = 0, duration = 150) {
  const target = spritePair.container;
  const startAlpha = target.alpha ?? 1;
  const startScaleX = target.scale?.x ?? 1;
  const startScaleY = target.scale?.y ?? 1;
  let start;
  return new Promise(resolve => {
    function step(ts) {
      if (start === undefined) start = ts;
      const t = Math.min(1, (ts - start) / duration);
      const ease = t;
      const alpha = startAlpha + (alphaTo - startAlpha) * ease;
      const sx = startScaleX + (scaleTo - startScaleX) * ease;
      const sy = startScaleY + (scaleTo - startScaleY) * ease;
      target.alpha = alpha;
      target.scale.set(sx, sy);
      if (t < 1) requestAnimationFrame(step); else resolve();
    }
    requestAnimationFrame(step);
  });
}

function animateDrop(toClear, spritesRef, tileSize, gap, duration = 160, fixedSet) {
  // Only move tiles that have cleared cells below them in their column
  const clearedSet = new Set(toClear);
  const clearedRowsByCol = new Map();
  for (const key of toClear) {
    const [rStr, cStr] = key.split(',');
    const r = Number(rStr), c = Number(cStr);
    const arr = clearedRowsByCol.get(c) || [];
    arr.push(r);
    clearedRowsByCol.set(c, arr);
  }
  for (const [c, arr] of clearedRowsByCol.entries()) arr.sort((a,b)=>a-b);

  const moves = [];
  const numRows = spritesRef.current.length | 0;
  const numCols = numRows ? (spritesRef.current[0]?.length | 0) : 0;
  for (let c = 0; c < numCols; c++) {
    const clearedRows = clearedRowsByCol.get(c) || [];
    if (!clearedRows.length) continue;
    for (let r = 0; r < numRows; r++) {
      const key = `${r},${c}`;
      if (clearedSet.has(key)) continue;
      if (fixedSet && fixedSet.has(key)) continue; // keep predicted power-up in place
      const sprite = spritesRef.current[r]?.[c];
      if (!sprite) continue;
      let drop = 0;
      for (let i = 0; i < clearedRows.length; i++) if (clearedRows[i] > r) drop++;
      if (!drop) continue;
      const toY = sprite.container.y + drop * (tileSize + gap);
      moves.push(animateMove(sprite, sprite.container.x, toY, duration));
    }
  }
  return Promise.all(moves);
}

function pickPreviewPowerPlacements(runsH, runsV, preferredPositions) {
  const placements = [];
  const prefer = Array.isArray(preferredPositions) ? preferredPositions : [];
  const inRunH = (run, pos) => pos && pos.r === run.r && pos.c >= run.c0 && pos.c <= run.c1;
  const inRunV = (run, pos) => pos && pos.c === run.c && pos.r >= run.r0 && pos.r <= run.r1;
  // Horizontal runs
  for (const run of runsH || []) {
    if (run.len >= 5) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunH(run, pos)) { placements.push({ r: pos.r, c: pos.c, kind: POWER.RAINBOW }); placed = true; break; }
      }
      if (!placed) {
        const center = Math.floor((run.c0 + run.c1) / 2);
        placements.push({ r: run.r, c: center, kind: POWER.RAINBOW });
      }
    } else if (run.len === 4) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunH(run, pos)) { placements.push({ r: pos.r, c: pos.c, kind: POWER.HLINE }); placed = true; break; }
      }
      if (!placed) placements.push({ r: run.r, c: run.c1, kind: POWER.HLINE });
    }
  }
  // Vertical runs
  for (const run of runsV || []) {
    if (run.len >= 5) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunV(run, pos)) { placements.push({ r: pos.r, c: pos.c, kind: POWER.RAINBOW }); placed = true; break; }
      }
      if (!placed) {
        const center = Math.floor((run.r0 + run.r1) / 2);
        placements.push({ r: center, c: run.c, kind: POWER.RAINBOW });
      }
    } else if (run.len === 4) {
      let placed = false;
      for (const pos of prefer) {
        if (inRunV(run, pos)) { placements.push({ r: pos.r, c: pos.c, kind: POWER.VLINE }); placed = true; break; }
      }
      if (!placed) placements.push({ r: run.r1, c: run.c, kind: POWER.VLINE });
    }
  }
  return placements;
}

function getDisplayText(cell) {
  if (!cell) return '';
  if (cell.type === TILE.POWER) {
    switch (cell.kind) {
      case POWER.HLINE: return '➡️';
      case POWER.VLINE: return '⬇️';
      case POWER.RAINBOW: return '🌈';
      default: return '';
    }
  }
  return cell.kind || '';
}


