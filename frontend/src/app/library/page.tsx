"use client";

import { useMemo, useState, useEffect } from "react";
import { type Prompt } from "@/lib/mock-data";
import { fetchApprovedPrompts } from "@/lib/data/prompts";
import { PromptCard } from "@/components/shared/PromptCard";
import { useBookmarks } from "@/lib/BookmarkContext";
import { Bookmark, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
    const { bookmarks } = useBookmarks();
    const [allPrompts, setAllPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApprovedPrompts()
            .then(setAllPrompts)
            .finally(() => setLoading(false));
    }, []);

    const bookmarkedPrompts = useMemo(() =>
        allPrompts.filter(p => bookmarks.includes(p.id)),
        [allPrompts, bookmarks]
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
                <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Loading Collection...</div>
            </div>
        );
    }

    return (
        <section
            className="p-8 rounded-2xl border animate-slide-up"
            style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--surface), transparent 50%)',
                backdropFilter: 'blur(12px)'
            }}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="term-label mb-1">YOUR COLLECTION</div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                        LIBRARY
                    </h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                        {bookmarkedPrompts.length} SAVED PROMPT{bookmarkedPrompts.length !== 1 ? 'S' : ''}
                    </p>
                </div>

                {/* Grid or Empty State */}
                {bookmarkedPrompts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {bookmarkedPrompts.map(prompt => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                        <Bookmark className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                        <h3 className="text-sm font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                            NO SAVED PROMPTS
                        </h3>
                        <p className="text-xs tracking-wide mb-6" style={{ color: 'var(--foreground-muted)' }}>
                            Bookmark prompts to build your personal collection.
                        </p>
                        <Link
                            href="/browse"
                            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-transform hover:scale-105 active:scale-95"
                            style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                        >
                            BROWSE PROMPTS <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
