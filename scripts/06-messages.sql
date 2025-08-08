-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.swap_listings(id) on delete set null,
  content text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_messages_receiver_created on public.messages(receiver_id, created_at desc);
create index if not exists idx_messages_sender_created on public.messages(sender_id, created_at desc);

-- Enable Realtime
-- (Supabase Realtime listens to WAL by default; ensure publication includes 'messages')
alter publication supabase_realtime add table public.messages;
