'use client';

import { Trophy, Clock, X, Play, Home, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Match3Modal({ open, type, score = 0, elapsedMs = 0, wins, losses, message = '', onClose, onPrimary, onBack, highlightBack = false }) {
  if (!open) return null;

  const isWin = type === 'win' || type === 'nudgeWin';
  const title = isWin ? 'Level Complete!' : (type?.startsWith('nudge') ? 'Quick Nudge' : 'New Board Suggested');
  const primaryLabel = isWin ? 'Next Level' : 'New Board';
  const router = useRouter();

	// Custom glow CSS for highlighted back button
	const glowCss = `
	@keyframes peachy-glow {
		0%, 100% { box-shadow: 0 0 0px rgba(249, 115, 22, 0.0); }
		50% { box-shadow: 0 0 18px rgba(249, 115, 22, 0.75); }
	}
	.peachy-glow { animation: peachy-glow 1.8s ease-in-out infinite; }
	`;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {highlightBack && (<style>{glowCss}</style>)}
      <div className="max-w-md w-full rounded-2xl shadow-2xl border-2 p-6 bg-white border-orange-400">
        {/* Celebration/Header */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">{isWin ? '🎉' : '🍑'}</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            {title}
          </h2>
          {message ? (
            <p className="mt-1 text-base text-gray-700">{message}</p>
          ) : null}
        </div>

        {/* Stats (show score/time for win; minimal for lose) */}
        {isWin ? (
          <div className="mb-4 p-3 rounded-xl border bg-orange-50 border-orange-200">
            <h3 className="text-xs font-bold uppercase tracking-wide text-center mb-2 text-orange-700">Level Score</h3>
            <div className="text-3xl font-black text-center bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {Number(score).toLocaleString()}
            </div>
          </div>
        ) : null}

        <div className="mb-4 p-3 rounded-xl border bg-gray-50 border-gray-200">
          <h3 className="text-xs font-bold uppercase tracking-wide text-center mb-2 text-gray-700">Session</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-orange-600" />
                <span className="text-xs text-gray-600">Score</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{Number(score).toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-orange-600" />
                <span className="text-xs text-gray-600">Time</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{formatTime(elapsedMs)}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span className="text-xs text-gray-600">Wins</span>
              </div>
              <div className="text-lg font-bold text-emerald-700">{wins ?? '—'}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <X className="w-3 h-3 text-red-600" />
                <span className="text-xs text-gray-600">Losses</span>
              </div>
              <div className="text-lg font-bold text-red-600">{losses ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={onPrimary}
            className="w-full py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {isWin ? <Play className="w-5 h-5" /> : <Home className="w-5 h-5" />}
            {primaryLabel}
          </button>
			<button
				onClick={() => { if (onBack) onBack(); else router.push('/dashboard'); }}
				className={`w-full py-3 rounded-xl font-medium transition border-2 flex items-center justify-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 ${highlightBack ? 'relative peachy-glow ring-4 ring-orange-400/60 ring-offset-2 ring-offset-white' : ''}`}
			>
            <Home className="w-5 h-5" />
            Back to Tasks
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const h = Math.floor(totalSec / 3600);
  if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}


