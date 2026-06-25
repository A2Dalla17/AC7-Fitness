/**
 * AC7 Elite — Brand & Experience Layer
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  YOUR VISION (features — never rename or remove)        │
 * │  Seasons · Missions · Ranks · Certificates · PCT        │
 * │  Coaches · Community · Shop · Calendar · XP · Progress  │
 * └─────────────────────────────────────────────────────────┘
 *                          +
 * ┌─────────────────────────────────────────────────────────┐
 * │  LEGACY PHILOSOPHY (experience — how it feels)          │
 * │  Journey-first · Mission-first · Discipline · Legacy    │
 * └─────────────────────────────────────────────────────────┘
 *
 * Philosophy: Build Your Legacy Through Discipline.
 * Emotional goal: "I am becoming stronger, more disciplined,
 *                  and building something meaningful."
 */

/** Core AC7 systems — the product foundation (unchanged) */
export const FEATURES = {
  seasons: 'Seasons', // A1, A2, A3…
  missions: 'Missions',
  ranks: ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum', 'Ace', 'Master'] as const,
  certificates: 'Certificates',
  pct: 'Private Coach Training (PCT)',
  coaches: 'Verified Coaches',
  community: 'Community',
  publicChat: 'Public Chat',
  privateChat: 'Private Chat',
  announcements: 'Announcements',
  shop: 'Shop',
  calendar: 'Calendar',
  xp: 'XP',
  progress: 'Progress Tracking',
  courses: {
    missions: 'Missions',
    pct: 'PCT',
    challenges: 'Challenges',
    masterLevels: 'Master Levels',
  },
} as const;

export const LEGACY = {
  name: 'AC7 Elite',
  philosophy: 'Build Your Legacy Through Discipline.',
  tagline: 'Train. Rank. Conquer.',
  emotionalGoal:
    'I am becoming stronger, more disciplined, and building something meaningful.',
  pillars: ['Discipline', 'Progression', 'Achievement', 'Community', 'Legacy'] as const,
  /** UX order — features shown mission-first, stats second */
  pagePriority: [
    'Current Mission',
    'Next Stage',
    'Rank Progression',
    'Achievements & Certificates',
    'Community',
  ] as const,
} as const;

