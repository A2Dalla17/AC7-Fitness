
const GUIDES = [
  { title: 'Getting Started with AC7 Fitness', desc: 'Set up your profile, pick a goal, and find your first coach.' },
  { title: 'Understanding Ranks & XP', desc: 'How missions, XP, and the rank ladder work together.' },
  { title: 'Booking Your First Session', desc: 'A step-by-step walkthrough of the calendar and booking flow.' },
  { title: 'Choosing the Right Coach', desc: 'What to look for in specialization, reviews, and pricing.' },
];

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-extrabold">Guides</h1>
        <p className="mt-2 text-sm text-muted">Step-by-step walkthroughs to get the most out of AC7.</p>

        <div className="mt-8 flex flex-col gap-4">
          {GUIDES.map((g) => (
            <div key={g.title} className="rounded-2xl border border-white/10 bg-surface p-5">
              <h3 className="text-lg font-bold">{g.title}</h3>
              <p className="mt-1 text-sm text-muted">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
