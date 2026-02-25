import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // 1. Session client — identify the caller using SSR client
    const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll() { }
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Service client — elevated access for admin ops
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const serviceClient = createClient<Database>(supabaseUrl, serviceRoleKey);

    // Verify admin role
    const { data: profileData } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const profile = profileData as { role: string } | null;

    if (profile?.role !== "admin") {
        return NextResponse.json({ error: "Forbidden: admin role required." }, { status: 403 });
    }

    // 3. Fetch audit log (Last 100 entries)
    const { data, error, count } = await serviceClient
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
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {
        console.error("[GET /api/admin/audit]", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        auditLog: data,
        totalCount: count ?? 0
    }, { status: 200 });
}
