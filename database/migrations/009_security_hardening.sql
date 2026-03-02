-- =============================================================
-- 009_security_hardening.sql
-- Digit88 Prompt Library — Security Hardening Migration
-- =============================================================

-- 1. HARDEN PUBLIC READ POLICY
-- Previously: status = 'approved' AND deleted_at IS NULL
-- Problem: This allowed reading PRIVATE prompts if they were approved (which they are for owners).
-- Fix: Explicitly exclude private prompts from public browsing.

DROP POLICY IF EXISTS "prompts: public read approved" ON prompts;
CREATE POLICY "prompts: public read approved"
    ON prompts
    FOR SELECT
    USING (
        status = 'approved'
        AND deleted_at IS NULL
        AND is_private = false
    );

-- 2. REINFORCE PRIVATE PROMPT OWNERSHIP
-- Ensure users can only read their own private prompts.
-- Note: 'prompts: own read all statuses' already covers this, but we'll be making it more explicit.

DROP POLICY IF EXISTS "prompts: own read all statuses" ON prompts;
CREATE POLICY "prompts: own read all statuses"
    ON prompts
    FOR SELECT
    USING (
        auth.uid() = owner_id
        AND deleted_at IS NULL
    );

-- 3. HARDEN PROFILE READ POLICY (Metadata Leakage)
-- Ensure display names are only selectively joinable or visible.
-- This is already managed via 'is_admin()' but we should confirm no anon access.

DROP POLICY IF EXISTS "profiles: own read" ON profiles;
CREATE POLICY "profiles: own read"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 4. LOGGING
-- Ensure every update to this file is documented in the schema history (if exists) or just applied.
-- No change to audit_log required as it's handled by service_role in API routes.
