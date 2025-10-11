'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full shadow-md border-b bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 border-orange-400/50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: '#fce4d2' }}>
            <span className="text-2xl">🍑</span>
          </div>
          <div className="leading-tight">
            <div className="text-white font-bold">Peachy Task</div>
            <div className="text-[11px] italic text-orange-50/90">Everything's peachy when you get things done.</div>
          </div>
        </Link>
        <nav className="flex items-center gap-4">
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


