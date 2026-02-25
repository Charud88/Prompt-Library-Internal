-- =============================================================
-- 008_single_session.sql
-- Digit88 Prompt Library — Concurrent Session Control
-- =============================================================

-- 1. Create a function that deletes all other sessions for the user
CREATE OR REPLACE FUNCTION public.enforce_single_session()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all sessions for the user except the one that was just created
    DELETE FROM auth.sessions
    WHERE user_id = NEW.user_id
      AND id <> NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind the function to the auth.sessions table
-- Note: This trigger fires AFTER a new session is inserted.
-- It requires high privileges, but typically works in Supabase SQL Editor.
DROP TRIGGER IF EXISTS on_session_created ON auth.sessions;
CREATE TRIGGER on_session_created
    AFTER INSERT ON auth.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_single_session();
