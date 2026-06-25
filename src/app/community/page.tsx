'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Megaphone, Send, Mic, Square, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { COPY } from '@/lib/legacyBrand';
import WorldPageHeader from '@/components/world/WorldPageHeader';

const PUBLIC_ID = '00000000-0000-0000-0000-000000000001';

type ChatTab = 'public' | 'messages';
type MsgFilter = 'all' | 'coaches' | 'clients' | 'search';

interface Msg {
  id: string;
  sender_id: string;
  kind: string;
  body: string | null;
  media_url: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
}

function CommunityContent() {
  const { supabaseUser, appUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<ChatTab>('public');
  const [msgFilter, setMsgFilter] = useState<MsgFilter>('all');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceText, setAnnounceText] = useState('');
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isAdmin = appUser?.role === 'admin';

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', PUBLIC_ID)
        .order('created_at', { ascending: true })
        .limit(200);
      if (data) setMessages(data as Msg[]);

      const { data: users } = await supabase.from('users').select('id,name,role');
      if (users) {
        setNames(Object.fromEntries(users.map((u: any) => [u.id, u.name])));
        setContacts(users.map((u: any) => ({ id: u.id, name: u.name, role: u.role })).filter((u) => u.id !== supabaseUser?.id));
      }
    })();

    const channel = supabase
      .channel('public-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${PUBLIC_ID}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser?.id]);

  useEffect(() => {
    if (tab === 'public') bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tab]);

  const send = async () => {
    if (!text.trim() || !supabaseUser) return;
    const body = text.trim();
    setText('');
    await supabase.from('chat_messages').insert({ conversation_id: PUBLIC_ID, sender_id: supabaseUser.id, kind: 'text', body });
  };

  const runSearch = async (q: string) => {
    setSearch(q);
    if (q.trim().length < 1) return setSearchResults([]);
    const { data } = await supabase.from('users').select('id,name,role').ilike('name', `%${q}%`).limit(15);
    setSearchResults((data ?? []).filter((u: any) => u.id !== supabaseUser?.id) as Contact[]);
  };

  const openDirect = async (otherId: string) => {
    const { data, error } = await supabase.rpc('start_direct_conversation', { other_user: otherId });
    if (!error && data) router.push(`/community/thread/${data}`);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (!supabaseUser) return;
        const path = `${supabaseUser.id}/${Date.now()}.webm`;
        const { error: upErr } = await supabase.storage.from('voice-messages').upload(path, blob, { contentType: 'audio/webm' });
        if (upErr) return;
        const { data: pub } = supabase.storage.from('voice-messages').getPublicUrl(path);
        await supabase.from('chat_messages').insert({ conversation_id: PUBLIC_ID, sender_id: supabaseUser.id, kind: 'voice', media_url: pub.publicUrl });
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      /* mic denied */
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const postAnnouncement = async () => {
    if (!announceTitle.trim() || !supabaseUser) return;
    await supabase.from('announcements').insert({
      title: announceTitle.trim(),
      body: announceText.trim(),
      category: 'news',
      importance: 'normal',
      author_id: supabaseUser.id,
    });
    setAnnounceTitle('');
    setAnnounceText('');
    setShowAnnounce(false);
  };

  const filteredContacts = contacts.filter((c) => {
    if (msgFilter === 'coaches') return c.role === 'coach';
    if (msgFilter === 'clients') return c.role === 'member' || c.role === 'client';
    if (msgFilter === 'search') return searchResults.some((r) => r.id === c.id);
    return true;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString();
  };

  return (
    <div className="fit-chat">
      <div className="fit-chat__header">
        <WorldPageHeader
          eyebrow={COPY.community.nationEyebrow}
          title={COPY.community.title}
          subline={COPY.community.subline}
        />
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowSearch((v) => !v)} aria-label="Search" className="fit-top-nav__icon-btn !h-9 !w-9">
            <Search size={18} />
          </button>
          <Link href="/announcements" aria-label="Announcements" className="fit-top-nav__icon-btn !h-9 !w-9">
            <Megaphone size={18} />
          </Link>
          {isAdmin && (
            <button type="button" onClick={() => setShowAnnounce((v) => !v)} aria-label="Post announcement" className="fit-top-nav__icon-btn !h-9 !w-9">
              <Megaphone size={18} className="text-blue-400" />
            </button>
          )}
        </div>
      </div>

      <div className="fit-chat__tabs">
        {(['public', 'messages'] as ChatTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`fit-chat__tab ${tab === t ? 'fit-chat__tab--active' : ''}`}
          >
            {t === 'public' ? COPY.community.publicChat : COPY.community.privateChat}
          </button>
        ))}
      </div>

      {showSearch && (
        <div className="border-b border-white/10 px-4 py-3">
          <div className="fit-search-bar">
            <Search size={16} className="text-muted shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => {
                runSearch(e.target.value);
                if (tab === 'messages') setMsgFilter('search');
              }}
              placeholder={COPY.community.searchPlaceholder}
            />
            {search && (
              <button type="button" onClick={() => runSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>
          {searchResults.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => openDirect(u.id)}
              className="mt-2 flex w-full items-center justify-between py-2 text-left text-sm"
            >
              <span className="font-semibold">{u.name}</span>
              <span className="text-xs capitalize text-muted">{u.role}</span>
            </button>
          ))}
        </div>
      )}

      {showAnnounce && isAdmin && (
        <div className="space-y-2 border-b border-white/10 px-4 py-3">
          <input
            value={announceTitle}
            onChange={(e) => setAnnounceTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
          />
          <textarea
            value={announceText}
            onChange={(e) => setAnnounceText(e.target.value)}
            placeholder="Message"
            rows={2}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm focus:outline-none"
          />
          <button type="button" onClick={postAnnouncement} className="fit-btn fit-btn--primary !py-2 !text-sm">
            Publish
          </button>
        </div>
      )}

      {tab === 'messages' && (
        <div className="fit-msg-filter">
          {(
            [
              ['all', COPY.community.filters.all],
              ['coaches', COPY.community.filters.coaches],
              ['clients', COPY.community.filters.clients],
              ['search', COPY.community.filters.search],
            ] as [MsgFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMsgFilter(key)}
              className={`fit-msg-filter__chip ${msgFilter === key ? 'fit-msg-filter__chip--active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === 'public' ? (
        <>
          <div className="fit-chat__messages">
            {messages.map((m) => {
              const mine = m.sender_id === supabaseUser?.id;
              return (
                <div key={m.id} className={`fit-chat__bubble ${mine ? 'fit-chat__bubble--mine' : 'fit-chat__bubble--theirs'}`}>
                  {!mine && <p className="mb-0.5 text-[11px] font-semibold text-blue-400">{names[m.sender_id] ?? 'Member'}</p>}
                  {m.kind === 'voice' && m.media_url ? (
                    <audio controls src={m.media_url} className="h-9 w-48 max-w-full" />
                  ) : (
                    <p>{m.body}</p>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="fit-chat__composer">
            {recording ? (
              <button type="button" onClick={stopRecording} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
                <Square size={16} />
              </button>
            ) : (
              <button type="button" onClick={startRecording} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15">
                <Mic size={18} />
              </button>
            )}
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={COPY.community.placeholder}
            />
            <button type="button" onClick={send} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Send size={18} />
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <p className="p-4 text-sm text-muted">{COPY.community.emptyDm}</p>
          ) : (
            filteredContacts.map((c) => (
              <button key={c.id} type="button" onClick={() => openDirect(c.id)} className="fit-dm-row w-full text-left">
                <div className="fit-dm-avatar">{c.name.charAt(0)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs capitalize text-muted">{c.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  return (
    <ProtectedRoute>
      <CommunityContent />
    </ProtectedRoute>
  );
}
