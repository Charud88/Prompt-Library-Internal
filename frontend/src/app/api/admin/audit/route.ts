/**
 * app/api/admin/audit/route.ts
 *
 * GET /api/admin/audit
 * Admin-only: Fetch the audit log.
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
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { }
            },
        }
    );

    const { data: { user } } = await sessionClient.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Use service_role to verify admin role and fetch audit log
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

    // 3. Fetch audit log
    const { data, error } = await serviceClient
        .from("audit_log")
        .select(`
            id,
            prompt_id,
            actor_id,
            action,
            note,
            metadata,
            created_at,
            prompt:prompts(title),
            actor:profiles!actor_id(display_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("[GET /api/admin/audit]", error.message);
        return NextResponse.json({ error: "Failed to load audit log" }, { status: 500 });
    }

    return NextResponse.json({ auditLog: data }, { status: 200 });
}
