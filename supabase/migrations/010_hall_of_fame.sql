-- AC7 Elite — Hall of Fame (prestigious rankings, legacy scores, profile badges)

create table if not exists public.hall_of_fame_awards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  badge_key text not null check (badge_key in (
    'warrior_of_season', 'elite_coach', 'community_champion',
    'certificate_master', 'legacy_leader'
  )),
  period_type text not null check (period_type in ('monthly', 'seasonal', 'all_time')),
  period_key text not null,
  rank_position int not null check (rank_position >= 1 and rank_position <= 10),
  label text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_key, period_type, period_key)
);

create index if not exists hof_awards_user_idx on public.hall_of_fame_awards (user_id);
alter table public.hall_of_fame_awards enable row level security;

drop policy if exists hof_awards_read on public.hall_of_fame_awards;
create policy hof_awards_read on public.hall_of_fame_awards
  for select using (auth.uid() is not null);

drop policy if exists achievements_hof_read on public.achievements;
create policy achievements_hof_read on public.achievements
  for select using (auth.uid() is not null and key like 'hof_%');

drop policy if exists certificates_hof_read on public.certificates;
create policy certificates_hof_read on public.certificates
  for select using (auth.uid() is not null);

drop policy if exists missions_hof_read on public.missions;
create policy missions_hof_read on public.missions
  for select using (auth.uid() is not null);

drop policy if exists sc_hof_read on public.stage_completions;
create policy sc_hof_read on public.stage_completions
  for select using (auth.uid() is not null);

drop policy if exists se_hof_read on public.season_enrollments;
create policy se_hof_read on public.season_enrollments
  for select using (auth.uid() is not null);

create or replace function public.compute_legacy_score(
  p_xp int, p_stages int, p_certificates int,
  p_posts int, p_comments int, p_chat int,
  p_seasons_completed int, p_streak_days int
) returns int language sql immutable as $$
  select (
    coalesce(p_xp, 0) * 1 + coalesce(p_stages, 0) * 50
    + coalesce(p_certificates, 0) * 500 + coalesce(p_posts, 0) * 15
    + coalesce(p_comments, 0) * 8 + coalesce(p_chat, 0) * 3
    + coalesce(p_seasons_completed, 0) * 1500 + coalesce(p_streak_days, 0) * 30
  )::int;
$$;

create or replace function public.hof_period_key(p_period text)
returns table(period_type text, period_key text, season_id uuid)
language plpgsql stable as $$
declare v_season record;
begin
  if p_period = 'monthly' then
    period_type := 'monthly';
    period_key := to_char(current_date, 'YYYY-MM');
    select id into season_id from public.seasons
      where starts_on <= current_date and ends_on >= current_date limit 1;
    return next;
  elsif p_period = 'all_time' then
    period_type := 'all_time'; period_key := 'all'; season_id := null;
    return next;
  else
    select * into v_season from public.seasons
      where starts_on <= current_date and ends_on >= current_date
      order by starts_on desc limit 1;
    if v_season.id is null then
      select * into v_season from public.seasons order by starts_on desc limit 1;
    end if;
    period_type := 'seasonal';
    period_key := coalesce(v_season.code, 'A1');
    season_id := v_season.id;
    return next;
  end if;
end; $$;

