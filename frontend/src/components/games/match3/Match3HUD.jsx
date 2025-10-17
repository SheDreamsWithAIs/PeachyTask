'use client';

import { Trophy, Target, Clock } from 'lucide-react';

export default function Match3HUD({
	metrics,
	goals,
	onNewBoard,
	className = '',
}) {
	const score = metrics?.score ?? 0;
	const moves = metrics?.moves ?? 0;
	const elapsedMs = metrics?.elapsedMs ?? 0;
	const level = metrics?.level ?? 1;

	return (
		<div className={`rounded-2xl px-3 py-2 border bg-white/90 ${className}`}>
			{/* Desktop layout */}
			<div className="hidden md:grid grid-cols-5 gap-2">
				{/* Score */}
				<div className="bg-orange-50 p-2.5 rounded-lg text-center">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Trophy className="w-4 h-4 text-orange-600" />
						<span className="text-xs font-medium uppercase tracking-wide text-gray-600">Score</span>
					</div>
					<div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
						{Number(score).toLocaleString()}
					</div>
				</div>
				{/* Moves */}
				<div className="bg-orange-50 p-2.5 rounded-lg text-center">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Target className="w-4 h-4 text-orange-600" />
						<span className="text-xs font-medium uppercase tracking-wide text-gray-600">Moves</span>
					</div>
					<div className={`text-2xl font-bold ${moves < 5 ? 'text-red-500' : 'text-gray-900'}`}>{moves}</div>
				</div>
				{/* Time */}
				<div className="bg-orange-50 p-2.5 rounded-lg text-center">
					<div className="flex items-center justify-center gap-1 mb-1">
						<Clock className="w-4 h-4 text-orange-600" />
						<span className="text-xs font-medium uppercase tracking-wide text-gray-600">Time</span>
					</div>
					<div className="text-2xl font-bold text-gray-900">{formatTimeSeconds(Math.floor(elapsedMs / 1000))}</div>
				</div>
				{/* Goals and right-side controls */}
				<div className="col-span-2 flex items-stretch gap-2">
					<div className="flex-1 p-2.5 rounded-lg border bg-gray-50 border-orange-200">
						<div className="text-xs font-bold uppercase tracking-wide mb-1 text-center text-orange-700">Goals</div>
						<div className="flex items-center justify-center gap-3 flex-nowrap">
							{(goals || []).map((g, idx) => (
								<div key={idx} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border ${g.remaining === 0 ? 'bg-emerald-100 border-emerald-400' : 'bg-white border-orange-300'}`}>
									<span className="text-base leading-none">{g.emoji}</span>
									<div className={`text-xs font-bold leading-none ${g.remaining === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>{g.remaining === 0 ? '✓' : g.remaining}</div>
								</div>
							))}
						</div>
					</div>
					<div className="flex flex-col gap-1.5 min-w-[110px]">
						<div className="bg-orange-50 border border-orange-200 px-2.5 py-1.5 rounded-lg text-center">
							<div className="text-[10px] uppercase tracking-wide text-gray-600">Level</div>
							<div className="text-sm font-bold text-gray-900">{level}</div>
						</div>
						<button onClick={onNewBoard} className="px-2.5 py-1.5 rounded-lg border text-sm whitespace-nowrap border-orange-300 text-gray-700 hover:bg-orange-50">New Board</button>
					</div>
				</div>
			</div>

			{/* Mobile layout */}
			<div className="md:hidden">
				<div className="flex items-center justify-between text-[10px] uppercase tracking-wide mb-1">
					<div className="flex items-center gap-3">
						<span className="flex items-center gap-1 text-gray-600"><Trophy className="w-3 h-3 text-orange-600" />Score</span>
						<span className="flex items-center gap-1 text-gray-600"><Target className="w-3 h-3 text-orange-600" />Moves</span>
						<span className="flex items-center gap-1 text-gray-600"><Clock className="w-3 h-3 text-orange-600" />Time</span>
					</div>
				</div>
				<div className="flex gap-2 mb-1.5">
					<div className="bg-orange-50 flex-1 text-center py-1.5 rounded-lg">
						<div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{Number(score).toLocaleString()}</div>
					</div>
					<div className="bg-orange-50 flex-1 text-center py-1.5 rounded-lg">
						<div className={`text-lg font-bold ${moves < 5 ? 'text-red-500' : 'text-gray-900'}`}>{moves}</div>
					</div>
					<div className="bg-orange-50 flex-1 text-center py-1.5 rounded-lg">
						<div className="text-lg font-bold text-gray-900">{formatTimeSeconds(Math.floor(elapsedMs / 1000))}</div>
					</div>
				</div>
				<div className="flex gap-2">
					<div className="rounded-lg border p-1.5 flex-1 bg-gray-50 border-orange-200">
						<div className="flex justify-center gap-2 flex-nowrap overflow-x-auto">
							{(goals || []).map((g, idx) => (
								<div key={idx} className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg border ${g.remaining === 0 ? 'bg-emerald-100 border-emerald-400' : 'bg-white border-orange-300'}`}>
									<span className="text-base leading-none">{g.emoji}</span>
									<div className={`text-xs font-bold leading-none ${g.remaining === 0 ? 'text-emerald-700' : 'text-gray-900'}`}>{g.remaining === 0 ? '✓' : g.remaining}</div>
								</div>
							))}
						</div>
					</div>
					<div className="flex flex-col gap-1.5 min-w-[100px]">
						<div className="bg-orange-50 border border-orange-200 px-2 py-1 rounded-lg text-center">
							<div className="text-[10px] uppercase tracking-wide text-gray-600">Level</div>
							<div className="text-sm font-bold text-gray-900">{level}</div>
						</div>
						<button onClick={onNewBoard} className="px-2 py-1 rounded-md border text-xs whitespace-nowrap border-orange-300 text-gray-700 hover:bg-orange-50">New</button>
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
