'use client';

import { useEffect, useMemo, useState } from 'react';
import Match3Canvas from '../../../../components/games/match3/Match3Canvas';
import { wins, losses, nudgesWin, nudgesLose, getRandomMessage } from '../../../../lib/match3/messages';
import {
  createSession,
  sessionSwap,
  hasValidSwap,
  resetBoard,
  getElapsedMs,
  maybeLevelUp,
} from '../../../../lib/match3/engine';
import { getGoalsForLevel, getFruitsForLevel } from '../../../../lib/match3/config';

export default function Match3Page() {
  const [session, setSession] = useState(() => createSession(1));
  const [metrics, setMetrics] = useState({ score: 0, moves: 0, elapsedMs: 0, level: 1 });
  const [dead, setDead] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [modal, setModal] = useState(null); // { type: 'win'|'lose'|'nudgeWin'|'nudgeLose', message }
  const [goals, setGoals] = useState(() => getGoalsForLevel(1, session.fruits));

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(m => ({ ...m, elapsedMs: getElapsedMs(session) }));
    }, 1000);
    return () => clearInterval(id);
  }, [session]);

  useEffect(() => {
    // update metrics on session change
    setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });
  }, [session]);

  const handleSwap = (a, b) => {
    const res = sessionSwap(session, a, b);
    // refresh state reference to trigger re-render
    setSession({ ...session, state: { ...session.state, grid: session.state.grid.map(row => row.slice()) } });
    if (res.swapped) {
      const leveled = maybeLevelUp?.(session); // safe if imported; bumps level and re-rolls board
      setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });
      if (leveled) setNudgeMsg(getRandomMessage(wins)); else if (res.cleared >= 12) setNudgeMsg(getRandomMessage(nudges));
      const stuck = !hasValidSwap(session.state);
      setDead(stuck);
    }
  };

  const handleReset = () => {
    resetBoard(session, true);
    setSession({ ...session, state: { ...session.state, grid: session.state.grid } });
    setDead(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Unified HUD */}
      <div className="rounded-2xl px-4 py-2 border bg-white/90 mb-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Stat title="Score" value={metrics.score.toLocaleString()} minCh={6} />
            <Stat title="Moves" value={metrics.moves} minCh={3} />
            <Stat title="Time" value={formatTime(metrics.elapsedMs)} minCh={8} />
            <div className="hidden md:flex items-center gap-2 ml-4">
              <div className="text-xs font-semibold text-gray-600">Goals:</div>
              {goals.map((g, idx) => (
                <GoalChip key={idx} emoji={g.emoji} remaining={g.remaining} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-700">Level {metrics.level}</div>
            <button onClick={handleReset} className="px-3 py-2 border rounded-lg">New Board</button>
          </div>
        </div>
        <div className="mt-3 flex md:hidden flex-wrap gap-2 items-center">
          <div className="text-xs font-semibold text-gray-600">Goals:</div>
          {goals.map((g, idx) => (
            <GoalChip key={idx} emoji={g.emoji} remaining={g.remaining} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-1 border bg-white/90 mx-auto" style={{ width: '55%', overflow: 'hidden' }}>
        <Match3Canvas
          session={session}
          onTrySwap={(a,b) => {
            const res = sessionSwap(session, a, b);
            setSession({ ...session, state: { ...session.state, grid: session.state.grid.map(row => row.slice()) } });
            if (res.swapped) {
              const leveled = maybeLevelUp?.(session);
              setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });
              // decrement goals live using cleared counts, if available
              if (res.countsByKind) {
                setGoals(prev => prev.map(g => ({ ...g, remaining: Math.max(0, g.remaining - (res.countsByKind[g.emoji] || 0)) })));
              }
              const stuck = !hasValidSwap(session.state);
              setDead(stuck);
              if (leveled) {
                // Update fruits and goals from config on level up
                const newFruits = getFruitsForLevel(session.level, session.fruits);
                session.fruits = newFruits;
                setGoals(getGoalsForLevel(session.level, session.fruits));
                const elapsedMs = getElapsedMs(session);
                const shouldNudge = gamesPlayed + 1 >= 3 || elapsedMs >= 15 * 60 * 1000;
                const message = shouldNudge ? getRandomMessage(nudgesWin) : getRandomMessage(wins);
                setGamesPlayed(g => g + 1);
                setModal({ type: shouldNudge ? 'nudgeWin' : 'win', message });
              } else if (stuck) {
                const elapsedMs = getElapsedMs(session);
                const shouldNudge = gamesPlayed + 1 >= 3 || elapsedMs >= 15 * 60 * 1000;
                const message = shouldNudge ? getRandomMessage(nudgesLose) : getRandomMessage(losses);
                setGamesPlayed(g => g + 1);
                setModal({ type: shouldNudge ? 'nudgeLose' : 'lose', message });
              }
            }
            return res;
          }}
          onDeadBoard={() => setDead(true)}
        />
      </div>

      <Modal
        open={!!modal}
        title={modal?.type?.startsWith('nudge') ? 'Quick Nudge' : modal?.type === 'win' ? 'Level Complete!' : 'New Board Suggested'}
        message={modal?.message || ''}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.min(99, Math.floor(totalSec / 3600));
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function Stat({ title, value, minCh = 4 }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-mono" style={{ minWidth: `${minCh}ch`, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      <div className="text-xs text-gray-600">{title}</div>
    </div>
  );
}

function GoalChip({ emoji, remaining }) {
  const complete = remaining === 0;
  return (
    <div className={`px-3 py-2 rounded-lg border ${complete ? 'bg-emerald-100 border-emerald-400' : 'bg-orange-50 border-orange-200'}`}>
      <div className="text-center text-xl">{emoji}</div>
      <div className={`text-center text-sm font-bold ${complete ? 'text-emerald-700' : 'text-gray-800'}`}>{complete ? '✓' : remaining}</div>
    </div>
  );
}

function Modal({ open, onClose, title, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full rounded-2xl shadow-2xl border-2 p-6 bg-white">
        <div className="text-center mb-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{title}</h2>
        </div>
        <div className="text-center text-gray-700 mb-4">{message}</div>
        <div className="flex justify-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">Close</button>
        </div>
      </div>
    </div>
  );
}


