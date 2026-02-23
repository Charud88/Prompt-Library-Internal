"use client";

import { MOCK_PROMPTS } from "@/lib/mock-data";
import { PromptCard } from "@/components/shared/PromptCard";
import { Sparkles, TrendingUp, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const featuredPrompts = MOCK_PROMPTS.filter(p => p.status === "approved").slice(0, 3);
  const recentPrompts = [...MOCK_PROMPTS].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3);
  const mostUsedPrompts = MOCK_PROMPTS.slice(0, 4);

  return (
    <div className="space-y-10 animate-slide-up pb-16">

      {/* Hero */}
      <section
        className="py-10 px-6 relative overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        {/* Terminal cursor decoration */}
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xs tracking-widest" style={{ color: 'var(--foreground-muted)' }}>
            // DIGIT88 INTERNAL RESOURCE
          </span>
          <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-bold tracking-widest px-2 py-0.5"
            style={{
              border: '1px solid var(--primary)',
              color: 'var(--primary)',
              background: 'var(--primary-dim)',
            }}
          >
            LIVE
          </motion.span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight"
          style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}
        >
          PROMPT LIBRARY<br />
          <span style={{ color: 'var(--primary)' }}>/ GENERATIVE AI</span>
        </motion.h1>

        <p
          className="text-sm max-w-xl mb-8 tracking-wide"
          style={{ color: 'var(--foreground-muted)' }}
        >
          A curated library of vetted prompts to supercharge your workflow —
          from engineering to leadership.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/browse"
            className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
            style={{
              background: 'var(--primary)',
              color: '#0d0f0e',
            }}
          >
            BROWSE LIBRARY →
          </Link>
          <Link
            href="/submit"
            className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase transition-colors"
            style={{
              border: '1px solid var(--border)',
              color: 'var(--foreground-muted)',
            }}
          >
            SUBMIT PROMPT
          </Link>
        </div>

        {/* Background decoration */}
        <div
          className="absolute right-0 top-0 text-[200px] font-black select-none pointer-events-none leading-none"
          style={{ color: 'var(--border)', opacity: 0.4 }}
        >
          D88
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
        {[
          { label: 'TOTAL PROMPTS', value: MOCK_PROMPTS.length, color: 'var(--foreground)' },
          { label: 'APPROVED', value: MOCK_PROMPTS.filter(p => p.status === 'approved').length, color: 'var(--primary)' },
          { label: 'PENDING REVIEW', value: MOCK_PROMPTS.filter(p => p.status === 'pending').length, color: 'var(--accent-yellow)' },
          { label: 'CATEGORIES', value: 9, color: 'var(--accent-blue)' },
        ].map(stat => (
          <div key={stat.label} className="px-5 py-4" style={{ background: 'var(--card)' }}>
            <div className="term-label mb-1">{stat.label}</div>
            <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Featured */}
      {featuredPrompts.length > 0 && (
        <section>
          <div className="term-section-header mb-4">
            <span className="term-label flex items-center gap-1.5">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {featuredPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {/* Trending */}
      {mostUsedPrompts.length > 0 && (
        <section>
          <div className="term-section-header mb-4">
            <span className="term-label flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" style={{ color: 'var(--accent-blue)' }} />
              TRENDING INTERNAL
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
            {mostUsedPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Added */}
      {recentPrompts.length > 0 && (
        <section>
          <div className="term-section-header mb-4">
            <span className="term-label flex items-center gap-1.5">
              <Clock className="h-3 w-3" style={{ color: 'var(--primary)' }} />
              RECENTLY ADDED
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {recentPrompts.map(prompt => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[10px] tracking-widest" style={{ color: 'var(--foreground-muted)' }}>
          DATA: MOCK DATABASE — {new Date().toISOString().split('T')[0]} — DIGIT88 INTERNAL
        </p>
      </div>
    </div>
  );
}
