'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Home, Play, RotateCcw, ArrowDownUp } from 'lucide-react';
import { getJson, patchJson, postJson } from '@/lib/api';
import { useTheme } from '@/components/ThemeContext';

function formatTimer(seconds) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) return `${hours}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  return `${mins}:${String(secs).padStart(2,'0')}`;
}

export default function ShowdownVSPage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [labels, setLabels] = useState([]);
  const [pair, setPair] = useState([]);
  const [pairLoading, setPairLoading] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState(null);

  // Load tasks
  useEffect(() => {
    setLoading(true);
    getJson('/tasks')
      .then((all) => setTasks(all.filter((t) => !t.completed)))
      .catch((e) => setError(e.message || 'Failed to load tasks'))
      .finally(() => setLoading(false));
    // load labels (non-fatal)
    getJson('/labels').then(setLabels).catch(() => {});
  }, []);

  // Simple local timer
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setTimerSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // Fetch a showdown pair from backend
  const fetchPair = async () => {
    setPairLoading(true);
    setSelectedId(null);
    try {
      const p = await getJson('/showdown/pair');
      setPair(Array.isArray(p) ? p : []);
    } catch (e) {
      setError(e.message || 'Failed to fetch showdown pair');
      setPair([]);
    } finally {
      setPairLoading(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    // Resume from session storage if flagged
    try {
      const resume = typeof window !== 'undefined' ? window.sessionStorage.getItem('showdown_resume') === '1' : false;
      if (resume) {
        const storedPair = window.sessionStorage.getItem('showdown_pair');
        const storedSelected = window.sessionStorage.getItem('showdown_selected_id');
        if (storedPair) {
          try {
            const parsed = JSON.parse(storedPair);
            if (Array.isArray(parsed) && parsed.length >= 2) {
              setPair(parsed);
            }
          } catch {}
        }
        if (storedSelected) {
          setSelectedId(storedSelected);
          // fetch saved time and continue
          getJson(`/tasks/${storedSelected}`).then((t) => {
            const secs = Number(t?.showdown_timer_seconds || 0);
            if (secs > 0) {
              setTimerSeconds(secs);
              setTimerRunning(true);
            }
          }).catch(() => {});
        }
        // clear resume flag so normal flow resumes next time
        window.sessionStorage.removeItem('showdown_resume');
        return;
      }
    } catch {}
    fetchPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const currentTask = useMemo(() => pair.find((t) => t._id === selectedId) || null, [pair, selectedId]);

  const handleComplete = async () => {
    if (!currentTask) return;
    try {
      // Capture and stop timer before persisting
      const finalSeconds = timerSeconds || 0;
      setTimerRunning(false);
      setTaskCompleted(true);
      // Persist pair/selection to session for potential resume
      try {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem('showdown_pair', JSON.stringify(pair));
          window.sessionStorage.setItem('showdown_selected_id', currentTask._id);
        }
      } catch {}
      // Persist completion via showdown endpoint (with timer)
      const updated = await postJson('/showdown/complete', { task_id: currentTask._id, timer_seconds: finalSeconds });
      // route to results with state via URL params
      const q = new URLSearchParams();
      q.set('taskId', updated._id);
      if (finalSeconds > 0) q.set('timer', String(finalSeconds));
      if (typeof window !== 'undefined') window.location.href = `/showdown/results?${q.toString()}`;
    } catch (e) {
      setError(e.message || 'Failed to complete task');
      setTaskCompleted(false);
    }
  };

  const attemptSelect = (newId) => {
    if (selectedId && newId !== selectedId && (timerSeconds || 0) > 0) {
      setPendingSelectId(newId);
      setShowSwitchModal(true);
      return;
    }
    setSelectedId(newId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-amber-200/90">Loading…</p>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors overflow-x-hidden ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Instructions or CTA when insufficient tasks */}
          {tasks.length < 4 ? (
            <div className={`mb-3 p-3 rounded-xl border text-center ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'}`}>
              <h3 className={`font-bold text-lg mb-2 ${darkMode ? 'text-amber-200' : 'text-gray-900'}`}>You need at least 4 active tasks</h3>
              <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm mb-3`}>Add more tasks on the dashboard to start a showdown.</p>
              <Link href="/dashboard" className={`${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'} inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium`}>Return to Dashboard</Link>
            </div>
          ) : pairLoading ? (
            <div className={`mb-3 p-3 rounded-xl border text-center ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'}`}>
              <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Picking your showdown pair…</p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className={`mb-3 p-3 rounded-xl border text-center ${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'}`}>
                <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-amber-200' : 'text-gray-900'}`}>Which task would you rather tackle?</h3>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Pick one and get started! You might surprise yourself.</p>
              </div>

              {/* VS Arena (reduced height on desktop) */}
              <div className="relative mb-6 h-[380px] lg:h-[400px]">
                {/* VS Badge */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 ${darkMode ? 'bg-gradient-to-br from-amber-600 to-orange-600 border-amber-400' : 'bg-gradient-to-br from-orange-400 to-amber-400 border-orange-300'}`}>
                    <span className="text-xl font-black text-white">VS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-0 h-full">
                  {pair.map((t, idx) => {
                    const isSelected = selectedId === t._id;
                    const left = idx === 0;
                    const ring = isSelected ? (darkMode ? (left ? 'ring-8 ring-amber-500/50' : 'ring-8 ring-red-500/50') : (left ? 'ring-8 ring-orange-400/50' : 'ring-8 ring-red-300/50')) : '';
                    const bg = darkMode
                      ? (left ? 'bg-gradient-to-br from-amber-700 to-orange-950 hover:from-amber-600 hover:to-orange-900' : 'bg-gradient-to-br from-stone-800 to-red-900 hover:from-stone-700 hover:to-red-800')
                      : (left ? 'bg-gradient-to-br from-orange-300 to-amber-500 hover:from-orange-400 hover:to-amber-600' : 'bg-gradient-to-br from-red-300 to-orange-300 hover:from-red-400 hover:to-orange-400');
                    const bgSelected = darkMode
                      ? (left ? 'bg-gradient-to-br from-amber-600 to-orange-900' : 'bg-gradient-to-br from-red-900 to-orange-900')
                      : (left ? 'bg-gradient-to-br from-orange-400 to-amber-600' : 'bg-gradient-to-br from-red-400 to-orange-400');
                    return (
                      <button key={t._id} onClick={() => attemptSelect(t._id)} className={`text-left p-6 transition-all h-full flex flex-col relative overflow-hidden ${isSelected ? bgSelected : bg} ${ring}`} style={{ borderRadius: left ? '24px 0 0 24px' : '0 24px 24px 0' }}>
                        {/* Header row with priority and check aligned */}
                        <div className="flex items-start justify-between mb-6">
                          {/* Left slot: for right card, show check; for left card, show priority */}
                          <div className="flex items-center">
                            {(!left) ? (
                              isSelected ? (
                                <button onClick={(e) => { e.stopPropagation(); handleComplete(); }} className="relative group cursor-pointer" title="Mark as Done" aria-label="Mark as Done">
                                  <div className="relative">
                                    {!taskCompleted && (<div className="absolute inset-0 rounded-full bg-white/50 animate-ping pointer-events-none" style={{ animationDuration: '1s', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }} />)}
                                    {taskCompleted && (<div className="absolute inset-0 rounded-full bg-yellow-300/70 pointer-events-none" />)}
                                    <CheckCircle className={`w-7 h-7 text-white drop-shadow-lg transition-transform group-hover:scale-110 relative z-10 ${taskCompleted ? '' : 'animate-bounce'}`} />
                                  </div>
                                </button>
                              ) : (
                                <span className="w-7 h-7 inline-block" aria-hidden="true" />
                              )
                            ) : (
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSelected ? 'bg-white/30 text-white border-2 border-white/50' : 'bg-white/20 text-white border-2 border-white/30'}`}>{String(t.priority || '').toUpperCase()}</div>
                            )}
                          </div>
                          {/* Right slot: for left card, show check; for right card, show priority */}
                          <div className="flex items-center">
                            {left ? (
                              isSelected ? (
                                <button onClick={(e) => { e.stopPropagation(); handleComplete(); }} className="relative group cursor-pointer" title="Mark as Done" aria-label="Mark as Done">
                                  <div className="relative">
                                    {!taskCompleted && (<div className="absolute inset-0 rounded-full bg-white/50 animate-ping pointer-events-none" style={{ animationDuration: '1s', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' }} />)}
                                    {taskCompleted && (<div className="absolute inset-0 rounded-full bg-yellow-300/70 pointer-events-none" />)}
                                    <CheckCircle className={`w-7 h-7 text-white drop-shadow-lg transition-transform group-hover:scale-110 relative z-10 ${taskCompleted ? '' : 'animate-bounce'}`} />
                                  </div>
                                </button>
                              ) : (
                                <span className="w-7 h-7 inline-block" aria-hidden="true" />
                              )
                            ) : (
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${isSelected ? 'bg-white/30 text-white border-2 border-white/50' : 'bg-white/20 text-white border-2 border-white/30'}`}>{String(t.priority || '').toUpperCase()}</div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center -mt-6">
                          <h3 className="text-2xl font-black mb-2 text-white drop-shadow-lg" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.title}</h3>
                          {t.description && (
                            <p className="text-base mb-3 text-white/90" style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-white/80">
                            <span>📅 Due: {new Date(t.deadline).toLocaleDateString()}</span>
                            {Array.isArray(t.label_ids) && t.label_ids.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-white/20 text-white border border-white/30">
                                🏷️ {(labels.find((l)=>l._id===t.label_ids[0])?.name) || 'Label'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-1 h-16 flex flex-col items-center justify-center gap-2">
                          {isSelected && (
                            <>
                              <div className="text-center font-black text-xl text-white drop-shadow-lg">✅ LET'S DO THIS!</div>
                              <button onClick={(e) => { e.stopPropagation(); setShowTaskModal(true); }} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${darkMode ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}>Show Task Details</button>
                            </>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timer Section */}
              <div className={`mb-4 p-4 rounded-xl border-2 ${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white border-orange-200'}`}>
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <h3 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-sm font-bold`}>Optional Timer</h3>
                    <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} text-3xl font-black`}>{formatTimer(timerSeconds)}</div>
                  </div>
                  <div className="flex gap-2">
                    {!timerRunning ? (
                      <button onClick={() => setTimerRunning(true)} disabled={!selectedId} className={`px-6 py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2 ${!selectedId ? (darkMode ? 'bg-stone-700 text-stone-500 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed') : (darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white')}`}><Play className="w-4 h-4"/>Start Timer</button>
                    ) : (
                      <>
                        <button onClick={handleComplete} className={`${darkMode ? 'bg-emerald-800 hover:bg-emerald-700 text-emerald-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} px-5 py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg`}>✓ Done</button>
                        <button onClick={() => setTimerRunning(false)} className={`px-5 py-2 rounded-lg font-medium transition border-2 ${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}>⏸ Pause</button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-center mb-4 flex-wrap">
                <button onClick={() => fetchPair()} className={`px-6 py-3 rounded-xl font-medium transition border-2 flex items-center gap-2 ${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}><RotateCcw className="w-5 h-5"/>Pick New Showdown</button>
                <Link href="/showdown/rank" className={`px-6 py-3 rounded-xl font-medium transition border-2 flex items-center gap-2 ${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}><ArrowDownUp className="w-5 h-5"/>Return to Ranking</Link>
                <Link href="/dashboard" className={`px-6 py-3 rounded-xl font-medium transition border-2 flex items-center gap-2 ${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'}`}><Home className="w-5 h-5"/>Return to Dashboard</Link>
              </div>

              {/* Helper Text */}
              <div className={`text-center p-4 rounded-xl border ${darkMode ? 'bg-stone-900/50 border-amber-900/30' : 'bg-white/50 border-orange-200'}`}>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}><span className="font-semibold">The secret:</span> Pick the lesser of evils to get more done!</p>
              </div>
            </>
          )}
        </div>

        {/* Task Details Modal (read-only) */}
        {showTaskModal && currentTask && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`max-w-lg w-full rounded-2xl shadow-2xl border-2 p-6 ${darkMode ? 'bg-stone-900/95 border-amber-600' : 'bg-white border-orange-400'}`}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-lg flex items-center justify-center`}><span className="text-2xl">📋</span></div>
                  <h2 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-xl font-bold`}>Task Details</h2>
                </div>
                <button onClick={() => setShowTaskModal(false)} className={`${darkMode ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-900/50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} p-2 rounded-lg`}>✕</button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-2xl font-bold mb-2`}>{currentTask.title}</h3>
                  {currentTask.description && <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-base`}>{currentTask.description}</p>}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-amber-900/30">
                  <span className={`${darkMode ? 'bg-red-900/50 text-red-300 border-red-800' : 'bg-red-100 text-red-800 border-red-200'} inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border`}>{String(currentTask.priority).charAt(0).toUpperCase() + String(currentTask.priority).slice(1)} Priority</span>
                  <span className={`${darkMode ? 'bg-stone-800/50 text-amber-300' : 'bg-gray-100 text-gray-700'} inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium`}>📅 {new Date(currentTask.deadline).toLocaleDateString()}</span>
                </div>
                <div className="pt-2">
                  <label className={`${darkMode ? 'text-amber-200' : 'text-gray-700'} block text-sm font-semibold mb-2`}>Labels</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(currentTask.label_ids) && currentTask.label_ids.length > 0 ? (
                      currentTask.label_ids.map((lid) => {
                        const ld = labels.find((l) => l._id === lid);
                        const name = (ld && ld.name) || 'Label';
                        const color = (ld && ld.color) || '#6b7280';
                        const style = darkMode
                          ? { backgroundColor: `${color}30`, color: color }
                          : { backgroundColor: `${color}20`, color: color };
                        return (
                          <span
                            key={lid}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border"
                            style={{ ...style, borderColor: `${color}55` }}
                          >
                            🏷️ {name}
                          </span>
                        );
                      })
                    ) : (
                      <span className={`${darkMode ? 'text-amber-300/70' : 'text-gray-500'} text-sm`}>No labels</span>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-amber-900/30">
                  <button onClick={() => setShowTaskModal(false)} className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} w-full px-6 py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg`}>Close & Return to Showdown</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showSwitchModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`${darkMode ? 'bg-stone-900/95 border-amber-600' : 'bg-white border-orange-400'} max-w-md w-full rounded-2xl shadow-2xl border-2 p-6`}>
              <h2 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-xl font-bold mb-2`}>Switch selected task?</h2>
              <p className={`${darkMode ? 'text-amber-300/80' : 'text-gray-700'} text-sm mb-4`}>Switching will clear your current timer. Do you want to proceed?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowSwitchModal(false); setPendingSelectId(null); }} className={`${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'} px-4 py-2 rounded-lg border-2 font-medium`}>Cancel</button>
                <button onClick={() => { setTimerRunning(false); setTimerSeconds(0); if (pendingSelectId) setSelectedId(pendingSelectId); setPendingSelectId(null); setShowSwitchModal(false); }} className={`${darkMode ? 'bg-gradient-to-r from-amber-700 to-orange-800 hover:from-amber-600 hover:to-orange-700 text-amber-50' : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'} px-4 py-2 rounded-lg font-semibold`}>Switch Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


