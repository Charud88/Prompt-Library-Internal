-- =============================================================
-- seed.sql
-- Digit88 Prompt Library — Development Seed Data
-- Run ONLY in the digit88-dev Supabase project.
-- NEVER run in production.
-- =============================================================
-- NOTE: This seed inserts prompts directly with service_role,
-- bypassing RLS. It mirrors the current MOCK_PROMPTS data.
-- owner_id uses a placeholder dev UUID — update to a real
-- profile UUID after creating a dev account.
-- =============================================================

-- Replace this UUID with your actual dev user UUID from
-- Supabase Auth > Users after your first login.
DO $$
DECLARE
    dev_owner_id UUID := '00000000-0000-0000-0000-000000000001';
BEGIN

    -- Ensure a placeholder profile exists for seeding
    INSERT INTO profiles (id, display_name, role)
    VALUES (dev_owner_id, 'Dev Seed User', 'admin')
    ON CONFLICT (id) DO NOTHING;

    -- Prompt 1
    INSERT INTO prompts (
        id, title, category, role, use_case, prompt_text,
        model_compatibility, difficulty, status, version, owner_id,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Unit Test Generator for Jest',
        ARRAY['Engineering', 'QA / Testing'],
        'Senior Developer',
        'Quickly generate Jest unit tests for React components.',
        'Act as a senior React developer. Write Jest unit tests for the following component, covering all edge cases and using react-testing-library...',
        ARRAY['GPT-4', 'Claude 3.5 Sonnet'],
        'Intermediate',
        'approved',
        '1.0.2',
        dev_owner_id,
        '2024-02-15T10:00:00Z',
        '2024-02-20T14:30:00Z'
    );

    -- Prompt 2
    INSERT INTO prompts (
        id, title, category, role, use_case, prompt_text,
        model_compatibility, difficulty, status, version, owner_id,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Product Requirement Doc (PRD) Template',
        ARRAY['Product'],
        'Product Manager',
        'Create a structured PRD from raw brainstorming notes.',
        'You are an expert PM. Transform the following notes into a formal PRD with User Stories, Success Metrics, and Technical Constraints...',
        ARRAY['GPT-4o'],
        'Advanced',
        'approved',
        '2.1.0',
        dev_owner_id,
        '2024-01-10T09:00:00Z',
        '2024-02-22T11:00:00Z'
    );

    -- Prompt 3
    INSERT INTO prompts (
        id, title, category, role, use_case, prompt_text,
        model_compatibility, difficulty, status, version, owner_id,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'SQL Query Optimizer',
        ARRAY['Engineering'],
        'Data Engineer',
        'Optimize complex SQL queries for PostgreSQL.',
        'Analyze the following SQL query and suggest optimizations for performance and readability. Focus on index usage and join strategies...',
        ARRAY['Claude 3 Opus', 'GPT-4'],
        'Advanced',
        'approved',
        '1.0.0',
        dev_owner_id,
        '2024-02-18T16:00:00Z',
        '2024-02-18T16:00:00Z'
    );

    -- Prompt 4 (pending — to test admin queue)
    INSERT INTO prompts (
        id, title, category, role, use_case, prompt_text,
        model_compatibility, difficulty, status, version, owner_id,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Go Service Boilerplate Generator',
        ARRAY['Engineering'],
        'Backend Lead',
        'Scaffold a new microservice in Go following company standards.',
        'Generate a Go microservice boilerplate using Gin and GORM. Include folder structure for controllers, services, and repositories...',
        ARRAY['GPT-4o'],
        'Advanced',
        'pending',
        '0.9.0',
        dev_owner_id,
        '2024-02-22T14:00:00Z',
        '2024-02-22T14:00:00Z'
    );

    -- Prompt 5 (pending — to test admin queue)
    INSERT INTO prompts (
        id, title, category, role, use_case, prompt_text,
        model_compatibility, difficulty, status, version, owner_id,
        created_at, updated_at
    ) VALUES (
        gen_random_uuid(),
        'Marketing Copy Tone Adjuster',
        ARRAY['Marketing'],
        'Content Strategist',
        'Adjust the tone of marketing copy to be more professional or witty.',
        'Rewrite the following marketing copy to sound more professional yet approachable. Avoid overused corporate jargon...',
        ARRAY['GPT-4'],
        'Beginner',
        'pending',
        '1.0.0',
        dev_owner_id,
        '2024-02-23T08:00:00Z',
        '2024-02-23T08:00:00Z'
    );

END $$;
