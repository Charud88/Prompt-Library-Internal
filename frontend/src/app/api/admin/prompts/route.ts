/**
 * app/api/admin/prompts/route.ts
 *
 * GET /api/admin/prompts
 * Admin-only: Fetch all pending prompts with owner info.
 *
 * Security: Verifies caller is admin. Uses service_role to bypass RLS.
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export async function GET() {
    const cookieStore = await cookies();

    // 1. Session client — identify the caller
    const sessionClient = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch { /* ignore */ }
                },
            },
        }
    );

    const { data: { user } } = await sessionClient.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use service_role to verify admin role (bypasses RLS reliably)
    const { createServiceClient } = await import("@/lib/supabase/server");
    const serviceClient = createServiceClient();

    const { data: profile } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .returns<{ role: string }[]>()
        .single();

    if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: admin role required." }, { status: 403 });
    }

    // 3. Fetch pending prompts
    const { data: pending, error: pendingErr } = await (serviceClient
        .from("prompts") as any)
        .select("id, title, use_case, category, owner_id, created_at")
        .eq("status", "pending")
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    if (pendingErr) {
        console.error("[GET /api/admin/prompts] pending:", pendingErr.message);
        return NextResponse.json({ error: "Failed to fetch queue." }, { status: 500 });
    }

    // 4. Fetch approved prompts
    const { data: approved, error: approvedErr } = await (serviceClient
        .from("prompts") as any)
        .select("id, title, use_case, category, owner_id, created_at")
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (approvedErr) {
        console.error("[GET /api/admin/prompts] approved:", approvedErr.message);
    }

    // 5. Fetch owner display names for all prompts
    const allPrompts = [...(pending ?? []), ...(approved ?? [])];
    const ownerIds = [...new Set(allPrompts.map((p: any) => p.owner_id))];
    let ownerMap: Record<string, string> = {};

    if (ownerIds.length > 0) {
        const { data: profiles } = await (serviceClient
            .from("profiles") as any)
            .select("id, display_name")
            .in("id", ownerIds);

        if (profiles) {
            for (const p of profiles) {
                ownerMap[p.id] = p.display_name ?? "Unknown";
            }
        }
    }

    const enrich = (list: any[]) => list.map((p: any) => ({
        ...p,
        owner: { display_name: ownerMap[p.owner_id] ?? "Unknown" },
    }));

    // 6. Stats
    const { count: contributorCount } = await (serviceClient
        .from("profiles") as any)
        .select("id", { count: "exact", head: true });

    return NextResponse.json({
        pending: enrich(pending ?? []),
        approved: enrich(approved ?? []),
        approvedCount: (approved ?? []).length,
        contributorCount: contributorCount ?? 0,
    });
}
