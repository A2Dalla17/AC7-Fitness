-- AC7 Fitness — Shop (products, orders, order_items)
create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null check (category in ('protein', 'supplements', 'equipment', 'apparel', 'accessories')),
  price numeric not null,
  description text default '',
  image_url text,
  verified boolean not null default true,
  stock int not null default 0,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.products enable row level security;

drop policy if exists "anyone signed in can read products" on public.products;
create policy "anyone signed in can read products" on public.products
  for select using (auth.uid() is not null);

drop policy if exists "admin can write products" on public.products;
create policy "admin can write products" on public.products
  for all using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'))
  with check (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

alter table public.orders enable row level security;

drop policy if exists "user can read own orders" on public.orders;
create policy "user can read own orders" on public.orders
  for select using (auth.uid() = user_id);

drop policy if exists "user can create own orders" on public.orders;
create policy "user can create own orders" on public.orders
  for insert with check (auth.uid() = user_id);

drop policy if exists "admin can read all orders" on public.orders;
create policy "admin can read all orders" on public.orders
  for select using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity int not null default 1,
  unit_price numeric not null
);

alter table public.order_items enable row level security;

drop policy if exists "user can read own order items" on public.order_items;
create policy "user can read own order items" on public.order_items
  for select using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "user can insert own order items" on public.order_items;
create policy "user can insert own order items" on public.order_items
  for insert with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

insert into public.products (name, category, price, description, verified, stock)
values
  ('Whey Protein', 'protein', 49.99, 'Premium Quality', true, 50),
  ('Creatine Monohydrate', 'supplements', 24.99, '500g', true, 80),
  ('Gym Backpack', 'equipment', 39.99, 'AC7 Edition', true, 30),
  ('Shaker Bottle', 'accessories', 14.99, '700ml', true, 100)
on conflict do nothing;
