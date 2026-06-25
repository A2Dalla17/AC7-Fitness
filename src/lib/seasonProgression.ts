import type { SupabaseClient } from '@supabase/supabase-js';
import { rankForXp } from '@/types';
import {
  RANK_STAGE_COUNTS,
  SEASON_RANK_ORDER,
  SeasonRank,
  stagesForRank,
  totalStagesInSeason,
} from '@/lib/seasons';

export const XP_PER_REP = 1;
export const STAGE_COMPLETION_BONUS = 25;
export const SEASON_COMPLETION_BONUS = 500;

/** Ranks that must be cleared to earn a season certificate (Master is coach-driven). */
export const COMPLETABLE_RANKS = SEASON_RANK_ORDER.filter((r) => r !== 'Master') as SeasonRank[];

export interface SeasonRow {
  id: string;
  code: string;
  name: string;
  starts_on: string;
  ends_on: string;
}

export interface SeasonEnrollmentRow {
  id: string;
  user_id: string;
  season_id: string;
  started_at: string;
  completed_at: string | null;
  seasons?: SeasonRow;
}

export interface StageCompletionRow {
  rank: string;
  stage_index: number;
  reps_done: number | null;
  completed_at: string;
}

export interface SeasonProgressState {
  season: SeasonRow;
  enrollment: SeasonEnrollmentRow;
  completions: Set<string>;
  currentRankIndex: number;
  currentRank: SeasonRank;
  seasonComplete: boolean;
  progressPercent: number;
  completedStageCount: number;
  totalStageCount: number;
}

export function rankToSlug(rank: SeasonRank): string {
  return rank.toLowerCase().replace(/\s+/g, '-');
}

export function missionRankPath(rank: SeasonRank): string {
  return `/missions/${rankToSlug(rank)}`;
}

export function missionTrainPath(rank: SeasonRank, stageIndex: number): string {
  return `/missions/${rankToSlug(rank)}/train/${stageIndex}`;
}

export function slugToRank(slug: string): SeasonRank | null {
  const normalized = slug.toLowerCase();
  return SEASON_RANK_ORDER.find((r) => rankToSlug(r) === normalized) ?? null;
}

export function completionKey(rank: SeasonRank, stageIndex: number): string {
  return `${rank}:${stageIndex}`;
}

export function buildCompletionSet(rows: Pick<StageCompletionRow, 'rank' | 'stage_index'>[]): Set<string> {
  return new Set(rows.map((r) => completionKey(r.rank as SeasonRank, r.stage_index)));
}

export function isStageComplete(completions: Set<string>, rank: SeasonRank, stageIndex: number): boolean {
  return completions.has(completionKey(rank, stageIndex));
}

export function isRankComplete(completions: Set<string>, rank: SeasonRank): boolean {
  const count = RANK_STAGE_COUNTS[rank];
  if (count === 0) return false;
  for (let i = 0; i < count; i++) {
    if (!isStageComplete(completions, rank, i)) return false;
  }
  return true;
}

export function isRankUnlocked(completions: Set<string>, rank: SeasonRank): boolean {
  if (rank === 'Master') return isRankComplete(completions, 'Ace 5');
  const idx = COMPLETABLE_RANKS.indexOf(rank);
  if (idx <= 0) return true;
  return isRankComplete(completions, COMPLETABLE_RANKS[idx - 1]);
}

export function isStageUnlocked(
  completions: Set<string>,
  rank: SeasonRank,
  stageIndex: number,
): boolean {
  if (!isRankUnlocked(completions, rank)) return false;
  if (stageIndex === 0) return true;
  return isStageComplete(completions, rank, stageIndex - 1);
}

export function completedStagesInRank(completions: Set<string>, rank: SeasonRank): number {
  let done = 0;
  for (let i = 0; i < RANK_STAGE_COUNTS[rank]; i++) {
    if (isStageComplete(completions, rank, i)) done++;
  }
  return done;
}

export function currentRankIndex(completions: Set<string>): number {
  for (let i = 0; i < COMPLETABLE_RANKS.length; i++) {
    if (!isRankComplete(completions, COMPLETABLE_RANKS[i])) return i;
  }
  return COMPLETABLE_RANKS.length - 1;
}

export function isSeasonComplete(completions: Set<string>): boolean {
  return COMPLETABLE_RANKS.every((r) => isRankComplete(completions, r));
}

