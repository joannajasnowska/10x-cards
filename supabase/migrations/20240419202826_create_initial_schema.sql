-- Migration: Initial Schema for 10x-cards
-- Description: Creates the initial database schema including users, flashcards, generations, and generation_logs tables
-- with appropriate relationships, constraints, and RLS policies.
-- Author: AI Assistant
-- Date: 2024-04-19

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create tables
---------------

-- Note: The users table is managed by Supabase Auth, so we don't create it here

-- Create generations table
create table generations (
    id bigserial primary key,
    start_date timestamptz not null,
    end_date timestamptz,
    generation_time interval not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    source_text_hash text not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    model text not null,
    all_count integer not null,
    ai_complete_count integer not null,
    ai_with_updates_count integer not null,
    created_at timestamptz not null default now()
);

-- Create flashcards table
create table flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source text not null check (source in ('manual', 'ai-complete', 'ai-with-updates')),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint references generations(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create generation_logs table
create table generation_logs (
    id bigserial primary key,
    timestamp timestamptz not null default now(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_id bigint not null references generations(id) on delete cascade,
    error_code text,
    error_message text,
    source_text_hash text not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    model text not null
);

-- Create indexes
---------------
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_generation_id on flashcards(generation_id);
create index idx_generations_user_id on generations(user_id);
create index idx_generation_logs_user_id on generation_logs(user_id);
create index idx_generation_logs_generation_id on generation_logs(generation_id);

-- Create updated_at trigger for flashcards
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_flashcards_updated_at
    before update on flashcards
    for each row
    execute function update_updated_at_column();

-- Enable Row Level Security
--------------------------
alter table flashcards enable row level security;
alter table generations enable row level security;
alter table generation_logs enable row level security;

-- Create RLS Policies
---------------------

-- Flashcards policies
-- Anonymous users have no access
create policy "No access for anon users on flashcards"
    on flashcards
    for all
    to anon
    using (false);

-- Authenticated users can select their own flashcards
create policy "Users can view own flashcards"
    on flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own flashcards
create policy "Users can insert own flashcards"
    on flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Authenticated users can update their own flashcards
create policy "Users can update own flashcards"
    on flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Authenticated users can delete their own flashcards
create policy "Users can delete own flashcards"
    on flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- Generations policies
-- Anonymous users have no access
create policy "No access for anon users on generations"
    on generations
    for all
    to anon
    using (false);

-- Authenticated users can select their own generations
create policy "Users can view own generations"
    on generations
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own generations
create policy "Users can insert own generations"
    on generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Authenticated users can update their own generations
create policy "Users can update own generations"
    on generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Generation logs policies
-- Anonymous users have no access
create policy "No access for anon users on generation_logs"
    on generation_logs
    for all
    to anon
    using (false);

-- Authenticated users can select their own generation logs
create policy "Users can view own generation logs"
    on generation_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Authenticated users can insert their own generation logs
create policy "Users can insert own generation logs"
    on generation_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Comments
----------
comment on table generations is 'Stores information about flashcard generation sessions';
comment on table flashcards is 'Stores individual flashcards created by users';
comment on table generation_logs is 'Stores logs and errors from flashcard generation sessions'; 