import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="elite-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">404</p>
      <h1 className="elite-page-title mt-2">Page not found</h1>
      <p className="elite-page-subtitle mt-2">This route does not exist or the dev cache needs a refresh.</p>
      <Link href="/home" className="ac7-btn mt-6">
        Back to Home
      </Link>
    </div>
  );
}
