'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Heart, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { CommunityGroup, CommunityPost, communityGroupFromRow, communityPostFromRow } from '@/types';

interface PostWithAuthor extends CommunityPost {
  authorName: string;
}

function GroupDetailContent() {
  const { groupId } = useParams<{ groupId: string }>();
  const { supabaseUser } = useAuth();
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [text, setText] = useState('');

  const loadPosts = async () => {
    const { data: postRows } = await supabase
      .from('community_posts')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    if (!postRows) return;

    const authorIds = Array.from(new Set(postRows.map((p: any) => p.author_id)));
    const { data: authors } = await supabase.from('users').select('id, name').in('id', authorIds);
    const nameById = new Map((authors ?? []).map((a: any) => [a.id, a.name]));

    setPosts(
      postRows.map((r: any) => ({
        ...communityPostFromRow(r),
        authorName: nameById.get(r.author_id) ?? 'AC7 Member',
      })),
    );

    const { data: likes } = await supabase
      .from('community_likes')
      .select('post_id')
      .in('post_id', postRows.map((p: any) => p.id));
    const counts: Record<string, number> = {};
    (likes ?? []).forEach((l: any) => {
      counts[l.post_id] = (counts[l.post_id] ?? 0) + 1;
    });
    setLikeCounts(counts);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('community_groups').select('*').eq('id', groupId).maybeSingle();
      if (data) setGroup(communityGroupFromRow(data as any));
      await loadPosts();
    })();
  }, [groupId]);

  const post = async () => {
    if (!supabaseUser || !text.trim()) return;
    await supabase.from('community_posts').insert({
      group_id: groupId,
      author_id: supabaseUser.id,
      content: text.trim(),
    });
    setText('');
    await loadPosts();
  };

  const like = async (postId: string) => {
    if (!supabaseUser) return;
    await supabase.from('community_likes').insert({ post_id: postId, user_id: supabaseUser.id });
    setLikeCounts((prev) => ({ ...prev, [postId]: (prev[postId] ?? 0) + 1 }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title={group?.name ?? 'Group'} back />
      <main className="flex-1 space-y-4 px-4 py-4 pb-24">
        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Share something with ${group?.name ?? 'the group'}...`}
            className="flex-1 resize-none rounded-xl2 border border-community/40 bg-community/5 px-4 py-2 text-sm placeholder:text-muted focus:outline-none"
            rows={2}
          />
        </div>
        <button
          onClick={post}
          disabled={!text.trim()}
          className="rounded-xl2 bg-community px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Post
        </button>

        <div className="flex flex-col gap-3">
          {posts.length === 0 && <p className="text-sm text-muted">No posts yet — be the first.</p>}
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl2 border border-community/30 bg-community/5 p-4">
              <p className="text-sm font-semibold text-community">{p.authorName}</p>
              <p className="mt-1 text-sm">{p.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                <button onClick={() => like(p.id)} className="flex items-center gap-1">
                  <Heart size={14} /> {likeCounts[p.id] ?? 0}
                </button>
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} /> Comments
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function GroupDetailPage() {
  return (
    <ProtectedRoute>
      <GroupDetailContent />
    </ProtectedRoute>
  );
}
