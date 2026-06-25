-- Profile avatars, follows, remove seed shop products

alter table public.users
  add column if not exists avatar_url text;

create table if not exists public.user_follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists user_follows_following_idx on public.user_follows (following_id);
create index if not exists user_follows_follower_idx on public.user_follows (follower_id);

alter table public.user_follows enable row level security;

drop policy if exists "signed in can read follows" on public.user_follows;
create policy "signed in can read follows" on public.user_follows
  for select using (auth.uid() is not null);

drop policy if exists "user can follow" on public.user_follows;
create policy "user can follow" on public.user_follows
  for insert with check (auth.uid() = follower_id);

drop policy if exists "user can unfollow" on public.user_follows;
create policy "user can unfollow" on public.user_follows
  for delete using (auth.uid() = follower_id);

-- Remove demo/seed products (no seller — fake supplements)
delete from public.products where seller_id is null;

-- Avatar storage
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists avatars_read on storage.objects;
create policy avatars_read on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists avatars_insert on storage.objects;
create policy avatars_insert on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_update on storage.objects;
create policy avatars_update on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists avatars_delete on storage.objects;
create policy avatars_delete on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
