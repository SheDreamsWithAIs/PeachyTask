'use client';

import Header from '@/components/Header';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) return null;
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-peach-50">
      <Header />
      <div className="max-w-6xl mx-auto p-4">{children}</div>
    </div>
  );
}


