'use client';

import { useRef, useState } from 'react';
import { Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/** Compact coach upload — lives inside Coach Tools, not full-width. */
export default function VideoUpload({ onUploaded }: { onUploaded?: () => void }) {
  const { supabaseUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    setError('');
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError('Choose a video file.');
      return;
    }
    if (!title.trim()) {
      setError('Add a title.');
      return;
    }
    if (!supabaseUser) return;

    setBusy(true);
    try {
      const ext = file.name.split('.').pop() ?? 'mp4';
      const path = `${supabaseUser.id}/${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('exercise-videos')
        .upload(path, file, { contentType: file.type || 'video/mp4', upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('exercise-videos').getPublicUrl(path);

      const { error: insErr } = await supabase.from('exercise_videos').insert({
        uploader_id: supabaseUser.id,
        title: title.trim(),
        video_url: pub.publicUrl,
      });
      if (insErr) throw insErr;

      setDone(true);
      setTitle('');
      if (fileRef.current) fileRef.current.value = '';
      onUploaded?.();
      setTimeout(() => setDone(false), 2500);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Video title"
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy"
      />
      <input
        ref={fileRef}
        type="file"
        accept="video/*"
        className="w-full text-xs text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-navy/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-navy"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button onClick={handleUpload} disabled={busy} className="ac7-btn !min-h-[36px] !px-4 !py-2 text-xs">
        {busy ? <Loader2 size={14} className="animate-spin" /> : done ? <CheckCircle2 size={14} /> : <Upload size={14} />}
        {busy ? 'Uploading…' : done ? 'Done' : 'Publish'}
      </button>
    </div>
  );
}
