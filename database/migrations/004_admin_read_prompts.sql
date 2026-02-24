-- =============================================================
-- 004_admin_read_prompts.sql
-- Allows admins to read all prompts (including pending/drafts).
-- =============================================================

-- Add policy for admins to read all prompts
CREATE POLICY "prompts: admin read all"
    ON prompts
    FOR SELECT
    USING (is_admin());
