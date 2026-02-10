
-- Payment Requests (for Manual Easypaisa)
create table if not exists public.payment_requests (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  currency text not null default 'PKR',
  trx_id text not null, -- User provided transaction ID
  status text not null default 'pending', -- pending, approved, rejected
  payment_method text not null default 'easypaisa_manual',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint payment_requests_pkey primary key (id)
);

-- RLS for payment_requests
alter table public.payment_requests enable row level security;

create policy "Users can view their own payment requests" on public.payment_requests
  for select using (auth.uid() = user_id);

create policy "Users can insert their own payment requests" on public.payment_requests
  for insert with check (auth.uid() = user_id);
