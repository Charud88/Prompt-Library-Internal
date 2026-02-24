"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { createClient } from "./supabase/client";
import type { Database } from "./supabase/types";

const STORAGE_KEY = "d88_bookmarks";

interface BookmarkContextType {
    bookmarks: string[];
    toggleBookmark: (id: string) => Promise<void>;
    isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);
    const [supabase] = useState(() => createClient());

    // 1. Listen for Auth Changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // 2. Load Bookmarks (Hybrid w/ Merge)
    useEffect(() => {
        const loadBookmarks = async () => {
            if (user) {
                // Check if there are local bookmarks to merge first
                let localBookmarksToMerge: string[] = [];
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.every(i => typeof i === "string")) {
                            localBookmarksToMerge = parsed;
                        }
                    }
                } catch { /* ignore */ }

                // Merge local into DB if they exist
                if (localBookmarksToMerge.length > 0) {
                    const inserts = localBookmarksToMerge.map(id => ({
                        user_id: user.id,
                        prompt_id: id
                    }));

                    // Insert ignoring duplicates (on conflict do nothing)
                    // Note: Supabase JS doesn't expose onConflict easily for simple inserts without declaring the constraint, 
                    // so we do standard insert. RLS or unique constraint will throw 23505 on dupes which we can just ignore.
                    for (const insert of inserts) {
                        await supabase.from("bookmarks").insert(insert as any).then(({ error }: any) => {
                            if (error && error.code !== '23505') console.error("Migration error:", error)
                        })
                    }
                    localStorage.removeItem(STORAGE_KEY);
                }

                // Load Final from Supabase
                const { data, error } = await supabase
                    .from("bookmarks")
                    .select("prompt_id");

                if (!error && data) {
                    setBookmarks(data.map(b => (b as any).prompt_id));
                }
            } else {
                // Load from LocalStorage for guests
                try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                        const parsed = JSON.parse(stored);
                        if (Array.isArray(parsed) && parsed.every(i => typeof i === "string")) {
                            setBookmarks(parsed);
                        }
                    }
                } catch {
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        };

        loadBookmarks();
    }, [user, supabase]);

    // 3. Persist Guest Bookmarks to LocalStorage
    useEffect(() => {
        if (!user) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
            } catch { /* ignore */ }
        }
    }, [bookmarks, user]);

    const toggleBookmark = useCallback(async (id: string) => {
        const alreadyBookmarked = bookmarks.includes(id);

        // Optimistic UI update
        setBookmarks(prev =>
            alreadyBookmarked ? prev.filter(b => b !== id) : [...prev, id]
        );

        if (user) {
            if (alreadyBookmarked) {
                const { error } = await supabase
                    .from("bookmarks")
                    .delete()
                    .match({ user_id: user.id, prompt_id: id });

                if (error) {
                    console.error("[BookmarkContext] Failed to remove bookmark in db:", error);
                    // Rollback
                    setBookmarks(prev => [...prev, id]);
                }
            } else {
                const { error } = await supabase
                    .from("bookmarks")
                    .insert({ user_id: user.id, prompt_id: id } as any);

                if (error) {
                    console.error("[BookmarkContext] Failed to add bookmark in db:", error);
                    // Rollback
                    setBookmarks(prev => prev.filter(b => b !== id));

                    if (error.code === '23505') {
                        // Already exists in DB - silent recover
                        setBookmarks(prev => [...prev, id]);
                    }
                }
            }
        }
    }, [bookmarks, user, supabase]);

    const isBookmarked = (id: string) => bookmarks.includes(id);

    return (
        <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
            {children}
        </BookmarkContext.Provider>
    );
}

export function useBookmarks() {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error("useBookmarks must be used within a BookmarkProvider");
    }
    return context;
}
