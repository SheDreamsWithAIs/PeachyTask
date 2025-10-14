'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, Heart, Home, Trophy, RotateCcw, ArrowDownUp } from 'lucide-react';
import { getJson, patchJson } from '@/lib/api';
import { useTheme } from '@/components/ThemeContext';

function useQuery() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function formatTime(seconds) {
  const s = Number(seconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m ${r}s`;
  return `${m}m ${r}s`;
}

export default function ShowdownResultsPage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const query = useQuery();
  const taskId = query.get('taskId');
  const timer = query.get('timer');
  const timerUsed = !!timer;

  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [reverting, setReverting] = useState(false);
  const [labels, setLabels] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [peachesInc, setPeachesInc] = useState(null);
  const [completedTotal, setCompletedTotal] = useState(null);

  // Fetch the completed task title for display
  useEffect(() => {
    let active = true;
    async function load() {
      if (!taskId) return;
      try {
        const t = await getJson(`/tasks/${taskId}`);
        if (active) setTitle(t?.title || '');
      } catch (e) {
        if (active) setError(e.message || 'Failed to load task');
      }
    }
    load();
    return () => { active = false; };
  }, [taskId]);

  // Fetch labels for name mapping (non-fatal)
  useEffect(() => {
    getJson('/labels').then(setLabels).catch(() => {});
  }, []);

  // Confetti on mount (respect reduced motion)
  useEffect(() => {
    try {
      const prefersReduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduce) {
        setShowConfetti(true);
        const t = setTimeout(() => setShowConfetti(false), 2500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  // Load completion meta (current peaches increment and completed total)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('showdown_complete_meta') : null;
      if (raw) {
        const meta = JSON.parse(raw);
        if (meta && (!meta.taskId || meta.taskId === taskId)) {
          if (typeof meta.peaches_increment === 'number') setPeachesInc(meta.peaches_increment);
          if (typeof meta.total_completed === 'number') setCompletedTotal(meta.total_completed);
          return;
        }
      }
    } catch {}
    // fallback to stats
    getJson('/showdown/stats').then((s) => {
      setCompletedTotal(Number(s?.total_completed || 0));
    }).catch(() => {});
  }, [taskId]);

  const completedTitle = title || (taskId ? `Task ${taskId}` : 'Task');

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Confetti overlay */}
          {showConfetti && (
            <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
              {Array.from({ length: 80 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 0.6;
                const duration = 1.6 + Math.random() * 0.9;
                const size = 6 + Math.random() * 6;
                const colors = ['#f97316','#fb923c','#f59e0b','#facc15','#a3e635','#34d399','#60a5fa','#f472b6'];
                const color = colors[i % colors.length];
                return (
                  <span key={i} className="confetti-piece" style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s`, width: `${size}px`, height: `${size * 0.5}px`, backgroundColor: color }} />
                );
              })}
              <style jsx>{`
                @keyframes confetti-fall {
                  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
                  100% { transform: translateY(110vh) rotate(540deg); opacity: 0.9; }
                }
                .confetti-piece {
                  position: absolute;
                  top: -10vh;
                  border-radius: 2px;
                  animation-name: confetti-fall;
                  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
                }
                @media (prefers-reduced-motion: reduce) {
                  .confetti-piece { animation: none; }
                }
              `}</style>
            </div>
          )}
          {/* Celebration Hero */}
          <div className={`${darkMode ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/50' : 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300'} text-center mb-6 p-6 rounded-2xl border-2`}>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="text-5xl">🎉</div>
              <h2 className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} text-3xl font-black`}>Crushed It!</h2>
            </div>
            <p className={`${darkMode ? 'text-amber-200' : 'text-gray-800'} text-lg mb-1`}>
              You tackled: <span className="font-bold">{completedTitle}</span>
            </p>
            <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>One less thing to procrastinate!</p>
          </div>

          {/* Stats Row */}
          <div className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white border-orange-200'} mb-6 p-5 rounded-xl border transition-all duration-300 hover:shadow-lg motion-reduce:transition-none`}>
            <div className="flex items-center justify-around flex-wrap gap-4">
              {timerUsed && (
                <div className="flex items-center gap-3">
                  <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                    <Clock className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                  </div>
                  <div>
                    <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{formatTime(timer)}</div>
                    <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Time Invested</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                  <Trophy className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                </div>
                <div>
                  <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{completedTotal !== null ? completedTotal : '—'}</div>
                  <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Tasks Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                  <Heart className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                </div>
                <div>
                  <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{peachesInc !== null ? peachesInc : '—'}</div>
                  <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Peaches Peached</p>
                </div>
              </div>
            </div>
          </div>

          {/* Motivational */}
          <div className={`${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'} mb-6 p-4 rounded-xl border`}>
            <div className="flex items-center gap-3">
              <span className={`${darkMode ? 'text-amber-300' : 'text-orange-700'} w-5 h-5`}>⚡</span>
              <p className={`${darkMode ? 'text-amber-300/80' : 'text-gray-700'} text-sm`}><span className="font-semibold">Keep the momentum going!</span> Start another showdown or return to tasks.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center mb-5">
            <button
              disabled={!taskId || reverting}
              onClick={async () => {
                if (!taskId) return;
                try {
                  setReverting(true);
                  await patchJson(`/tasks/${taskId}`, { completed: false });
                  try {
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem('showdown_resume', '1');
                      // keep previous pair and selection if present
                      const pair = window.sessionStorage.getItem('showdown_pair');
                      if (pair) {
                        // keep as-is
                      }
                      window.sessionStorage.setItem('showdown_selected_id', taskId);
                    }
                  } catch {}
                  if (typeof window !== 'undefined') window.location.href = '/showdown/vs';
                } catch (e) {
                  setError(e.message || 'Failed to revert completion');
                } finally {
                  setReverting(false);
                }
              }}
              className={`${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'} px-8 py-3 rounded-xl font-semibold transition border-2 flex items-center justify-center gap-2 disabled:opacity-60`}
            >
              <RotateCcw className="w-5 h-5"/>
              {reverting ? 'Reverting…' : 'Oops, Not Done Yet'}
            </button>
          </div>

          {error && (
            <div className="text-center mb-5">
              <p className="text-sm text-red-700 bg-red-100 border border-red-200 rounded inline-block px-3 py-2">{error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap mb-5">
            <Link href="/showdown/rank" className={`${darkMode ? 'border-amber-800/50 text-amber-400/70 hover:bg-stone-800/30 hover:text-amber-300' : 'border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-gray-800'} px-4 py-2 rounded-lg font-medium transition border flex items-center gap-2 text-sm`}><ArrowDownUp className="w-4 h-4"/>Rank Tasks</Link>
            <Link href="/showdown/vs" className={`${darkMode ? 'border-amber-800/50 text-amber-400/70 hover:bg-stone-800/30 hover:text-amber-300' : 'border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-gray-800'} px-4 py-2 rounded-lg font-medium transition border flex items-center gap-2 text-sm`}><Trophy className="w-4 h-4"/>Another Showdown</Link>
            <Link href="/dashboard" className={`${darkMode ? 'border-amber-800/50 text-amber-400/70 hover:bg-stone-800/30 hover:text-amber-300' : 'border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-gray-800'} px-4 py-2 rounded-lg font-medium transition border flex items-center gap-2 text-sm`}><Home className="w-4 h-4"/>Dashboard</Link>
          </div>

          <div className="text-center">
            <p className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} text-xs italic`}>The secret of getting ahead is getting started.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


