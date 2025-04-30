create table if not exists reviews (
  id uuid default gen_random_uuid() primary key,
  place_id text not null,
  author_name text not null,
  rating integer not null,
  text text not null,
  time_created timestamp with time zone not null,
  sentiment text not null check (sentiment in ('positive', 'negative', 'neutral')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create a unique constraint to prevent duplicate reviews
alter table reviews 
add constraint reviews_unique_review 
unique (place_id, author_name, time_created);

-- Create an index on place_id for faster lookups
create index if not exists reviews_place_id_idx on reviews(place_id);

-- Enable Row Level Security (RLS)
alter table reviews enable row level security;

-- Create a policy that allows all users to read reviews
create policy "Allow public read access"
  on reviews for select
  using (true);

-- Create a policy that allows authenticated users to insert reviews
create policy "Allow authenticated insert"
  on reviews for insert
  with check (auth.role() = 'authenticated'); 