create or replace function public.get_hall_of_fame_inner(p_period text default 'seasonal')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_period record; v_result jsonb;
begin
  select * into v_period from public.hof_period_key(p_period);

  with user_stats as (
    select u.id as user_id, u.name,
      coalesce(m.xp, 0) as xp, coalesce(m.level, 'Bronze') as level,
      (select count(*)::int from public.stage_completions sc where sc.user_id = u.id
        and (v_period.season_id is null or sc.season_id = v_period.season_id)
        and (p_period != 'monthly' or sc.completed_at >= date_trunc('month', current_date))) as stages_completed,
      (select count(*)::int from public.certificates c where c.user_id = u.id) as certificate_count,
      (select count(*)::int from public.community_posts cp where cp.author_id = u.id
        and (p_period != 'monthly' or to_timestamp(cp.created_at / 1000.0) >= date_trunc('month', current_date))) as post_count,
      (select count(*)::int from public.community_comments cc where cc.author_id = u.id
        and (p_period != 'monthly' or to_timestamp(cc.created_at / 1000.0) >= date_trunc('month', current_date))) as comment_count,
      (select count(*)::int from public.chat_messages cm where cm.sender_id = u.id
        and (p_period != 'monthly' or cm.created_at >= date_trunc('month', current_date))) as chat_count,
      (select count(*)::int from public.season_enrollments se
        where se.user_id = u.id and se.completed_at is not null) as seasons_completed,
      (select count(distinct date(sc.completed_at))::int from public.stage_completions sc
        where sc.user_id = u.id and sc.completed_at >= current_date - interval '30 days') as streak_days,
      (select case when v_period.season_id is null then 0 else
        round((count(sc.id)::numeric / 156.0) * 100)::int end
        from public.stage_completions sc where sc.user_id = u.id and sc.season_id = v_period.season_id) as season_progress
    from public.users u left join public.missions m on m.user_id = u.id
    where u.role is distinct from 'admin'
  ),
  warriors_ranked as (
    select user_id, name, xp, level, coalesce(season_progress, 0) as season_progress,
      row_number() over (order by coalesce(season_progress, 0) desc, xp desc) as rank from user_stats
  ),
  legacy_ranked as (
    select user_id, name, level, seasons_completed,
      public.compute_legacy_score(xp, stages_completed, certificate_count,
        post_count, comment_count, chat_count, seasons_completed, streak_days) as legacy_score,
      row_number() over (order by public.compute_legacy_score(
        xp, stages_completed, certificate_count,
        post_count, comment_count, chat_count, seasons_completed, streak_days) desc) as rank
    from user_stats
  ),
  active_ranked as (
    select user_id, name, post_count, comment_count, chat_count,
      (post_count + comment_count + chat_count) as activity_score,
      row_number() over (order by (post_count * 2 + comment_count + chat_count) desc) as rank
    from user_stats where (post_count + comment_count + chat_count) > 0
  ),
  cert_ranked as (
    select user_id, name, certificate_count, level,
      row_number() over (order by certificate_count desc, xp desc) as rank
    from user_stats where certificate_count > 0
  ),
  coach_stats as (
    select c.user_id, c.name, c.verified, c.rating, c.review_count,
      (select count(distinct b.client_id)::int from public.bookings b
        where b.coach_id = c.user_id and b.status in ('completed', 'confirmed')) as students_trained,
      (select count(*)::int from public.certificates cert where cert.user_id in (
        select distinct b.client_id from public.bookings b
        where b.coach_id = c.user_id and b.status = 'completed')) as certificates_produced
    from public.coaches c
  ),
  coaches_ranked as (
    select user_id, name, verified, rating, students_trained, certificates_produced,
      row_number() over (order by students_trained desc, rating desc) as rank from coach_stats
  )
  select jsonb_build_object(
    'periodType', v_period.period_type, 'periodKey', v_period.period_key,
    'warriors', coalesce((select jsonb_agg(jsonb_build_object(
      'rank', rank, 'userId', user_id, 'name', name, 'level', level,
      'xp', xp, 'seasonProgress', season_progress) order by rank)
      from warriors_ranked where rank <= 10), '[]'::jsonb),
    'coaches', coalesce((select jsonb_agg(jsonb_build_object(
      'rank', rank, 'userId', user_id, 'name', name, 'verified', verified,
      'rating', rating, 'studentsTrained', students_trained,
      'certificatesProduced', certificates_produced) order by rank)
      from coaches_ranked where rank <= 10), '[]'::jsonb),
    'activeMembers', coalesce((select jsonb_agg(jsonb_build_object(
      'rank', rank, 'userId', user_id, 'name', name, 'posts', post_count,
      'comments', comment_count, 'chatMessages', chat_count,
      'activityScore', activity_score) order by rank)
      from active_ranked where rank <= 10), '[]'::jsonb),
    'legacyLeaders', coalesce((select jsonb_agg(jsonb_build_object(
      'rank', rank, 'userId', user_id, 'name', name, 'legacyScore', legacy_score,
      'level', level, 'seasonsCompleted', seasons_completed) order by rank)
      from legacy_ranked where rank <= 10), '[]'::jsonb),
    'certificateMasters', coalesce((select jsonb_agg(jsonb_build_object(
      'rank', rank, 'userId', user_id, 'name', name,
      'certificatesEarned', certificate_count, 'highestRank', level) order by rank)
      from cert_ranked where rank <= 10), '[]'::jsonb)
  ) into v_result;
  return v_result;
