"use client";

import Link from "next/link";
import { Copy, User, ExternalLink, Sparkles, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { Prompt } from "@/lib/mock-data";
import { useState } from "react";
import { motion } from "framer-motion";
import { useBookmarks } from "@/lib/BookmarkContext";

interface PromptCardProps {
    prompt: Prompt;
}

const DIFFICULTY_STYLE: Record<string, { color: string; label: string }> = {
    Beginner: { color: 'var(--primary)', label: 'BGN' },
    Intermediate: { color: 'var(--accent-yellow)', label: 'INT' },
    Advanced: { color: 'var(--accent-red)', label: 'ADV' },
};

export function PromptCard({ prompt }: PromptCardProps) {
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
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
        >
            <Link
                href={`/prompts/${prompt.id}`}
                className="block group relative h-full flex flex-col transition-colors"
                style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    padding: '16px',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
                {/* Top row: categories + difficulty */}
                <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                        {prompt.category.map((cat) => (
                            <span key={cat} className="term-tag term-tag-primary">{cat}</span>
                        ))}
                    </div>
                    <span
                        className="text-[10px] font-bold tracking-widest shrink-0"
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
                            {prompt.owner}
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
        </motion.div>
    );
}
