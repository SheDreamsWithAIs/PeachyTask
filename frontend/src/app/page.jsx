'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getJson } from '@/lib/api';

export default function Home() {
  const [me, setMe] = useState(null);
  useEffect(() => {
    getJson('/auth/me').then(setMe).catch(() => setMe(null));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-4">
        <h1 className="text-3xl font-semibold">PeachyTask</h1>
        {me ? (
          <div className="text-gray-700">Welcome back, {me.email}.</div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Sign in</Link>
            <Link href="/signup" className="px-4 py-2 border rounded">Create account</Link>
          </div>
        )}
      </div>
    </main>
  );
}


