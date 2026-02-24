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

        // Anti-Deadlock Patch:
        // navigator.locks frequently deadlocks in Firefox/Brave during Next.js client-side routing
        // because multiple components rapidly mount/unmount and fight for the token refresh lock.
        let cachedSession: any = null;

        // Keep cache updated automatically
        supabase.auth.onAuthStateChange((_event, session) => {
            cachedSession = session;
        });

        const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
        supabase.auth.getSession = async () => {
            // If the lock hangs for more than 800ms, force resolve with the last known good session
            // to completely eliminate infinite loading spinners in the UI.
            const timeout = new Promise<any>((resolve) =>
                setTimeout(() => resolve({ data: { session: cachedSession }, error: null }), 800)
            );

            try {
                const result = await Promise.race([originalGetSession(), timeout]);
                if (result?.data?.session) {
                    cachedSession = result.data.session;
                }
                return result;
            } catch (err) {
                return { data: { session: cachedSession }, error: err as any };
            }
        };
    }

    return supabase;
}
