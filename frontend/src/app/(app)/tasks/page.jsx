'use client';

import { useEffect, useState } from 'react';
import { getJson } from '@/lib/api';
import CreateTaskModal from '@/components/CreateTaskModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getJson('/tasks')
      .then(setTasks)
      .catch((e) => setError(e.message || 'Failed to load tasks'));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your Tasks</h1>
        <button onClick={() => setOpen(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">New Task</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}
      {tasks.length === 0 ? (
        <div className="text-gray-600">No tasks yet.</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t._id} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">Priority: {t.priority} · Due: {new Date(t.deadline).toLocaleDateString()}</div>
              </div>
              {t.completed && <span className="text-green-700 text-xs">Completed</span>}
            </li>
          ))}
        </ul>
      )}
      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(t) => setTasks((prev) => [t, ...prev])}
      />
    </div>
  );
}


