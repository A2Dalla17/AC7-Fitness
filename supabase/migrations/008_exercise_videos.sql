create table if not exists public.exercise_videos (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  exercise_key text,
  video_url text not null,
  created_at timestamptz not null default now()
);

alter table public.exercise_videos enable row level security;

drop policy if exists "exercise_videos_read" on public.exercise_videos;
create policy "exercise_videos_read" on public.exercise_videos
  for select using (true);

drop policy if exists "exercise_videos_insert" on public.exercise_videos;
create policy "exercise_videos_insert" on public.exercise_videos
  for insert with check (
    uploader_id = auth.uid()
    and (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      or exists (select 1 from public.coaches c where c.user_id = auth.uid() and c.verified = true)
    )
  );

drop policy if exists "exercise_videos_delete" on public.exercise_videos;
create policy "exercise_videos_delete" on public.exercise_videos
  for delete using (
    uploader_id = auth.uid()
    or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
  );

insert into storage.buckets (id, name, public)
values ('exercise-videos', 'exercise-videos', true)
on conflict (id) do nothing;

drop policy if exists "exercise_videos_storage_read" on storage.objects;
create policy "exercise_videos_storage_read" on storage.objects
  for select using (bucket_id = 'exercise-videos');

drop policy if exists "exercise_videos_storage_insert" on storage.objects;
create policy "exercise_videos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'exercise-videos'
    and (
      exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
      or exists (select 1 from public.coaches c where c.user_id = auth.uid() and c.verified = true)
    )
  );

drop policy if exists "exercise_videos_storage_delete" on storage.objects;
create policy "exercise_videos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'exercise-videos'
    and (
      owner = auth.uid()
      or exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin')
    )
  );
