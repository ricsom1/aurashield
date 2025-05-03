-- Drop the existing mentions table if it exists
drop table if exists public.mentions;

-- Create the new mentions table
create table public.mentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  platform text not null,
  handle text not null,
  text text not null,
  sentiment text not null,
  is_crisis boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.mentions enable row level security;

-- Create policies
create policy "Users can read their own mentions"
  on public.mentions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own mentions"
  on public.mentions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own mentions"
  on public.mentions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own mentions"
  on public.mentions
  for delete
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index mentions_user_id_idx on public.mentions(user_id);
create index mentions_created_at_idx on public.mentions(created_at);
create index mentions_platform_idx on public.mentions(platform);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_mentions_updated_at
  before update on public.mentions
  for each row
  execute procedure public.handle_updated_at(); 