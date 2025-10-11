'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">PeachyTask</Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.email}</span>
              <button onClick={logout} className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm">Sign in</Link>
              <Link href="/signup" className="text-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}


