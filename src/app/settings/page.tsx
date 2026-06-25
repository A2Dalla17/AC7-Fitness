'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

function SettingsContent() {
  const { appUser, signOut } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Settings" back />
      <main className="flex-1 space-y-6 px-4 py-6 pb-24">
        <div className="rounded-xl2 border border-navy-deep p-4">
          <p className="font-semibold">{appUser?.name}</p>
          <p className="text-sm text-muted">{appUser?.email}</p>
        </div>

        <div className="flex items-center justify-between rounded-xl2 border border-navy-deep p-4">
          <span className="text-sm">Push Notifications</span>
          <button
            onClick={() => setNotifications((v) => !v)}
            className={`h-6 w-11 rounded-full transition-colors ${notifications ? 'bg-navy' : 'bg-navy-deep/40'}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform ${
                notifications ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-navy-deep rounded-xl2 border border-navy-deep">
          <Link href="/profile" className="flex items-center justify-between p-4 text-sm">
            Edit Profile <ChevronRight size={16} className="text-muted" />
          </Link>
          {appUser?.role === 'coach' && (
            <Link href="/coach-dashboard" className="flex items-center justify-between p-4 text-sm">
              Coach Dashboard <ChevronRight size={16} className="text-muted" />
            </Link>
          )}
          {appUser?.role === 'admin' && (
            <Link href="/admin" className="flex items-center justify-between p-4 text-sm">
              Admin Panel <ChevronRight size={16} className="text-muted" />
            </Link>
          )}
        </div>

        <button
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
          className="w-full rounded-xl2 border border-navy-deep px-6 py-3 font-semibold"
        >
          Sign Out
        </button>
      </main>
      <BottomNav />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}
