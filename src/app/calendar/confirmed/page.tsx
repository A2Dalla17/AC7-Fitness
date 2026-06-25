'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import PremiumCard from '@/components/premium/PremiumCard';
import { Booking, bookingFromRow, Coach, coachFromRow } from '@/types';

function ConfirmedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const bookingId = params.get('bookingId');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    (async () => {
      const { data: bookingRow } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();
      if (!bookingRow) return;

      await supabase.from('bookings').update({ payment_status: 'paid' }).eq('id', bookingId);
      const updated = { ...bookingRow, payment_status: 'paid' };
      setBooking(bookingFromRow(updated as any));

      const { data: coachRow } = await supabase
        .from('coaches')
        .select('*')
        .eq('user_id', bookingRow.coach_id)
        .maybeSingle();
      if (coachRow) setCoach(coachFromRow(coachRow as any));
    })();
  }, [bookingId]);

  return (
    <div className="fit-page flex min-h-[60vh] flex-col items-center justify-center py-10 text-center">
      <PremiumCard className="elite-session-confirmed w-full max-w-md p-8">
        <div className="elite-session-confirmed__icon mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/15 text-orange-500">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="mt-5 text-xl font-bold text-ink">✓ Session Confirmed</h2>
        <p className="mt-2 text-sm text-muted">Your session is booked and paid for.</p>

        {booking && (
          <div className="mt-6 rounded-xl border border-[var(--elite-card-border)] bg-[var(--color-surface-elevated)] p-4 text-left">
            <p className="font-semibold text-ink">{coach?.name ?? 'Coach'}</p>
            <p className="mt-1 text-sm text-muted">
              {booking.date} · {booking.time}
            </p>
            <p className="mt-2 text-lg font-bold text-ink">${coach?.price ?? '—'}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push('/home')}
          className="mt-8 w-full rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400"
        >
          Back to Dashboard
        </button>
      </PremiumCard>
    </div>
  );
}

export default function ConfirmedPage() {
  return (
    <ProtectedRoute>
      <ConfirmedContent />
    </ProtectedRoute>
  );
}
