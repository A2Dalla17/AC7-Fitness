'use client';

import { Crown, Flame, Medal, Scroll, ShieldCheck, Swords, Users } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import WorldPageHeader from '@/components/world/WorldPageHeader';
import {
  HallOfFameEmpty,
  HallOfFameEntry,
  HallOfFamePeriodTabs,
  HallOfFameSection,
} from '@/components/hall-of-fame/HallOfFameBlocks';
import { useHallOfFame } from '@/hooks/useHallOfFame';
import { COPY, LEGACY } from '@/lib/legacyBrand';
import { formatLegacyScore, LEGACY_WEIGHTS } from '@/lib/legacyScore';
import { HOF_PERIOD_LABELS } from '@/lib/hallOfFame';

function HallOfFameContent() {
  const { data, loading, period, setPeriod, usingDemo } = useHallOfFame('seasonal');

  const periodLabel = data ? HOF_PERIOD_LABELS[data.periodType] : HOF_PERIOD_LABELS.seasonal;

  return (
    <div className="fit-page fit-page--hof">
      <WorldPageHeader
        title={COPY.hallOfFame.title}
        subline={COPY.hallOfFame.subline}
        eyebrow={LEGACY.philosophy}
      />

      <div className="hof-hero">
        <Crown size={32} className="hof-hero__icon" aria-hidden />
        <p className="hof-hero__tagline">{COPY.hallOfFame.tagline}</p>
        {data && (
          <p className="hof-hero__period">
            {periodLabel} · {data.periodKey}
          </p>
        )}
      </div>

      <HallOfFamePeriodTabs period={period} onChange={setPeriod} />

      {usingDemo && (
        <p className="hof-demo-note">{COPY.hallOfFame.demoNote}</p>
      )}

      {loading ? (
        <p className="text-muted py-8">{COPY.hallOfFame.loading}</p>
      ) : !data ? null : (
        <div className="hof-sections">
          <HallOfFameSection
            icon={<Swords size={22} />}
            title={COPY.hallOfFame.warriors.title}
            subtitle={COPY.hallOfFame.warriors.subtitle}
            featured
          >
            {data.warriors.length === 0 ? (
              <HallOfFameEmpty message={COPY.hallOfFame.empty} />
            ) : (
              data.warriors.map((w) => (
                <HallOfFameEntry
                  key={w.userId}
                  rank={w.rank}
                  name={w.name}
                  primary={`${w.level} · ${w.xp.toLocaleString()} XP`}
                  secondary={`${w.seasonProgress}% season progress`}
                  highlight={w.rank === 1}
                />
              ))
            )}
          </HallOfFameSection>

          <HallOfFameSection
            icon={<ShieldCheck size={22} />}
            title={COPY.hallOfFame.coaches.title}
            subtitle={COPY.hallOfFame.coaches.subtitle}
          >
            {data.coaches.length === 0 ? (
              <HallOfFameEmpty message={COPY.hallOfFame.coaches.empty} />
            ) : (
              data.coaches.map((c) => (
                <HallOfFameEntry
                  key={c.userId}
                  rank={c.rank}
                  name={c.name}
                  primary={`${c.studentsTrained} students · ★ ${Number(c.rating).toFixed(1)}`}
                  secondary={`${c.certificatesProduced} certificates produced${c.verified ? ' · Verified' : ''}`}
                  highlight={c.rank === 1}
                />
              ))
            )}
          </HallOfFameSection>

          <HallOfFameSection
            icon={<Users size={22} />}
            title={COPY.hallOfFame.active.title}
            subtitle={COPY.hallOfFame.active.subtitle}
          >
            {data.activeMembers.length === 0 ? (
              <HallOfFameEmpty message={COPY.hallOfFame.active.empty} />
            ) : (
              data.activeMembers.map((m) => (
                <HallOfFameEntry
                  key={m.userId}
                  rank={m.rank}
                  name={m.name}
                  primary={`${m.posts} posts · ${m.comments} contributions · ${m.chatMessages} messages`}
                  secondary={`Activity score: ${m.activityScore}`}
                  highlight={m.rank === 1}
                />
              ))
            )}
          </HallOfFameSection>

          <HallOfFameSection
            icon={<Flame size={22} />}
            title={COPY.hallOfFame.legacy.title}
            subtitle={COPY.hallOfFame.legacy.subtitle}
            featured
          >
            <div className="hof-legacy-formula ac7-section-card">
              <p className="hof-legacy-formula__title">{COPY.hallOfFame.legacy.formulaTitle}</p>
              <ul className="hof-legacy-formula__list">
                <li>XP × {LEGACY_WEIGHTS.xp}</li>
                <li>Mission stages × {LEGACY_WEIGHTS.missionStage}</li>
                <li>Certificates × {LEGACY_WEIGHTS.certificate}</li>
                <li>Community × participation</li>
                <li>Seasons completed × {LEGACY_WEIGHTS.seasonComplete}</li>
                <li>Consistency streak × {LEGACY_WEIGHTS.streakDay}/day</li>
              </ul>
            </div>
            {data.legacyLeaders.length === 0 ? (
              <HallOfFameEmpty message={COPY.hallOfFame.empty} />
            ) : (
              data.legacyLeaders.map((l) => (
                <HallOfFameEntry
                  key={l.userId}
                  rank={l.rank}
                  name={l.name}
                  primary={`Legacy Score: ${formatLegacyScore(l.legacyScore)}`}
                  secondary={`${l.level} · ${l.seasonsCompleted} season${l.seasonsCompleted !== 1 ? 's' : ''} completed`}
                  highlight={l.rank === 1}
                />
              ))
            )}
          </HallOfFameSection>

          <HallOfFameSection
            icon={<Scroll size={22} />}
            title={COPY.hallOfFame.certificates.title}
            subtitle={COPY.hallOfFame.certificates.subtitle}
          >
            {data.certificateMasters.length === 0 ? (
              <HallOfFameEmpty message={COPY.hallOfFame.certificates.empty} />
            ) : (
              data.certificateMasters.map((c) => (
                <HallOfFameEntry
                  key={c.userId}
                  rank={c.rank}
                  name={c.name}
                  primary={`${c.certificatesEarned} certificate${c.certificatesEarned !== 1 ? 's' : ''} earned`}
                  secondary={`Highest rank: ${c.highestRank}`}
                  highlight={c.rank === 1}
                />
              ))
            )}
          </HallOfFameSection>

          <section className="hof-badges-section ac7-section-card">
            <header className="hof-section__header">
              <span className="hof-section__icon">
                <Medal size={22} />
              </span>
              <div>
                <h2 className="hof-section__title">{COPY.hallOfFame.badges.title}</h2>
                <p className="hof-section__subtitle">{COPY.hallOfFame.badges.subtitle}</p>
              </div>
            </header>
            <div className="hof-badges-grid">
              {COPY.hallOfFame.badges.list.map((b) => (
                <div key={b.title} className="hof-badge-card">
                  <span className="hof-badge-card__emoji">{b.emoji}</span>
                  <p className="hof-badge-card__title">{b.title}</p>
                  <p className="hof-badge-card__desc">{b.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function HallOfFamePage() {
  return (
    <ProtectedRoute>
      <HallOfFameContent />
    </ProtectedRoute>
  );
}
