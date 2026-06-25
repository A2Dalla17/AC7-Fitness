import Link from 'next/link';
import { Dumbbell, Salad, BarChart3, Users } from 'lucide-react';
import AC7Logo from '@/components/ac7/AC7Logo';

const FEATURES = [
  { icon: Dumbbell, label: 'Workout Plans' },
  { icon: Salad, label: 'Nutrition' },
  { icon: BarChart3, label: 'Progress' },
  { icon: Users, label: 'Community' },
];

export default function SplashPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-10">
      {/* minimal brand mark */}
      <div className="absolute left-6 top-6 flex items-center gap-2">
        <AC7Logo size={30} />
        <span className="text-sm font-bold tracking-wide">AC7 FITNESS</span>
      </div>

      {/* laptop */}
      <div className="w-full max-w-md">
        <div className="relative">
          {/* screen */}
          <div className="rounded-t-2xl border-[10px] border-b-0 border-[#11203c] bg-gradient-to-br from-[#0c1c3a] via-[#0a1730] to-[#0c1f42] shadow-2xl">
            <div className="flex aspect-[16/10] flex-col items-center justify-center px-6 text-center">
              <Dumbbell size={44} className="text-white" />
              <p className="mt-3 text-3xl font-extrabold tracking-[0.25em] text-white">FITNESS</p>
              <p className="mt-1 text-[11px] tracking-wide text-blue-300">
                Powered by <span className="font-semibold">AC7 Elite</span>
              </p>

              <div className="mt-6 grid w-full grid-cols-4 gap-2">
                {FEATURES.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5">
                    <Icon size={20} className="text-blue-400" />
                    <span className="text-[9px] leading-tight text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* base / deck */}
          <div className="relative -mx-[6%] h-3.5 rounded-b-xl bg-gradient-to-b from-[#1b2c4d] to-[#0d1830] shadow-lg">
            <div className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 rounded-b-lg bg-[#0a1424]" />
          </div>
        </div>
      </div>

      {/* minimal entry actions */}
      <div className="mt-8 flex w-full max-w-[260px] flex-col gap-2.5">
        <Link
          href="/register"
          className="rounded-full bg-navy px-5 py-2.5 text-center text-sm font-bold text-white shadow-[0_0_18px_rgba(37,99,235,0.35)] transition active:scale-[0.98]"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/15 px-5 py-2.5 text-center text-sm font-semibold text-ink transition active:scale-[0.98]"
        >
          I already have an account
        </Link>
      </div>
    </main>
  );
}
