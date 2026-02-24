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
        supabase = createBrowserClient<Database>(url, key, {
            global: {
                fetch: async (fetchUrl, options) => {
                    // Adblocker fallback: Some browsers (Brave) block network requests
                    // but don't fail immediately, holding the `navigator.locks` lock forever.
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);

                    try {
                        const response = await fetch(fetchUrl, {
                            ...options,
                            signal: controller.signal,
                        });
                        clearTimeout(timeoutId);
                        return response;
                    } catch (err) {
                        clearTimeout(timeoutId);
                        throw err;
                    }
                },
            },
        });
    }

    return supabase;
}
