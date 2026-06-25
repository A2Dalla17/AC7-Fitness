'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';

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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-ink">
        <Ac7BrandWatermark size={40} />
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
