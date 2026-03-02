import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;

    if (!id) {
        return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // ignore if called from server component
                    }
                },
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

    // Explicitly verify the prompt belongs to the user and is private before hard-deleting
    const { data, error: fetchError } = await supabase
        .from("prompts")
        .select()
        .eq("id", id)
        .single();

    const prompt = data as any;

    if (fetchError || !prompt) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.owner_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized. You do not own this prompt." }, { status: 403 });
    }

    if (!prompt.is_private) {
        return NextResponse.json({ error: "Only private prompts can be deleted permanently by users." }, { status: 403 });
    }

    // Perform hard delete
    const { error: deleteError } = await supabase
        .from("prompts")
        .delete()
        .eq("id", id);

    if (deleteError) {
        console.error(`[DELETE /api/prompts/${id}]`, deleteError.message);
        return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}
