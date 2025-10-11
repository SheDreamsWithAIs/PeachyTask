'use client';

import { useEffect, useState } from 'react';
import { getJson } from '@/lib/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson('/tasks')
      .then(setTasks)
      .catch((e) => setError(e.message || 'Failed to load tasks'));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Tasks</h1>
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
    </div>
  );
}


