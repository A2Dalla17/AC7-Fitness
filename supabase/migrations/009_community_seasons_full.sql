-- Community/chat, calls, announcements extension, seasons/missions, certificates,
-- coach PCT videos, voice-message storage. Applied 2026-06-25 via Supabase MCP.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('public','direct')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'text' check (kind in ('text','voice','system')),
  body text, media_url text, duration_seconds int,
  created_at timestamptz not null default now()
);
create index if not exists chat_messages_conversation_idx on public.chat_messages(conversation_id, created_at);
create table if not exists public.calls (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade,
  caller_id uuid not null references auth.users(id) on delete cascade,
  callee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'ringing' check (status in ('ringing','accepted','declined','ended','missed')),
  started_at timestamptz not null default now(), ended_at timestamptz
);
insert into public.conversations (id, type, created_by)
values ('00000000-0000-0000-0000-000000000001','public', null) on conflict (id) do nothing;

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.chat_messages enable row level security;
alter table public.calls enable row level security;

drop policy if exists conv_select on public.conversations;
create policy conv_select on public.conversations for select using (
  type='public' or exists(select 1 from public.conversation_participants p where p.conversation_id=id and p.user_id=auth.uid()));
drop policy if exists cp_select on public.conversation_participants;
create policy cp_select on public.conversation_participants for select using (
  user_id = auth.uid() or exists(select 1 from public.conversation_participants me where me.conversation_id=conversation_participants.conversation_id and me.user_id=auth.uid()));
drop policy if exists msg_select on public.chat_messages;
create policy msg_select on public.chat_messages for select using (
  exists(select 1 from public.conversations c where c.id=conversation_id and (
    c.type='public' or exists(select 1 from public.conversation_participants p where p.conversation_id=c.id and p.user_id=auth.uid()))));
drop policy if exists msg_insert on public.chat_messages;
create policy msg_insert on public.chat_messages for insert with check (
  sender_id = auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and (
    c.type='public' or exists(select 1 from public.conversation_participants p where p.conversation_id=c.id and p.user_id=auth.uid()))));
drop policy if exists calls_select on public.calls;
create policy calls_select on public.calls for select using (caller_id=auth.uid() or callee_id=auth.uid());
drop policy if exists calls_insert on public.calls;
create policy calls_insert on public.calls for insert with check (caller_id=auth.uid());
drop policy if exists calls_update on public.calls;
create policy calls_update on public.calls for update using (caller_id=auth.uid() or callee_id=auth.uid());

create or replace function public.start_direct_conversation(other_user uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare cid uuid;
begin
  select c.id into cid from conversations c
   join conversation_participants p1 on p1.conversation_id=c.id and p1.user_id=auth.uid()
   join conversation_participants p2 on p2.conversation_id=c.id and p2.user_id=other_user
   where c.type='direct' limit 1;
  if cid is not null then return cid; end if;
  insert into conversations(type, created_by) values('direct', auth.uid()) returning id into cid;
  insert into conversation_participants(conversation_id,user_id) values (cid, auth.uid()), (cid, other_user);
  return cid;
end; $$;

alter table public.announcements add column if not exists importance text not null default 'normal';
alter table public.announcements add column if not exists expires_at timestamptz;
alter table public.announcements add column if not exists author_id uuid references auth.users(id) on delete set null;

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
  starts_on date not null, ends_on date not null, created_at timestamptz not null default now());
alter table public.seasons enable row level security;
drop policy if exists seasons_read on public.seasons;
create policy seasons_read on public.seasons for select using (true);

create table if not exists public.season_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  started_at timestamptz not null default now(), completed_at timestamptz,
  unique (user_id, season_id));
alter table public.season_enrollments enable row level security;
drop policy if exists se_all on public.season_enrollments;
create policy se_all on public.season_enrollments for all using (user_id=auth.uid()) with check (user_id=auth.uid());

create table if not exists public.stage_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  rank text not null, stage_index int not null, reps_done int,
  completed_at timestamptz not null default now(),
  unique (user_id, season_id, rank, stage_index));
alter table public.stage_completions enable row level security;
drop policy if exists sc_all on public.stage_completions;
create policy sc_all on public.stage_completions for all using (user_id=auth.uid()) with check (user_id=auth.uid());

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  title text not null, issued_at timestamptz not null default now(),
  unique (user_id, season_id));
alter table public.certificates enable row level security;
drop policy if exists cert_read on public.certificates;
create policy cert_read on public.certificates for select using (user_id=auth.uid());
drop policy if exists cert_insert on public.certificates;
create policy cert_insert on public.certificates for insert with check (user_id=auth.uid());

insert into public.seasons (code,name,starts_on,ends_on)
values ('A1','Season A1','2026-06-25','2026-09-25') on conflict (code) do nothing;

alter table public.exercise_videos add column if not exists kind text not null default 'demo';

insert into storage.buckets (id,name,public) values ('voice-messages','voice-messages',true) on conflict (id) do nothing;
drop policy if exists voice_read on storage.objects;
create policy voice_read on storage.objects for select using (bucket_id='voice-messages');
drop policy if exists voice_insert on storage.objects;
create policy voice_insert on storage.objects for insert with check (bucket_id='voice-messages' and auth.role()='authenticated');

-- realtime: alter publication supabase_realtime add table chat_messages, calls, announcements;
