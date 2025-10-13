'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getJson, postJson } from '@/lib/api';
import { patchJson, deleteJson } from '@/lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function LabelsPage() {
  const [labels, setLabels] = useState([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#f97316');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    getJson('/labels')
      .then((data) => setLabels(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message || 'Failed to load labels'))
      .finally(() => setLoading(false));
  }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      const created = await postJson('/labels', { name, color: color || undefined });
      setLabels((prev) => [created, ...prev]);
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
      const updated = await patchJson(`/labels/${editing._id}`, payload);
      setLabels((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      setEditing(null);
    } catch (e) {
      setError(e.message || 'Failed to update label');
    }
  };

  const onConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteJson(`/labels/${deletingId}`);
      setLabels((prev) => prev.filter((l) => l._id !== deletingId));
      setDeletingId(null);
    } catch (e) {
      setError(e.message || 'Failed to delete label');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Labels</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">Back to Dashboard</Link>
      </div>

      {error && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}

      {/* Create label */}
      <form onSubmit={onCreate} className="rounded-xl shadow-sm border p-5 bg-white/80 border-orange-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium mb-1">Label name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. Work" className="w-full px-4 py-2 rounded-lg border bg-white border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-10 w-16 border rounded"/>
          </div>
          <div>
            <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 flex items-center gap-2">
              <Plus className="w-4 h-4"/> Create Label
            </button>
          </div>
        </div>
      </form>

      {/* List labels */}
      <div className="rounded-xl shadow-sm border p-5 bg-white/80 border-orange-200/50 backdrop-blur-sm">
        {loading ? (
          <div className="text-sm text-gray-600">Loading labels…</div>
        ) : labels.length === 0 ? (
          <div className="text-sm text-gray-600">No labels yet. Create your first label.</div>
        ) : (
          <ul className="divide-y">
            {labels.map((l) => (
              <li key={l._id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color || '#f97316' }} />
                  <span className="font-medium text-gray-800">{l.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(l)} className="p-2 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50" aria-label="Edit label"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => setDeletingId(l._id)} className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete label"><Trash2 className="w-4 h-4"/></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <EditLabelModal
          label={editing}
          onClose={() => setEditing(null)}
          onSave={onSaveEdit}
        />
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-orange-200/60">
            <div className="px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <h2 className="text-base font-semibold">Delete label</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-700">Are you sure you want to delete this label? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeletingId(null)} className="px-4 py-2 border border-orange-300 text-gray-700 hover:bg-orange-50 rounded-lg">Cancel</button>
                <button onClick={onConfirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditLabelModal({ label, onClose, onSave }) {
  const [name, setName] = useState(label.name || '');
  const [color, setColor] = useState(label.color || '#f97316');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSubmitting(true);
    try {
      await onSave({ name, color: color || undefined });
    } catch (e) {
      setError(e.message || 'Failed to update label');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-orange-200/60">
        <div className="flex items-center justify-between px-4 py-3 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <h2 className="text-lg font-semibold">Edit Label</h2>
          <button onClick={onClose} className="text-white/90 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          {error && <div className="text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}
          <div>
            <label className="block text-sm font-medium mb-1">Label name <span className="text-red-500">*</span></label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border bg-white border-orange-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} className="h-10 w-16 border rounded"/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded disabled:opacity-60">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}


