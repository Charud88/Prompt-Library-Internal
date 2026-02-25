"use client";

import Link from "next/link";
import { Copy, User, ExternalLink, Sparkles, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { Prompt } from "@/lib/mock-data";
import { useState } from "react";
import { motion } from "framer-motion";
import { useBookmarks } from "@/lib/BookmarkContext";


interface PromptCardProps {
    prompt: Prompt;
    showStatus?: boolean;
}

const DIFFICULTY_STYLE: Record<string, { color: string; label: string }> = {
    Beginner: { color: 'var(--primary)', label: 'BGN' },
    Intermediate: { color: 'var(--accent-yellow)', label: 'INT' },
    Advanced: { color: 'var(--accent-red)', label: 'ADV' },
};

export function PromptCard({ prompt, showStatus }: PromptCardProps) {
    const [copied, setCopied] = useState(false);
    const { toggleBookmark, isBookmarked } = useBookmarks();
    const bookmarked = isBookmarked(prompt.id);
    const diff = DIFFICULTY_STYLE[prompt.difficulty] ?? DIFFICULTY_STYLE.Beginner;

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(prompt.prompt_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(prompt.id);
    };

    return (
        <Link
            href={`/prompts/${prompt.id}`}
            className="block group relative h-full flex flex-col transition-all duration-300"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                padding: '16px',
            }}
        >
            {/* Top row: categories + difficulty */}
            <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                    {prompt.category.map((cat) => (
                        <span key={cat} className="term-tag term-tag-primary">{cat}</span>
                    ))}
                    {showStatus && (prompt as any).status && (
                        <span
                            className="px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded shadow-sm"
                            style={{
                                background: (prompt as any).status === "approved" ? "rgba(16, 185, 129, 0.15)" :
                                    (prompt as any).status === "rejected" ? "rgba(244, 63, 94, 0.15)" :
                                        "rgba(251, 191, 36, 0.15)",
                                color: (prompt as any).status === "approved" ? "#10b981" :
                                    (prompt as any).status === "rejected" ? "#f43f5e" :
                                        "#fbbf24",
                                border: `1px solid ${(prompt as any).status === "approved" ? "rgba(16, 185, 129, 0.3)" :
                                    (prompt as any).status === "rejected" ? "rgba(244, 63, 94, 0.3)" :
                                        "rgba(251, 191, 36, 0.3)"}`
                            }}
                        >
                            {(prompt as any).status}
                        </span>
                    )}
                </div>
                <span
                    className="text-[10px] font-bold tracking-widest shrink-0 mt-0.5"
                    style={{ color: diff.color }}
                >
                    {diff.label}
                </span>
            </div>

            {/* Title */}
            <h3
                className="text-sm font-bold mb-2 tracking-tight line-clamp-2 group-hover:transition-colors"
                style={{ color: 'var(--foreground)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground)')}
            >
                {prompt.title}
            </h3>

            {/* Use case */}
            <p
                className="text-xs mb-4 line-clamp-2 flex-1"
                style={{ color: 'var(--foreground-muted)' }}
            >
                {prompt.use_case}
            </p>

            {/* Footer */}
            <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: '1px solid var(--border)' }}
            >
                <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3" style={{ color: 'var(--foreground-muted)' }} />
                    <span
                        className="text-[11px] font-medium tracking-wide"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        {prompt.owner || (prompt as any).profiles?.display_name || "Digit88 Library"}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
                        v{prompt.version}
                    </span>
                    <button
                        onClick={handleBookmark}
                        className="p-1.5 transition-colors"
                        style={{
                            color: bookmarked ? 'var(--accent-yellow)' : 'var(--foreground-muted)',
                            background: bookmarked ? 'rgba(251, 191, 36, 0.12)' : 'transparent',
                        }}
                        title={bookmarked ? "Remove Bookmark" : "Bookmark Prompt"}
                    >
                        {bookmarked ? (
                            <BookmarkCheck className="h-3.5 w-3.5" />
                        ) : (
                            <Bookmark className="h-3.5 w-3.5" />
                        )}
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 transition-colors"
                        style={{
                            color: copied ? 'var(--primary)' : 'var(--foreground-muted)',
                            background: copied ? 'var(--primary-dim)' : 'transparent',
                        }}
                        title="Copy Prompt"
                    >
                        {copied ? (
                            <Check className="h-3.5 w-3.5" />
                        ) : (
                            <Copy className="h-3.5 w-3.5" />
                        )}
                    </button>
                </div>
            </div>

            {/* Corner indicator for advanced */}
            {prompt.difficulty === "Advanced" && (
                <div className="absolute top-2 right-2 opacity-20">
                    <Sparkles className="h-3 w-3" style={{ color: 'var(--accent-red)' }} />
                </div>
            )}
        </Link>
    );
}

export function PromptCardSkeleton() {
    return (
        <div
            className="p-6 h-full flex flex-col space-y-4"
            style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                padding: '16px'
            }}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex gap-1.5">
                    <div className="h-4 w-12 rounded bg-muted/50 animate-pulse" />
                    <div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
                </div>
                <div className="h-4 w-8 rounded bg-muted/50 animate-pulse" />
            </div>
            <div className="space-y-2 flex-1">
                <div className="h-5 w-full rounded bg-muted/50 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-muted/50 animate-pulse" />
            </div>
            <div className="pt-3 border-t border-border mt-auto flex justify-between items-center">
                <div className="h-4 w-20 rounded bg-muted/50 animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-6 w-6 rounded bg-muted/50 animate-pulse" />
                    <div className="h-6 w-6 rounded bg-muted/50 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
