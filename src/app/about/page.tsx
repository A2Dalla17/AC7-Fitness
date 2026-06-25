'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

function AboutContent() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header title="About Us" back />
      <main className="flex-1 space-y-4 px-5 py-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-surface p-6">
          <h2 className="text-xl font-extrabold">AC7 Fitness</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-navy">Train. Rank. Conquer.</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            AC7 Fitness is a premium coaching marketplace, gamified training journey, and real community in one app.
            Complete AI-verified missions, climb the ranks through seasons, train with verified coaches, and earn your
            certificates — all powered by AC7 Elite.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-surface p-6">
          <h3 className="font-bold">Our Mission</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Make world-class coaching and structured training accessible to everyone, anywhere — with real
            accountability through camera-verified workouts and a supportive community.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-surface p-6 text-sm text-muted">
          <p>Powered by <span className="font-semibold text-ink">AC7 Elite</span></p>
          <p className="mt-1">Contact: support@ac7fitness.com</p>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

export default function AboutPage() {
  return (
    <ProtectedRoute>
      <AboutContent />
    </ProtectedRoute>
  );
}