export function seasonProgressPercent(completions: Set<string>): number {
  const total = totalStagesInSeason();
  if (total === 0) return 0;
  let done = 0;
  for (const rank of COMPLETABLE_RANKS) {
    done += completedStagesInRank(completions, rank);
  }
  return Math.round((done / total) * 100);
}

export function nextIncompleteStage(
  completions: Set<string>,
): { rank: SeasonRank; stageIndex: number } | null {
  for (const rank of COMPLETABLE_RANKS) {
    if (!isRankUnlocked(completions, rank)) return null;
    const count = RANK_STAGE_COUNTS[rank];
    for (let i = 0; i < count; i++) {
      if (!isStageComplete(completions, rank, i)) return { rank, stageIndex: i };
    }
  }
  return null;
}

export function nextSeasonCode(code: string): string {
  const match = code.match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return `${code}2`;
  return `${match[1]}${parseInt(match[2], 10) + 1}`;
}

export function buildProgressState(
  season: SeasonRow,
  enrollment: SeasonEnrollmentRow,
  completionRows: StageCompletionRow[],
): SeasonProgressState {
  const completions = buildCompletionSet(completionRows);
  const idx = currentRankIndex(completions);
  const totalStageCount = totalStagesInSeason();
  let completedStageCount = 0;
  for (const rank of COMPLETABLE_RANKS) {
    completedStageCount += completedStagesInRank(completions, rank);
  }
  return {
    season,
    enrollment,
    completions,
    currentRankIndex: idx,
    currentRank: COMPLETABLE_RANKS[idx],
    seasonComplete: isSeasonComplete(completions),
    progressPercent: seasonProgressPercent(completions),
    completedStageCount,
    totalStageCount,
  };
}

export async function fetchStageCompletions(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
): Promise<StageCompletionRow[]> {
  const { data, error } = await supabase
    .from('stage_completions')
    .select('rank, stage_index, reps_done, completed_at')
    .eq('user_id', userId)
    .eq('season_id', seasonId);
  if (error) throw error;
  return (data ?? []) as StageCompletionRow[];
}

async function enrollInSeason(
  supabase: SupabaseClient,
  userId: string,
  seasonCode: string,
): Promise<SeasonEnrollmentRow | null> {
  const { data: season, error: seasonErr } = await supabase
    .from('seasons')
    .select('*')
    .eq('code', seasonCode)
    .maybeSingle();
  if (seasonErr) throw seasonErr;
  if (!season) return null;

  const { data: created, error: insertErr } = await supabase
    .from('season_enrollments')
    .insert({ user_id: userId, season_id: season.id })
    .select('*, seasons(*)')
    .single();
  if (insertErr?.code === '23505') {
    const { data: existing } = await supabase
      .from('season_enrollments')
      .select('*, seasons(*)')
      .eq('user_id', userId)
      .eq('season_id', season.id)
      .maybeSingle();
    return (existing as SeasonEnrollmentRow) ?? null;
  }
  if (insertErr) throw insertErr;
  return created as SeasonEnrollmentRow;
}

