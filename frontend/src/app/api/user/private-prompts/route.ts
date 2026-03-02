import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Authentication required." },
            { status: 401 }
        );
    }

    const { data, error } = await supabase
        .from("prompts")
        .select(`
            id, title, category, prompt_text, difficulty, status, version, created_at,
            profiles:owner_id (display_name)
        `)
        .eq("owner_id", user.id)
        .eq("is_private", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[GET /api/user/private-prompts]", error.message);
        return NextResponse.json({ error: "Failed to fetch private prompts" }, { status: 500 });
    }

    return NextResponse.json({ prompts: data ?? [] }, { status: 200 });
}
