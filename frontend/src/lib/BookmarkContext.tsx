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
    const supabase = createClient();

    // 1. Listen for Auth Changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // 2. Load Bookmarks (Hybrid)
    useEffect(() => {
        const loadBookmarks = async () => {
            if (user) {
                // Load from Supabase
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
                    console.error("Failed to remove bookmark", error);
                    // Rollback
                    setBookmarks(prev => [...prev, id]);
                }
            } else {
                const { error } = await supabase
                    .from("bookmarks")
                    .insert({ user_id: user.id, prompt_id: id } as any);

                if (error) {
                    console.error("Failed to add bookmark", error);
                    // Rollback
                    setBookmarks(prev => prev.filter(b => b !== id));
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
