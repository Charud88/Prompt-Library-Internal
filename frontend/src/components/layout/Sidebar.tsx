"use client";

import { usePathname } from "next/navigation";
import { useBrowse } from "@/lib/BrowseContext";
import { Category, Difficulty } from "@/lib/mock-data";
import { Search, X } from "lucide-react";

const CATEGORIES: Category[] = [
    "Engineering", "QA / Testing", "Product", "Design / UX",
    "Marketing", "Sales", "Customer Support", "HR / Internal Ops", "Leadership / Strategy"
];

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

export function Sidebar() {
    const pathname = usePathname();
    const isBrowsePage = pathname === "/browse";

    let browseContext: any = null;
    try {
        browseContext = useBrowse();
    } catch (e) { /* not in provider */ }

    if (!isBrowsePage) return null;

    const {
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        selectedDifficulty, setSelectedDifficulty
    } = browseContext;

    return (
        <aside
            className="hidden lg:block w-60 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto shrink-0"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        >
            <div className="p-4 space-y-6">

                {/* Search */}
                <div>
                    <div className="term-section-header">
                        <span className="term-label flex items-center gap-1.5">
                            <Search className="h-3 w-3" /> SEARCH
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="KEYWORDS..."
                            className="w-full px-3 py-2 text-xs tracking-widest uppercase outline-none"
                            style={{
                                background: 'var(--surface-2)',
                                border: '1px solid var(--border)',
                                color: 'var(--foreground)',
                                caretColor: 'var(--primary)',
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                style={{ color: 'var(--foreground-muted)' }}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Category */}
                <div>
                    <div className="term-section-header">
                        <span className="term-label">CATEGORY</span>
                    </div>
                    <div className="space-y-0.5">
                        {["All", ...CATEGORIES].map((cat) => {
                            const isActive = (cat === "All" ? selectedCategory === "All" : selectedCategory === cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className="w-full text-left px-2 py-1.5 text-xs tracking-wide transition-colors"
                                    style={{
                                        color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                                        background: isActive ? 'var(--primary-dim)' : 'transparent',
                                        borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                    }}
                                >
                                    {cat === "All" ? "ALL CATEGORIES" : cat.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Difficulty */}
                <div>
                    <div className="term-section-header">
                        <span className="term-label">DIFFICULTY</span>
                    </div>
                    <div className="space-y-0.5">
                        {["All", ...DIFFICULTIES].map((diff) => {
                            const isActive = (diff === "All" ? selectedDifficulty === "All" : selectedDifficulty === diff);
                            return (
                                <button
                                    key={diff}
                                    onClick={() => setSelectedDifficulty(diff)}
                                    className="w-full text-left px-2 py-1.5 text-xs tracking-wide transition-colors"
                                    style={{
                                        color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                                        background: isActive ? 'var(--primary-dim)' : 'transparent',
                                        borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                                    }}
                                >
                                    {diff === "All" ? "ALL LEVELS" : diff.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Reset */}
                {(searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All") && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("All");
                            setSelectedDifficulty("All");
                        }}
                        className="w-full py-2 text-xs font-semibold tracking-widest uppercase transition-colors"
                        style={{
                            border: '1px solid var(--accent-red)',
                            color: 'var(--accent-red)',
                        }}
                    >
                        RESET FILTERS
                    </button>
                )}
            </div>
        </aside>
    );
}
