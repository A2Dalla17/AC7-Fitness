-- AC7 Fitness — phase 1 core schema
create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text check (role in ('client', 'coach', 'admin')),
  goal text check (goal in ('fat_loss', 'muscle_gain', 'strength', 'bodybuilding', 'calisthenics', 'general_fitness')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.users enable row level security;

drop policy if exists "users can read any profile" on public.users;
create policy "users can read any profile" on public.users
  for select using (auth.uid() is not null);

drop policy if exists "users can insert their own profile" on public.users;
create policy "users can insert their own profile" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.users;
create policy "users can update their own profile" on public.users
  for update using (auth.uid() = id);

create table if not exists public.coaches (
  user_id uuid primary key references public.users(id) on delete cascade,
  name text not null,
  bio text default '',
  experience int default 0,
  specializations text[] default '{}',
  price numeric default 0,
  rating numeric default 0,
  review_count int default 0,
  availability jsonb default '[]',
  verified boolean not null default false
);

alter table public.coaches enable row level security;

drop policy if exists "anyone signed in can read coaches" on public.coaches;
create policy "anyone signed in can read coaches" on public.coaches
  for select using (auth.uid() is not null);

drop policy if exists "coach can insert own row" on public.coaches;
create policy "coach can insert own row" on public.coaches
  for insert with check (auth.uid() = user_id);

drop policy if exists "coach can update own row" on public.coaches;
create policy "coach can update own row" on public.coaches
  for update using (auth.uid() = user_id);

drop policy if exists "admin can update any coach" on public.coaches;
create policy "admin can update any coach" on public.coaches
  for update using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.users(id) on delete cascade,
  coach_id uuid not null references public.users(id) on delete cascade,
  date text not null,
  time text not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.bookings enable row level security;

drop policy if exists "participants can read bookings" on public.bookings;
create policy "participants can read bookings" on public.bookings
  for select using (auth.uid() = client_id or auth.uid() = coach_id);

drop policy if exists "client can create booking" on public.bookings;
create policy "client can create booking" on public.bookings
  for insert with check (auth.uid() = client_id);

drop policy if exists "participants can update booking" on public.bookings;
create policy "participants can update booking" on public.bookings
  for update using (auth.uid() = client_id or auth.uid() = coach_id);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id text not null,
  sender_id uuid not null references public.users(id) on delete cascade,
  receiver_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  timestamp bigint not null default (extract(epoch from now()) * 1000)::bigint
);

create index if not exists messages_conversation_idx on public.messages (conversation_id, timestamp);

alter table public.messages enable row level security;

drop policy if exists "participants can read messages" on public.messages;
create policy "participants can read messages" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "sender can insert message" on public.messages;
create policy "sender can insert message" on public.messages
  for insert with check (auth.uid() = sender_id);

create table if not exists public.missions (
  user_id uuid primary key references public.users(id) on delete cascade,
  xp int not null default 0,
  level text not null default 'Bronze',
  completed_tasks jsonb not null default '[]'
);

alter table public.missions enable row level security;

drop policy if exists "user can read own missions" on public.missions;
create policy "user can read own missions" on public.missions
  for select using (auth.uid() = user_id);

drop policy if exists "user can insert own missions" on public.missions;
create policy "user can insert own missions" on public.missions
  for insert with check (auth.uid() = user_id);

drop policy if exists "user can update own missions" on public.missions;
create policy "user can update own missions" on public.missions
  for update using (auth.uid() = user_id);

create table if not exists public.weight_logs (
  user_id uuid primary key references public.users(id) on delete cascade,
  entries jsonb not null default '[]'
);

alter table public.weight_logs enable row level security;

drop policy if exists "user can read own weight logs" on public.weight_logs;
create policy "user can read own weight logs" on public.weight_logs
  for select using (auth.uid() = user_id);

drop policy if exists "user can insert own weight logs" on public.weight_logs;
create policy "user can insert own weight logs" on public.weight_logs
  for insert with check (auth.uid() = user_id);

drop policy if exists "user can update own weight logs" on public.weight_logs;
create policy "user can update own weight logs" on public.weight_logs
  for update using (auth.uid() = user_id);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, role, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    null,
    (extract(epoch from now()) * 1000)::bigint
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

revoke execute on function public.handle_new_auth_user() from public, anon, authenticated;

alter publication supabase_realtime add table public.messages;
