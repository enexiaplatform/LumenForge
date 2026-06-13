-- Chạy lệnh này trên Supabase SQL Editor
create table if not exists public.pending_orders (
    order_code bigint primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id text not null,
    product_name text not null,
    product_type text not null,
    product_link text not null,
    price numeric not null,
    status text not null default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.pending_orders enable row level security;
-- Chỉ Admin / Webhook mới có quyền thao tác (thông qua Service Role Key).
-- Giao diện web không cần query bảng này.
