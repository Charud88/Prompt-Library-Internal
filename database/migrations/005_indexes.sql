-- database/migrations/005_indexes.sql

-- Add B-tree index on status and deleted_at to speed up the base query
-- `eq('status', 'approved').is('deleted_at', null)`
CREATE INDEX IF NOT EXISTS idx_prompts_status_active 
ON public.prompts (status) 
WHERE deleted_at IS NULL;

-- Add B-tree index on created_at for sorting newest first
CREATE INDEX IF NOT EXISTS idx_prompts_created_at_desc 
ON public.prompts (created_at DESC);

-- Add GIN index on category array for fast 'contains' filtering
CREATE INDEX IF NOT EXISTS idx_prompts_category_gin 
ON public.prompts USING GIN (category);

-- Add B-tree index on difficulty for fast equality filtering
CREATE INDEX IF NOT EXISTS idx_prompts_difficulty 
ON public.prompts (difficulty);

-- If we start doing ILIKE searches on large prompt text, a trigram index would be useful:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_prompts_search_trgm 
-- ON public.prompts USING GIN ((title || ' ' || use_case || ' ' || prompt_text) gin_trgm_ops);
