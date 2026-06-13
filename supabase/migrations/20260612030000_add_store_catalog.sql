create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('student', 'vendor', 'rider');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'Placed',
    'Vendor confirmed',
    'Rider en route to shop',
    'Picking items',
    'Delivering',
    'Delivered'
  );
exception
  when duplicate_object then null;
end $$;

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table public.profiles
  add column if not exists shop_hours text;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '',
  tagline text not null default '',
  area text not null,
  location text not null,
  phone text,
  email text,
  hours text,
  cover_image_url text,
  hue text,
  is_open boolean not null default true,
  rating numeric(3,2) not null default 0,
  reviews_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shops_owner_user_id_idx on public.shops(owner_user_id);
create index if not exists shops_area_idx on public.shops(area);

alter table public.shops enable row level security;

drop trigger if exists touch_shops_updated_at on public.shops;
create trigger touch_shops_updated_at
before update on public.shops
for each row
execute function public.update_updated_at_column();

drop policy if exists "Shops are readable by everyone" on public.shops;
create policy "Shops are readable by everyone"
on public.shops
for select
to anon, authenticated
using (true);

drop policy if exists "Owners can create their shop" on public.shops;
create policy "Owners can create their shop"
on public.shops
for insert
to authenticated
with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can update their shop" on public.shops;
create policy "Owners can update their shop"
on public.shops
for update
to authenticated
using (auth.uid() = owner_user_id)
with check (auth.uid() = owner_user_id);

drop policy if exists "Owners can delete their shop" on public.shops;
create policy "Owners can delete their shop"
on public.shops
for delete
to authenticated
using (auth.uid() = owner_user_id);

create table if not exists public.shop_products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  emoji text not null default '',
  category text not null,
  description text not null default '',
  available boolean not null default true,
  photos text[] not null default '{}'::text[],
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shop_products_shop_id_idx on public.shop_products(shop_id);
create index if not exists shop_products_category_idx on public.shop_products(category);

alter table public.shop_products enable row level security;

drop trigger if exists touch_shop_products_updated_at on public.shop_products;
create trigger touch_shop_products_updated_at
before update on public.shop_products
for each row
execute function public.update_updated_at_column();

drop policy if exists "Products are readable by everyone" on public.shop_products;
create policy "Products are readable by everyone"
on public.shop_products
for select
to anon, authenticated
using (true);

drop policy if exists "Shop owners can create products" on public.shop_products;
create policy "Shop owners can create products"
on public.shop_products
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shops s
    where s.id = shop_products.shop_id
      and s.owner_user_id = auth.uid()
  )
);

drop policy if exists "Shop owners can update products" on public.shop_products;
create policy "Shop owners can update products"
on public.shop_products
for update
to authenticated
using (
  exists (
    select 1
    from public.shops s
    where s.id = shop_products.shop_id
      and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shops s
    where s.id = shop_products.shop_id
      and s.owner_user_id = auth.uid()
  )
);

drop policy if exists "Shop owners can delete products" on public.shop_products;
create policy "Shop owners can delete products"
on public.shop_products
for delete
to authenticated
using (
  exists (
    select 1
    from public.shops s
    where s.id = shop_products.shop_id
      and s.owner_user_id = auth.uid()
  )
);

create table if not exists public.product_measurements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete cascade,
  label text not null,
  price integer not null check (price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_measurements_product_id_idx on public.product_measurements(product_id);

alter table public.product_measurements enable row level security;

drop trigger if exists touch_product_measurements_updated_at on public.product_measurements;
create trigger touch_product_measurements_updated_at
before update on public.product_measurements
for each row
execute function public.update_updated_at_column();

drop policy if exists "Measurements are readable by everyone" on public.product_measurements;
create policy "Measurements are readable by everyone"
on public.product_measurements
for select
to anon, authenticated
using (true);

drop policy if exists "Shop owners can create measurements" on public.product_measurements;
create policy "Shop owners can create measurements"
on public.product_measurements
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shop_products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_measurements.product_id
      and s.owner_user_id = auth.uid()
  )
);

drop policy if exists "Shop owners can update measurements" on public.product_measurements;
create policy "Shop owners can update measurements"
on public.product_measurements
for update
to authenticated
using (
  exists (
    select 1
    from public.shop_products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_measurements.product_id
      and s.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.shop_products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_measurements.product_id
      and s.owner_user_id = auth.uid()
  )
);

drop policy if exists "Shop owners can delete measurements" on public.product_measurements;
create policy "Shop owners can delete measurements"
on public.product_measurements
for delete
to authenticated
using (
  exists (
    select 1
    from public.shop_products p
    join public.shops s on s.id = p.shop_id
    where p.id = product_measurements.product_id
      and s.owner_user_id = auth.uid()
  )
);

create table if not exists public.shop_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, shop_id)
);

create index if not exists shop_favorites_user_id_idx on public.shop_favorites(user_id);
create index if not exists shop_favorites_shop_id_idx on public.shop_favorites(shop_id);

alter table public.shop_favorites enable row level security;

drop policy if exists "Users can read their favorites" on public.shop_favorites;
create policy "Users can read their favorites"
on public.shop_favorites
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can add their favorites" on public.shop_favorites;
create policy "Users can add their favorites"
on public.shop_favorites
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their favorites" on public.shop_favorites;
create policy "Users can delete their favorites"
on public.shop_favorites
for delete
to authenticated
using (auth.uid() = user_id);

alter table public.orders
  add column if not exists shop_id uuid references public.shops(id) on delete set null;

alter table public.orders
  add column if not exists rider_user_id uuid references auth.users(id) on delete set null;

alter table public.orders enable row level security;

drop trigger if exists touch_orders_updated_at on public.orders;
create trigger touch_orders_updated_at
before update on public.orders
for each row
execute function public.update_updated_at_column();

drop policy if exists "Students can read their own orders" on public.orders;
create policy "Students can read their own orders"
on public.orders
for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.uid()
      and r.role in ('vendor', 'rider')
  )
);

drop policy if exists "Students can create their own orders" on public.orders;
create policy "Students can create their own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Order managers can update orders" on public.orders;
create policy "Order managers can update orders"
on public.orders
for update
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.uid()
      and r.role in ('vendor', 'rider')
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.user_roles r
    where r.user_id = auth.uid()
      and r.role in ('vendor', 'rider')
  )
);

