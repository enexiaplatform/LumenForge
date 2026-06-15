-- ==========================================================================
-- LUMENFORGE — Supabase Database Schema
-- Run this SQL script in the SQL Editor of your Supabase Dashboard.
-- ==========================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (linked to auth.users)
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text,
    avatar text,
    is_creator boolean default false,
    xp integer default 0,
    rank text default 'Novice',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" 
on public.profiles for select 
using (true);

create policy "Users can update their own profile" 
on public.profiles for update 
using (auth.uid() = id);

-- Trigger to automatically create profile on sign up
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, name, email, avatar, xp, rank, is_creator)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.email,
        upper(substring(coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)) from 1 for 1)),
        0,
        'Novice',
        false
    );
    return new;
end;
$$ language plpgsql security definer;


create or replace trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();


-- 2. PRODUCTS TABLE
create table if not exists public.products (
    id text primary key, -- prod-123456
    name text not null,
    creator text not null,
    creator_email text not null,
    bank_name text not null,
    bank_account text not null,
    bank_owner text not null,
    momo_number text not null,
    type text not null, -- 'preset', 'lut', 'ebook'
    price numeric not null,
    original_price numeric,
    description text not null,
    cover_url text not null,
    file_link text not null,
    status text not null default 'draft', -- 'draft', 'testing', 'submitted', 'approved'
    creator_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for products
alter table public.products enable row level security;

create policy "Approved products are viewable by everyone"
on public.products for select
using (status = 'approved');

create policy "Creators can view their own products in any state"
on public.products for select
using (auth.uid() = creator_id);

create policy "Creators can insert their own products"
on public.products for insert
with check (auth.uid() = creator_id);

create policy "Creators can update their own products"
on public.products for update
using (auth.uid() = creator_id);

create policy "Creators can delete their own products"
on public.products for delete
using (auth.uid() = creator_id);

-- Policy for Admin approval ( Henry )
create policy "Allow creators to self-update for testing"
on public.products for update
using (auth.uid() = creator_id);


-- 3. PURCHASES TABLE
create table if not exists public.purchases (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id text not null,
    product_name text not null,
    product_type text not null,
    product_link text not null,
    price numeric not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for purchases
alter table public.purchases enable row level security;

create policy "Users can view their own purchases"
on public.purchases for select
using (auth.uid() = user_id);

create policy "Users can insert their own purchases"
on public.purchases for insert
with check (auth.uid() = user_id);


-- 4. SALES TABLE (Creator Earnings Log)
create table if not exists public.sales (
    id text primary key, -- TX-123456
    product_id text not null,
    product_name text not null,
    price numeric not null,
    buyer_name text not null,
    buyer_email text not null,
    seller_id uuid references public.profiles(id) on delete cascade not null,
    status text not null default 'completed', -- 'completed', 'pending'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for sales
alter table public.sales enable row level security;

create policy "Sellers can view their own sales logs"
on public.sales for select
using (auth.uid() = seller_id);

create policy "Allow insert of sales logs"
on public.sales for insert
with check (true); -- Anyone can create a sales record when buying


-- 5. BOOKMARKS TABLE
create table if not exists public.bookmarks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    article_id text not null,
    article_title text not null,
    article_link text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, article_id)
);

-- Enable RLS for bookmarks
alter table public.bookmarks enable row level security;

create policy "Users can view their own bookmarks"
on public.bookmarks for select
using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks"
on public.bookmarks for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks"
on public.bookmarks for delete
using (auth.uid() = user_id);


-- 6. READ HISTORY TABLE
create table if not exists public.read_history (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    article_id text not null,
    article_title text not null,
    article_link text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, article_id)
);

-- Enable RLS for read history
alter table public.read_history enable row level security;

create policy "Users can view their own read history"
on public.read_history for select
using (auth.uid() = user_id);

create policy "Users can insert their own read history"
on public.read_history for insert
with check (auth.uid() = user_id);

create policy "Users can delete their own read history"
on public.read_history for delete
using (auth.uid() = user_id);


-- 7. PENDING ORDERS TABLE (for automatic payment gateway checkout)
create table if not exists public.pending_orders (
    order_code bigint primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id text not null,
    product_name text not null,
    product_type text not null,
    product_link text not null,
    price numeric not null,
    status text not null default 'pending', -- 'pending', 'completed'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for pending_orders
alter table public.pending_orders enable row level security;

create policy "Users can view their own pending orders"
on public.pending_orders for select
using (auth.uid() = user_id);

create policy "Users can insert their own pending orders"
on public.pending_orders for insert
with check (auth.uid() = user_id);

create policy "Service role bypasses RLS for updates"
on public.pending_orders for update
using (true);

