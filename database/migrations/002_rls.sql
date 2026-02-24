-- =============================================================
-- 002_rls.sql
-- Digit88 Prompt Library — Row Level Security Policies
-- Run this AFTER 001_schema.sql in Supabase SQL Editor
-- =============================================================
-- Default deny: RLS is enabled on every table.
-- Policies GRANT access; no policy = no access.
-- service_role key always bypasses RLS (admin server routes only).
-- =============================================================

-- ------------------------------------------------------------
-- PROFILES
-- ------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users read their own profile
CREATE POLICY "profiles: own read"
    ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Admins can read all profiles (needed to show author names in admin panel)
CREATE POLICY "profiles: admin read all"
    ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles AS self
            WHERE self.id = auth.uid()
              AND self.role = 'admin'
        )
    );

-- Users update their own display_name only.
-- 'role' column must be stripped from payload server-side — never passed from client.
CREATE POLICY "profiles: own update"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- No INSERT policy — profiles created automatically via trigger on_auth_user_created.
-- No DELETE policy — cascades from auth.users deletion only.

-- ------------------------------------------------------------
-- PROMPTS
-- ------------------------------------------------------------

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + authenticated) can read approved, non-deleted prompts.
-- Browsing is public; no login required to view.
CREATE POLICY "prompts: public read approved"
    ON prompts
    FOR SELECT
    USING (
        status = 'approved'
        AND deleted_at IS NULL
    );

-- Authenticated users can read their own prompts (all statuses — e.g. drafts, pending).
CREATE POLICY "prompts: own read all statuses"
    ON prompts
    FOR SELECT
    USING (
        auth.uid() = owner_id
        AND deleted_at IS NULL
    );

-- Authenticated users can submit a new prompt.
-- Enforced: owner_id MUST match auth.uid() (set server-side).
-- Enforced: status MUST be 'pending' — client cannot self-approve.
-- Enforced: deleted_at MUST be NULL.
CREATE POLICY "prompts: authenticated insert"
    ON prompts
    FOR INSERT
    WITH CHECK (
        auth.uid() = owner_id
        AND status = 'pending'
        AND deleted_at IS NULL
    );

-- Authenticated users can edit their own DRAFT prompts only.
-- Cannot touch status, owner_id, or deleted_at.
CREATE POLICY "prompts: own update draft"
    ON prompts
    FOR UPDATE
    USING (
        auth.uid() = owner_id
        AND status = 'draft'
        AND deleted_at IS NULL
    )
    WITH CHECK (
        auth.uid() = owner_id
        AND status = 'draft'
    );

-- No DELETE policy for any client role.
-- Soft delete (setting deleted_at) is performed via service_role in server API routes.

-- ------------------------------------------------------------
-- AUDIT LOG
-- ------------------------------------------------------------

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can read the audit log.
CREATE POLICY "audit_log: admin read only"
    ON audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- No INSERT / UPDATE / DELETE policies for any client role.
-- All writes to audit_log are performed by server-side routes using service_role.

-- ------------------------------------------------------------
-- BOOKMARKS
-- ------------------------------------------------------------

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks.
CREATE POLICY "bookmarks: own read"
    ON bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can bookmark a prompt.
-- Enforced: user_id MUST match auth.uid() — never client-supplied.
CREATE POLICY "bookmarks: own insert"
    ON bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can remove their own bookmarks.
CREATE POLICY "bookmarks: own delete"
    ON bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);

-- No UPDATE policy — bookmarks are created or deleted, never modified.
