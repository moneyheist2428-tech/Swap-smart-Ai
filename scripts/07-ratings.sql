create table if not exists public.user_ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references auth.users(id) on delete cascade,
  rated_id uuid not null references public.users(id) on delete cascade,
  swap_request_id uuid,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (rater_id, rated_id, swap_request_id)
);

create index if not exists idx_user_ratings_rated on public.user_ratings(rated_id);

-- Simple trust score calculation: average rating * 20 (0-100)
create or replace function public.calculate_trust_score(user_id_param uuid)
returns void
language plpgsql
as $$
begin
  update public.users u
  set trust_score = coalesce((
    select round(avg(r.rating) * 20)::int from public.user_ratings r where r.rated_id = user_id_param
  ), 0),
  updated_at = now()
  where u.id = user_id_param;
end;
$$;
