'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, addDays, startOfToday } from 'date-fns';
import { Calendar, Clock, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Booking, bookingFromRow } from '@/types';
import { useCopy } from '@/context/LanguageContext';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import Ac7BrandWatermark from '@/components/ac7/Ac7BrandWatermark';

const TIME_SLOTS = ['09:00', '11:00', '13:00', '15:00', '17:00', '19:00'];

function CalendarContent() {
  const COPY = useCopy();
  const { supabaseUser, appUser } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const coachId = params.get('coachId');

  const today = startOfToday();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [coachName, setCoachName] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!supabaseUser || !appUser) return;
    (async () => {
      const field = appUser.role === 'coach' ? 'coach_id' : 'client_id';
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq(field, supabaseUser.id)
        .order('date', { ascending: true });
      if (data) setBookings(data.map((r) => bookingFromRow(r as any)));

      if (coachId) {
        const { data: coach } = await supabase.from('users').select('name').eq('id', coachId).maybeSingle();
        if (coach) setCoachName((coach as any).name);
      }
    })();
  }, [supabaseUser, appUser, status, coachId]);

  const handleBook = async () => {
    if (!supabaseUser || !coachId || !selectedTime) return;
    setStatus('booking');
    const { data } = await supabase
      .from('bookings')
      .insert({
        client_id: supabaseUser.id,
        coach_id: coachId,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        status: 'pending',
        created_at: Date.now(),
      })
      .select()
      .single();
    setStatus('booked');
    setSelectedTime(null);
    if (data) router.push(`/calendar/confirmed?bookingId=${data.id}`);
  };

  const upcoming = bookings.filter((b) => b.status !== 'cancelled').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <div className="fit-page">
      <WorldPageHeader title={COPY.calendar.title} subline={COPY.calendar.subline} />

      <div className="calendar-widget-grid">
        <PremiumCard className="calendar-widget">
          <p className="calendar-widget__label">{COPY.calendar.upcoming}</p>
          <p className="calendar-widget__value">{upcoming}</p>
        </PremiumCard>
        <PremiumCard className="calendar-widget">
          <p className="calendar-widget__label">{COPY.calendar.sessionStats}</p>
          <p className="calendar-widget__value">{confirmed}</p>
        </PremiumCard>
        <PremiumCard className="calendar-widget">
          <p className="calendar-widget__label">{COPY.calendar.coachAvailability}</p>
          <p className="calendar-widget__value">{TIME_SLOTS.length} slots</p>
        </PremiumCard>
        <PremiumCard className="calendar-widget">
          <p className="calendar-widget__label">{COPY.calendar.monthlyOverview}</p>
          <p className="calendar-widget__value">{format(today, 'MMM yyyy')}</p>
        </PremiumCard>
      </div>

      {coachId ? (
        <p className="text-sm text-muted">
          Book with <span className="font-semibold text-ink">{coachName ?? 'Coach'}</span>
        </p>
      ) : (
        <Link href="/coach" className="fit-hub-row premium-card premium-card--interactive">
          <span className="fit-hub-row__icon">
            <Search size={20} className="text-orange-400" />
          </span>
          <div className="fit-hub-row__body">
            <p className="fit-hub-row__title">{COPY.calendar.pickCoach}</p>
            <p className="fit-hub-row__meta">{COPY.calendar.pickCoachMeta}</p>
          </div>
        </Link>
      )}

      <PremiumCard>
        <p className="fit-section-title flex items-center gap-2">
          <Calendar size={16} className="text-orange-400" /> Select date
        </p>
        <div className="fit-date-strip">
          {days.map((d) => {
            const active = format(d, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={`fit-date-chip ${active ? 'fit-date-chip--active' : ''}`}
              >
                <span className="text-[10px] opacity-80">{format(d, 'EEE')}</span>
                <span className="font-bold">{format(d, 'd')}</span>
              </button>
            );
          })}
        </div>
      </PremiumCard>

      {coachId && (
        <PremiumCard>
          <p className="fit-section-title flex items-center gap-2">
            <Clock size={16} className="text-orange-400" /> Available · {format(selectedDate, 'MMM d')}
          </p>
          <div className="fit-time-grid">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(t)}
                className={`fit-time-slot ${selectedTime === t ? 'fit-time-slot--active' : ''}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!selectedTime || status === 'booking'}
            onClick={handleBook}
            className="fit-btn fit-btn--primary fit-btn--block mt-4 disabled:opacity-50"
          >
            {status === 'booking' ? 'Booking…' : COPY.calendar.confirm}
          </button>
        </PremiumCard>
      )}

      <section>
        <p className="fit-section-title">{COPY.calendar.upcoming}</p>
        {bookings.length === 0 ? (
          <PremiumCard className="calendar-empty">
            <Ac7BrandWatermark />
            <p className="calendar-empty__title">{COPY.calendar.emptyTitle}</p>
            <p className="calendar-empty__meta">{COPY.calendar.emptyMeta}</p>
            <Link href="/coach" className="fit-btn fit-btn--primary">
              {COPY.calendar.emptyCta}
            </Link>
          </PremiumCard>
        ) : (
          bookings.map((b) => (
            <PremiumCard key={b.id} className="fit-booking-row mb-2">
              <span>
                {b.date} · {b.time}
              </span>
              <span className="capitalize text-muted">{b.status}</span>
            </PremiumCard>
          ))
        )}
      </section>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ProtectedRoute>
      <Suspense>
        <CalendarContent />
      </Suspense>
    </ProtectedRoute>
  );
}
