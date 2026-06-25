import { supabase } from '@/lib/supabase';

const BUCKET = 'product-images';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

export function validateProductImage(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return 'Use JPG, PNG, or WebP';
  if (file.size > MAX_BYTES) return 'Image must be under 5 MB';
  return null;
}

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const err = validateProductImage(file);
  if (err) throw new Error(err);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (upErr) throw upErr;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
