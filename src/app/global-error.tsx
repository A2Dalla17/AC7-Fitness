'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#060d1c', color: '#fff' }}>
        <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Application error
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>AC7 Elite Fitness</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 12 }}>
            {error.message || 'A critical error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 24,
              padding: '12px 24px',
              borderRadius: 14,
              border: 'none',
              background: '#f97316',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
