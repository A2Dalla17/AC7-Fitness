'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { Message, messageFromRow } from '@/types';

function conversationId(a: string, b: string) {
  return [a, b].sort().join('_');
}

function ChatThreadContent() {
  const { id } = useParams<{ id: string }>();
  const { supabaseUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [otherName, setOtherName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('users').select('name').eq('id', id).maybeSingle();
      if (data) setOtherName((data as any).name);
    })();
  }, [id]);

  useEffect(() => {
    if (!supabaseUser) return;
    const convoId = conversationId(supabaseUser.id, id);

    (async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('timestamp', { ascending: true });
      if (data) setMessages(data.map((r) => messageFromRow(r as any)));
    })();

    const channel = supabase
      .channel(`messages:${convoId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convoId}` },
        (payload) => {
          setMessages((prev) => [...prev, messageFromRow(payload.new as any)]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabaseUser, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!supabaseUser || !text.trim()) return;
    const convoId = conversationId(supabaseUser.id, id);
    await supabase.from('messages').insert({
      conversation_id: convoId,
      sender_id: supabaseUser.id,
      receiver_id: id,
      message: text.trim(),
      timestamp: Date.now(),
    });
    setText('');
  };

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header title={otherName || 'Chat'} back />
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          {messages.map((m) => {
            const mine = m.senderId === supabaseUser?.id;
            return (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-xl2 px-4 py-2 text-sm ${
                  mine ? 'self-end bg-chat' : 'self-start bg-chatReceived'
                }`}
              >
                {m.message}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </main>
      <div className="flex items-center gap-2 border-t border-navy-deep bg-navy px-3 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        <button onClick={send} className="rounded-full bg-chat px-4 py-2 text-sm font-semibold">
          Send
        </button>
      </div>
    </div>
  );
}

export default function ChatThreadPage() {
  return (
    <ProtectedRoute>
      <ChatThreadContent />
    </ProtectedRoute>
  );
}
