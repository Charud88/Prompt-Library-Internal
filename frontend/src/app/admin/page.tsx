"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    CheckCircle2,
    Eye,
    Check,
    X,
    Plus,
    Loader2,
    AlertCircle,
    Archive,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface AdminPrompt {
    id: string;
    title: string;
    use_case: string | null;
    category: string[];
    created_at: string;
    owner?: Array<{ display_name: string }> | { display_name: string } | null;
}

export default function AdminPanel() {
    const [pendingPrompts, setPendingPrompts] = useState<AdminPrompt[]>([]);
    const [approvedPrompts, setApprovedPrompts] = useState<AdminPrompt[]>([]);
    const [approvedCount, setApprovedCount] = useState(0);
    const [contributorCount, setContributorCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/prompts");
            const json = await res.json();

            if (!res.ok) {
                setError(json.error ?? "Failed to load admin data.");
                return;
            }

            setPendingPrompts(json.pending ?? []);
            setApprovedPrompts(json.approved ?? []);
            setApprovedCount(json.approvedCount ?? 0);
            setContributorCount(json.contributorCount ?? 0);
        } catch {
            setError("Network error. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (promptId: string, action: "approved" | "rejected" | "archived") => {
        setActionLoading(promptId + action);
        try {
            const res = await fetch(`/api/admin/prompts/${promptId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });

            const json = await res.json();

            if (!res.ok) {
                alert(json.error ?? `Failed to ${action} prompt.`);
                return;
            }

            if (action === "approved") {
                // Move from pending to approved
                const prompt = pendingPrompts.find(p => p.id === promptId);
                setPendingPrompts(prev => prev.filter(p => p.id !== promptId));
                if (prompt) setApprovedPrompts(prev => [prompt, ...prev]);
                setApprovedCount(c => c + 1);
            } else if (action === "rejected") {
                setPendingPrompts(prev => prev.filter(p => p.id !== promptId));
            } else if (action === "archived") {
                setApprovedPrompts(prev => prev.filter(p => p.id !== promptId));
                setApprovedCount(c => c - 1);
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    // Helper to safely get display name
    const getOwnerName = (owner: AdminPrompt["owner"]): string => {
        if (!owner) return "Unknown";
        if (Array.isArray(owner)) return owner[0]?.display_name ?? "Unknown";
        return (owner as any).display_name ?? "Unknown";
    };

    // Shared table row renderer
    const renderPromptRow = (prompt: AdminPrompt, idx: number, total: number, actions: React.ReactNode) => (
        <tr
            key={prompt.id}
            style={{
                borderBottom: idx < total - 1 ? '1px solid var(--border)' : 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            <td className="px-5 py-4">
                <div className="text-xs font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                    {prompt.title}
                </div>
                <div className="text-[11px] line-clamp-1" style={{ color: 'var(--foreground-muted)' }}>
                    {prompt.use_case || "No description provided"}
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <div
                        className="h-6 w-6 flex items-center justify-center text-[10px] font-bold uppercase"
                        style={{ background: 'var(--surface-3)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                    >
                        {getOwnerName(prompt.owner).charAt(0)}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                        {getOwnerName(prompt.owner)}
                    </span>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex gap-1 flex-wrap">
                    {prompt.category.slice(0, 2).map(cat => (
                        <span key={cat} className="term-tag">{cat}</span>
                    ))}
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-1.5">
                    {actions}
                </div>
            </td>
        </tr>
    );

    return (
        <div className="space-y-8 pb-20">

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

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 text-xs" style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)' }}>
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
                {[
                    { label: 'PENDING REVIEW', value: loading ? '—' : pendingPrompts.length, color: 'var(--accent-yellow)' },
                    { label: 'APPROVED PROMPTS', value: loading ? '—' : approvedCount, color: 'var(--primary)' },
                    { label: 'TOTAL CONTRIBUTORS', value: loading ? '—' : contributorCount, color: 'var(--accent-blue)' },
                ].map((stat, i) => (
                    <div key={i} className="px-6 py-5" style={{ background: 'var(--card)' }}>
                        <div className="term-label mb-1">{stat.label}</div>
                        <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* ─── Pending Queue ─── */}
            <div>
                <div className="term-section-header mb-0">
                    <span className="term-label flex items-center gap-1.5">
                        <Clock className="h-3 w-3" style={{ color: 'var(--accent-yellow)' }} />
                        QUEUE FOR APPROVAL
                    </span>
                    <span className="term-label">{loading ? '—' : `${pendingPrompts.length} ITEM${pendingPrompts.length !== 1 ? 'S' : ''}`}</span>
                </div>

                <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary)' }} />
                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Loading Queue...</div>
                        </div>
                    ) : (
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
                                    {pendingPrompts.length > 0 ? pendingPrompts.map((prompt, idx) =>
                                        renderPromptRow(prompt, idx, pendingPrompts.length, (
                                            <>
                                                {/* Approve */}
                                                <button
                                                    onClick={() => handleAction(prompt.id, "approved")}
                                                    disabled={actionLoading !== null}
                                                    className="h-7 w-7 flex items-center justify-center transition-colors disabled:opacity-40"
                                                    style={{ border: '1px solid var(--primary)', color: 'var(--primary)' }}
                                                    title="Approve"
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#0d0f0e'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                                >
                                                    {actionLoading === prompt.id + "approved"
                                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                                        : <Check className="h-3.5 w-3.5" />}
                                                </button>
                                                {/* Reject */}
                                                <button
                                                    onClick={() => handleAction(prompt.id, "rejected")}
                                                    disabled={actionLoading !== null}
                                                    className="h-7 w-7 flex items-center justify-center transition-colors disabled:opacity-40"
                                                    style={{ border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}
                                                    title="Reject"
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = '#fff'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                                                >
                                                    {actionLoading === prompt.id + "rejected"
                                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                                        : <X className="h-3.5 w-3.5" />}
                                                </button>
                                                {/* View */}
                                                <Link
                                                    href={`/prompts/${prompt.id}`}
                                                    className="h-7 w-7 flex items-center justify-center transition-colors"
                                                    style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                                                    title="View"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                            </>
                                        ))
                                    ) : (
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
                    )}
                </div>
            </div>

            {/* ─── Approved Prompts ─── */}
            <div>
                <div className="term-section-header mb-0">
                    <span className="term-label flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" style={{ color: 'var(--primary)' }} />
                        APPROVED PROMPTS
                    </span>
                    <span className="term-label">{loading ? '—' : `${approvedPrompts.length} ITEM${approvedPrompts.length !== 1 ? 'S' : ''}`}</span>
                </div>

                <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary)' }} />
                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Loading...</div>
                        </div>
                    ) : (
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
                                    {approvedPrompts.length > 0 ? approvedPrompts.map((prompt, idx) =>
                                        renderPromptRow(prompt, idx, approvedPrompts.length, (
                                            <>
                                                {/* Archive */}
                                                <button
                                                    onClick={() => handleAction(prompt.id, "archived")}
                                                    disabled={actionLoading !== null}
                                                    className="h-7 flex items-center gap-1.5 px-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40"
                                                    style={{ border: '1px solid var(--accent-yellow)', color: 'var(--accent-yellow)' }}
                                                    title="Archive this prompt"
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-yellow)'; e.currentTarget.style.color = '#0d0f0e'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-yellow)'; }}
                                                >
                                                    {actionLoading === prompt.id + "archived"
                                                        ? <Loader2 className="h-3 w-3 animate-spin" />
                                                        : <Archive className="h-3 w-3" />}
                                                    Archive
                                                </button>
                                                {/* View */}
                                                <Link
                                                    href={`/prompts/${prompt.id}`}
                                                    className="h-7 w-7 flex items-center justify-center transition-colors"
                                                    style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                                                    title="View"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                            </>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center">
                                                <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--foreground-muted)' }}>
                                                    NO APPROVED PROMPTS YET
                                                </div>
                                                <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                                    Approve prompts from the queue above to see them here.
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
