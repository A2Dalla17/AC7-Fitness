'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function Header({
  title,
  back,
  right,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 nav-surface px-4 py-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        {back && (
          <button onClick={() => router.back()} className="text-ink">
            <ChevronLeft size={22} />
          </button>
        )}
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
      </div>
      <div>{right}</div>
    </header>
  );
}
