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
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-4">{children}</div>
    </>
  );
}


