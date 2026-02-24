/**
 * lib/supabase/types.ts
 *
 * TypeScript types matching the Supabase database schema.
 * Keep in sync with database/migrations/001_schema.sql.
 *
 * NOTE: Once the Supabase project is live, replace this with the
 * auto-generated types by running:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
 */

export type PromptStatus = "draft" | "pending" | "approved" | "archived";
export type PromptDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type AuditAction = "approved" | "rejected" | "archived" | "restored" | "deleted";
export type AppRole = "user" | "admin";

export interface Profile {
    id: string;
    display_name: string;
    role: AppRole;
    created_at: string;
}

export interface Prompt {
    id: string;
    title: string;
    category: string[];
    role: string | null;
    use_case: string | null;
    prompt_text: string;
    model_compatibility: string[];
    difficulty: PromptDifficulty;
    status: PromptStatus;
    version: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // Joined fields (present when queried with select owner:profiles(...))
    owner?: Pick<Profile, "display_name" | "role">;
}

export interface AuditLog {
    id: string;
    prompt_id: string | null;
    actor_id: string | null;
    action: AuditAction;
    note: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    // Joined fields
    prompt?: Pick<Prompt, "title"> | null;
    actor?: Pick<Profile, "display_name"> | null;
}

export interface Bookmark {
    user_id: string;
    prompt_id: string;
    created_at: string;
}

// Supabase Database interface (used by the typed client)
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, "created_at">;
                Update: Partial<Omit<Profile, "id" | "created_at">>;
            };
            prompts: {
                Row: Prompt;
                Insert: Omit<Prompt, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Prompt, "id" | "owner_id" | "created_at">>;
            };
            audit_log: {
                Row: AuditLog;
                Insert: Omit<AuditLog, "id" | "created_at">;
                Update: never; // Append-only
            };
            bookmarks: {
                Row: Bookmark;
                Insert: Bookmark;
                Update: never; // Create or delete only
            };
        };
        Enums: {
            prompt_status: PromptStatus;
            prompt_difficulty: PromptDifficulty;
            audit_action: AuditAction;
            app_role: AppRole;
        };
    };
};
