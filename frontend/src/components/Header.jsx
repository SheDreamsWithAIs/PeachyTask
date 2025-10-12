'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import { LogOut, User, Moon, Sun, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <header className="w-full shadow-md border-b bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 border-orange-400/50 dark:from-amber-900 dark:via-orange-950 dark:to-amber-900 dark:border-amber-800/50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg dark:bg-gradient-to-br dark:from-amber-800 dark:to-orange-900" style={{ backgroundColor: '#fce4d2' }}>
            <span className="text-2xl">🍑</span>
          </div>
          <div className="leading-tight">
            <div className="text-white font-bold">Peachy Task</div>
            <div className="text-[11px] italic text-orange-50/90 dark:text-amber-200/80">Everything's peachy when you get things done.</div>
          </div>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg ${pathname === '/dashboard' ? 'text-white/50 cursor-default pointer-events-none' : 'text-white/95 hover:bg-orange-600/40'}`}
            aria-disabled={pathname === '/dashboard'}
            aria-label="Home"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
          <button onClick={toggleTheme} className="p-2 rounded-lg text-white hover:bg-orange-600/40" aria-label="Toggle theme" title={mounted ? (dark ? 'Switch to Light' : 'Switch to Dark') : 'Toggle theme'}>
            {mounted ? (dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />) : <span className="w-5 h-5 inline-block" />}
          </button>
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-white/95">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:bg-orange-600/40">
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-white/95 text-sm">Sign in</Link>
              <Link href="/signup" className="text-white/95 text-sm">Sign up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}