export const COPY = {
  nav: {
    home: 'Home',
    courses: 'Courses',
    community: 'Community',
    calendar: 'Calendar',
    shop: 'Shop',
  },

  /** Journey section labels — experience layer on top of real features */
  journey: {
    currentMission: 'Current mission',
    nextStage: 'Next stage',
    rankProgression: 'Rank progression',
    achievements: 'Achievements',
    community: FEATURES.community,
    seasonProgress: 'Season progress',
  },

  home: {
    greeting: (name: string) => `Welcome back, ${name}`,
    continueJourney: 'Continue Journey',
    missionProgress: 'Mission Progress',
    journeyProgress: 'Journey Progress',
    announcementsEmpty: 'No announcements right now.',
    communityHighlights: 'Community Highlights',
    challenges: 'Challenges',
    announcements: 'Announcements',
    hallOfFame: 'Hall of Fame',
    hallOfFameCta: 'See who is building their legacy',
    rankLabel: (season: string, rank: string) => `Season ${season} · ${rank}`,
    continueLabel: 'Continue mission',
    continueIdleTitle: 'Start your mission',
    continueIdleMeta: (season: string) => `Season ${season} · Missions await`,
    seasonCompleteTitle: 'Season complete',
    seasonCompleteCta: 'View certificate',
    nextStageDone: 'Season complete — certificate earned',
    nextStageLabel: (rank: string, stage: number, exercise: string) =>
      `${rank} · Stage ${stage} · ${exercise}`,
    seasonProgress: (code: string, pct: number, xp: number) =>
      `Season ${code} · ${pct}% complete · ${xp} XP`,
    communityCta: FEATURES.community,
    communityMeta: 'Public chat · private messages · announcements',
    achievementsEmpty: 'Complete missions to earn achievements',
    bookCoach: 'Book a coach (Calendar)',
    openMissions: 'Open missions',
    statsRank: 'Current Rank',
    statsXp: 'Total XP',
    statsStreak: 'Current Streak',
    statsMissions: 'Missions Done',
    weeklyProgress: 'Weekly Progress',
    monthlyProgress: 'Monthly Progress',
    xpThisWeek: 'XP This Week',
    momentum: 'Your Momentum',
  },

  courses: {
    title: FEATURES.courses.missions === 'Missions' ? 'Courses' : 'Courses',
    subline: LEGACY.philosophy,
    trainingHub: 'Training hub',
    currentMission: 'Current mission',
    yourPrograms: 'Your programs',
    missions: FEATURES.missions,
    missionsMeta: (season: string, rank: string, pct: number) =>
      `Season ${season} · ${rank} · ${pct}%`,
    pct: FEATURES.pct,
    pctMeta: 'Verified coaches · 1-on-1 training',
    challenges: FEATURES.courses.challenges,
    challengesMeta: 'Bonus missions · extra XP',
    masterLevels: FEATURES.courses.masterLevels,
    masterLevelsMeta: 'Coach-assigned Master rank stages',
    guides: 'Training guides',
    guidesMeta: 'Exercise form & tips',
    resume: 'Resume mission',
    statsStreak: 'Daily Streak',
    statsWeeklyXp: 'Weekly XP',
    statsTrainingTime: 'Training Time',
    statsCompletion: 'Completion',
  },

  missions: {
    title: FEATURES.missions,
    back: '← Courses',
    roadmapTitle: 'Your journey',
    roadmapSubline: 'Every rank is earned through discipline',
    stages: (rank: string) => `${rank} · mission stages`,
    rankPath: 'Bronze → Silver → Gold → Diamond → Platinum → Ace → Master',
    continue: (n: number) => `Continue · Stage ${n}`,
    viewAll: (n: number) => `View all ${n} stages →`,
    coachTools: 'Coach tools',
  },

  community: {
    nationEyebrow: 'The Nation',
    title: FEATURES.community,
    subline: 'Your fitness nation — chat, connect, stay accountable',
    publicChat: FEATURES.publicChat,
    privateChat: FEATURES.privateChat,
    announcements: FEATURES.announcements,
    filters: {
      all: 'Direct messages',
      coaches: FEATURES.coaches,
      clients: 'Members',
      search: 'Search users',
    },
    placeholder: 'Message the community…',
    emptyDm: 'No private chats yet. Search for a member or coach.',
    searchPlaceholder: 'Search members…',
    trending: 'Trending Topics',
    trendingTopics: ['#SeasonA1', '#Discipline', '#HallOfFame', '#PCT'],
    onlineMembers: 'Online Now',
    topContributors: 'Top Contributors',
    activeNow: 'Active',
    todaysChallenge: "Today's Challenge",
    challengeTitle: 'Complete 50 reps today',
    challengeMeta: 'Join the nation · earn bonus XP',
    statsLine: (n: number) => `${n}+ members building their legacy`,
  },

  calendar: {
    title: FEATURES.calendar,
    subline: 'Book sessions with verified coaches',
    pickCoach: 'Choose a verified coach',
    pickCoachMeta: 'Select a coach to book a session',
    upcoming: 'Upcoming sessions',
    confirm: 'Confirm booking',
    emptyTitle: 'Book Your First Session',
    emptyMeta: 'Connect with a verified coach and start your private training journey.',
    emptyCta: 'Find a Coach',
    sessionStats: 'Session Statistics',
    coachAvailability: 'Coach Availability',
    monthlyOverview: 'Monthly Overview',
  },

  shop: {
    title: FEATURES.shop,
    subline: 'Verified gear & supplements',
    search: 'Search products…',
    featured: 'Featured',
    all: 'All products',
    addToCart: 'Add to Cart',
    wishlist: 'Wishlist',
    sale: 'Sale',
  },

  profile: {
    title: 'Profile',
    legacySubline: 'Your legacy in AC7 Elite',
    rank: (role: string, rank: string, xp: number) => `${role} · ${rank} · ${xp} XP`,
    seasonProgress: 'Season progress',
    currentRank: 'Current rank',
    nextRank: 'Next rank',
    achievements: 'Achievements',
    achievementsEmpty: 'Complete mission stages to earn achievements.',
    certificates: FEATURES.certificates,
    certificatesEmpty: 'Complete a full season to earn your certificate.',
    settings: 'Settings',
    hallOfFameMember: 'Hall of Fame Member',
    seasonChampion: 'Season Champion',
    hallOfFame: 'Hall of Fame',
    viewHallOfFame: 'View Hall of Fame →',
    signOut: 'Sign out',
  },

  certificates: {
    title: FEATURES.certificates,
    subtitle: 'Earned by completing seasons — Bronze through Ace',
    empty: 'No certificates yet',
    emptyHint: 'Complete all ranks in a season to earn your certificate.',
    cta: 'Go to missions',
    modalHeading: 'Certificate of Completion',
    modalCertifies: 'This certifies that',
    modalCompleted: 'has successfully completed',
    modalIssued: 'Issued',
    modalFooter: 'AC7 Elite · Train. Rank. Conquer.',
  },

  hallOfFame: {
    title: 'Hall of Fame',
    subline: 'Where discipline becomes legacy',
    tagline: 'The most prestigious honor in AC7 Elite',
    loading: 'Loading the Hall of Fame…',
    demoNote: 'Preview data shown — apply migration 010_hall_of_fame.sql for live rankings.',
    empty: 'No warriors ranked yet. Be the first to earn your place.',
    warriors: {
      title: 'Top Warriors This Season',
      subtitle: 'Rank · Name · Level · XP · Season progress',
    },
    coaches: {
      title: 'Top Coaches',
      subtitle: 'Verified coaches shaping the next generation',
      empty: 'No coaches ranked yet.',
    },
    active: {
      title: 'Most Active Members',
      subtitle: 'Community impact · posts · contributions · challenges',
      empty: 'No community activity ranked yet.',
    },
    legacy: {
      title: 'Highest Legacy Score',
      subtitle: 'The true measure of your AC7 legacy',
      formulaTitle: 'Legacy Score combines:',
    },
    certificates: {
      title: 'Most Certificates Earned',
      subtitle: 'Season champions who finished the climb',
      empty: 'No certificates earned yet.',
    },
    badges: {
      title: 'Hall of Fame Titles',
      subtitle: 'Earned by reaching the Top 10 — displayed on your profile',
      list: [
        { emoji: '🏆', title: 'Warrior of the Season', desc: 'Top warrior this season' },
        { emoji: '🏅', title: 'Elite Coach', desc: 'Top verified coach' },
        { emoji: '🔥', title: 'Community Champion', desc: 'Most active in The Nation' },
        { emoji: '📜', title: 'Certificate Master', desc: 'Most certificates earned' },
        { emoji: '👑', title: 'Legacy Leader', desc: 'Highest legacy score' },
      ],
    },
  },

  train: {
    stageComplete: 'Mission stage complete!',
    stageCompleteBody: (reps: number, name: string, xp: number) =>
      `${reps} ${name.toLowerCase()} · +${xp} XP earned`,
    continue: 'Continue to next stage',
    exit: 'Exit',
  },

  defaultName: 'Athlete',
  defaultRank: 'Bronze',
} as const;

export function seasonLabel(code: string, name?: string): string {
  return name ? `Season ${code} · ${name}` : `Season ${code}`;
}
