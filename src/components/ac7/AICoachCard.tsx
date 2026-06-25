import AC7Logo from '@/components/ac7/AC7Logo';

export default function AICoachCard({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-navy/20 bg-navy/5 p-4">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-navy/30 bg-navy/10">
        <AC7Logo size={32} />
      </div>

      <div className="flex-1">
        <p className="text-sm font-bold">
          Hey {name}! I'm your <span className="text-navy">AI Coach</span>.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          I'm here to guide you, motivate you, and help you crush your goals.
        </p>
      </div>
    </div>
  );
}
