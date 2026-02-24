/**
 * lib/data/prompts.ts
 *
 * Data access layer — all Supabase query functions for prompts.
 * Components import from here, never directly from supabase/client.
 *
 * Security:
 * - All reads use the anon key + RLS (only approved, non-deleted prompts returned)
 * - ID parameters are validated as UUIDs before querying (prevents IDOR/injection)
 * - Only specific columns are selected (no owner_id, deleted_at exposed to UI)
 */

import { createClient } from "@/lib/supabase/client";
import type { Prompt, Category } from "@/lib/mock-data";

// Only select columns the UI needs — never expose owner_id or deleted_at to components
const PUBLIC_COLUMNS =
    "id, title, category, role, use_case, prompt_text, model_compatibility, difficulty, status, version, created_at, updated_at";

// UUID v4 regex — validate all ID params before querying to prevent IDOR
const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maps a Supabase prompt row to the Prompt interface used by existing components.
 * Keeps backward compatibility with mock-data shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function adaptPrompt(p: Record<string, any>): Prompt {
    return {
        id: p.id,
        title: p.title,
        category: (p.category ?? []) as Category[],
        role: p.role ?? "",
        use_case: p.use_case ?? "",
        prompt_text: p.prompt_text,
        model_compatibility: (p.model_compatibility ?? []) as string[],
        difficulty: p.difficulty,
        status: p.status,
        version: p.version,
        // owner: display name from profiles — empty until auth joins profiles table
        owner: "",
        created_at: p.created_at,
        updated_at: p.updated_at,
    };
}

/**
 * Fetch all approved, non-deleted prompts.
 * Used by Home and Browse pages.
 * Returns [] on error — never throws.
 */
export async function fetchApprovedPrompts(): Promise<Prompt[]> {
    const supabase = createClient();

    const { data, error } = await (supabase
        .from("prompts")
        .select(`
            ${PUBLIC_COLUMNS},
            profiles:owner_id (display_name)
        `)
        .eq("status", "approved")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }) as any);

    if (error) {
        console.error("[fetchApprovedPrompts]", error.message);
        return [];
    }

    return (data ?? []).map((p: any) => {
        const adapted = adaptPrompt(p);
        if (p.profiles && !Array.isArray(p.profiles)) {
            adapted.owner = (p.profiles as any).display_name || "Unknown";
        }
        return adapted;
    });
}

/**
 * Fetch a single prompt by ID.
 * Security: Uses RLS — non-admins will only see approved prompts.
 * ID is validated as a UUID — returns null if invalid or not found.
 * Used by Prompt Detail page.
 */
export async function fetchPromptById(id: string): Promise<Prompt | null> {
    if (!UUID_RE.test(id)) {
        console.warn("[fetchPromptById] Invalid UUID:", id);
        return null;
    }

    const supabase = createClient();

    const { data, error } = await (supabase
        .from("prompts")
        .select(`
            ${PUBLIC_COLUMNS},
            profiles:owner_id (display_name)
        `)
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle() as any);

    if (error) {
        console.error("[fetchPromptById]", error.message);
        return null;
    }

    if (!data) return null;

    const adapted = adaptPrompt(data);
    // Extract display name from join result
    if (data.profiles && !Array.isArray(data.profiles)) {
        adapted.owner = (data.profiles as any).display_name || "Unknown";
    }

    return adapted;
}
