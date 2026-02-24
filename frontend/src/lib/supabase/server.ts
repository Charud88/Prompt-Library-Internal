/**
 * lib/supabase/server.ts
 *
 * Server-side Supabase client for Next.js API routes.
 * Uses the SERVICE ROLE key — bypasses RLS.
 * NEVER import this in client components or browser code.
 * Used exclusively for admin actions (approve/reject/archive)
 * and writing to audit_log.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing Supabase service role credentials. " +
            "Ensure SUPABASE_SERVICE_ROLE_KEY is set in server environment only."
        );
    }

    return createClient<Database>(url, key, {
        auth: {
            // Disable auto-refresh and session persistence —
            // this client is stateless and used only in server API routes.
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
