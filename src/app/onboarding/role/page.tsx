'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';

export default function RoleSelectPage() {
  const { setRole } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const choose = async (role: Role) => {
    setSaving(true);
    await setRole(role);
    router.push('/home');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-bg px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">How will you use AC7 Fitness?</h1>
        <p className="mt-2 text-sm text-muted">You can switch roles later from support.</p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          disabled={saving}
          onClick={() => choose('client')}
          className="rounded-xl2 border border-navy-deep bg-navy px-6 py-5 text-left"
        >
          <p className="font-semibold">I'm a Client</p>
          <p className="text-sm text-muted">Track progress, book coaches, complete missions</p>
        </button>
        <button
          disabled={saving}
          onClick={() => choose('coach')}
          className="rounded-xl2 border border-navy-deep bg-navy px-6 py-5 text-left"
        >
          <p className="font-semibold">I'm a Coach</p>
          <p className="text-sm text-muted">Build your profile, manage bookings, chat with clients</p>
        </button>
      </div>
    </main>
  );
}
