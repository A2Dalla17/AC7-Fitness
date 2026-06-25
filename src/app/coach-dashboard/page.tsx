'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import {
  AvailabilitySlot,
  Booking,
  bookingFromRow,
  Coach,
  coachFromRow,
  CoachReview,
  coachReviewFromRow,
} from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
type Tab = 'schedule' | 'bookings' | 'reviews' | 'earnings';

function CoachDashboardContent() {
  const { supabaseUser } = useAuth();
  const [tab, setTab] = useState<Tab>('schedule');
  const [coach, setCoach] = useState<Coach | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<CoachReview[]>([]);
  const [activeClients, setActiveClients] = useState(0);
  const [saving, setSaving] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', start: '09:00', end: '17:00' });

  const load = async () => {
    if (!supabaseUser) return;
    const { data: coachRow } = await supabase
      .from('coaches')
      .select('*')
      .eq('user_id', supabaseUser.id)
      .maybeSingle();
    if (coachRow) setCoach(coachFromRow(coachRow as any));

    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('*')
      .eq('coach_id', supabaseUser.id)
      .order('date', { ascending: true });
    if (bookingRows) {
      const mapped = bookingRows.map((r) => bookingFromRow(r as any));
      setBookings(mapped);
      setActiveClients(new Set(mapped.map((b) => b.clientId)).size);
    }

    const { data: reviewRows } = await supabase
      .from('coach_reviews')
      .select('*')
      .eq('coach_id', supabaseUser.id)
      .order('created_at', { ascending: false });
    if (reviewRows) setReviews(reviewRows.map((r) => coachReviewFromRow(r as any)));
  };

  useEffect(() => {
    load();
  }, [supabaseUser]);

  const upcoming = bookings.filter((b) => b.status !== 'completed' && b.status !== 'cancelled');
  const completed = bookings.filter((b) => b.status === 'completed');
  const earnings = completed.length * (coach?.price ?? 0);

  const earningsByMonth = completed.reduce<Record<string, number>>((acc, b) => {
    const month = b.date.slice(0, 7);
    acc[month] = (acc[month] ?? 0) + (coach?.price ?? 0);
    return acc;
  }, {});

  const updatePrice = async (price: number) => {
    if (!supabaseUser) return;
    setSaving(true);
    await supabase.from('coaches').update({ price }).eq('user_id', supabaseUser.id);
    setCoach((c) => (c ? { ...c, price } : c));
    setSaving(false);
  };

  const addSlot = async () => {
    if (!supabaseUser || !coach) return;
    const updated = [...coach.availability, newSlot];
    await supabase.from('coaches').update({ availability: updated }).eq('user_id', supabaseUser.id);
    setCoach({ ...coach, availability: updated });
  };

  const removeSlot = async (index: number) => {
    if (!supabaseUser || !coach) return;
    const updated = coach.availability.filter((_, i) => i !== index);
    await supabase.from('coaches').update({ availability: updated }).eq('user_id', supabaseUser.id);
    setCoach({ ...coach, availability: updated });
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'completed') => {
    await supabase.from('bookings').update({ status }).eq('id', bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Coach Dashboard" />
      <main className="flex-1 space-y-6 px-4 py-6 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl2 border border-white/10 bg-surface p-4">
            <p className="text-xs text-muted">Active Clients</p>
            <p className="text-2xl font-bold">{activeClients}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 bg-surface p-4">
            <p className="text-xs text-muted">Earnings</p>
            <p className="text-2xl font-bold">${earnings.toFixed(0)}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 bg-surface p-4">
            <p className="text-xs text-muted">Upcoming Sessions</p>
            <p className="text-2xl font-bold">{upcoming.length}</p>
          </div>
          <div className="rounded-xl2 border border-white/10 bg-surface p-4">
            <p className="text-xs text-muted">Rating</p>
            <p className="text-2xl font-bold">⭐ {coach?.rating.toFixed(1) ?? '—'}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {(['schedule', 'bookings', 'reviews', 'earnings'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm capitalize ${
                tab === t ? 'bg-navy text-white' : 'border border-white/10 text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'schedule' && (
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              {(coach?.availability ?? []).length === 0 && (
                <p className="text-sm text-muted">No availability set yet.</p>
              )}
              {(coach?.availability ?? []).map((slot: AvailabilitySlot, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl2 border border-white/10 p-3 text-sm">
                  <span>{slot.day} · {slot.start}–{slot.end}</span>
                  <button onClick={() => removeSlot(i)} className="text-xs text-red-400">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="rounded-xl2 border border-white/10 p-4">
              <p className="mb-2 text-sm font-semibold">Add availability slot</p>
              <div className="flex flex-wrap gap-2">
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot((s) => ({ ...s, day: e.target.value }))}
                  className="rounded-xl2 border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newSlot.start}
                  onChange={(e) => setNewSlot((s) => ({ ...s, start: e.target.value }))}
                  className="rounded-xl2 border border-white/10 bg-white/5 px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={newSlot.end}
                  onChange={(e) => setNewSlot((s) => ({ ...s, end: e.target.value }))}
                  className="rounded-xl2 border border-white/10 bg-white/5 px-3 py-2 text-sm"
                />
                <button onClick={addSlot} className="rounded-xl2 bg-navy px-4 py-2 text-sm font-semibold">
                  Add
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl2 border border-white/10 p-4">
              <span className="text-sm text-muted">Price per session ($)</span>
              <input
                type="number"
                defaultValue={coach?.price ?? 0}
                onBlur={(e) => updatePrice(parseFloat(e.target.value) || 0)}
                disabled={saving}
                className="ml-auto w-24 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-right text-sm"
              />
            </div>
          </div>
        )}

        {tab === 'bookings' && (
          <div className="flex flex-col gap-2">
            {bookings.length === 0 && <p className="text-sm text-muted">No bookings yet.</p>}
            {bookings.map((b) => (
              <div key={b.id} className="rounded-xl2 border border-white/10 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{b.date} · {b.time}</p>
                  <span className="capitalize text-muted">{b.status}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(b.id, 'confirmed')}
                      className="rounded-full bg-navy px-3 py-1 text-xs font-semibold"
                    >
                      Confirm
                    </button>
                  )}
                  {b.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(b.id, 'completed')}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'reviews' && (
          <div className="flex flex-col gap-2">
            {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl2 border border-white/10 p-3 text-sm">
                <p className="font-semibold">{'⭐'.repeat(r.rating)}</p>
                {r.comment && <p className="mt-1 text-muted">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'earnings' && (
          <div className="flex flex-col gap-2">
            {Object.keys(earningsByMonth).length === 0 && (
              <p className="text-sm text-muted">No completed sessions yet.</p>
            )}
            {Object.entries(earningsByMonth)
              .sort((a, b) => b[0].localeCompare(a[0]))
              .map(([month, total]) => (
                <div key={month} className="flex items-center justify-between rounded-xl2 border border-white/10 p-3 text-sm">
                  <span>{month}</span>
                  <span className="font-semibold">${total.toFixed(0)}</span>
                </div>
              ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

export default function CoachDashboardPage() {
  return (
    <ProtectedRoute requireRole="coach">
      <CoachDashboardContent />
    </ProtectedRoute>
  );
}
