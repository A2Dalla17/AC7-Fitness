-- AC7 Fitness — Public Community (groups, posts, comments, likes)
create table if not exists public.community_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text default '',
  member_count int not null default 0,
  cover_image_url text,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.community_groups enable row level security;

drop policy if exists "anyone signed in can read groups" on public.community_groups;
create policy "anyone signed in can read groups" on public.community_groups
  for select using (auth.uid() is not null);

drop policy if exists "admin can write groups" on public.community_groups;
create policy "admin can write groups" on public.community_groups
  for all using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create table if not exists public.community_group_members (
  group_id uuid not null references public.community_groups(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  primary key (group_id, user_id)
);

alter table public.community_group_members enable row level security;

drop policy if exists "anyone signed in can read memberships" on public.community_group_members;
create policy "anyone signed in can read memberships" on public.community_group_members
  for select using (auth.uid() is not null);

drop policy if exists "user can join group" on public.community_group_members;
create policy "user can join group" on public.community_group_members
  for insert with check (auth.uid() = user_id);

drop policy if exists "user can leave group" on public.community_group_members;
create policy "user can leave group" on public.community_group_members
  for delete using (auth.uid() = user_id);

create table if not exists public.community_posts (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references public.community_groups(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.community_posts enable row level security;

drop policy if exists "anyone signed in can read posts" on public.community_posts;
create policy "anyone signed in can read posts" on public.community_posts
  for select using (auth.uid() is not null);

drop policy if exists "author can create post" on public.community_posts;
create policy "author can create post" on public.community_posts
  for insert with check (auth.uid() = author_id);

drop policy if exists "author can delete own post" on public.community_posts;
create policy "author can delete own post" on public.community_posts
  for delete using (auth.uid() = author_id);

create table if not exists public.community_comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.community_comments enable row level security;

drop policy if exists "anyone signed in can read comments" on public.community_comments;
create policy "anyone signed in can read comments" on public.community_comments
  for select using (auth.uid() is not null);

drop policy if exists "author can create comment" on public.community_comments;
create policy "author can create comment" on public.community_comments
  for insert with check (auth.uid() = author_id);

create table if not exists public.community_likes (
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.community_likes enable row level security;

drop policy if exists "anyone signed in can read likes" on public.community_likes;
create policy "anyone signed in can read likes" on public.community_likes
  for select using (auth.uid() is not null);

drop policy if exists "user can like post" on public.community_likes;
create policy "user can like post" on public.community_likes
  for insert with check (auth.uid() = user_id);

drop policy if exists "user can unlike post" on public.community_likes;
create policy "user can unlike post" on public.community_likes
  for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.community_posts;
alter publication supabase_realtime add table public.community_comments;

insert into public.community_groups (name, description, member_count)
values ('AC7 Lifters', 'Public Group for the AC7 community', 12400)
on conflict do nothing;