end; $$;

create or replace function public.sync_hall_of_fame_awards(p_period text default 'seasonal')
returns void language plpgsql security definer set search_path = public as $$
declare
  v_data jsonb; v_period record; v_entry jsonb; v_badge jsonb; v_field text;
  v_badges jsonb := '[
    {"key":"warrior_of_season","label":"🏆 Warrior of the Season","field":"warriors"},
    {"key":"elite_coach","label":"🏅 Elite Coach","field":"coaches"},
    {"key":"community_champion","label":"🔥 Community Champion","field":"activeMembers"},
    {"key":"legacy_leader","label":"👑 Legacy Leader","field":"legacyLeaders"},
    {"key":"certificate_master","label":"📜 Certificate Master","field":"certificateMasters"}
  ]'::jsonb;
begin
  select * into v_period from public.hof_period_key(p_period);
  v_data := public.get_hall_of_fame_inner(p_period);
  for v_badge in select * from jsonb_array_elements(v_badges) loop
    v_field := v_badge->>'field';
    for v_entry in select * from jsonb_array_elements(coalesce(v_data->v_field, '[]'::jsonb)) loop
      insert into public.hall_of_fame_awards (user_id, badge_key, period_type, period_key, rank_position, label)
      values ((v_entry->>'userId')::uuid, v_badge->>'key', v_period.period_type, v_period.period_key,
        (v_entry->>'rank')::int, v_badge->>'label')
      on conflict (user_id, badge_key, period_type, period_key)
      do update set rank_position = excluded.rank_position, awarded_at = now();
      insert into public.achievements (user_id, key, label)
      values ((v_entry->>'userId')::uuid,
        'hof_' || (v_badge->>'key') || '_' || v_period.period_type || '_' || v_period.period_key,
        v_badge->>'label')
      on conflict (user_id, key) do update set label = excluded.label;
    end loop;
  end loop;
end; $$;

create or replace function public.get_hall_of_fame(p_period text default 'seasonal')
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_result jsonb;
begin
  v_result := public.get_hall_of_fame_inner(p_period);
  perform public.sync_hall_of_fame_awards(p_period);
  return v_result;
end; $$;

create or replace function public.get_hall_of_fame_profile(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_awards jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'badgeKey', badge_key, 'label', label, 'rankPosition', rank_position,
    'periodType', period_type, 'periodKey', period_key) order by rank_position), '[]'::jsonb)
  into v_awards from public.hall_of_fame_awards where user_id = p_user_id;
  return jsonb_build_object(
    'isMember', exists (select 1 from public.hall_of_fame_awards where user_id = p_user_id and rank_position <= 10),
    'isChampion', exists (select 1 from public.hall_of_fame_awards where user_id = p_user_id and rank_position = 1),
    'awards', v_awards
  );
end; $$;

grant execute on function public.get_hall_of_fame(text) to authenticated;
grant execute on function public.get_hall_of_fame_profile(uuid) to authenticated;
