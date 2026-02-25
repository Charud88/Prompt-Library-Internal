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

    // 3. Fetch pending prompts
    const { data: pending, error: pendingErr } = await (serviceClient
        .from("prompts") as any)
        .select(`
            id, 
            title, 
            use_case, 
            category, 
            owner_id, 
            created_at,
            owner:profiles!owner_id(display_name)
        `)
        .eq("status", "pending")
        .is("deleted_at", null)
        .order("created_at", { ascending: true });

    if (pendingErr) {
        console.error("[GET /api/admin/prompts] pending:", pendingErr.message);
        return NextResponse.json({ error: pendingErr.message }, { status: 500 });
    }

    // 4. Fetch approved prompts
    const { data: approved, error: approvedErr } = await (serviceClient
        .from("prompts") as any)
        .select(`
            id, 
            title, 
            use_case, 
            category, 
            owner_id, 
            created_at,
            owner:profiles!owner_id(display_name)
        `)
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (approvedErr) {
        console.error("[GET /api/admin/prompts] approved:", approvedErr.message);
        return NextResponse.json({ error: approvedErr.message }, { status: 500 });
    }

    // 5. Stats (Total contributor count)
    const { count: contributorCount } = await (serviceClient
        .from("profiles") as any)
        .select("id", { count: "exact", head: true });

    return NextResponse.json({
        pending: pending ?? [],
        approved: approved ?? [],
        approvedCount: (approved ?? []).length,
        contributorCount: contributorCount ?? 0
    });
}
