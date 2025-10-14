'use client';

import Link from 'next/link';
import { ArrowDownUp, Play, BarChart3, Home } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function ShowdownLandingPage() {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50'}`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-2xl font-bold`}>Procrastination Showdown</h1>
              <p className={`${darkMode ? 'text-amber-300/80' : 'text-gray-600'} text-sm`}>Turn "ugh" into "done" - one clever choice at a time!</p>
            </div>
            <Link href="/dashboard" className={`${darkMode ? 'border-amber-700 text-amber-300 hover:bg-amber-900/30' : 'border-orange-300 text-orange-700 hover:bg-orange-50'} inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium`}>
              <Home className="w-4 h-4"/>
              Dashboard
            </Link>
          </div>
          {/* Hero section */}
          <div className={`text-center mb-6 p-6 rounded-2xl border-2 ${darkMode ? 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-600/50' : 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-300'}`}>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-4xl">🎯</div>
              <h2 className={`${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'} text-3xl font-black`}>Welcome to the Showdown!</h2>
            </div>
            <p className={`${darkMode ? 'text-amber-200/80' : 'text-gray-700'} text-base max-w-2xl mx-auto`}>Stop stalling and start doing! Pick the task you hate less, crush it, and feel amazing. 🍑</p>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Featured Rank card */}
            <Link href="/showdown/rank" className={`p-5 rounded-2xl border-2 transition-all hover:scale-105 text-left ${darkMode ? 'bg-gradient-to-br from-amber-800/50 to-orange-900/50 border-amber-600 shadow-lg' : 'bg-gradient-to-br from-orange-500 to-amber-500 border-orange-400 shadow-xl'}`}>
              <div className="flex items-start gap-3">
                <div className={`${darkMode ? 'bg-amber-700/50' : 'bg-white/30'} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <ArrowDownUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">Rank Tasks</h3>
                    <span className={`${darkMode ? 'bg-amber-400 text-amber-950' : 'bg-white text-orange-600'} px-2 py-0.5 rounded-full text-xs font-bold`}>START HERE</span>
                  </div>
                  <p className="text-sm text-white/90">Tell us which tasks you dread most. Required before your first showdown!</p>
                </div>
              </div>
            </Link>

            <Link href="/showdown/vs" className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30 hover:border-amber-600' : 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-orange-200/50'} p-5 rounded-2xl border-2 transition-all hover:scale-105 text-left`}>
              <div className="flex items-start gap-3">
                <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Play className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-6 h-6`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-lg font-bold mb-1`}>Start Showdown</h3>
                  <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Two tasks face off — you pick the lesser evil and get started!</p>
                </div>
              </div>
            </Link>

            <Link href="/showdown/stats" className={`${darkMode ? 'bg-stone-900/80 border-amber-900/30 hover:border-amber-600' : 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-orange-200/50'} p-5 rounded-2xl border-2 transition-all hover:scale-105 text-left`}>
              <div className="flex items-start gap-3">
                <div className={`${darkMode ? 'bg-amber-800/50' : 'bg-orange-100'} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <BarChart3 className={`${darkMode ? 'text-amber-300' : 'text-orange-600'} w-6 h-6`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-lg font-bold mb-1`}>View Stats</h3>
                  <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>See your progress, streaks, and accomplishments!</p>
                </div>
              </div>
            </Link>
          </div>

          {/* How it works */}
          <div className={`${darkMode ? 'bg-amber-900/20 border-amber-700/50' : 'bg-orange-50 border-orange-200'} rounded-2xl border p-6 mb-5`}>
            <h4 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} text-lg font-bold mb-4 text-center`}>How It Works</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">1️⃣</div>
                <h5 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} font-semibold mb-1`}>Rank Your Dread</h5>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Compare tasks pairwise to build your personal avoid-o-meter.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">2️⃣</div>
                <h5 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} font-semibold mb-1`}>Pick the Lesser Evil</h5>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>We show you two dreaded tasks — choose which one you’d rather do.</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">3️⃣</div>
                <h5 className={`${darkMode ? 'text-amber-100' : 'text-gray-900'} font-semibold mb-1`}>Just Do It!</h5>
                <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-sm`}>Start the task, use the optional timer, and celebrate when done!</p>
              </div>
            </div>
          </div>

          {/* Motivational */}
          <p className={`${darkMode ? 'text-amber-300/70' : 'text-gray-600'} text-xs italic text-center`}>"The best way to get started is to quit talking and begin doing."</p>
        </div>
      </div>
    </div>
  );
}


