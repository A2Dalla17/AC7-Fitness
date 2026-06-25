'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { Send, Mic, Square, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';

interface Msg {
  id: string;
  sender_id: string;
  kind: string;
  body: string | null;
  media_url: string | null;
  created_at: string;
}

function ThreadContent() {
  const { supabaseUser } = useAuth();
  const params = useParams();
  const conversationId = String(params.id);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [otherName, setOtherName] = useState('Chat');
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'calling'>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabaseUser) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as Msg[]);

      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId);
      const other = parts?.map((p: any) => p.user_id).find((id: string) => id !== supabaseUser.id);
      if (other) {
        const { data: u } = await supabase.from('users').select('name').eq('id', other).maybeSingle();
        if (u?.name) setOtherName(u.name);
      }
    })();

    const channel = supabase
      .channel(`thread-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabaseUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !supabaseUser) return;
    const body = text.trim();
    setText('');
    await supabase.from('chat_messages').insert({ conversation_id: conversationId, sender_id: supabaseUser.id, kind: 'text', body });
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
        const { error } = await supabase.storage.from('voice-messages').upload(path, blob, { contentType: 'audio/webm' });
        if (error) return;
        const { data: pub } = supabase.storage.from('voice-messages').getPublicUrl(path);
        await supabase
          .from('chat_messages')
          .insert({ conversation_id: conversationId, sender_id: supabaseUser.id, kind: 'voice', media_url: pub.publicUrl });
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

  const startCall = async () => {
    if (!supabaseUser) return;
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId);
    const other = parts?.map((p: any) => p.user_id).find((id: string) => id !== supabaseUser.id);
    if (!other) return;
    await supabase.from('calls').insert({ conversation_id: conversationId, caller_id: supabaseUser.id, callee_id: other, status: 'ringing' });
    await supabase
      .from('chat_messages')
      .insert({ conversation_id: conversationId, sender_id: supabaseUser.id, kind: 'system', body: '📞 Voice call started' });
    setCallState('calling');
    setTimeout(() => setCallState('idle'), 4000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header
        title={otherName}
        back
        right={
          <button onClick={startCall} aria-label="Call" className="text-navy">
            <Phone size={20} />
          </button>
        }
      />

      {callState === 'calling' && (
        <div className="bg-navy/10 px-4 py-2 text-center text-sm text-navy">Calling {otherName}…</div>
      )}

      <main className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-24">
        {messages.map((m) => {
          const mine = m.sender_id === supabaseUser?.id;
          if (m.kind === 'system') {
            return (
              <p key={m.id} className="text-center text-xs text-muted">
                {m.body}
              </p>
            );
          }
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2 ${mine ? 'bg-navy text-white' : 'border border-white/10 bg-surface'}`}>
                {m.kind === 'voice' && m.media_url ? (
                  <audio controls src={m.media_url} className="h-9 w-52" />
                ) : (
                  <p className="text-sm">{m.body}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="sticky bottom-0 z-10 flex items-center gap-2 border-t border-white/10 bg-surface px-3 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        {recording ? (
          <button onClick={stopRecording} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
            <Square size={16} />
          </button>
        ) : (
          <button onClick={startRecording} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink">
            <Mic size={18} />
          </button>
        )}
        <button onClick={send} className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ThreadPage() {
  return (
    <ProtectedRoute>
      <ThreadContent />
    </ProtectedRoute>
  );
}
