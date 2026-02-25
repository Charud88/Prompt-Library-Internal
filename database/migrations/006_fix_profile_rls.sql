-- =============================================================
-- 006_fix_profile_rls.sql
-- Digit88 Prompt Library — Security Fix
-- Run this in Supabase SQL Editor
-- =============================================================

-- Drop the overly permissive UPDATE policy
DROP POLICY IF EXISTS "profiles: own update" ON profiles;

-- Create a newly restricted UPDATE policy 
-- This policy allows users to update their own row, but the WITH CHECK clause
-- combined with Supabase's column-level privileges (if needed) or simple application logic
-- usually isn't enough to stop them from passing `role = 'admin'` in the JSON body.
-- The TRUE fix in PostgreSQL RLS is to restrict UPDATE access to specific columns.

-- 1. Revoke general UPDATE access on the 'role' column from the authenticated web role
REVOKE UPDATE (role) ON profiles FROM authenticated;

-- 2. Re-create the policy for the allowed columns
CREATE POLICY "profiles: own update"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Note: Since we revoked UPDATE on the `role` column specifically, any attempt 
-- by an authenticated user to run: .update({ role: 'admin' }) 
-- will result in a PostgreSQL permission denied error, even if the RLS policy matches.