/** Returns the user's active (incomplete) season enrollment, enrolling in A1 if needed. */
export async function ensureActiveSeasonEnrollment(
  supabase: SupabaseClient,
  userId: string,
): Promise<SeasonEnrollmentRow | null> {
  const { data: active, error: activeErr } = await supabase
    .from('season_enrollments')
    .select('*, seasons(*)')
    .eq('user_id', userId)
    .is('completed_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (activeErr) throw activeErr;
  if (active) return active as SeasonEnrollmentRow;

  const { data: latestCompleted } = await supabase
    .from('season_enrollments')
    .select('*, seasons(*)')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestCompleted?.seasons) {
    const season = latestCompleted.seasons as SeasonRow;
    const nextCode = nextSeasonCode(season.code);
    const nextEnrollment = await enrollInSeason(supabase, userId, nextCode);
    if (nextEnrollment && !nextEnrollment.completed_at) return nextEnrollment;
    return latestCompleted as SeasonEnrollmentRow;
  }

  const { data: anyEnrollment } = await supabase
    .from('season_enrollments')
    .select('*, seasons(*)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (anyEnrollment) return anyEnrollment as SeasonEnrollmentRow;

  return enrollInSeason(supabase, userId, 'A1');
}

export async function loadSeasonProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<SeasonProgressState | null> {
  const enrollment = await ensureActiveSeasonEnrollment(supabase, userId);
  if (!enrollment?.seasons) return null;
  const season = enrollment.seasons as SeasonRow;
  const completionRows = await fetchStageCompletions(supabase, userId, season.id);
  return buildProgressState(season, enrollment, completionRows);
}

export interface RecordStageResult {
  success: boolean;
  xpAwarded: number;
  seasonCompleted?: boolean;
  certificateTitle?: string;
  nextRankUnlocked?: SeasonRank;
}

async function awardXp(supabase: SupabaseClient, userId: string, amount: number): Promise<void> {
  const { data: row } = await supabase.from('missions').select('xp').eq('user_id', userId).maybeSingle();
  const newXp = (row?.xp ?? 0) + amount;
  await supabase
    .from('missions')
    .update({ xp: newXp, level: rankForXp(newXp).rank })
    .eq('user_id', userId);
}

async function completeSeasonIfReady(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
  completions: Set<string>,
): Promise<RecordStageResult | null> {
  if (!isSeasonComplete(completions)) return null;

  const { data: season, error: seasonErr } = await supabase
    .from('seasons')
    .select('code, name')
    .eq('id', seasonId)
    .single();
  if (seasonErr) throw seasonErr;

  await supabase
    .from('season_enrollments')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('season_id', seasonId);

  const title = `${season.name} — Season Complete`;
  await supabase
    .from('certificates')
    .upsert({ user_id: userId, season_id: seasonId, title }, { onConflict: 'user_id,season_id' });

  await supabase.from('achievements').upsert(
    {
      user_id: userId,
      key: `season_${season.code}_complete`,
      label: `${season.code} Champion`,
    },
    { onConflict: 'user_id,key' },
  );

  await awardXp(supabase, userId, SEASON_COMPLETION_BONUS);

  const nextCode = nextSeasonCode(season.code);
  const { data: nextSeason } = await supabase.from('seasons').select('id').eq('code', nextCode).maybeSingle();
  if (nextSeason) {
    await supabase.from('season_enrollments').insert({ user_id: userId, season_id: nextSeason.id });
  }

  return {
    success: true,
    xpAwarded: SEASON_COMPLETION_BONUS,
    seasonCompleted: true,
    certificateTitle: title,
  };
}

/** Persist a completed stage and run rank/season progression side effects. */
export async function recordStageCompletion(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
  rank: SeasonRank,
  stageIndex: number,
  repsDone: number,
): Promise<RecordStageResult> {
  const beforeRows = await fetchStageCompletions(supabase, userId, seasonId);
  const before = buildCompletionSet(beforeRows);
  const rankWasComplete = isRankComplete(before, rank);

  const { error: insertErr } = await supabase.from('stage_completions').insert({
    user_id: userId,
    season_id: seasonId,
    rank,
    stage_index: stageIndex,
    reps_done: repsDone,
  });
  if (insertErr && insertErr.code !== '23505') throw insertErr;

  const xpAwarded = repsDone * XP_PER_REP + STAGE_COMPLETION_BONUS;
  await awardXp(supabase, userId, xpAwarded);
  await syncLegacyStageProgress(supabase, userId, seasonId);

  const afterRows = await fetchStageCompletions(supabase, userId, seasonId);
  const completions = buildCompletionSet(afterRows);

  const nextRankUnlocked =
    !rankWasComplete && isRankComplete(completions, rank)
      ? (COMPLETABLE_RANKS[COMPLETABLE_RANKS.indexOf(rank) + 1] ?? undefined)
      : undefined;

  const seasonResult = await completeSeasonIfReady(supabase, userId, seasonId, completions);
  if (seasonResult) {
    return { ...seasonResult, xpAwarded: xpAwarded + seasonResult.xpAwarded, nextRankUnlocked };
  }

  return { success: true, xpAwarded, nextRankUnlocked };
}

/** Sync legacy missions.stage_progress jsonb from season completions (best-effort). */
export async function syncLegacyStageProgress(
  supabase: SupabaseClient,
  userId: string,
  seasonId: string,
): Promise<void> {
  const rows = await fetchStageCompletions(supabase, userId, seasonId);
  const completions = buildCompletionSet(rows);
  const stageProgress: Record<string, boolean[]> = {};

  for (const rank of COMPLETABLE_RANKS) {
    const count = RANK_STAGE_COUNTS[rank];
    stageProgress[rank] = Array.from({ length: count }, (_, i) => isStageComplete(completions, rank, i));
  }

  await supabase.from('missions').update({ stage_progress: stageProgress }).eq('user_id', userId);
}

export function exerciseForStage(rank: SeasonRank, stageIndex: number) {
  const stages = stagesForRank(rank);
  return stages[stageIndex] ?? null;
}
