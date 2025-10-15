'use client';

import { useEffect, useMemo, useState } from 'react';
import Match3Canvas from '../../../../components/games/match3/Match3Canvas';
import { nudges, wins, losses, getRandomMessage } from '../../../../lib/match3/messages';
import {
  createSession,
  sessionSwap,
  hasValidSwap,
  resetBoard,
  getElapsedMs,
  maybeLevelUp,
} from '../../../../lib/match3/engine';

export default function Match3Page() {
  const [session, setSession] = useState(() => createSession(1));
  const [metrics, setMetrics] = useState({ score: 0, moves: 0, elapsedMs: 0, level: 1 });
  const [dead, setDead] = useState(false);
  const [nudgeMsg, setNudgeMsg] = useState('');

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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-4 grid grid-cols-3 gap-4">
        <div className="rounded-xl p-4 border bg-white/80">
          <div className="text-sm text-gray-600">Score</div>
          <div className="text-2xl font-bold">{metrics.score}</div>
        </div>
        <div className="rounded-xl p-4 border bg-white/80">
          <div className="text-sm text-gray-600">Moves</div>
          <div className="text-2xl font-bold">{metrics.moves}</div>
        </div>
        <div className="rounded-xl p-4 border bg-white/80">
          <div className="text-sm text-gray-600">Time</div>
          <div className="text-2xl font-bold">{formatTime(metrics.elapsedMs)}</div>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="text-gray-700">Level {metrics.level}</div>
        <button onClick={handleReset} className="px-3 py-2 border rounded-lg">New Board</button>
      </div>

      <div className="rounded-2xl p-3 border bg-white/90" style={{ width: '100%', overflow: 'hidden' }}>
        <Match3Canvas
          session={session}
          onTrySwap={(a,b) => {
            const res = sessionSwap(session, a, b);
            setSession({ ...session, state: { ...session.state, grid: session.state.grid.map(row => row.slice()) } });
            if (res.swapped) {
              const leveled = maybeLevelUp?.(session);
              setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });
              if (leveled) setNudgeMsg(getRandomMessage(wins)); else if (res.cleared >= 12) setNudgeMsg(getRandomMessage(nudges));
              const stuck = !hasValidSwap(session.state);
              setDead(stuck);
            }
            return res;
          }}
          onDeadBoard={() => setDead(true)}
        />
      </div>

      {(dead || nudgeMsg) && (
        <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
          {dead ? 'No valid moves left. Generating a new board...' : nudgeMsg}
          <button onClick={() => { if (dead) handleReset(); setNudgeMsg(''); }} className="ml-3 px-2 py-1 border rounded">{dead ? 'Reset' : 'Dismiss'}</button>
        </div>
      )}
    </div>
  );
}

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}


