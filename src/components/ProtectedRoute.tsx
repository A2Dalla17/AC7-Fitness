'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

export default function ProtectedRoute({
  children,
  requireRole,
}: {
  children: ReactNode;
  requireRole?: Role;
}) {
  const { supabaseUser, appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!supabaseUser) {
      router.replace('/login');
      return;
    }
    if (supabaseUser && appUser && !appUser.role) {
      router.replace('/onboarding/role');
      return;
    }
    if (requireRole && appUser?.role && appUser.role !== requireRole) {
      router.replace('/home');
    }
  }, [loading, supabaseUser, appUser, requireRole, router]);

  if (loading || !supabaseUser || !appUser?.role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
        <p className="text-sm text-muted">Loading AC7 Fitness...</p>
      </div>
    );
  }

  return <>{children}</>;
}
