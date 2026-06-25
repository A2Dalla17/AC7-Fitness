'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

interface Contact {
  id: string;
  name: string;
}

function ChatListContent() {
  const { supabaseUser, appUser } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    if (!supabaseUser || !appUser) return;
    (async () => {
      const field = appUser.role === 'coach' ? 'coach_id' : 'client_id';
      const otherField = appUser.role === 'coach' ? 'client_id' : 'coach_id';
      const { data: bookingRows } = await supabase
        .from('bookings')
        .select(otherField)
        .eq(field, supabaseUser.id);

      const otherIds = Array.from(
        new Set((bookingRows ?? []).map((r: any) => r[otherField] as string)),
      );
      if (otherIds.length === 0) return;

      const { data: userRows } = await supabase.from('users').select('id, name').in('id', otherIds);
      setContacts((userRows ?? []).map((u: any) => ({ id: u.id, name: u.name ?? 'AC7 Member' })));
    })();
  }, [supabaseUser, appUser]);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="Messages" />
      <main className="flex-1 px-4 py-4 pb-24">
        {contacts.length === 0 && (
          <p className="text-sm text-muted">
            No conversations yet. Book a session to start chatting with your coach.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {contacts.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 rounded-xl2 border border-navy-deep p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chat text-sm font-bold">
                {c.name.charAt(0)}
              </div>
              <p className="font-semibold">{c.name}</p>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function ChatListPage() {
  return (
    <ProtectedRoute>
      <ChatListContent />
    </ProtectedRoute>
  );
}
