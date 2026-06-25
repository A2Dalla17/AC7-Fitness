
const TOPICS = [
  { title: 'Injury Prevention Basics', desc: 'Common causes of training injuries and how to avoid them.' },
  { title: 'Hydration & Performance', desc: 'How much water you actually need on training days.' },
  { title: 'Mental Health & Training', desc: 'Why consistency beats intensity for long-term wellbeing.' },
];

export default function HealthPage() {
  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-extrabold">Health</h1>
        <p className="mt-2 text-sm text-muted">Wellbeing resources to support your training.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-2xl border border-white/10 bg-surface p-5">
              <h3 className="text-base font-bold">{t.title}</h3>
              <p className="mt-1 text-sm text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
