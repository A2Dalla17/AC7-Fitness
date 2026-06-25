import Link from 'next/link';

export default function MissionsCoursePage() {
  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-navy">Open to everyone</span>
        <h1 className="mt-2 text-3xl font-extrabold">Missions</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Missions are daily and weekly tasks — complete a workout, hit your step goal, drink enough water — that
          earn XP and push you up the rank ladder from Bronze all the way to Conquer. No coach required to start;
          every member gets a missions tracker the moment they sign up.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Complete a workout', xp: '+50 XP' },
            { label: 'Walk 10,000 steps', xp: '+50 XP' },
            { label: 'Drink 2L of water', xp: '+50 XP' },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl border border-white/10 bg-surface p-4">
              <p className="text-sm font-semibold">{t.label}</p>
              <p className="mt-1 text-xs font-bold text-navy">{t.xp}</p>
            </div>
          ))}
        </div>

        <Link
          href="/missions"
          className="mt-8 inline-block rounded-full bg-navy px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(163,230,53,0.3)]"
        >
          Open My Missions
        </Link>
      </div>
    </main>
  );
}
