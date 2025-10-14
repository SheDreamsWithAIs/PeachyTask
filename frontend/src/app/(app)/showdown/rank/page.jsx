'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Swords, ThumbsDown, Trophy, Zap } from 'lucide-react';
import { getJson, patchJson } from '@/lib/api';
import { useTheme } from '@/components/ThemeContext';

export default function ShowdownRankPage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(1);
  const totalComparisons = 8;
  const [pair, setPair] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [deltas, setDeltas] = useState({}); // { taskId: +n }
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load incomplete tasks
  useEffect(() => {
    setLoading(true);
    getJson('/tasks')
      .then((all) => setTasks(all.filter((t) => !t.completed)))
      .catch((e) => setError(e.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const pickPair = useCallback(() => {
    const pool = tasks.slice();
    if (pool.length < 2) return [];
    // Compute effective rank = persisted + in-session delta
    const eff = (t) => (Number(t.dislike_rank || 0) + Number(deltas[t._id] || 0));
    const unranked = pool.filter((t) => eff(t) <= 0);
    const ranked = pool.filter((t) => eff(t) > 0);

    // Prefer pairing: one unranked with one ranked (to quickly place new tasks)
    if (unranked.length > 0) {
      const a = unranked[Math.floor(Math.random() * unranked.length)];
      const bPool = ranked.length > 0 ? ranked : unranked.filter((t) => t._id !== a._id);
      if (bPool.length === 0) return [a, pool.find((t) => t._id !== a._id)];
      const b = bPool[Math.floor(Math.random() * bPool.length)];
      return [a, b];
    }

    // All ranked: allow cyclic refinement on already-ranked tasks
    const i = Math.floor(Math.random() * pool.length);
    let j = Math.floor(Math.random() * pool.length);
    if (j === i) j = (j + 1) % pool.length;
    return [pool[i], pool[j]];
  }, [tasks, deltas]);

  useEffect(() => {
    if (!loading) setPair(pickPair());
  }, [loading, pickPair]);

  const onChoose = (winnerId) => {
    // Simple scoring: increment dislike_rank delta for the chosen task
    setDeltas((prev) => ({ ...prev, [winnerId]: (prev[winnerId] || 0) + 1 }));

    if (comparison < totalComparisons) {
      setComparison((c) => c + 1);
      setSelectedId(null);
      setPair(pickPair());
    } else {
      setShowCompletionModal(true);
    }
  };

  const flushUpdates = useCallback(async () => {
    if (!tasks.length || !Object.keys(deltas).length) return;
    setSaving(true);
    try {
      for (const t of tasks) {
        const d = deltas[t._id] || 0;
        if (!d) continue;
        const next = (t.dislike_rank || 0) + d;
        await patchJson(`/tasks/${t._id}`, { dislike_rank: next });
      }
    } finally {
      setSaving(false);
    }
  }, [tasks, deltas]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-amber-200/90">Loading…</p>
      </div>
    );
  }

  const left = pair[0];
  const right = pair[1];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Progress */}
          <div className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white/80 border-orange-200/50'} mb-6 rounded-xl p-4 border`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`${darkMode ? 'text-amber-300' : 'text-gray-700'} text-sm font-semibold`}>Task Rankings</span>
              <span className={`${darkMode ? 'text-amber-300' : 'text-gray-700'} text-sm font-semibold`}>Comparison {comparison} of {totalComparisons}</span>
            </div>
            <div className={`${darkMode ? 'bg-stone-800' : 'bg-gray-200'} h-3 rounded-full overflow-hidden`}>
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" style={{ width: `${(comparison / totalComparisons) * 100}%` }} />
            </div>
          </div>

          {/* Instructions */}
          <div className={`${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'} mb-6 p-4 rounded-xl border-2`}>
            <div className="flex items-start gap-3">
              <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-200'} p-2 rounded-lg`}>
                <ThumbsDown className={`${darkMode ? 'text-amber-300' : 'text-orange-700'} w-5 h-5`} />
              </div>
              <div>
                <h3 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} font-bold mb-1`}>Which task do you want to avoid MORE?</h3>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Click the task you dislike more. We’ll use your choices to steer the VS picks.</p>
              </div>
            </div>
          </div>

          {/* VS Badge */}
          <div className="relative mb-6">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className={`${darkMode ? 'bg-gradient-to-br from-amber-800 to-orange-900 border-amber-600' : 'bg-gradient-to-br from-orange-400 to-amber-500 border-orange-300'} w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4`}>
                <Swords className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[left, right].filter(Boolean).map((t) => (
                <button
                  key={t._id}
                  onClick={() => onChoose(t._id)}
                  className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30 hover:border-amber-600' : 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-lg'} text-left p-6 rounded-2xl border-2 transition-all transform hover:scale-105`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${darkMode ? 'bg-amber-900/30 border-amber-700 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-700'} px-3 py-1 rounded-full text-xs font-bold border`}>{String(t.priority || '').toUpperCase()}</div>
                    <ThumbsDown className={`${selectedId === t._id ? 'text-red-500 animate-bounce' : (darkMode ? 'text-amber-500/50' : 'text-gray-400')} w-5 h-5`} />
                  </div>
                  <h3 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-xl font-bold mb-2`}>{t.title}</h3>
                  {t.description && (
                    <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm mb-3`} style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>
                  )}
                  <div className={`${darkMode ? 'text-amber-400/60' : 'text-gray-500'} flex items-center gap-2 text-xs`}>
                    <span>📅 Due: {new Date(t.deadline).toLocaleDateString()}</span>
                  </div>
                  {selectedId === t._id && (
                    <div className={`${darkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'} mt-4 p-3 rounded-lg text-center font-semibold`}>😱 I dislike THIS one more!</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Completion Modal */}
          {showCompletionModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${darkMode ? 'bg-stone-900/95 border-amber-600' : 'bg-white border-orange-400'} max-w-md w-full rounded-2xl shadow-2xl border-2 p-6`}>
                <div className="text-center mb-4">
                  <div className="text-5xl mb-3">⚖️</div>
                  <h2 className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} text-2xl font-bold mb-1`}>Rankings Updated!</h2>
                  <p className={`${darkMode ? 'text-amber-300/80' : 'text-gray-700'} text-base`}>Great job! Your task preferences are now ranked.</p>
                </div>
                <div className={`${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'} mb-6 p-4 rounded-xl border`}>
                  <p className={`${darkMode ? 'text-amber-300/80' : 'text-gray-700'} text-sm text-center`}>You've compared <span className="font-bold">{totalComparisons} pairs</span> of tasks.</p>
                </div>
                <div className="space-y-3">
                  <button
                    disabled={saving}
                    onClick={async () => {
                      setError('');
                      try {
                        await flushUpdates();
                      } catch (e) {
                        setError(e.message || 'Failed to save rankings');
                      }
                      if (typeof window !== 'undefined') window.location.href = '/showdown/vs';
                    }}
                    className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} w-full py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
                  >
                    <Trophy className="w-5 h-5" />
                    {saving ? 'Saving…' : 'Start Showdown'}
                  </button>
                  <button
                    disabled={saving}
                    onClick={() => {
                      setComparison(1);
                      setSelectedId(null);
                      setPair(pickPair());
                      setShowCompletionModal(false);
                    }}
                    className={`${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'} w-full py-3 rounded-xl font-medium transition border-2 flex items-center justify-center gap-2`}
                  >
                    <Zap className="w-5 h-5" />
                    Rank More Tasks
                  </button>
                  <Link href="/dashboard" className={`${darkMode ? 'border-amber-800/50 text-amber-400/70 hover:bg-stone-800/30 hover:text-amber-300' : 'border-orange-200 text-gray-600 hover:bg-orange-50 hover:text-gray-800'} w-full py-3 rounded-xl font-medium transition border flex items-center justify-center gap-2`}>Back to Main Menu</Link>
                </div>
                {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


