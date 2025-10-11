'use client';

import { useEffect, useState } from 'react';
import { getJson } from '@/lib/api';
import CreateTaskModal from '@/components/CreateTaskModal';

function PriorityBadge({ priority }) {
  const map = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };
  const cls = map[priority] || 'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`text-xs px-2 py-0.5 rounded border ${cls}`}>{priority}</span>;
}

export default function DashboardPage() {
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
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button onClick={() => setOpen(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">New Task</button>
      </div>
      {error && <div className="mb-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>}
      {tasks.length === 0 ? (
        <div className="text-gray-600">No tasks yet.</div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li key={t._id} className="border rounded p-3 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium flex items-center gap-2">
                  {t.title}
                  <PriorityBadge priority={t.priority} />
                </div>
                <div className="text-xs text-gray-500">Due: {new Date(t.deadline).toLocaleDateString()}</div>
                {t.description && (
                  <div className="text-sm text-gray-700">{t.description}</div>
                )}
              </div>
              {t.completed && <span className="text-green-700 text-xs">Completed</span>}
            </li>
          ))}
        </ul>
      )}
      <CreateTaskModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(task) => setTasks((prev) => [task, ...prev])}
      />
    </div>
  );
}


