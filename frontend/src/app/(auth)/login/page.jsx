'use client';

import { useState } from 'react';
import { postJson } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await postJson('/auth/login', { email, password });
      // After login, go to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50 dark:from-stone-900 dark:via-amber-950 dark:to-stone-900">
      <div className="w-full max-w-md rounded-xl shadow-lg border bg-white border-orange-200/50 backdrop-blur-sm dark:bg-stone-900/80 dark:border-amber-900/30">
        <div className="px-6 py-4 rounded-t-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white">
          <h1 className="text-xl font-semibold">Sign in</h1>
        </div>
        <div className="p-6">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-amber-200">Email</label>
            <input
              type="email"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-orange-500 dark:bg-stone-800/60 dark:border-amber-900/40 dark:text-amber-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-amber-200">Password</label>
            <input
              type="password"
              className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-orange-500 dark:bg-stone-800/60 dark:border-amber-900/40 dark:text-amber-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-2 rounded disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 dark:text-amber-300/80">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-orange-600 hover:underline">Sign up</Link>
        </p>
        </div>
      </div>
    </div>
  );
}


