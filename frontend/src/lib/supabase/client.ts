/**
 * lib/supabase/client.ts
 *
 * Browser-side Supabase client.
 * Uses the ANON key — safe to expose to the browser.
 * Subject to RLS policies on every query.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

let supabase: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        throw new Error(
            "Missing Supabase environment variables. " +
            "Copy .env.local.example to .env.local and fill in your project credentials."
        );
    }

    if (!supabase) {
        supabase = createBrowserClient<Database>(url, key);
    }

    return supabase;
}
