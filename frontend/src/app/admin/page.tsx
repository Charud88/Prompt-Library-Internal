"use client";

import { MOCK_PROMPTS } from "@/lib/mock-data";
import {
    ShieldCheck,
    Clock,
    CheckCircle2,
    Eye,
    Check,
    X,
    Plus
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminPanel() {
    const pendingPrompts = MOCK_PROMPTS.filter(p => p.status === "pending");
    const approvedPrompts = MOCK_PROMPTS.filter(p => p.status === "approved");
    const totalContributors = new Set(MOCK_PROMPTS.map(p => p.owner)).size;

    return (
        <div className="space-y-8 animate-slide-up pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                    <div className="term-label mb-1">SYSTEM ACCESS</div>
                    <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                        ADMIN PANEL
                    </h1>
                    <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                        Review, moderate, and manage the internal prompt library.
                    </p>
                </div>
                <Link
                    href="/submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-widest uppercase"
                    style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                >
                    <Plus className="h-3.5 w-3.5" />
                    ADD PROMPT
                </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
                {[
                    { label: 'PENDING REVIEW', value: pendingPrompts.length, color: 'var(--accent-yellow)' },
                    { label: 'APPROVED PROMPTS', value: approvedPrompts.length, color: 'var(--primary)' },
                    { label: 'TOTAL CONTRIBUTORS', value: totalContributors, color: 'var(--accent-blue)' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="px-6 py-5"
                        style={{ background: 'var(--card)' }}
                    >
                        <div className="term-label mb-1">{stat.label}</div>
                        <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Queue */}
            <div>
                <div className="term-section-header mb-0">
                    <span className="term-label flex items-center gap-1.5">
                        <Clock className="h-3 w-3" style={{ color: 'var(--accent-yellow)' }} />
                        QUEUE FOR APPROVAL
                    </span>
                    <span className="term-label">{pendingPrompts.length} ITEM{pendingPrompts.length !== 1 ? 'S' : ''}</span>
                </div>

                <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                    {['PROMPT', 'AUTHOR', 'CATEGORY', 'ACTIONS'].map(col => (
                                        <th key={col} className="px-5 py-3">
                                            <span className="term-label">{col}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pendingPrompts.length > 0 ? pendingPrompts.map((prompt, idx) => (
                                    <tr
                                        key={prompt.id}
                                        style={{
                                            borderBottom: idx < pendingPrompts.length - 1 ? '1px solid var(--border)' : 'none',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="text-xs font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                                                {prompt.title}
                                            </div>
                                            <div className="text-[11px] line-clamp-1" style={{ color: 'var(--foreground-muted)' }}>
                                                {prompt.use_case}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-6 w-6 flex items-center justify-center text-[10px] font-bold uppercase"
                                                    style={{ background: 'var(--surface-3)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                                                >
                                                    {prompt.owner.charAt(0)}
                                                </div>
                                                <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                                                    {prompt.owner}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-1 flex-wrap">
                                                {prompt.category.slice(0, 1).map(cat => (
                                                    <span key={cat} className="term-tag">{cat}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    className="h-7 w-7 flex items-center justify-center transition-colors"
                                                    style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                                    title="Approve"
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)';
                                                        (e.currentTarget as HTMLButtonElement).style.color = '#0d0f0e';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)';
                                                    }}
                                                >
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    className="h-7 w-7 flex items-center justify-center transition-colors"
                                                    style={{ border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}
                                                    title="Reject"
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-red)';
                                                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-red)';
                                                    }}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                                <Link
                                                    href={`/prompts/${prompt.id}`}
                                                    className="h-7 w-7 flex items-center justify-center transition-colors"
                                                    style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                                                    title="View"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-16 text-center">
                                            <CheckCircle2 className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--primary)' }} />
                                            <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--foreground)' }}>
                                                QUEUE CLEAR
                                            </div>
                                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                                All pending prompts have been reviewed.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
