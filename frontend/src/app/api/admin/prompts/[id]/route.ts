/**
 * app/api/admin/prompts/[id]/route.ts
 *
 * PATCH /api/admin/prompts/:id
 * Admin-only: Approve or reject a pending prompt.
 *
 * Security contracts:
 * - Reads user session from cookies (no token in body)
 * - Verifies user is an admin (role = 'admin' in profiles table)
 * - Uses service_role client for the actual DB update (bypasses RLS)
 * - Writes to audit_log for every action
 * - Returns 401 if not authenticated, 403 if not admin
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/types";

const PatchSchema = z.object({
    action: z.enum(["approved", "rejected", "archived"]),
});

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: promptId } = await params;
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

    // 3. Parse and validate body
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid action. Use 'approved' or 'rejected'." }, { status: 422 });
    }

    const { action } = parsed.data;

    // 4. Use service_role client to bypass RLS for the actual update

    const { error: updateError } = await (serviceClient
        .from("prompts") as any)
        .update({ status: action })
        .eq("id", promptId);

    if (updateError) {
        console.error("[PATCH /api/admin/prompts]", updateError.message);
        return NextResponse.json({ error: "Failed to update prompt status." }, { status: 500 });
    }

    // 5. Write to audit_log — every admin action must be recorded
    const { error: auditError } = await serviceClient
        .from("audit_log")
        .insert({
            prompt_id: promptId,
            actor_id: user.id,
            action: action,
            note: null,
            metadata: {},
        } as any);

    if (auditError) {
        console.warn("[PATCH /api/admin/prompts] audit_log write failed:", auditError.message);
        // Don't fail the request — status update succeeded, audit is secondary
    }

    return NextResponse.json({ status: action }, { status: 200 });
}
