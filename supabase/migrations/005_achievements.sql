-- AC7 Fitness — Achievements (badges earned alongside the mission/XP system)
create table if not exists public.achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  key text not null,
  label text not null,
  earned_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  unique (user_id, key)
);

alter table public.achievements enable row level security;

drop policy if exists "user can read own achievements" on public.achievements;
create policy "user can read own achievements" on public.achievements
  for select using (auth.uid() = user_id);

drop policy if exists "user can insert own achievements" on public.achievements;
create policy "user can insert own achievements" on public.achievements
  for insert with check (auth.uid() = user_id);
