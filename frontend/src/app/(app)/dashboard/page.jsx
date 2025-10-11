'use client';

import { useEffect, useMemo, useState } from 'react';
import { getJson, postJson } from '@/lib/api';
import { Calendar, Check, Flag, Plus, Tag, X, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';

function PriorityBadge({ priority }) {
	const map = {
		high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
		medium: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800',
		low: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800',
	};
	const cls = map[priority] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-stone-800/60 dark:text-amber-200 dark:border-stone-700';
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
				<label className="block text-sm font-medium mb-1 dark:text-amber-100">Title <span className="text-red-500">*</span></label>
				<input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.title ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}/>
				{fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
			</div>
			<div>
				<label className="block text-sm font-medium mb-1 dark:text-amber-100">Description</label>
				<textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 border-orange-200 dark:border-amber-900/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium mb-1 dark:text-amber-100">Priority <span className="text-red-500">*</span></label>
					<select value={priority} onChange={(e)=>setPriority(e.target.value)} className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.priority ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
					{fieldErrors.priority && <p className="mt-1 text-xs text-red-600">{fieldErrors.priority}</p>}
				</div>
				<div>
					<label className="block text-sm font-medium mb-1 dark:text-amber-100">Deadline <span className="text-red-500">*</span></label>
					<input value={deadline} onChange={(e)=>setDeadline(e.target.value)} type="date" className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.deadline ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}/>
					{fieldErrors.deadline && <p className="mt-1 text-xs text-red-600">{fieldErrors.deadline}</p>}
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium mb-2 dark:text-amber-100">Labels</label>
				<div className="flex flex-wrap gap-2">
					{labels.map((l) => {
						const selected = selectedLabelIds.includes(l._id);
						return (
							<button key={l._id} type="button" onClick={()=>toggleLabel(l._id)} className={`px-3 py-1 rounded-full text-sm border-2 transition ${selected ? 'border-orange-500 shadow' : 'border-orange-300 hover:border-orange-500 text-gray-700 dark:text-amber-100'}`} style={selected ? { backgroundColor: (l.color || '#f97316') + '20', borderColor: l.color || '#f97316', color: l.color || '#f97316' } : {}}>
								<span className="flex items-center gap-1">{selected && <Check className="w-3 h-3"/>}{l.name}</span>
							</button>
						);
					})}
				</div>
			</div>
			<div className="flex justify-end gap-2 pt-2">
				<button type="button" onClick={onCancel} className="px-4 py-2 border rounded dark:text-amber-100 dark:border-amber-900/40 dark:hover:bg-amber-900/40">Cancel</button>
				<button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-amber-800 dark:hover:bg-amber-700 text-white rounded disabled:opacity-60">Save Changes</button>
			</div>
		</form>
	);
}

