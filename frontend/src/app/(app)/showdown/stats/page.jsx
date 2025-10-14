'use client';

import { useEffect, useState } from 'react';
import { Clock, Trophy, Heart } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';
import { getJson } from '@/lib/api';

function formatTime(seconds) {
  const s = Number(seconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = Math.floor(s % 60);
  if (h > 0) return `${h}h ${m}m ${r}s`;
  return `${m}m ${r}s`;
}

export default function ShowdownStatsPage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total_completed: 0, total_time_seconds: 0, streak_days: 0, peaches_peached_total: 0 });

  useEffect(() => {
    setLoading(true);
    getJson('/showdown/stats')
      .then((s) => setStats(s))
      .catch((e) => setError(e.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-2xl font-bold mb-4`}>Showdown Stats</h1>
          {loading ? (
            <div className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white border-orange-200'} rounded-xl border p-6`}>Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded p-3">{error}</div>
          ) : (
            <div className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30' : 'bg-white border-orange-200'} rounded-xl border p-6`}>
              <div className="flex items-center justify-around flex-wrap gap-6">
                {stats.total_time_seconds > 0 && (
                  <div className="flex items-center gap-3">
                    <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                      <Clock className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                    </div>
                    <div>
                      <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{formatTime(stats.total_time_seconds)}</div>
                      <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Time Invested</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                    <Trophy className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                  </div>
                  <div>
                    <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{stats.total_completed}</div>
                    <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Tasks Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-10 h-10 rounded-full flex items-center justify-center`}>
                    <Heart className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-5 h-5`} />
                  </div>
                  <div>
                    <div className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'text-orange-600'} text-xl font-black`}>{stats.peaches_peached_total}</div>
                    <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs`}>Total Peaches Peached</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


