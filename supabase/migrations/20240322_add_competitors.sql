-- Add competitors array to profiles table
alter table profiles
add column competitors text[] default '{}';

-- Add is_competitor flag to mentions table
alter table mentions
add column is_competitor boolean default false;

-- Create index for faster competitor mention lookups
create index if not exists mentions_competitor_idx on mentions(creator_handle, is_competitor);

-- Update RLS policies to allow reading competitor mentions
create policy "Allow reading competitor mentions"
  on mentions for select
  using (
    auth.uid() in (
      select id from profiles
      where creator_handle = any(competitors)
    )
  );

-- Add function to check if a handle is a competitor
create or replace function is_competitor(handle text)
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where auth.uid() = id
    and handle = any(competitors)
  );
end;
$$ language plpgsql security definer; 