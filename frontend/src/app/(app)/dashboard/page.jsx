'use client';

import { useEffect, useMemo, useState } from 'react';
import { getJson, postJson } from '@/lib/api';
import { Calendar, Check, Flag, Plus, Tag, X, Trash2, Edit2 } from 'lucide-react';

function PriorityBadge({ priority }) {
	const map = {
		high: 'bg-red-100 text-red-800 border-red-200',
		medium: 'bg-amber-100 text-amber-800 border-amber-200',
		low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
	};
	const cls = map[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
	return <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{priority}</span>;
}

function EditTaskForm({ task, labels, onCancel, onSaved }) {
	const [title, setTitle] = useState(task.title || '');
	const [description, setDescription] = useState(task.description || '');
	const [priority, setPriority] = useState(task.priority || 'medium');
	const [deadline, setDeadline] = useState(task.deadline ? new Date(task.deadline).toISOString().slice(0,10) : '');
	const [selectedLabelIds, setSelectedLabelIds] = useState(Array.isArray(task.label_ids) ? task.label_ids : []);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});

	const toggleLabel = (labelId) => {
		setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]));
	};

	const validate = () => {
		const errs = {};
		if (!title.trim()) errs.title = 'Title is required';
		if (!deadline) errs.deadline = 'Deadline is required';
		if (!['low', 'medium', 'high'].includes(priority)) errs.priority = 'Invalid priority';
		return errs;
	};

	const submit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		setFieldErrors({});
		const errs = validate();
		if (Object.keys(errs).length) {
			setFieldErrors(errs);
			setSubmitting(false);
			return;
		}
		try {
			const payload = {
				title,
				description: description || undefined,
				priority,
				deadline,
				label_ids: selectedLabelIds,
			};
			const { patchJson } = await import('@/lib/api');
			const updated = await patchJson(`/tasks/${task._id}`, payload);
			onSaved(updated);
		} catch (err) {
			if (Array.isArray(err.data?.detail)) {
				const fe = {};
				for (const d of err.data.detail) {
					const last = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : d.loc;
					if (typeof last === 'string') fe[last] = d.msg;
				}
				setFieldErrors(fe);
			}
			setError(err.message || 'Failed to update task');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={submit} className="p-4 space-y-4">
			{error && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}
			<div>
				<label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
				<input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.title ? 'border-red-300' : 'border-orange-200'}`}/>
				{fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Description</label>
				<textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border bg-white border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1">Priority <span className="text-red-500">*</span></label>
					<select value={priority} onChange={(e)=>setPriority(e.target.value)} className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.priority ? 'border-red-300' : 'border-orange-200'}`}>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
					{fieldErrors.priority && <p className="mt-1 text-xs text-red-600">{fieldErrors.priority}</p>}
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">Deadline <span className="text-red-500">*</span></label>
					<input value={deadline} onChange={(e)=>setDeadline(e.target.value)} type="date" className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.deadline ? 'border-red-300' : 'border-orange-200'}`}/>
					{fieldErrors.deadline && <p className="mt-1 text-xs text-red-600">{fieldErrors.deadline}</p>}
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium mb-2">Labels</label>
				<div className="flex flex-wrap gap-2">
					{labels.map((l) => {
						const selected = selectedLabelIds.includes(l._id);
						return (
							<button key={l._id} type="button" onClick={()=>toggleLabel(l._id)} className={`px-3 py-1 rounded-full text-sm border-2 transition ${selected ? 'border-orange-500 shadow' : 'border-orange-300 hover:border-orange-500 text-gray-700'}`} style={selected ? { backgroundColor: (l.color || '#f97316') + '20', borderColor: l.color || '#f97316', color: l.color || '#f97316' } : {}}>
								<span className="flex items-center gap-1">{selected && <Check className="w-3 h-3"/>}{l.name}</span>
							</button>
						);
					})}
				</div>
			</div>
			<div className="flex justify-end gap-2 pt-2">
				<button type="button" onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
				<button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-60">Save Changes</button>
			</div>
		</form>
	);
}

export default function DashboardPage() {
	const [tasks, setTasks] = useState([]);
	const [labels, setLabels] = useState([]);
	const [filter, setFilter] = useState('all');
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [showNew, setShowNew] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editingTask, setEditingTask] = useState(null);

	// New task form state
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [priority, setPriority] = useState('medium');
	const [deadline, setDeadline] = useState('');
	const [selectedLabelIds, setSelectedLabelIds] = useState([]);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		setLoading(true);
		Promise.all([
			getJson('/tasks').then(setTasks),
			getJson('/labels').then(setLabels).catch(() => {}),
		])
			.catch((e) => setError(e.message || 'Failed to load tasks'))
			.finally(() => setLoading(false));
	}, []);

	const filteredTasks = useMemo(() => {
		if (filter === 'active') return tasks.filter((t) => !t.completed);
		if (filter === 'completed') return tasks.filter((t) => t.completed);
		return tasks;
	}, [tasks, filter]);

	const toggleLabel = (labelId) => {
		setSelectedLabelIds((prev) => (prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]));
	};

	const validate = () => {
		const errs = {};
		if (!title.trim()) errs.title = 'Title is required';
		if (!deadline) errs.deadline = 'Deadline is required';
		if (!['low', 'medium', 'high'].includes(priority)) errs.priority = 'Invalid priority';
		return errs;
	};

	const submitNewTask = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError('');
		setFieldErrors({});
		const errs = validate();
		if (Object.keys(errs).length) {
			setFieldErrors(errs);
			setSubmitting(false);
			return;
		}
		try {
			const payload = {
				title,
				description: description || undefined,
				priority,
				deadline,
				completed: false,
				label_ids: selectedLabelIds,
			};
			const created = await postJson('/tasks', payload);
			setTasks((prev) => [created, ...prev]);
			// reset
			setTitle('');
			setDescription('');
			setPriority('medium');
			setDeadline('');
			setSelectedLabelIds([]);
			setShowNew(false);
		} catch (err) {
			// If FastAPI validation errors are present, try to map some to fields
			if (Array.isArray(err.data?.detail)) {
				const fe = {};
				for (const d of err.data.detail) {
					const last = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : d.loc;
					if (typeof last === 'string') fe[last] = d.msg;
				}
				setFieldErrors(fe);
			}
			setError(err.message || 'Failed to create task');
		} finally {
			setSubmitting(false);
		}
	};

	const [confirmDeleteId, setConfirmDeleteId] = useState(null);

	const handleConfirmDelete = async () => {
		if (!confirmDeleteId) return;
		try {
			await (await import('@/lib/api')).deleteJson(`/tasks/${confirmDeleteId}`);
			setTasks((prev) => prev.filter((t) => t._id !== confirmDeleteId));
			setConfirmDeleteId(null);
		} catch (e) {
			setError(e.message || 'Failed to delete task');
		}
	};

	const handleToggleCompleted = async (task) => {
		try {
			const updated = await (await import('@/lib/api')).patchJson(`/tasks/${task._id}`, { completed: !task.completed });
			setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
		} catch (e) {
			setError(e.message || 'Failed to update task');
		}
	};

	return (
		<>
		<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
			{/* Sidebar: Filters and Labels */}
			<aside className="lg:col-span-1">
				<div className="rounded-xl shadow-sm border p-4 bg-white/80 border-orange-200/50 backdrop-blur-sm">
					<h2 className="text-lg font-semibold mb-4">Filters</h2>
					<div className="space-y-2 mb-6">
						<button onClick={() => setFilter('all')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'all' ? 'bg-orange-100 text-orange-700 font-medium' : 'text-gray-700 hover:bg-orange-50'}`}>All Tasks ({tasks.length})</button>
						<button onClick={() => setFilter('active')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'active' ? 'bg-orange-100 text-orange-700 font-medium' : 'text-gray-700 hover:bg-orange-50'}`}>Active ({tasks.filter((t)=>!t.completed).length})</button>
						<button onClick={() => setFilter('completed')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'completed' ? 'bg-orange-100 text-orange-700 font-medium' : 'text-gray-700 hover:bg-orange-50'}`}>Completed ({tasks.filter((t)=>t.completed).length})</button>
					</div>
					<div className="border-t border-orange-200 pt-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold">Labels</h3>
						</div>
						<div className="space-y-2">
							{labels.map((l) => (
								<div key={l._id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50">
									<div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color || '#f97316' }} />
									<span className="text-sm text-gray-700">{l.name}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<section className="lg:col-span-3">
				<div className="mb-6">
					<button onClick={() => setShowNew((v)=>!v)} className="w-full px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
						<Plus className="w-5 h-5"/>
						New Task
					</button>
				</div>
				{error && <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}

				{/* Inline New Task Form */}
				{showNew && (
					<form onSubmit={submitNewTask} className="rounded-xl shadow-sm border p-6 mb-6 bg-white/80 border-orange-200/50 backdrop-blur-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold">Create New Task</h3>
							<button type="button" onClick={() => setShowNew(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5"/></button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
								<input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder="Enter task title..." className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.title ? 'border-red-300' : 'border-orange-200'}`}/>
								{fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Description</label>
								<textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} placeholder="Add details about this task..." className="w-full px-4 py-2 rounded-lg border bg-white border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1">Priority <span className="text-red-500">*</span></label>
									<select value={priority} onChange={(e)=>setPriority(e.target.value)} className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.priority ? 'border-red-300' : 'border-orange-200'}`}>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
									</select>
									{fieldErrors.priority && <p className="mt-1 text-xs text-red-600">{fieldErrors.priority}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Deadline <span className="text-red-500">*</span></label>
									<input value={deadline} onChange={(e)=>setDeadline(e.target.value)} type="date" className={`w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.deadline ? 'border-red-300' : 'border-orange-200'}`}/>
									{fieldErrors.deadline && <p className="mt-1 text-xs text-red-600">{fieldErrors.deadline}</p>}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2">Labels</label>
								<div className="flex flex-wrap gap-2">
									{labels.map((l) => {
										const selected = selectedLabelIds.includes(l._id);
										return (
											<button key={l._id} type="button" onClick={()=>toggleLabel(l._id)} className={`px-3 py-1 rounded-full text-sm border-2 transition ${selected ? 'border-orange-500 shadow' : 'border-orange-300 hover:border-orange-500 text-gray-700'}`} style={selected ? { backgroundColor: (l.color || '#f97316') + '20', borderColor: l.color || '#f97316', color: l.color || '#f97316' } : {}}>
												<span className="flex items-center gap-1">{selected && <Check className="w-3 h-3"/>}{l.name}</span>
											</button>
										);
									})}
								</div>
							</div>
							<div className="flex gap-3 pt-2">
								<button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium disabled:opacity-60">
									<span className="flex items-center justify-center gap-2"><Check className="w-4 h-4"/>Create Task</span>
								</button>
								<button type="button" onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-orange-300 text-gray-700 hover:bg-orange-50">Cancel</button>
							</div>
						</div>
					</form>
				)}

				{/* Task list or states */}
				{loading ? (
					<div className="rounded-xl shadow-sm border p-12 text-center bg-white/80 border-orange-200/50 backdrop-blur-sm">
						<p className="text-sm text-gray-600">Loading tasks…</p>
					</div>
				) : filteredTasks.length === 0 ? (
					<div className="rounded-xl shadow-sm border p-12 text-center bg-white/80 border-orange-200/50 backdrop-blur-sm">
						<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-100">
							<span className="text-4xl">🍑</span>
						</div>
						<h3 className="text-lg font-semibold mb-2">No tasks found</h3>
						<p className="text-sm text-gray-600">{filter === 'completed' ? "You haven't completed any tasks yet. Keep going!" : 'Create a new task and make everything peachy! 🍑'}</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredTasks.map((t) => (
							<div key={t._id} className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition bg-white/80 border-orange-200/50 backdrop-blur-sm ${t.completed ? 'opacity-60' : ''}`}>
								<div className="flex items-start gap-4">
									<div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${t.completed ? 'bg-orange-500 border-orange-500' : 'border-orange-300'}`}>
										<button onClick={() => handleToggleCompleted(t)} aria-label="Toggle complete">{t.completed && <Check className="w-4 h-4 text-white"/>}</button>
									</div>
									<div className="flex-1">
										<h3 className={`text-lg font-semibold mb-1 ${t.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>{t.title}</h3>
										{t.description && <p className="text-sm mb-3 text-gray-600">{t.description}</p>}
										<div className="flex flex-wrap items-center gap-3">
											<PriorityBadge priority={t.priority} />
											<span className="inline-flex items-center gap-1 text-xs text-gray-600"><Calendar className="w-3 h-3"/>{new Date(t.deadline).toLocaleDateString()}</span>
											{Array.isArray(t.label_ids) && t.label_ids.map((lid) => {
												const l = labels.find((x)=>x._id===lid);
												if (!l) return null;
												return (
													<span key={lid} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: (l.color||'#6b7280')+'20', color: l.color||'#6b7280' }}>
														<Tag className="w-3 h-3"/>{l.name}
													</span>
												);
											})}
										</div>
									</div>
									<div className="flex gap-2">
										<button onClick={() => setEditingTask(t)} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50" aria-label="Edit task"><Edit2 className="w-4 h-4"/></button>
										<button onClick={() => setConfirmDeleteId(t._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete task"><Trash2 className="w-4 h-4"/></button>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
		{/* Delete confirmation modal */}
		{confirmDeleteId && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
				<div className="w-full max-w-sm bg-white rounded shadow">
					<div className="px-4 py-3 border-b">
						<h2 className="text-base font-semibold">Delete task</h2>
					</div>
					<div className="p-4 space-y-3">
						<p className="text-sm text-gray-700">Are you sure you want to delete this task? This action cannot be undone.</p>
						<div className="flex justify-end gap-2">
							<button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border rounded">Cancel</button>
							<button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Delete</button>
						</div>
					</div>
				</div>
			</div>
		)}
		{/* Edit modal */}
		{editingTask && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
				<div className="w-full max-w-lg bg-white rounded shadow">
					<div className="flex items-center justify-between px-4 py-3 border-b">
						<h2 className="text-lg font-semibold">Edit Task</h2>
						<button onClick={() => setEditingTask(null)} className="text-gray-500 hover:text-gray-700" aria-label="Close"><X className="w-5 h-5"/></button>
					</div>
					<EditTaskForm task={editingTask} labels={labels} onCancel={() => setEditingTask(null)} onSaved={(updated)=>{
						setTasks((prev)=>prev.map((t)=>t._id===updated._id?updated:t));
						setEditingTask(null);
					}}/>
				</div>
			</div>
		)}
		<footer className="mt-10 border-t border-orange-200/60">
			<div className="max-w-6xl mx-auto px-2 sm:px-0 py-6 text-center text-xs text-gray-600">
				<span>🍑 Peachy Task — Make everything peachy.</span>
			</div>
		</footer>
		</>
	);
}


