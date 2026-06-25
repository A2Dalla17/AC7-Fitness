'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="elite-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Something went wrong</p>
      <h1 className="elite-page-title mt-2">Unable to load this page</h1>
      <p className="elite-page-subtitle mt-2 max-w-md">
        {error.message || 'An unexpected error occurred. Try refreshing or clearing the dev cache.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => reset()} className="ac7-btn">
          Try again
        </button>
        <a href="/home" className="ac7-btn ac7-btn-outline">
          Go to Home
        </a>
      </div>
    </div>
  );
}
