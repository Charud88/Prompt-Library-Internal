/**
 * app/api/prompts/route.ts
 *
 * POST /api/prompts
 * Handles prompt submission from the submit form.
 *
 * Security contracts:
 * - Validates all input fields with Zod before touching the database
 * - owner_id is set from auth session (NOT from request body — prevents IDOR)
 * - status is hardcoded to 'pending' (client cannot self-approve)
 * - Uses service_role client on the server only
 * - Returns 401 if user is not authenticated
 *
 * NOTE: Auth check is a TODO placeholder until Supabase Google OAuth is implemented.
 * Once auth is in place, replace the TODO block with real session validation.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

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
    // ----------------------------------------------------------------
    // TODO: Supabase Auth check — implement when Google OAuth is done
    // Replace this block with:
    //
    // const { createServiceClient } = await import("@/lib/supabase/server");
    // const supabase = createServiceClient();
    // const { data: { user } } = await supabase.auth.getUser(bearerToken);
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // if (!user.email?.endsWith("@digit88.com")) {
    //     return NextResponse.json({ error: "Only @digit88.com accounts can submit prompts." }, { status: 403 });
    // }
    // ----------------------------------------------------------------
    return NextResponse.json(
        { error: "Authentication required. Please sign in with your Digit88 account to submit prompts." },
        { status: 401 }
    );

    // ----------------------------------------------------------------
    // The code below is ready to execute once auth is in place.
    // Uncomment when removing the early return above.
    // ----------------------------------------------------------------
    /*
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

    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    const { data, error } = await supabase
        .from("prompts")
        .insert({
            ...parsed.data,
            owner_id: user.id,  // Always from auth session, NEVER from body
            status: "pending",  // Client can never self-approve
        })
        .select("id")
        .single();

    if (error) {
        console.error("[POST /api/prompts]", error.message);
        return NextResponse.json({ error: "Failed to submit prompt. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
    */
}
