'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { AppUser, Coach, coachFromRow } from '@/types';

function AdminContent() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [tab, setTab] = useState<'users' | 'coaches' | 'announcements'>('users');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', body: '' });

  const load = async () => {
    const { data: userRows } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (userRows) {
      setUsers(
        userRows.map((r: any) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          goal: r.goal,
          createdAt: r.created_at,
        })),
      );
    }

    const { data: coachRows } = await supabase.from('coaches').select('*');
    if (coachRows) setCoaches(coachRows.map((r) => coachFromRow(r as any)));

    const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    setBookingCount(count ?? 0);

    const { data: orders } = await supabase.from('orders').select('total');
    setRevenue((orders ?? []).reduce((sum: number, o: any) => sum + Number(o.total), 0));
  };

  useEffect(() => {
    load();
  }, []);

  const verifyCoach = async (userId: string, verified: boolean) => {
    await supabase.from('coaches').update({ verified }).eq('user_id', userId);
    setCoaches((prev) => prev.map((c) => (c.userId === userId ? { ...c, verified } : c)));
  };

  const postAnnouncement = async () => {
    if (!newAnnouncement.title.trim()) return;
    await supabase.from('announcements').insert({
      title: newAnnouncement.title,
      body: newAnnouncement.body,
      category: 'news',
    });
    setNewAnnouncement({ title: '', body: '' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Admin Dashboard" />
      <main className="flex-1 space-y-4 px-4 py-4 pb-10">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl2 border border-white/10 p-4">
            <p className="text-xs text-muted">Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 p-4">
            <p className="text-xs text-muted">Coaches</p>
            <p className="text-2xl font-bold">{coaches.length}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 p-4">
            <p className="text-xs text-muted">Sessions Booked</p>
            <p className="text-2xl font-bold">{bookingCount}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 p-4">
            <p className="text-xs text-muted">Revenue</p>
            <p className="text-2xl font-bold">${revenue.toFixed(0)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {(['users', 'coaches', 'announcements'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm capitalize ${
                tab === t ? 'bg-navy' : 'border border-white/10 text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <div className="flex flex-col gap-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl2 border border-white/10 p-3 text-sm">
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs capitalize">
                  {u.role ?? 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === 'coaches' && (
          <div className="flex flex-col gap-2">
            {coaches.map((c) => (
              <div key={c.userId} className="flex items-center justify-between rounded-xl2 border border-white/10 p-3 text-sm">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted">${c.price}/session · {c.experience}+ yrs</p>
                </div>
                <button
                  onClick={() => verifyCoach(c.userId, !c.verified)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    c.verified ? 'bg-blue-500 text-white' : 'border border-white/10 text-muted'
                  }`}
                >
                  {c.verified ? 'Verified ✓' : 'Verify'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'announcements' && (
          <div className="space-y-3">
            <input
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement((s) => ({ ...s, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-xl2 border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-muted"
            />
            <textarea
              value={newAnnouncement.body}
              onChange={(e) => setNewAnnouncement((s) => ({ ...s, body: e.target.value }))}
              placeholder="Body"
              rows={3}
              className="w-full resize-none rounded-xl2 border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-muted"
            />
            <button
              onClick={postAnnouncement}
              className="rounded-xl2 bg-navy px-6 py-2 text-sm font-semibold"
            >
              Publish Announcement
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute requireRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
