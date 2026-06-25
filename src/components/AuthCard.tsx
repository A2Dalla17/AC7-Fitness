'use client';

import { ReactNode } from 'react';
import AC7Logo from '@/components/ac7/AC7Logo';

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5">
          <AC7Logo size={64} />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-surface p-6">{children}</div>
    </main>
  );
}
