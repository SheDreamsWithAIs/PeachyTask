'use client';

import Header from '@/components/Header';
import { useAuth } from '@/components/AuthContext';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user && typeof window !== 'undefined') {
    window.location.href = '/login';
    return null;
  }
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto p-4">{children}</div>
    </>
  );
}


