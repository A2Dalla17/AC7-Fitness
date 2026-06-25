-- AC7 Shop — seller listings (any member can sell)
alter table public.products
  add column if not exists seller_id uuid references public.users(id) on delete set null;

create index if not exists products_seller_id_idx on public.products (seller_id);

drop policy if exists "seller can insert own products" on public.products;
create policy "seller can insert own products" on public.products
  for insert with check (auth.uid() = seller_id);

drop policy if exists "seller can update own products" on public.products;
create policy "seller can update own products" on public.products
  for update using (auth.uid() = seller_id)
  with check (auth.uid() = seller_id);

drop policy if exists "seller can delete own products" on public.products;
create policy "seller can delete own products" on public.products
  for delete using (auth.uid() = seller_id);
