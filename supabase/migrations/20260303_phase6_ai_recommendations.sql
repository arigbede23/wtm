-- Phase 6: AI Recommendations — pgvector, embedding columns, RPC functions
-- Enables semantic similarity search for personalized event recommendations.

-- 1. Enable pgvector extension
create extension if not exists vector with schema extensions;

-- 2. Add embedding columns to events and users
alter table events add column if not exists embedding vector(1536);
alter table users add column if not exists embedding vector(1536);

-- 3. Create IVFFlat index on events.embedding for fast cosine similarity
-- IVFFlat requires at least some rows; the index is created with lists=100
-- which works well up to ~1M rows.
create index if not exists events_embedding_idx
  on events
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. RPC: match_events_for_user
-- Returns events ordered by cosine similarity to a given embedding.
-- Used by the "For You" feed.
create or replace function match_events_for_user(
  query_embedding vector(1536),
  match_count int default 20,
  match_threshold float default 0.7
)
returns table (
  id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      events.id,
      1 - (events.embedding <=> query_embedding) as similarity
    from events
    where events.embedding is not null
      and events.status = 'PUBLISHED'
      and events."startDate" >= now()
      and 1 - (events.embedding <=> query_embedding) > match_threshold
    order by events.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- 5. RPC: match_similar_events
-- Returns events similar to a given event's embedding, excluding the event itself.
-- Used on event detail pages for "You might also like".
create or replace function match_similar_events(
  event_id uuid,
  query_embedding vector(1536),
  match_count int default 6,
  match_threshold float default 0.5
)
returns table (
  id uuid,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      events.id,
      1 - (events.embedding <=> query_embedding) as similarity
    from events
    where events.embedding is not null
      and events.id != event_id
      and events.status = 'PUBLISHED'
      and events."startDate" >= now()
      and 1 - (events.embedding <=> query_embedding) > match_threshold
    order by events.embedding <=> query_embedding
    limit match_count;
end;
$$;
