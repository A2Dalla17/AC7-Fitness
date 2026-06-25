'use client';

import { ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SupabaseSetupNotice({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <h1 className="text-xl font-bold">Supabase not configured</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Add your Supabase credentials to <code>.env.local</code> and restart the dev server.
      </p>
      <ol className="mt-6 max-w-sm space-y-2 text-left text-sm text-muted">
        <li>1. Create a project at supabase.com/dashboard</li>
        <li>2. Open Project Settings → API and copy the Project URL and anon public key</li>
        <li>
          3. Paste them into <code>.env.local</code> as <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
        </li>
        <li>4. Run the SQL migrations in supabase/migrations/</li>
        <li>5. Restart with npm run dev</li>
      </ol>
    </div>
  );
}
