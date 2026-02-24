-- =============================================================
-- 003_fix_rls_recursion.sql
-- Fixes Infinite Recursion in profiles RLS policies.
-- =============================================================

-- 1. Create a security definer function to check admin status.
-- This bypasses RLS on the profiles table by running as the owner (postgres).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
          AND role = 'admin'
    );
END;
$$;

-- 2. Drop the recursive policies
DROP POLICY IF EXISTS "profiles: admin read all" ON profiles;
DROP POLICY IF EXISTS "audit_log: admin read only" ON audit_log;

-- 3. Re-create the policies using the helper function
-- This avoids selecting from 'profiles' directly inside the USING clause of a profiles policy.
CREATE POLICY "profiles: admin read all"
    ON profiles
    FOR SELECT
    USING (is_admin());

CREATE POLICY "audit_log: admin read only"
    ON audit_log
    FOR SELECT
    USING (is_admin());

-- 4. Double check profiles: own read (it's fine, but let's be explicit)
-- This one doesn't recurse because it doesn't SELECT from profiles.
-- USING (auth.uid() = id) is a direct column comparison.
