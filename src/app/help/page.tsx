
const FAQS = [
  { q: 'How do I book a coach?', a: 'Go to Coaches from the bottom nav, pick a coach, and select an open slot on their calendar.' },
  { q: 'How does Private Training unlock?', a: 'Private Training under Courses stays locked until a coach you booked assigns it to you directly.' },
  { q: 'How do I earn XP and rank up?', a: 'Complete daily missions — workouts, steps, water — from the Missions tab to earn XP toward the next rank.' },
  { q: 'Can I switch from client to coach?', a: 'Contact support from Settings to request a role change.' },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-bg pb-16">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <h1 className="text-3xl font-extrabold">Help</h1>
        <p className="mt-2 text-sm text-muted">Answers to common questions.</p>

        <div className="mt-8 flex flex-col gap-3">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-2xl border border-white/10 bg-surface p-5">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
