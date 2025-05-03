create table if not exists mentions (
  id uuid default gen_random_uuid() primary key,
  creator_handle text not null,
  source text not null,
  text text not null,
  sentiment numeric not null default 0,
  crisis_score numeric not null default 0,
  is_crisis boolean not null default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a unique constraint to prevent duplicate mentions
alter table mentions 
add constraint mentions_unique_mention 
unique (creator_handle, source, text, created_at);

-- Create an index on creator_handle for faster lookups
create index if not exists mentions_creator_handle_idx on mentions(creator_handle);

-- Enable Row Level Security (RLS)
alter table mentions enable row level security;

-- Create a policy that allows all users to read mentions
create policy "Allow public read access"
  on mentions for select
  using (true);

-- Create a policy that allows authenticated users to insert mentions
create policy "Allow authenticated insert"
  on mentions for insert
  with check (auth.role() = 'authenticated'); 