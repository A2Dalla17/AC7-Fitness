'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
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

      // No real payment processor yet — this is the placeholder "paid" step
      // in the flow until Stripe/escrow is wired up.
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
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Booking Confirmed" />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
        <CheckCircle2 size={56} className="text-chat" />
        <h2 className="mt-4 text-xl font-bold">Payment confirmed</h2>
        <p className="mt-1 text-sm text-muted">Your session is booked and paid for.</p>

        {booking && (
          <div className="mt-6 w-full max-w-sm rounded-xl2 border border-navy-deep bg-navy/20 p-4 text-left">
            <p className="font-semibold">{coach?.name ?? 'Coach'}</p>
            <p className="mt-1 text-sm text-muted">{booking.date} · {booking.time}</p>
            <p className="mt-2 text-lg font-bold">${coach?.price ?? '—'}</p>
          </div>
        )}

        <button
          onClick={() => router.push('/home')}
          className="mt-8 w-full max-w-sm rounded-xl2 bg-navy px-6 py-3 font-semibold"
        >
          Back to Dashboard
        </button>
      </main>
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
