'use client';

import Link from 'next/link';
import { Flame, Hash, Trophy, Users, Zap } from 'lucide-react';
import PremiumCard from '@/components/premium/PremiumCard';
import { useCopy } from '@/context/LanguageContext';

interface CommunityWidgetsProps {
  memberCount?: number;
  onlineCount?: number;
}

/** Live community layer above chat — ecosystem feel */
export default function CommunityWidgets({
  memberCount = 0,
  onlineCount = 0,
}: CommunityWidgetsProps) {
  const COPY = useCopy();
  const topics = COPY.community.trendingTopics;
  const online = onlineCount || Math.max(3, Math.min(memberCount, 24));

  return (
    <div className="community-widgets">
      <div className="community-widgets__stats">
        <PremiumCard className="community-widget">
          <Users size={18} className="community-widget__icon" />
          <div>
            <p className="community-widget__label">{COPY.community.onlineMembers}</p>
            <p className="community-widget__value">{online}</p>
          </div>
        </PremiumCard>
        <PremiumCard className="community-widget">
          <Zap size={18} className="community-widget__icon" />
          <div>
            <p className="community-widget__label">{COPY.community.topContributors}</p>
            <p className="community-widget__value">{COPY.community.activeNow}</p>
          </div>
        </PremiumCard>
      </div>

      <PremiumCard className="community-challenge" glow href="/courses">
        <Trophy size={20} className="community-challenge__icon" />
        <div>
          <p className="community-challenge__label">{COPY.community.todaysChallenge}</p>
          <p className="community-challenge__title">{COPY.community.challengeTitle}</p>
          <p className="community-challenge__meta">{COPY.community.challengeMeta}</p>
        </div>
      </PremiumCard>

      <div className="community-topics">
        <p className="community-topics__title">
          <Hash size={14} /> {COPY.community.trending}
        </p>
        <div className="community-topics__list">
          {topics.map((t) => (
            <Link key={t} href="/community" className="community-topic-pill">
              {t}
            </Link>
          ))}
        </div>
      </div>

      <PremiumCard className="community-stat-strip">
        <Flame size={16} className="text-orange-400" />
        <span>{COPY.community.statsLine(memberCount || online * 4)}</span>
      </PremiumCard>
    </div>
  );
}
