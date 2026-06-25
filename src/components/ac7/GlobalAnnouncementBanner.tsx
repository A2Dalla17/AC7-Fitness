'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Megaphone, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const HIDDEN = ['/', '/login', '/register', '/onboarding'];

/**
 * Global alert banner shown to every logged-in user when an admin posts an
 * "important" announcement, until its expires_at passes. Dismissible per user
 * per announcement (localStorage).
 */
export default function GlobalAnnouncementBanner() {
  const pathname = usePathname() ?? '';
  const { supabaseUser } = useAuth();
  const [ann, setAnn] = useState<{ id: string; title: string; body: string } | null>(null);

  useEffect(() => {
    if (!supabaseUser) return;
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id,title,body,importance,expires_at')
        .eq('importance', 'important')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      if (!active) return;
      const row = data?.[0] as any;
      if (row && localStorage.getItem(`ann-dismissed-${row.id}`) !== '1') {
        setAnn({ id: row.id, title: row.title, body: row.body });
      } else {
        setAnn(null);
      }
    };
    load();
    const channel = supabase
      .channel('global-announce')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, load)
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabaseUser]);

  if (!ann || HIDDEN.some((h) => h === pathname || (h !== '/' && pathname.startsWith(h)))) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center gap-2 border-b border-red-400/30 bg-red-500/15 px-4 py-2 backdrop-blur-md">
      <Megaphone size={15} className="shrink-0 text-red-400" />
      <p className="flex-1 text-xs">
        <span className="font-bold">{ann.title}</span>
        {ann.body ? <span className="text-muted"> — {ann.body}</span> : null}
      </p>
      <button
        onClick={() => {
          localStorage.setItem(`ann-dismissed-${ann.id}`, '1');
          setAnn(null);
        }}
        aria-label="Dismiss"
      >
        <X size={15} className="text-muted" />
      </button>
    </div>
  );
}
