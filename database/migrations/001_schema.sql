-- =============================================================
-- 001_schema.sql
-- Digit88 Prompt Library — Core Schema
-- Run this FIRST in Supabase SQL Editor
-- =============================================================

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------

CREATE TYPE prompt_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'archived'
);

CREATE TYPE prompt_difficulty AS ENUM (
    'Beginner',
    'Intermediate',
    'Advanced'
);

CREATE TYPE audit_action AS ENUM (
    'approved',
    'rejected',
    'archived',
    'restored',
    'deleted'
);

CREATE TYPE app_role AS ENUM (
    'user',
    'admin'
);

-- ------------------------------------------------------------
-- TABLE: profiles
-- Extends auth.users. Created automatically on signup via trigger.
-- Never stores passwords or raw emails (owned by Supabase Auth).
-- ------------------------------------------------------------

CREATE TABLE profiles (
    id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT        NOT NULL DEFAULT '',
    role         app_role    NOT NULL DEFAULT 'user',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE  profiles              IS 'One row per authenticated user. Role defaults to user; only service_role can elevate to admin.';
COMMENT ON COLUMN profiles.role         IS 'Never updatable via client — server only.';
COMMENT ON COLUMN profiles.display_name IS 'Sourced from Google OAuth display name on signup.';

-- ------------------------------------------------------------
-- TABLE: prompts
-- Core content table. status defaults to pending = client cannot self-approve.
-- owner_id is always set server-side from auth.uid().
-- Soft-delete via deleted_at (no hard DELETE from client paths).
-- ------------------------------------------------------------

CREATE TABLE prompts (
    id                  UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    title               TEXT             NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
    category            TEXT[]           NOT NULL CHECK (array_length(category, 1) BETWEEN 1 AND 5),
    role                TEXT             CHECK (char_length(role) <= 80),
    use_case            TEXT             CHECK (char_length(use_case) <= 500),
    prompt_text         TEXT             NOT NULL CHECK (char_length(prompt_text) BETWEEN 10 AND 8000),
    model_compatibility TEXT[]           NOT NULL DEFAULT '{}',
    difficulty          prompt_difficulty NOT NULL DEFAULT 'Beginner',
    status              prompt_status    NOT NULL DEFAULT 'pending',
    version             TEXT             NOT NULL DEFAULT '1.0.0',
    owner_id            UUID             NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ      NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ      DEFAULT NULL  -- soft delete: NULL = active
);

COMMENT ON TABLE  prompts            IS 'All submitted prompts. Status starts as pending; only service_role can approve.';
COMMENT ON COLUMN prompts.owner_id   IS 'Set server-side from auth.uid(). Never supplied by client.';
COMMENT ON COLUMN prompts.status     IS 'Client can only insert with status=pending. Approve/reject via server API only.';
COMMENT ON COLUMN prompts.deleted_at IS 'Soft delete. All SELECT queries must filter WHERE deleted_at IS NULL.';

-- ------------------------------------------------------------
-- TABLE: audit_log
-- Append-only record of admin actions. No client UPDATE/DELETE.
-- metadata JSONB: allowed fields are {title, category} only — no PII.
-- ------------------------------------------------------------

CREATE TABLE audit_log (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id  UUID         REFERENCES prompts(id) ON DELETE SET NULL,
    actor_id   UUID         REFERENCES profiles(id) ON DELETE SET NULL,
    action     audit_action NOT NULL,
    note       TEXT         CHECK (char_length(note) <= 500),
    metadata   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  audit_log          IS 'Append-only admin action log. Only admins can read; only service_role can insert.';
COMMENT ON COLUMN audit_log.metadata IS 'Allowed fields: {title, category}. Never store PII, emails, or prompt_text here.';

-- ------------------------------------------------------------
-- TABLE: bookmarks
-- Composite PK prevents duplicate bookmarks.
-- Cascade deletes clean up automatically if user or prompt is removed.
-- ------------------------------------------------------------

CREATE TABLE bookmarks (
    user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prompt_id  UUID        NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, prompt_id)
);

COMMENT ON TABLE bookmarks IS 'User-prompt bookmarks. user_id is always auth.uid() — never client-supplied.';

-- ------------------------------------------------------------
-- TRIGGER: auto-update updated_at on prompts
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER prompts_set_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- TRIGGER: auto-create profile on user signup
-- Reads display_name from Google OAuth metadata if available.
-- SECURITY DEFINER runs with elevated privileges to insert into profiles.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------
-- TRIGGER: block non-@digit88.com signups at the database level.
-- This is a safety net — primary restriction is in Supabase Auth settings.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION block_non_digit88_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.email NOT LIKE '%@digit88.com' THEN
        RAISE EXCEPTION 'Access restricted to @digit88.com accounts only.';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_digit88_domain
    BEFORE INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION block_non_digit88_signup();
