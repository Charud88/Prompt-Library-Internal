"use client";

import { Category } from "@/lib/mock-data";
import { PromptCard, PromptCardSkeleton } from "@/components/shared/PromptCard";
import { Sparkles, TrendingUp, Clock, ArrowRight, Search, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      params.append("limit", "15");

      const res = await fetch(`/api/prompts?${params.toString()}`);
      const data = await res.json();
      setPrompts(data.prompts || []);
    } catch (err) {
      console.error("Failed to fetch prompts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPrompts();
  }, [selectedCategory, searchQuery]);

  const isFiltering = !!selectedCategory || !!searchQuery;

  // Sections for the "Default" view
  const featuredPrompts = useMemo(() => isFiltering ? [] : prompts.slice(0, 3), [isFiltering, prompts]);
  const mostUsedPrompts = useMemo(() => isFiltering ? [] : prompts.slice(3, 7), [isFiltering, prompts]);
  const recentPrompts = useMemo(() => isFiltering ? prompts : prompts.slice(0, 6), [isFiltering, prompts]);

  const handleRefresh = () => {
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-10 animate-slide-up pb-16">
      <section
        className="py-12 px-8 relative overflow-hidden rounded-2xl border"
        style={{
          borderColor: 'var(--border)',
          background: 'color-mix(in srgb, var(--surface), transparent 50%)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="flex flex-col items-center text-center mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-3"
            style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}
          >
            <span style={{ color: 'var(--primary)' }}>D88</span> PROMPT LIBRARY
          </motion.h1>

          <p
            className="text-xs max-w-2xl tracking-wide mx-auto"
            style={{ color: 'var(--foreground-muted)' }}
          >
            Explore our curated collection of AI prompts to enhance your interactions and boost productivity.
            Check out <em>My Prompts</em> to save and reuse your favorite prompts!
          </p>
        </div>

        <div className="absolute top-6 right-6 hidden md:flex items-center gap-2">
          <Link
            href="/browse"
            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors rounded-lg"
            style={{ background: 'var(--primary)', color: '#0d0f0e' }}
          >
            BROWSE LIBRARY →
          </Link>
          <Link
            href="/submit"
            className="flex items-center gap-2 px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase transition-colors rounded-lg"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
              background: 'var(--surface-2)',
            }}
          >
            SUBMIT PROMPT
          </Link>
        </div>

        <div className="md:hidden flex flex-wrap justify-center gap-2 mb-6">
          <Link
            href="/browse"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-lg"
            style={{ background: 'var(--primary)', color: '#0d0f0e' }}
          >
            BROWSE LIBRARY →
          </Link>
          <Link
            href="/submit"
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors rounded-lg"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
              background: 'var(--surface-2)',
            }}
          >
            SUBMIT PROMPT
          </Link>
        </div>

        <div className="w-full max-w-2xl mx-auto mb-6">
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all"
            style={{
              background: 'var(--surface-2)',
              borderColor: 'var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Search className="h-4 w-4" style={{ color: 'var(--foreground-muted)' }} />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none w-full text-sm tracking-wide placeholder:text-muted-foreground/40"
              style={{ color: 'var(--foreground)', caretColor: 'var(--primary)' }}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="relative group">
            <select
              value={selectedCategory}
              className="appearance-none px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase cursor-pointer outline-none transition-all pr-12"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              }}
              onChange={(e) => setSelectedCategory(e.target.value as Category | "")}
            >
              <option value="">All Categories</option>
              {[
                "Engineering", "QA / Testing", "Product", "Design / UX",
                "Marketing", "Sales", "Customer Support", "HR / Internal Ops", "Leadership / Strategy"
              ].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="h-3 w-3" style={{ color: 'var(--foreground-muted)' }} />
            </div>
          </div>
        </div>

        <div
          className="absolute right-0 bottom-0 text-[120px] font-black select-none pointer-events-none leading-none -mb-2 -mr-1"
          style={{ color: 'var(--border)', opacity: 0.15 }}
        >
          D88
        </div>
      </section>

      {loading ? (
        <div className="py-20 text-center animate-slide-up bg-card border border-border rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <div className="term-label tracking-[0.2em]">LOADING PROMPTS...</div>
        </div>
      ) : (
        <>
          {isFiltering && (
            <div className="px-6 flex items-center justify-between border-b border-border pb-4">
              <div className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Showing {prompts.length} results for:
                {selectedCategory && <span className="text-primary ml-2">{selectedCategory}</span>}
                {searchQuery && <span className="text-primary ml-2">&quot;{searchQuery}&quot;</span>}
              </div>
              <button
                onClick={handleRefresh}
                className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* FEATURED SELECTION */}
          {!isFiltering && featuredPrompts.length > 0 && (
            <section
              className="p-8 rounded-2xl border mb-10"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--surface), transparent 40%)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="term-section-header mb-4 px-2">
                <span className="term-label flex items-center gap-1.5 font-bold">
                  <Sparkles className="h-3 w-3" style={{ color: 'var(--accent-yellow)' }} />
                  FEATURED SELECTION
                </span>
                <Link
                  href="/browse"
                  className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 transition-colors hover:underline"
                  style={{ color: 'var(--primary)' }}
                >
                  VIEW ALL <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPrompts.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </section>
          )}

          {/* TRENDING INTERNAL */}
          {!isFiltering && mostUsedPrompts.length > 0 && (
            <section
              className="p-8 rounded-2xl border mb-10"
              style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--surface), transparent 40%)',
                backdropFilter: 'blur(12px)'
              }}
            >
              <div className="term-section-header mb-4 px-2">
                <span className="term-label flex items-center gap-1.5 font-bold">
                  <TrendingUp className="h-3 w-3" style={{ color: 'var(--accent-blue)' }} />
                  TRENDING INTERNAL
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mostUsedPrompts.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))}
              </div>
            </section>
          )}

          {/* MAIN FEED */}
          <section
            className="p-8 rounded-2xl border"
            style={{
              borderColor: 'var(--border)',
              background: 'color-mix(in srgb, var(--surface), transparent 40%)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="term-section-header mb-4 px-2">
              <span className="term-label flex items-center gap-1.5 font-bold">
                <Clock className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                {isFiltering ? "SEARCH RESULTS" : "RECENTLY ADDED"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPrompts.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </section>

          {/* No Results Fallback */}
          {prompts.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border rounded-xl">
              <div className="term-label mb-2 font-bold tracking-[0.2em]">NO PROMPTS FOUND</div>
              <p className="text-sm text-foreground-muted">Try adjusting your filters or search terms.</p>
              <button
                onClick={handleRefresh}
                className="mt-8 px-8 py-3 bg-primary text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-transform hover:scale-105 active:scale-95"
              >
                RESET ALL FILTERS
              </button>
            </div>
          )}
        </>
      )}

      <div className="pt-8 mt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] tracking-widest opacity-50" style={{ color: 'var(--foreground-muted)' }}>
          SYSTEM_LOG: DATA_SOURCE_SUPABASE {"//"} {mounted ? new Date().toISOString() : "2026-02-24T00:00:00.000Z"} {"//"} CLASSIFIED INTERNAL USE ONLY
        </p>
      </div>
    </div>
  );
}
