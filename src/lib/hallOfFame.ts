/**
 * Hall of Fame — types, badges, and client fetch helpers.
 */

export type HallOfFamePeriod = 'seasonal' | 'monthly' | 'all_time';

export const HOF_BADGES = {
  warrior_of_season: { emoji: '🏆', title: 'Warrior of the Season' },
  elite_coach: { emoji: '🏅', title: 'Elite Coach' },
  community_champion: { emoji: '🔥', title: 'Community Champion' },
  certificate_master: { emoji: '📜', title: 'Certificate Master' },
  legacy_leader: { emoji: '👑', title: 'Legacy Leader' },
} as const;

export type HofBadgeKey = keyof typeof HOF_BADGES;

export interface HofWarrior {
  rank: number;
  userId: string;
  name: string;
  level: string;
  xp: number;
  seasonProgress: number;
}

export interface HofCoach {
  rank: number;
  userId: string;
  name: string;
  verified: boolean;
  rating: number;
  studentsTrained: number;
  certificatesProduced: number;
}

export interface HofActiveMember {
  rank: number;
  userId: string;
  name: string;
  posts: number;
  comments: number;
  chatMessages: number;
  activityScore: number;
}

export interface HofLegacyLeader {
  rank: number;
  userId: string;
  name: string;
  legacyScore: number;
  level: string;
  seasonsCompleted: number;
}

export interface HofCertificateMaster {
  rank: number;
  userId: string;
  name: string;
  certificatesEarned: number;
  highestRank: string;
}

export interface HallOfFameData {
  periodType: HallOfFamePeriod;
  periodKey: string;
  warriors: HofWarrior[];
  coaches: HofCoach[];
  activeMembers: HofActiveMember[];
  legacyLeaders: HofLegacyLeader[];
  certificateMasters: HofCertificateMaster[];
}

export interface HallOfFameProfileStatus {
  isMember: boolean;
  isChampion: boolean;
  awards: {
    badgeKey: HofBadgeKey;
    label: string;
    rankPosition: number;
    periodType: HallOfFamePeriod;
    periodKey: string;
  }[];
}

export const HOF_PERIOD_LABELS: Record<HallOfFamePeriod, string> = {
  seasonal: 'This Season',
  monthly: 'This Month',
  all_time: 'All-Time',
};

export function parseHallOfFameData(raw: Record<string, unknown>): HallOfFameData {
  return {
    periodType: (raw.periodType as HallOfFamePeriod) ?? 'seasonal',
    periodKey: String(raw.periodKey ?? ''),
    warriors: (raw.warriors as HofWarrior[]) ?? [],
    coaches: (raw.coaches as HofCoach[]) ?? [],
    activeMembers: (raw.activeMembers as HofActiveMember[]) ?? [],
    legacyLeaders: (raw.legacyLeaders as HofLegacyLeader[]) ?? [],
    certificateMasters: (raw.certificateMasters as HofCertificateMaster[]) ?? [],
  };
}

export function parseHallOfFameProfile(raw: Record<string, unknown>): HallOfFameProfileStatus {
  return {
    isMember: Boolean(raw.isMember),
    isChampion: Boolean(raw.isChampion),
    awards: ((raw.awards as HallOfFameProfileStatus['awards']) ?? []),
  };
}

/** Client-side fallback when RPC is unavailable (dev/demo) */
export function demoHallOfFameData(period: HallOfFamePeriod): HallOfFameData {
  return {
    periodType: period,
    periodKey: period === 'seasonal' ? 'A1' : period === 'monthly' ? '2026-06' : 'all',
    warriors: [
      { rank: 1, userId: 'demo-1', name: 'Marcus Steele', level: 'Gold', xp: 4200, seasonProgress: 68 },
      { rank: 2, userId: 'demo-2', name: 'Aisha Khan', level: 'Silver', xp: 3100, seasonProgress: 54 },
      { rank: 3, userId: 'demo-3', name: 'Jordan Reyes', level: 'Silver', xp: 2800, seasonProgress: 49 },
    ],
    coaches: [
      { rank: 1, userId: 'demo-c1', name: 'Coach Elena', verified: true, rating: 4.9, studentsTrained: 42, certificatesProduced: 18 },
      { rank: 2, userId: 'demo-c2', name: 'Coach Darius', verified: true, rating: 4.8, studentsTrained: 35, certificatesProduced: 12 },
    ],
    activeMembers: [
      { rank: 1, userId: 'demo-a1', name: 'Priya N.', posts: 24, comments: 56, chatMessages: 120, activityScore: 200 },
      { rank: 2, userId: 'demo-a2', name: 'Tyler M.', posts: 18, comments: 40, chatMessages: 95, activityScore: 153 },
    ],
    legacyLeaders: [
      { rank: 1, userId: 'demo-l1', name: 'Marcus Steele', legacyScore: 12450, level: 'Gold', seasonsCompleted: 1 },
      { rank: 2, userId: 'demo-l2', name: 'Aisha Khan', legacyScore: 9820, level: 'Silver', seasonsCompleted: 0 },
    ],
    certificateMasters: [
      { rank: 1, userId: 'demo-cert1', name: 'Marcus Steele', certificatesEarned: 2, highestRank: 'Gold' },
      { rank: 2, userId: 'demo-cert2', name: 'Legacy Vet', certificatesEarned: 1, highestRank: 'Platinum' },
    ],
  };
}
