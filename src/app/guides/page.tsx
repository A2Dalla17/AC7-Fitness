'use client';

import Link from 'next/link';
import { ChevronRight, Clock, BarChart3 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import PremiumCard from '@/components/premium/PremiumCard';
import { LEGACY } from '@/lib/legacyBrand';

const GUIDES = [
  {
    title: 'Getting Started with AC7 Elite',
    desc: 'Set up your profile, pick a goal, and begin your first mission.',
    category: 'Foundation',
    readMin: 4,
    difficulty: 'Beginner',
    progress: 0,
  },
  {
    title: 'Understanding Ranks & Legacy',
    desc: 'How missions, XP, Legacy Score, and the rank journey work together.',
    category: 'Progression',
    readMin: 6,
    difficulty: 'Intermediate',
    progress: 35,
  },
  {
    title: 'Booking Your First Session',
    desc: 'Walk through calendar booking with a verified coach.',
    category: 'Coaching',
    readMin: 3,
    difficulty: 'Beginner',
    progress: 0,
  },
  {
    title: 'Choosing the Right Coach',
    desc: 'Specialization, reviews, PCT programs, and pricing.',
    category: 'Coaching',
    readMin: 5,
    difficulty: 'Intermediate',
    progress: 0,
  },
];

function GuidesContent() {
  return (
    <div className="fit-page">
      <WorldPageHeader title="Guides" subline={`Training knowledge · ${LEGACY.philosophy}`} />

      <div className="flex flex-col gap-3">
        {GUIDES.map((g) => (
          <PremiumCard key={g.title} className="guide-card premium-card--interactive">
            <div className="guide-card__meta">
              <span className="guide-card__tag">{g.category}</span>
              <span className="guide-card__tag">
                <Clock size={12} className="inline mr-1" />
                {g.readMin} min
              </span>
              <span className="guide-card__tag">
                <BarChart3 size={12} className="inline mr-1" />
                {g.difficulty}
              </span>
            </div>
            <p className="guide-card__title">{g.title}</p>
            <p className="guide-card__desc">{g.desc}</p>
            {g.progress > 0 && (
              <div className="guide-card__progress">
                <div className="guide-card__progress-fill" style={{ width: `${g.progress}%` }} />
              </div>
            )}
            <span className="announce-card__read mt-1 inline-flex items-center gap-1">
              Start guide <ChevronRight size={14} />
            </span>
          </PremiumCard>
        ))}
      </div>

      <Link href="/courses" className="fit-journey-link">
        Back to Courses →
      </Link>
    </div>
  );
}

export default function GuidesPage() {
  return (
    <ProtectedRoute>
      <GuidesContent />
    </ProtectedRoute>
  );
}
