import type { SeasonRank } from '@/lib/seasons';

/** Display names for the mission journey roadmap */
export const RANK_DISPLAY: Record<SeasonRank, string> = {
  Bronze: 'Bronze Warrior',
  Silver: 'Silver Warrior',
  Gold: 'Gold Warrior',
  Diamond: 'Diamond Elite',
  Platinum: 'Platinum Elite',
  'Ace 1': 'Ace I',
  'Ace 2': 'Ace II',
  'Ace 3': 'Ace III',
  'Ace 4': 'Ace IV',
  'Ace 5': 'Ace V',
  Master: 'Master',
};

export const LEGEND_LABEL = 'Legend';

export function rankDisplayName(rank: SeasonRank): string {
  return RANK_DISPLAY[rank];
}
