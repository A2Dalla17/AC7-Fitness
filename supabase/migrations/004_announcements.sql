-- AC7 Fitness — Announcements
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  body text not null,
  category text not null default 'news' check (category in ('news', 'feature', 'tournament', 'verification', 'maintenance')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.announcements enable row level security;

drop policy if exists "anyone signed in can read announcements" on public.announcements;
create policy "anyone signed in can read announcements" on public.announcements
  for select using (auth.uid() is not null);

drop policy if exists "admin can write announcements" on public.announcements;
create policy "admin can write announcements" on public.announcements
  for all using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
