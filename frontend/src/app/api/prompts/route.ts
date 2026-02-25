/**
 * app/api/prompts/route.ts
 *
 * POST /api/prompts
 * Handles prompt submission from the submit form.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

// Only select columns the UI needs — never expose owner_id or deleted_at to components
const PUBLIC_COLUMNS =
    "id, title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, version, created_at, updated_at";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

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

    let query = supabase
        .from("prompts")
        .select(`
            ${PUBLIC_COLUMNS},
            profiles:owner_id (display_name)
        `)
        .eq("status", "approved")
        .is("deleted_at", null);

    // Apply filtering
    if (category && category !== "All") {
        query = query.contains("category", [category]);
    }
    if (difficulty && difficulty !== "All") {
        query = query.eq("difficulty", difficulty);
    }
    if (search) {
        query = query.or(`title.ilike.%${search}%,use_case.ilike.%${search}%,prompt_text.ilike.%${search}%`);
    }

    const { data, error } = await query
        .order("created_at", { ascending: false });

    if (error) {
        console.error("[GET /api/prompts]", error.message);
        return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
    }

    return NextResponse.json({
        prompts: data ?? []
    }, { status: 200 });
}

// Input validation schema — mirrors DB constraints
const SubmitPromptSchema = z.object({
    title: z
        .string()
        .min(3, "Title must be at least 3 characters")
        .max(120, "Title must be under 120 characters"),
    category: z
        .array(z.string())
        .min(1, "At least one category is required")
        .max(5, "Maximum 5 categories allowed"),
    role: z
        .string()
        .max(80, "Role must be under 80 characters")
        .optional(),
    use_case: z
        .string()
        .max(500, "Use case must be under 500 characters")
        .optional(),
    prompt_text: z
        .string()
        .min(10, "Prompt must be at least 10 characters")
        .max(8000, "Prompt must be under 8000 characters"),
    model_compatibility: z
        .array(z.string())
        .default([]),
    difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export async function POST(request: Request) {
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

    // Get the user from the session
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: "Authentication required. Please sign in with your Digit88 account." },
            { status: 401 }
        );
    }

    // Security Contract: Domain restriction check
    if (!user.email?.endsWith("@digit88.com")) {
        return NextResponse.json(
            { error: "Only @digit88.com accounts can submit prompts." },
            { status: 403 }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = SubmitPromptSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
            { status: 422 }
        );
    }

    // Cast the insertion object to any as a last resort for TS resolution issues
    // but keep it structured correctly for the DB.
    const insertData: any = {
        title: parsed.data.title,
        category: parsed.data.category,
        role: parsed.data.role || null,
        use_case: parsed.data.use_case || null,
        prompt_text: parsed.data.prompt_text,
        model_compatibility: parsed.data.model_compatibility,
        difficulty: parsed.data.difficulty,
        owner_id: user.id,
        status: "pending",
        version: "1.0.0",
    };

    const { data, error } = await supabase
        .from("prompts")
        .insert(insertData)
        .select("id")
        .single();

    if (error) {
        console.error("[POST /api/prompts]", error.message);
        return NextResponse.json({ error: "Failed to submit prompt. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ id: (data as any)?.id }, { status: 201 });
}
