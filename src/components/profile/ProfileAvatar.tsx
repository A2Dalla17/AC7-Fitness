'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ProfileAvatar({
  userId,
  name,
  avatarUrl,
  editable,
  onUploaded,
  size = 'lg',
}: {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  editable?: boolean;
  onUploaded?: (url: string) => void;
  size?: 'sm' | 'lg';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(avatarUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const initial = name?.charAt(0).toUpperCase() || 'A';
  const dim = size === 'sm' ? 'h-12 w-12 text-base' : 'h-24 w-24 text-2xl';

  useEffect(() => {
    setUrl(avatarUrl ?? '');
  }, [avatarUrl]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('users').update({ avatar_url: publicUrl }).eq('id', userId);
      setUrl(publicUrl);
      onUploaded?.(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`profile-avatar-wrap ${dim}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name} className="profile-avatar-wrap__img" />
      ) : (
        <span className="profile-avatar-wrap__initial">{initial}</span>
      )}
      {editable && (
        <>
          <button
            type="button"
            className="profile-avatar-wrap__edit"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            aria-label="Upload profile photo"
          >
            <Camera size={size === 'sm' ? 14 : 18} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </>
      )}
    </div>
  );
}
