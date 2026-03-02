"use client";

import { useMemo, useState, useEffect } from "react";
import { PromptCard } from "@/components/shared/PromptCard";
import { useBookmarks } from "@/lib/BookmarkContext";
import { Bookmark, ArrowRight, AlertCircle, Loader2, Lock, Trash2, LogIn } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LibraryPage() {
    const { bookmarks } = useBookmarks();
    const [prompts, setPrompts] = useState<any[]>([]);
    const [privatePrompts, setPrivatePrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<"saved" | "private">("saved");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [supabase] = useState(() => createClient());

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkUser();
    }, [supabase.auth]);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/library`,
            },
        });
    };

    const fetchPrompts = async () => {
        setLoading(true);
        setError(false);
        try {
            const [publicRes, privateRes] = await Promise.all([
                fetch("/api/prompts"),
                fetch("/api/user/private-prompts")
            ]);

            if (!publicRes.ok) throw new Error("Failed to fetch public prompts");

            const publicData = await publicRes.json();
            setPrompts(publicData.prompts || []);

            if (privateRes.ok) {
                const privateData = await privateRes.json();
                setPrivatePrompts(privateData.prompts || []);
            }
        } catch (err) {
            console.error("Library load error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    const handleDeletePrivate = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPromptToDelete(id);
    };

    const confirmDeletePrivate = async () => {
        if (!promptToDelete) return;

        setDeletingId(promptToDelete);
        try {
            const res = await fetch(`/api/prompts/${promptToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");

            // Remove from state without reloading
            setPrivatePrompts(prev => prev.filter(p => p.id !== promptToDelete));
            setPromptToDelete(null);
        } catch (err) {
            console.error(err);
            alert("Failed to delete the prompt. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const bookmarkedPrompts = useMemo(() =>
        prompts.filter(p => bookmarks.includes(p.id)),
        [prompts, bookmarks]
    );

    if (loading) {
        return (
            <div className="py-20 text-center animate-slide-up bg-card border border-border rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <div className="term-label tracking-[0.2em]">SYNCING COLLECTION...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                <div className="term-label mb-2 text-red-500">SYSTEM_ERROR: SYNC_FAILED</div>
                <p className="text-sm text-foreground-muted">Failed to load your collection. Please try again.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold underline">RETRY</button>
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
                <div className="pb-4 flex flex-col items-center justify-between gap-6" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="text-center">
                        <div className="term-label mb-1">YOUR COLLECTION</div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                            LIBRARY
                        </h1>
                        <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                            {activeTab === "saved"
                                ? `${bookmarkedPrompts.length} SAVED PROMPT${bookmarkedPrompts.length !== 1 ? 'S' : ''}`
                                : `${privatePrompts.length} PRIVATE PROMPT${privatePrompts.length !== 1 ? 'S' : ''}`
                            }
                        </p>
                    </div>

                    <div className="flex rounded-md border p-1" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                        <button
                            onClick={() => setActiveTab("saved")}
                            className={`flex justify-center items-center gap-2 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors rounded ${activeTab === 'saved'
                                ? 'text-[var(--primary)]'
                                : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#ffffff0a]'
                                }`}
                        >
                            <Bookmark className="h-4 w-4" />
                            Saved
                        </button>
                        <button
                            onClick={() => setActiveTab("private")}
                            className={`flex justify-center items-center gap-2 px-6 py-2 text-xs font-bold tracking-widest uppercase transition-colors rounded ${activeTab === 'private'
                                ? 'text-[var(--primary)]'
                                : 'text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#ffffff0a]'
                                }`}
                        >
                            <Lock className="h-4 w-4" />
                            Private
                        </button>
                    </div>
                </div>

                {/* Grid or Empty State */}
                {activeTab === "saved" && (
                    bookmarkedPrompts.length > 0 ? (
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
                    )
                )}

                {activeTab === "private" && (
                    privatePrompts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {privatePrompts.map(prompt => (
                                <div key={prompt.id} className="relative group">
                                    <PromptCard prompt={prompt} />
                                    <button
                                        onClick={(e) => handleDeletePrivate(prompt.id, e)}
                                        disabled={deletingId === prompt.id}
                                        className="absolute top-4 right-4 p-2 rounded bg-black/50 backdrop-blur border border-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 hover:text-red-300 disabled:opacity-50 z-10"
                                        title="Delete Private Prompt"
                                    >
                                        {deletingId === prompt.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                            {!user ? (
                                <>
                                    <LogIn className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                                    <h3 className="text-sm font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                                        SIGN IN REQUIRED
                                    </h3>
                                    <p className="text-xs tracking-wide mb-6" style={{ color: 'var(--foreground-muted)' }}>
                                        Private prompts are only visible to logged-in Digit88 users.
                                    </p>
                                    <button
                                        onClick={handleLogin}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-transform hover:scale-105 active:scale-95"
                                        style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                                    >
                                        SIGN IN WITH GOOGLE <ArrowRight className="h-3 w-3" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Lock className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                                    <h3 className="text-sm font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                                        NO PRIVATE PROMPTS
                                    </h3>
                                    <p className="text-xs tracking-wide mb-6" style={{ color: 'var(--foreground-muted)' }}>
                                        You haven't created any private prompts yet.
                                    </p>
                                    <Link
                                        href="/submit"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-transform hover:scale-105 active:scale-95"
                                        style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                                    >
                                        CREATE PRIVATE PROMPT <ArrowRight className="h-3 w-3" />
                                    </Link>
                                </>
                            )}
                        </div>
                    )
                )}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {promptToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div
                        className="w-full max-w-md p-6 rounded-2xl border flex flex-col items-center text-center shadow-2xl"
                        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                    >
                        <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 tracking-tight" style={{ color: 'var(--foreground)' }}>
                            Delete Private Prompt?
                        </h3>
                        <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
                            Are you sure you want to permanently delete this prompt? This action cannot be undone and it will be removed from your library forever.
                        </p>

                        <div className="flex w-full gap-3">
                            <button
                                onClick={() => setPromptToDelete(null)}
                                disabled={deletingId !== null}
                                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--foreground-muted)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeletePrivate}
                                disabled={deletingId !== null}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
                                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
                            >
                                {deletingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                {deletingId !== null ? "DELETING" : "DELETE"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