function LabelsManagerModal({ labels: initialLabels, onClose, onCreated, onUpdated, onDeleted }) {
	const [labels, setLabels] = useState(initialLabels || []);
	const [name, setName] = useState('');
	const [color, setColor] = useState('#f97316');
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deletingId, setDeletingId] = useState(null);

	useEffect(() => {
		setLabels(initialLabels || []);
	}, [initialLabels]);

	const onCreate = async (e) => {
		e.preventDefault();
		setError('');
		if (!name.trim()) {
			setError('Name is required');
			return;
		}
		setSubmitting(true);
		try {
			const { postJson } = await import('@/lib/api');
			const created = await postJson('/labels', { name, color: color || undefined });
			onCreated?.(created);
			setName('');
		} catch (e) {
			setError(e.message || 'Failed to create label');
		} finally {
			setSubmitting(false);
		}
	};

	const onSaveEdit = async (payload) => {
		if (!editing) return;
		try {
			const { patchJson } = await import('@/lib/api');
			const updated = await patchJson(`/labels/${editing._id}`, payload);
			onUpdated?.(updated);
			setEditing(null);
		} catch (e) {
			setError(e.message || 'Failed to update label');
		}
	};

	const onConfirmDelete = async () => {
		if (!deletingId) return;
		try {
			const { deleteJson } = await import('@/lib/api');
			await deleteJson(`/labels/${deletingId}`);
			onDeleted?.(deletingId);
			setDeletingId(null);
		} catch (e) {
			setError(e.message || 'Failed to delete label');
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
			<div className="w-full max-w-xl bg-white dark:bg-amber-950 rounded-xl shadow-lg border border-orange-200/60 dark:border-amber-900/40">
				<div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-amber-800 dark:to-orange-900 text-white">
					<h2 className="text-lg font-semibold">Manage Labels</h2>
					<button onClick={onClose} className="text-white/90 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></button>
				</div>
					<div className="p-5 space-y-5">
						{error && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}
						<form onSubmit={onCreate} className="rounded-xl shadow-sm border p-4 bg-white/80 dark:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/40 backdrop-blur-sm">
						<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
							<div className="flex-1 w-full">
									<label className="block text-sm font-medium mb-1 dark:text-amber-100">Label name <span className="text-red-500">*</span></label>
									<input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Work" className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 border-orange-200 dark:border-amber-900/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
							</div>
							<div>
									<label className="block text-sm font-medium mb-1 dark:text-amber-100">Color</label>
									<input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-10 w-16 border rounded dark:bg-stone-900/60 dark:border-amber-900/40"/>
							</div>
							<div>
								<button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 flex items-center gap-2">
									<Plus className="w-4 h-4"/> Create Label
								</button>
							</div>
						</div>
					</form>

						<div className="rounded-xl shadow-sm border p-4 bg-white/80 dark:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/40 backdrop-blur-sm">
						{labels.length === 0 ? (
								<div className="text-sm text-gray-600 dark:text-amber-200/90">No labels yet.</div>
						) : (
							<ul className="divide-y">
								{labels.map((l) => (
										<li key={l._id} className="py-3 flex items-center justify-between">
											<div className="flex items-center gap-3">
												<span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color || '#f97316' }} />
												<span className="font-medium text-gray-800 dark:text-amber-100">{l.name}</span>
											</div>
										<div className="flex items-center gap-2">
												<button onClick={() => setEditing(l)} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-900/40" aria-label="Edit label"><Edit2 className="w-4 h-4"/></button>
												<button onClick={() => setDeletingId(l._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:text-amber-300 dark:hover:text-red-400 dark:hover:bg-red-900/30" aria-label="Delete label"><Trash2 className="w-4 h-4"/></button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				</div>

				{/* Edit label modal nested */}
				{editing && (
					<div className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent p-4">
						<div className="w-full max-w-md bg-white dark:bg-amber-950 rounded-xl shadow-lg border border-orange-200/60 dark:border-amber-900/40">
							<div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-amber-800 dark:to-orange-900 text-white">
								<h2 className="text-lg font-semibold">Edit Label</h2>
								<button onClick={()=>setEditing(null)} className="text-white/90 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></button>
							</div>
							<form onSubmit={(e)=>{e.preventDefault(); onSaveEdit({ name: editing.name, color: editing.color });}} className="p-4 space-y-4">
								<div>
									<label className="block text-sm font-medium mb-1">Label name</label>
									<input value={editing.name} onChange={(e)=>setEditing((prev)=>({...prev, name: e.target.value}))} className="w-full px-4 py-2 rounded-lg border bg-white border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">Color</label>
									<input type="color" value={editing.color || '#f97316'} onChange={(e)=>setEditing((prev)=>({...prev, color: e.target.value}))} className="h-10 w-16 border rounded"/>
								</div>
								<div className="flex justify-end gap-2 pt-2">
									<button type="button" onClick={()=>setEditing(null)} className="px-4 py-2 border rounded">Cancel</button>
									<button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-amber-800 dark:hover:bg-amber-700 text-white rounded">Save Changes</button>
								</div>
							</form>
						</div>
					</div>
				)}

				{/* Delete confirm nested */}
				{deletingId && (
					<div className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent p-4">
						<div className="w-full max-w-sm bg-white dark:bg-amber-950 rounded-xl shadow-lg border border-orange-200/60 dark:border-amber-900/40">
							<div className="px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-amber-800 dark:to-orange-900 text-white">
								<h2 className="text-base font-semibold">Delete label</h2>
							</div>
							<div className="p-5 space-y-4">
								<p className="text-sm text-gray-700">Are you sure you want to delete this label?</p>
								<div className="flex justify-end gap-2">
									<button onClick={()=>setDeletingId(null)} className="px-4 py-2 border border-orange-300 text-gray-700 hover:bg-orange-50 rounded-lg">Cancel</button>
									<button onClick={onConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function DashboardPage() {
	const [tasks, setTasks] = useState([]);
	const [labels, setLabels] = useState([]);
	const [filter, setFilter] = useState('all');
	const [activeLabelIds, setActiveLabelIds] = useState([]);
	const [error, setError] = useState('');
	const [fieldErrors, setFieldErrors] = useState({});
	const [showNew, setShowNew] = useState(false);
	const [loading, setLoading] = useState(true);
	const [showLabelsManager, setShowLabelsManager] = useState(false);
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
		let out = tasks;
		if (filter === 'active') out = out.filter((t) => !t.completed);
		if (filter === 'completed') out = out.filter((t) => t.completed);
		if (activeLabelIds.length > 0) {
			out = out.filter((t) => Array.isArray(t.label_ids) && t.label_ids.some((id)=>activeLabelIds.includes(id)));
		}
		return out;
	}, [tasks, filter, activeLabelIds]);

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
				<div className="rounded-xl shadow-sm border p-4 bg-white/80 dark:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/40 backdrop-blur-sm">
					<h2 className="text-lg font-semibold mb-4 dark:text-amber-100">Filters</h2>
					<div className="space-y-2 mb-6">
						<button onClick={() => setFilter('all')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'all' ? 'bg-orange-100 text-orange-700 font-medium dark:bg-amber-800/50 dark:text-amber-100' : 'text-gray-700 hover:bg-orange-50 dark:text-amber-200 dark:hover:bg-amber-900/40'}`}>All Tasks ({tasks.length})</button>
						<button onClick={() => setFilter('active')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'active' ? 'bg-orange-100 text-orange-700 font-medium dark:bg-amber-800/50 dark:text-amber-100' : 'text-gray-700 hover:bg-orange-50 dark:text-amber-200 dark:hover:bg-amber-900/40'}`}>Active ({tasks.filter((t)=>!t.completed).length})</button>
						<button onClick={() => setFilter('completed')} className={`w-full text-left px-3 py-2 rounded-lg ${filter === 'completed' ? 'bg-orange-100 text-orange-700 font-medium dark:bg-amber-800/50 dark:text-amber-100' : 'text-gray-700 hover:bg-orange-50 dark:text-amber-200 dark:hover:bg-amber-900/40'}`}>Completed ({tasks.filter((t)=>t.completed).length})</button>
					</div>
					<div className="border-t border-orange-200 pt-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-semibold dark:text-amber-100">Labels</h3>
							<button onClick={() => setShowLabelsManager(true)} className="text-orange-600 hover:text-orange-700 dark:text-amber-200 dark:hover:text-amber-100 flex items-center gap-1 text-sm" title="Manage labels">
								<Plus className="w-4 h-4" />
								Manage
							</button>
						</div>
						<div className="space-y-2">
							{labels.map((l) => {
								const selected = activeLabelIds.includes(l._id);
								return (
									<button key={l._id} type="button" onClick={()=>setActiveLabelIds((prev)=>selected ? prev.filter((id)=>id!==l._id) : [...prev, l._id])} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${selected ? 'bg-orange-100 text-orange-700 font-medium dark:bg-amber-800/50 dark:text-amber-100' : 'hover:bg-orange-50 dark:text-amber-200 dark:hover:bg-amber-900/40'}`}>
										<span className="flex items-center gap-2">
											<span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color || '#f97316' }} />
											<span className="text-sm">{l.name}</span>
										</span>
										{selected && <Check className="w-4 h-4"/>}
									</button>
								);
							})}
							{labels.length > 0 && activeLabelIds.length > 0 && (
								<button type="button" onClick={(e)=>{e.preventDefault(); e.stopPropagation(); setActiveLabelIds([]);}} className="mt-2 text-xs text-gray-600 hover:text-gray-800 dark:text-amber-300/80 dark:hover:text-amber-200 underline">Clear label filter</button>
							)}
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<section className="lg:col-span-3">
				<div className="mb-6">
					<button onClick={() => setShowNew((v)=>!v)} className="w-full px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 dark:from-amber-700 dark:to-orange-800 dark:hover:from-amber-600 dark:hover:to-orange-700 text-white">
						<Plus className="w-5 h-5"/>
						New Task
					</button>
				</div>
				{error && <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}

				{/* Inline New Task Form */}
				{showNew && (
					<form onSubmit={submitNewTask} className="rounded-xl shadow-sm border p-6 mb-6 bg-white/80 dark:bg-amber-950/70 border-orange-200/50 dark:border-amber-900/40 backdrop-blur-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold dark:text-amber-100">Create New Task</h3>
							<button type="button" onClick={() => setShowNew(false)} className="text-gray-500 hover:text-gray-700 dark:text-amber-300 dark:hover:text-amber-100"><X className="w-5 h-5"/></button>
						</div>
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-amber-100">Title <span className="text-red-500">*</span></label>
								<input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder="Enter task title..." className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.title ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}/>
								{fieldErrors.title && <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-amber-100">Description</label>
								<textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} placeholder="Add details about this task..." className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 border-orange-200 dark:border-amber-900/40 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium mb-1 dark:text-amber-100">Priority <span className="text-red-500">*</span></label>
									<select value={priority} onChange={(e)=>setPriority(e.target.value)} className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.priority ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}>
										<option value="low">Low</option>
										<option value="medium">Medium</option>
										<option value="high">High</option>
									</select>
									{fieldErrors.priority && <p className="mt-1 text-xs text-red-600">{fieldErrors.priority}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium mb-1 dark:text-amber-100">Deadline <span className="text-red-500">*</span></label>
									<input value={deadline} onChange={(e)=>setDeadline(e.target.value)} type="date" className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-stone-900/60 dark:text-amber-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${fieldErrors.deadline ? 'border-red-300' : 'border-orange-200 dark:border-amber-900/40'}`}/>
									{fieldErrors.deadline && <p className="mt-1 text-xs text-red-600">{fieldErrors.deadline}</p>}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium mb-2 dark:text-amber-100">Labels</label>
								<div className="flex flex-wrap gap-2">
									{labels.map((l) => {
										const selected = selectedLabelIds.includes(l._id);
										return (
										<button key={l._id} type="button" onClick={()=>toggleLabel(l._id)} className={`px-3 py-1 rounded-full text-sm border-2 transition ${selected ? 'border-orange-500 shadow' : 'border-orange-300 hover:border-orange-500 text-gray-700 dark:text-amber-100'}`} style={selected ? { backgroundColor: (l.color || '#f97316') + '20', borderColor: l.color || '#f97316', color: l.color || '#f97316' } : {}}>
												<span className="flex items-center gap-1">{selected && <Check className="w-3 h-3"/>}{l.name}</span>
											</button>
										);
									})}
								</div>
							</div>
							<div className="flex gap-3 pt-2">
								<button type="submit" disabled={submitting} className="flex-1 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 dark:bg-amber-800 dark:hover:bg-amber-700 text-white font-medium disabled:opacity-60">
									<span className="flex items-center justify-center gap-2"><Check className="w-4 h-4"/>Create Task</span>
								</button>
								<button type="button" onClick={()=>setShowNew(false)} className="px-4 py-2 rounded-lg border border-orange-300 text-gray-700 hover:bg-orange-50 dark:text-amber-100 dark:border-amber-900/40 dark:hover:bg-amber-900/40">Cancel</button>
							</div>
						</div>
					</form>
				)}

				{/* Task list or states */}
				{loading ? (
					<div className="rounded-xl shadow-sm border p-12 text-center bg-white/80 dark:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/40 backdrop-blur-sm">
						<p className="text-sm text-gray-600 dark:text-amber-200/90">Loading tasks…</p>
					</div>
				) : filteredTasks.length === 0 ? (
						<div className="rounded-xl shadow-sm border p-12 text-center bg-white/80 dark:bg-orange-900/60 border-orange-200/50 dark:border-orange-800/40 backdrop-blur-sm">
							<div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-100 dark:bg-amber-800/60">
							<span className="text-4xl">🍑</span>
						</div>
						<h3 className="text-lg font-semibold mb-2 dark:text-amber-100">No tasks found</h3>
						<p className="text-sm text-gray-600 dark:text-amber-200/90">{filter === 'completed' ? "You haven't completed any tasks yet. Keep going!" : 'Create a new task and make everything peachy! 🍑'}</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredTasks.map((t) => (
							<div key={t._id} className={`rounded-xl shadow-sm border p-5 hover:shadow-lg transition bg-white/90 dark:bg-orange-900/70 border-orange-200/50 dark:border-orange-700/50 backdrop-blur-sm ${t.completed ? 'opacity-60' : ''}`}>
								<div className="flex items-start gap-4">
									<button onClick={() => handleToggleCompleted(t)} aria-label={t.completed ? 'Mark as incomplete' : 'Mark as complete'} className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${t.completed ? 'bg-orange-500 border-orange-500' : 'border-orange-300 hover:border-orange-400'}`}>
										{t.completed && <Check className="w-4 h-4 text-white"/>}
									</button>
									<div className="flex-1">
										<h3 className={`text-lg font-semibold mb-1 ${t.completed ? 'line-through text-gray-500 dark:text-amber-500/60' : 'text-gray-900 dark:text-amber-100'}`}>{t.title}</h3>
										{t.description && <p className="text-sm mb-3 text-gray-600 dark:text-amber-300/80">{t.description}</p>}
										<div className="flex flex-wrap items-center gap-3">
											<PriorityBadge priority={t.priority} />
											<span className="inline-flex items-center gap-1 text-xs text-gray-600 dark:text-amber-300/80"><Calendar className="w-3 h-3"/>{new Date(t.deadline).toLocaleDateString()}</span>
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
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4">
				<div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-orange-200/60 dark:bg-[#1a0e00] dark:border-amber-900/60">
					<div className="px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-amber-800 dark:to-orange-900 text-white">
						<h2 className="text-base font-semibold">Delete task</h2>
					</div>
					<div className="p-5 space-y-4">
						<p className="text-sm text-gray-700 dark:text-amber-200/90">Are you sure you want to delete this task? This action cannot be undone.</p>
						<div className="flex justify-end gap-2">
							<button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border border-orange-300 text-gray-700 hover:bg-orange-50 dark:text-amber-100 dark:border-amber-800/50 dark:hover:bg-amber-900/40 rounded-lg">Cancel</button>
							<button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
						</div>
					</div>
				</div>
			</div>
		)}
		{/* Edit modal */}
		{editingTask && (
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-amber-950 p-4">
				<div className="w-full max-w-lg bg-white rounded-xl shadow-lg border border-orange-200/60 dark:bg-stone-900/80 dark:border-amber-900/40">
					<div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 dark:from-amber-800 dark:to-orange-900 text-white">
						<h2 className="text-lg font-semibold">Edit Task</h2>
						<button onClick={() => setEditingTask(null)} className="text-white/90 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></button>
					</div>
					<EditTaskForm task={editingTask} labels={labels} onCancel={() => setEditingTask(null)} onSaved={(updated)=>{
						setTasks((prev)=>prev.map((t)=>t._id===updated._id?updated:t));
						setEditingTask(null);
					}}/>
				</div>
			</div>
		)}
		{/* Labels Manager Modal */}
		{showLabelsManager && (
			<LabelsManagerModal
				labels={labels}
				onClose={() => setShowLabelsManager(false)}
				onCreated={(created)=>setLabels((prev)=>[created, ...prev])}
				onUpdated={(updated)=>setLabels((prev)=>prev.map((l)=>l._id===updated._id?updated:l))}
				onDeleted={(id)=>setLabels((prev)=>prev.filter((l)=>l._id!==id))}
			/>
		)}
		<footer className="mt-10 border-t border-orange-200/60 dark:border-amber-900/40">
			<div className="max-w-6xl mx-auto px-2 sm:px-0 py-6 text-center text-xs text-gray-600 dark:text-amber-300/80">
				<span>🍑 Peachy Task — Make everything peachy.</span>
			</div>
		</footer>
		</>
	);
}


