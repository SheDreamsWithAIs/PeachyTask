'use client';

import { useEffect, useState } from 'react';
import { postJson } from '@/lib/api';
import Link from 'next/link';
import { Mail, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await postJson('/auth/signup', { email, password });
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50 dark:from-stone-900 dark:via-amber-950 dark:to-stone-900">
      <button onClick={toggleTheme} className="fixed top-6 right-6 p-3 rounded-lg transition shadow-lg bg-white text-orange-600 hover:bg-orange-50 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900" aria-label="Toggle theme" title={mounted ? (dark ? 'Switch to Light' : 'Switch to Dark') : 'Toggle theme'}>
        {mounted ? (dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <span className="w-5 h-5 inline-block" />}
      </button>
      <div className="w-full max-w-2xl mx-auto px-6 py-8">
        <div className="rounded-2xl shadow-2xl border-2 p-10 bg-white/90 border-orange-200/50 backdrop-blur-sm dark:bg-stone-900/90 dark:border-amber-900/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl" style={{ backgroundColor: '#fce4d2' }}>
                <span className="text-5xl">🍑</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-amber-400">Join Peachy Task</h1>
            <p className="text-sm italic text-orange-600/70 dark:text-amber-400/70">Everything's peachy when you get things done.</p>
          </div>
          <div className="mb-6 p-4 rounded-xl border-2 bg-orange-50 border-orange-200 dark:bg-amber-900/20 dark:border-amber-700/50">
            <div className="flex items-start gap-3">
              <span className="text-orange-600 dark:text-amber-400">✨</span>
              <div>
                <h3 className="font-semibold mb-1 text-gray-900 dark:text-amber-200">Start Your Peachy Journey!</h3>
                <p className="text-sm text-gray-700 dark:text-amber-300/70">Create your free account and join the dozens of satisfied users achieving peach flavored enlightenment.</p>
              </div>
            </div>
          </div>
          <div className="pt-1">
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-2">{error}</div>
        )}
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-amber-200">Email</label>
            <div className="mt-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-amber-500/60">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full border-2 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800/60 dark:border-amber-800/50 dark:text-amber-100"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-amber-200">Password</label>
            <div className="mt-1 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-amber-500/60">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full border-2 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-stone-800/60 dark:border-amber-800/50 dark:text-amber-100"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
              className="w-full py-4 rounded-lg transition font-semibold text-lg shadow-md hover:shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center text-gray-300 dark:text-amber-800"><div className="w-full border-t"></div></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 dark:bg-stone-900 dark:text-amber-400/60">Already have an account?</span>
            </div>
          </div>
          <div className="text-center">
            <Link href="/login" className="inline-block w-full py-3 rounded-lg border-2 border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30">Sign In Instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


