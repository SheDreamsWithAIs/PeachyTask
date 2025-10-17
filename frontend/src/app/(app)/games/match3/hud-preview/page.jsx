	'use client';

	import { useState } from 'react';
	import { Moon, Sun, Trophy, Target, Clock } from 'lucide-react';

export default function Match3HudPreviewPage() {
	const [darkMode, setDarkMode] = useState(false);
	const score = 2450;
	const moves = 15;
	const timeLeft = 180; // seconds
	const level = 3;
	const levelGoals = [
		{ emoji: '🍑', remaining: 7, completed: false },
		{ emoji: '🍓', remaining: 0, completed: true },
		{ emoji: '🍊', remaining: 3, completed: false },
	];

	return (
		<div className={darkMode ? 'dark' : ''}>
			<div className="max-w-4xl mx-auto px-4 py-6">
				<div className="flex justify-end mb-3">
					<button
						onClick={() => setDarkMode(v => !v)}
						className={`p-2 rounded-lg transition ${darkMode ? 'bg-amber-800/50 text-amber-200 hover:bg-amber-800' : 'bg-orange-400/30 text-orange-700 hover:bg-orange-600/40 hover:text-white'}`}
						aria-label="Toggle dark mode"
					>
						{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
					</button>
				</div>

				<div className={`rounded-xl shadow-sm border p-4 ${darkMode ? 'bg-stone-900/80 border-amber-900/30 backdrop-blur-sm' : 'bg-white/80 border-orange-200/50 backdrop-blur-sm'}`}>
					{/* Desktop: boxed sections with icons; wider Goals to avoid wrap */}
					<div className="hidden md:grid grid-cols-5 gap-3">
						{/* Score */}
						<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} p-3 rounded-lg text-center`}>
							<div className="flex items-center justify-center gap-1 mb-1">
								<Trophy className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />
								<span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300/70' : 'text-gray-600'}`}>Score</span>
							</div>
							<div className={`text-2xl font-bold ${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'}`}>{score.toLocaleString()}</div>
						</div>
						{/* Moves */}
						<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} p-3 rounded-lg text-center`}>
							<div className="flex items-center justify-center gap-1 mb-1">
								<Target className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />
								<span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300/70' : 'text-gray-600'}`}>Moves</span>
							</div>
							<div className={`text-2xl font-bold ${moves < 5 ? 'text-red-500' : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{moves}</div>
						</div>
						{/* Time */}
						<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} p-3 rounded-lg text-center`}>
							<div className="flex items-center justify-center gap-1 mb-1">
								<Clock className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />
								<span className={`text-xs font-medium uppercase tracking-wide ${darkMode ? 'text-amber-300/70' : 'text-gray-600'}`}>Time</span>
							</div>
							<div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-red-500' : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{formatTimeSeconds(timeLeft)}</div>
						</div>
						{/* Goals + right controls */}
						<div className="col-span-2 flex items-stretch gap-3">
							<div className={`flex-1 p-3 rounded-lg border ${darkMode ? 'bg-stone-800/50 border-amber-800/30' : 'bg-gray-50 border-orange-200'}`}>
								<div className={`text-xs font-bold uppercase tracking-wide mb-1 text-center ${darkMode ? 'text-amber-300' : 'text-orange-700'}`}>Goals</div>
								<div className="flex items-center justify-center gap-3 flex-nowrap">
									{levelGoals.map((goal, idx) => (
										<div
											key={idx}
											className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border ${goal.completed ? (darkMode ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-100 border-emerald-400') : (darkMode ? 'bg-stone-800/50 border-amber-700/50' : 'bg-white border-orange-300')}`}
										>
											<span className="text-base leading-none">{goal.emoji}</span>
											<div className={`text-xs font-bold leading-none ${goal.completed ? (darkMode ? 'text-emerald-300' : 'text-emerald-700') : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{goal.completed ? '✓' : goal.remaining}</div>
										</div>
									))}
								</div>
							</div>
							<div className="flex flex-col gap-2 min-w-[110px]">
								<div className={`${darkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-orange-50 border-orange-200'} px-3 py-2 rounded-lg border text-center`}>
									<div className={`text-[10px] uppercase tracking-wide ${darkMode ? 'text-amber-300/80' : 'text-gray-600'}`}>Level</div>
									<div className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-sm font-bold`}>{level}</div>
								</div>
								<button className={`px-3 py-1.5 rounded-lg border text-sm whitespace-nowrap ${darkMode ? 'border-amber-800 text-amber-200 hover:bg-amber-900/40' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}>New Board</button>
							</div>
						</div>
					</div>

					{/* Mobile: 4 lines max with icons and boxed values */}
					<div className="md:hidden">
						{/* Labels row with icons */}
						<div className="flex items-center justify-between text-[10px] uppercase tracking-wide mb-1">
							<div className="flex items-center gap-3">
								<span className={`flex items-center gap-1 ${darkMode ? 'text-amber-300/80' : 'text-gray-600'}`}><Trophy className={`w-3 h-3 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />Score</span>
								<span className={`flex items-center gap-1 ${darkMode ? 'text-amber-300/80' : 'text-gray-600'}`}><Target className={`w-3 h-3 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />Moves</span>
								<span className={`flex items-center gap-1 ${darkMode ? 'text-amber-300/80' : 'text-gray-600'}`}><Clock className={`w-3 h-3 ${darkMode ? 'text-amber-400' : 'text-orange-600'}`} />Time</span>
							</div>
						</div>
						{/* Values row in boxes */}
						<div className="flex gap-2 mb-2">
							<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} flex-1 text-center p-2 rounded-lg`}>
								<div className={`text-lg font-bold ${darkMode ? 'bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'}`}>{score.toLocaleString()}</div>
							</div>
							<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} flex-1 text-center p-2 rounded-lg`}>
								<div className={`text-lg font-bold ${moves < 5 ? 'text-red-500' : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{moves}</div>
							</div>
							<div className={`${darkMode ? 'bg-amber-900/20' : 'bg-orange-50'} flex-1 text-center p-2 rounded-lg`}>
								<div className={`text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{formatTimeSeconds(timeLeft)}</div>
							</div>
						</div>
						{/* Goals row plus right controls in one line */}
						<div className="flex gap-2">
							<div className={`rounded-lg border p-2 flex-1 ${darkMode ? 'bg-stone-800/50 border-amber-800/30' : 'bg-gray-50 border-orange-200'}`}>
								<div className="flex justify-center gap-2 flex-nowrap overflow-x-auto">
									{levelGoals.map((goal, idx) => (
										<div
											key={idx}
											className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border ${goal.completed ? (darkMode ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-100 border-emerald-400') : (darkMode ? 'bg-stone-800/50 border-amber-700/50' : 'bg-white border-orange-300')}`}
										>
											<span className="text-base leading-none">{goal.emoji}</span>
											<div className={`text-xs font-bold leading-none ${goal.completed ? (darkMode ? 'text-emerald-300' : 'text-emerald-700') : (darkMode ? 'text-amber-200' : 'text-gray-900')}`}>{goal.completed ? '✓' : goal.remaining}</div>
										</div>
									))}
								</div>
							</div>
							<div className="flex flex-col gap-2 min-w-[100px]">
								<div className={`${darkMode ? 'bg-amber-900/20 border-amber-800/30' : 'bg-orange-50 border-orange-200'} px-2.5 py-1.5 rounded-lg border text-center`}>
									<div className={`text-[10px] uppercase tracking-wide ${darkMode ? 'text-amber-300/80' : 'text-gray-600'}`}>Level</div>
									<div className={`${darkMode ? 'text-amber-200' : 'text-gray-900'} text-sm font-bold`}>{level}</div>
								</div>
								<button className={`px-2.5 py-1 rounded-md border text-xs whitespace-nowrap ${darkMode ? 'border-amber-800 text-amber-200 hover:bg-amber-900/40' : 'border-orange-300 text-gray-700 hover:bg-orange-50'}`}>New</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatTimeSeconds(seconds) {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${String(secs).padStart(2, '0')}`;
}


