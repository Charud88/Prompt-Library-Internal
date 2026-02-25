"use client";

import { useMemo, useState, useEffect } from "react";
import { type Category, type Difficulty } from "@/lib/mock-data";
import { PromptCard, PromptCardSkeleton } from "@/components/shared/PromptCard";
import { Search, X, SlidersHorizontal, AlertCircle, Loader2 } from "lucide-react";
import { useBrowse } from "@/lib/BrowseContext";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES: Category[] = [
    "Engineering", "QA / Testing", "Product", "Design / UX",
    "Marketing", "Sales", "Customer Support", "HR / Internal Ops", "Leadership / Strategy"
];

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export default function BrowsePage() {
    const {
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        selectedDifficulty, setSelectedDifficulty
    } = useBrowse();

    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(false);

    // Pagination state
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const limit = 12;

    const fetchPrompts = async (currentPage: number, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        setError(false);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "All") params.append("category", selectedCategory);
            if (selectedDifficulty !== "All") params.append("difficulty", selectedDifficulty);
            if (searchQuery) params.append("search", searchQuery);

            params.append("page", currentPage.toString());
            params.append("limit", limit.toString());

            const res = await fetch(`/api/prompts?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();

            if (isLoadMore) {
                setPrompts(prev => [...prev, ...(data.prompts || [])]);
            } else {
                setPrompts(data.prompts || []);
            }

            setHasNextPage(data.hasNextPage || false);
        } catch (err) {
            console.error("Browse fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Reset pagination and fetch when filters change
    useEffect(() => {
        setPage(1);
        fetchPrompts(1, false);
    }, [selectedCategory, selectedDifficulty, searchQuery]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPrompts(nextPage, true);
    };

    if (loading && page === 1) {
        return (
            <div className="py-20 text-center animate-slide-up bg-card border border-border rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                <div className="term-label tracking-[0.2em]">LOADING PROMPTS...</div>
            </div>
        );
    }

    if (error && page === 1) {
        return (
            <div className="py-20 text-center">
                <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                <div className="term-label mb-2 text-red-500">SYSTEM_ERROR: FETCH_FAILED</div>
                <p className="text-sm text-foreground-muted">Failed to load prompts. Please try again.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-xs font-bold underline">RETRY_CONNECTION</button>
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
                {/* Header row */}
                <div className="flex justify-between items-end pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                        <div className="term-label mb-1">PROMPT LIBRARY</div>
                        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                            BROWSE
                        </h1>
                        <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                            {prompts.length} RESULT{prompts.length !== 1 ? 'S' : ''} FOUND IN DATABASE
                        </p>
                    </div>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setMobileFiltersOpen(true)}
                        className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-widest uppercase transition-colors"
                        style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                        FILTERS
                    </button>
                </div>

                {/* Active filter chips */}
                {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All") && (
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="term-label">ACTIVE:</span>
                        {searchQuery && (
                            <span className="term-tag term-tag-primary flex items-center gap-1">
                                "{searchQuery}"
                                <button onClick={() => setSearchQuery("")}><X className="h-2.5 w-2.5" /></button>
                            </span>
                        )}
                        {selectedCategory !== "All" && (
                            <span className="term-tag term-tag-primary flex items-center gap-1">
                                {selectedCategory}
                                <button onClick={() => setSelectedCategory("All")}><X className="h-2.5 w-2.5" /></button>
                            </span>
                        )}
                        {selectedDifficulty !== "All" && (
                            <span className="term-tag term-tag-primary flex items-center gap-1">
                                {selectedDifficulty}
                                <button onClick={() => setSelectedDifficulty("All")}><X className="h-2.5 w-2.5" /></button>
                            </span>
                        )}
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setSelectedDifficulty("All"); }}
                            className="text-[10px] tracking-widest uppercase"
                            style={{ color: 'var(--accent-red)' }}
                        >
                            CLEAR ALL
                        </button>
                    </div>
                )}

                {/* Mobile Filters Drawer */}
                <AnimatePresence>
                    {mobileFiltersOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] lg:hidden flex justify-end"
                            style={{ background: 'rgba(0,0,0,0.7)' }}
                        >
                            <motion.div
                                initial={{ x: "100%" }}
                                animate={{ x: 0 }}
                                exit={{ x: "100%" }}
                                style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
                                className="w-[80%] max-w-sm h-full overflow-y-auto p-6 space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="term-label">FILTERS</span>
                                    <button onClick={() => setMobileFiltersOpen(false)} style={{ color: 'var(--foreground-muted)' }}>
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <div>
                                    <span className="term-label block mb-3">SEARCH</span>
                                    <input
                                        type="text"
                                        placeholder="KEYWORDS..."
                                        className="w-full px-3 py-2 text-xs tracking-widest uppercase outline-none"
                                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <span className="term-label block mb-3">CATEGORY</span>
                                    <div className="flex flex-wrap gap-1">
                                        {(["All", ...CATEGORIES] as (Category | "All")[]).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className="px-2 py-1 text-[10px] font-semibold tracking-widest uppercase"
                                                style={{
                                                    border: `1px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                                                    color: selectedCategory === cat ? 'var(--primary)' : 'var(--foreground-muted)',
                                                    background: selectedCategory === cat ? 'var(--primary-dim)' : 'transparent',
                                                }}
                                            >
                                                {cat === "All" ? "ALL" : cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="term-label block mb-3">DIFFICULTY</span>
                                    <div className="flex flex-wrap gap-1">
                                        {(["All", ...DIFFICULTIES] as (Difficulty | "All")[]).map(diff => (
                                            <button
                                                key={diff}
                                                onClick={() => setSelectedDifficulty(diff)}
                                                className="px-2 py-1 text-[10px] font-semibold tracking-widest uppercase"
                                                style={{
                                                    border: `1px solid ${selectedDifficulty === diff ? 'var(--primary)' : 'var(--border)'}`,
                                                    color: selectedDifficulty === diff ? 'var(--primary)' : 'var(--foreground-muted)',
                                                    background: selectedDifficulty === diff ? 'var(--primary-dim)' : 'transparent',
                                                }}
                                            >
                                                {diff === "All" ? "ALL LEVELS" : diff}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMobileFiltersOpen(false)}
                                    className="w-full py-2.5 text-xs font-bold tracking-widest uppercase"
                                    style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                                >
                                    APPLY FILTERS
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {prompts.length > 0 ? (
                        prompts.map(prompt => (
                            <PromptCard key={prompt.id} prompt={prompt} />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center border border-dashed border-border rounded-xl">
                            <Search className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                            <h3 className="text-sm font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                                NO RESULTS FOUND
                            </h3>
                            <p className="text-xs tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
                                Adjust your search or filters and try again.
                            </p>
                        </div>
                    )}
                </div>

                {/* Load More Button */}
                {hasNextPage && (
                    <div className="mt-8 text-center pt-8 border-t border-border">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="px-6 py-2 text-xs font-bold tracking-widest uppercase transition-all rounded-lg disabled:opacity-50"
                            style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)',
                            }}
                        >
                            {loadingMore ? "LOADING..." : "LOAD MORE RESULTS"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
