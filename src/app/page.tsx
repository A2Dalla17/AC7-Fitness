import Link from 'next/link';
import AC7Logo from '@/components/ac7/AC7Logo';
import { LEGACY } from '@/lib/legacyBrand';

export default function SplashPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-10 flex flex-col items-center">
        <AC7Logo size={72} />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-muted">AC7 Elite</p>
        <h1 className="mt-3 max-w-sm text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {LEGACY.tagline}
        </h1>
        <p className="mt-2 max-w-xs text-sm text-muted">{LEGACY.philosophy}</p>
      </div>

      <div className="flex w-full max-w-[280px] flex-col gap-3">
        <Link href="/register" className="fit-btn fit-btn--primary fit-btn--block">
          Get Started
        </Link>
        <Link href="/login" className="fit-btn fit-btn--ghost fit-btn--block">
          I already have an account
        </Link>
      </div>
    </main>
  );
}
