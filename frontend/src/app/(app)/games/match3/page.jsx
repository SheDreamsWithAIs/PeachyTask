'use client';

import { useEffect, useMemo, useState } from 'react';
import Match3Canvas from '../../../../components/games/match3/Match3Canvas';
import Match3HUD from '../../../../components/games/match3/Match3HUD';
import Match3Modal from '../../../../components/games/match3/Match3Modal';
import { wins, losses, nudgesWin, nudgesLose, getRandomMessage } from '../../../../lib/match3/messages';
import {
  createSession,
  sessionSwap,
  hasValidSwap,
  resetBoard,
  getElapsedMs,
  maybeLevelUp,
  pause,
  createBoard,
  resume,
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
      // Freeze timer while win modal is shown
      if (modal?.type === 'win' || modal?.type === 'nudgeWin') return;
      setMetrics(m => ({ ...m, elapsedMs: getElapsedMs(session) }));
    }, 1000);
    return () => clearInterval(id);
  }, [session, modal]);

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

  const handleNextLevel = () => {
    // increment level
    session.level += 1;
    // update fruits per config for new level
    session.fruits = getFruitsForLevel(session.level, session.fruits);
    // recreate board with same dimensions using new fruits
    const { rows, cols } = session.state;
    session.state = createBoard(rows, cols, session.fruits, session.rng);
    // reset move count and timer; carry score forward
    session.movesUsed = 0;
    session.accumulatedMs = 0;
    session.lastResumeMs = Date.now();
    session.paused = false;
    // goals for new level
    setGoals(getGoalsForLevel(session.level, session.fruits));
    // update metrics and re-render
    setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });
    setSession({ ...session, state: { ...session.state, grid: session.state.grid.map(row => row.slice()) } });
    setDead(false);
    setModal(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Unified HUD */}
      <Match3HUD
        metrics={metrics}
        goals={goals}
        onNewBoard={handleReset}
        paused={session.paused}
        onTogglePause={() => {
          if (session.paused) {
            resume(session);
          } else {
            pause(session);
          }
          setMetrics(m => ({ ...m, elapsedMs: getElapsedMs(session) }));
          setSession({ ...session });
        }}
        className="mb-2"
      />

      <div className="rounded-2xl p-1 border bg-white/90 mx-auto" style={{ width: '55%', overflow: 'hidden' }}>
        <Match3Canvas
          session={session}
          onTrySwap={(a,b) => {
            const res = sessionSwap(session, a, b);
            setSession({ ...session, state: { ...session.state, grid: session.state.grid.map(row => row.slice()) } });
            if (res.swapped) {
              // Refresh metrics first
              setMetrics({ score: session.score, moves: session.movesUsed, elapsedMs: getElapsedMs(session), level: session.level });

              // Decrement goals live using cleared counts and compute if all goals are met
              let nextGoals = goals;
              if (res.countsByKind) {
                nextGoals = goals.map(g => ({ ...g, remaining: Math.max(0, g.remaining - (res.countsByKind[g.emoji] || 0)) }));
                setGoals(nextGoals);
              }

              const stuck = !hasValidSwap(session.state);
              setDead(stuck);

              // Determine goal completion based on updated goals (if available) or current goals state
              const allGoalsMet = (nextGoals || goals).every(g => g.remaining === 0);

              if (allGoalsMet) {
                const elapsedMs = getElapsedMs(session);
                pause(session); // stop timer when won
                const shouldNudge = ((gamesPlayed + 1) % 4) === 0; // every 4th level
                const message = shouldNudge ? getRandomMessage(nudgesWin) : getRandomMessage(wins);
                setGamesPlayed(g => g + 1);
                setModal({ type: 'win', message });
              } else if (stuck) {
                // Only show lose suggestion when stuck and goals not yet complete
                const shouldNudge = ((gamesPlayed + 1) % 4) === 0; // every 4th round
                const message = shouldNudge ? getRandomMessage(nudgesLose) : getRandomMessage(losses);
                setGamesPlayed(g => g + 1);
                setModal({ type: 'lose', message });
              }
            }
            return res;
          }}
          onDeadBoard={() => setDead(true)}
        />
      </div>

      <Match3Modal
        open={!!modal}
        type={modal?.type}
        score={metrics.score}
        elapsedMs={metrics.elapsedMs}
        wins={gamesPlayed}
        losses={dead ? 1 : undefined}
        message={modal?.message || ''}
        onPrimary={handleNextLevel}
        onClose={() => setModal(null)}
        onBack={undefined}
        highlightBack={((gamesPlayed) % 4) === 0 && modal?.type === 'lose'}
      />
    </div>
  );
}
 
 

