alter table public.missions add column if not exists stage_progress jsonb not null default '{}'::jsonb;
