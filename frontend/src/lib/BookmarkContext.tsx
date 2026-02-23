"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BookmarkContextType {
    bookmarks: string[];
    toggleBookmark: (id: string) => void;
    isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = "d88_bookmarks";

export function BookmarkProvider({ children }: { children: ReactNode }) {
    const [bookmarks, setBookmarks] = useState<string[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setBookmarks(JSON.parse(stored));
            }
        } catch {
            // Silently fail — localStorage may be unavailable
        }
        setLoaded(true);
    }, []);

    // Persist to localStorage on change (skip initial load)
    useEffect(() => {
        if (loaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
            } catch {
                // Silently fail
            }
        }
    }, [bookmarks, loaded]);

    const toggleBookmark = (id: string) => {
        setBookmarks(prev =>
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
    };

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
