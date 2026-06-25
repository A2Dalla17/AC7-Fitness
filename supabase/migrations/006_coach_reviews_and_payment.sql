-- AC7 Fitness — coach reviews + booking payment status placeholder
alter table public.bookings
  add column if not exists payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid'));

create table if not exists public.coach_reviews (
  id uuid primary key default uuid_generate_v4(),
  coach_id uuid not null references public.users(id) on delete cascade,
  client_id uuid not null references public.users(id) on delete cascade,
  booking_id uuid not null references public.bookings(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text default '',
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint,
  unique (booking_id)
);

alter table public.coach_reviews enable row level security;

drop policy if exists "anyone signed in can read reviews" on public.coach_reviews;
create policy "anyone signed in can read reviews" on public.coach_reviews
  for select using (auth.uid() is not null);

drop policy if exists "client can review own completed booking" on public.coach_reviews;
create policy "client can review own completed booking" on public.coach_reviews
  for insert with check (
    auth.uid() = client_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid() and b.status = 'completed'
    )
  );

create or replace function public.update_coach_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.coaches
  set
    review_count = (select count(*) from public.coach_reviews where coach_id = new.coach_id),
    rating = (select avg(rating)::numeric(3,2) from public.coach_reviews where coach_id = new.coach_id)
  where user_id = new.coach_id;
  return new;
end;
$$;

drop trigger if exists on_coach_review_created on public.coach_reviews;
create trigger on_coach_review_created
  after insert on public.coach_reviews
  for each row execute function public.update_coach_rating();

revoke execute on function public.update_coach_rating() from public, anon, authenticated;
