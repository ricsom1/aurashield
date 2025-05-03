create table if not exists crisis_playbooks (
  id uuid default gen_random_uuid() primary key,
  creator_handle text not null,
  playbook jsonb not null,
  generated_at timestamp with time zone default now(),
  used_at timestamp with time zone,
  is_archived boolean default false
);

-- Create index for faster lookups
create index if not exists crisis_playbooks_creator_idx on crisis_playbooks(creator_handle);

-- Enable RLS
alter table crisis_playbooks enable row level security;

-- Create policy for reading playbooks
create policy "Allow reading own playbooks"
  on crisis_playbooks for select
  using (
    auth.uid() in (
      select id from profiles
      where creator_handle = crisis_playbooks.creator_handle
    )
  );

-- Create policy for inserting playbooks
create policy "Allow inserting playbooks"
  on crisis_playbooks for insert
  with check (
    auth.uid() in (
      select id from profiles
      where creator_handle = crisis_playbooks.creator_handle
    )
  );

-- Create policy for updating playbooks
create policy "Allow updating own playbooks"
  on crisis_playbooks for update
  using (
    auth.uid() in (
      select id from profiles
      where creator_handle = crisis_playbooks.creator_handle
    )
  ); 