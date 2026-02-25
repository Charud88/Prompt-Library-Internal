"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle2,
    Check,
    X,
    Eye,
    Archive,
    Loader2,
    AlertCircle,
    ShieldCheck,
} from "lucide-react";
import Link from "next/link";

interface AdminPrompt {
    id: string;
    title: string;
    use_case: string | null;
    category: string[];
    created_at: string;
    owner?: { display_name: string } | null;
}

export default function AdminPanel() {
    const [pendingPrompts, setPendingPrompts] = useState<AdminPrompt[]>([]);
    const [approvedPrompts, setApprovedPrompts] = useState<AdminPrompt[]>([]);
    const [stats, setStats] = useState({ approvedCount: 0, contributorCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/prompts");
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `HTTP_Error_${res.status}`);
            }
            const data = await res.json();
            setPendingPrompts(data.pending || []);
            setApprovedPrompts(data.approved || []);
            setStats({
                approvedCount: data.approvedCount || 0,
                contributorCount: data.contributorCount || 0,
            });
        } catch (err: any) {
            console.error("Admin load error:", err.message || err);
            setError(err.message || "An unexpected error occurred.");
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

            if (!res.ok) {
                const json = await res.json();
                alert(json.error || "Failed to perform action.");
                return;
            }

            // Simple reload after action
            loadData();
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setActionLoading(null);
        }
    };

    // Shared table row renderer
    const renderPromptRow = (prompt: AdminPrompt, idx: number, total: number, actions: React.ReactNode) => (
        <tr
            key={prompt.id}
            style={{ borderBottom: idx < total - 1 ? '1px solid var(--border)' : 'none' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
            <td className="px-5 py-4">
                <div className="text-xs font-bold tracking-tight mb-0.5" style={{ color: 'var(--foreground)' }}>
                    {prompt.title}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50" style={{ color: 'var(--primary)' }}>
                        {prompt.category[0] || "General"}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                        {new Date(prompt.created_at).toLocaleDateString()}
                    </span>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="text-[10px] leading-relaxed text-muted-foreground line-clamp-1 italic">
                    {prompt.use_case || "No use case provided."}
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                    <div
                        className="h-6 w-6 flex items-center justify-center text-[10px] font-bold uppercase"
                        style={{ background: 'var(--surface-3)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                    >
                        {prompt.owner?.display_name?.charAt(0) || "?"}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                        {prompt.owner?.display_name || "Unknown"}
                    </span>
                </div>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center justify-end gap-2">
                    {actions}
                </div>
            </td>
        </tr>
    );

    return (
        <section className="space-y-8 animate-slide-up">
            {/* Control Center Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-border">
                <div>
                    <div className="term-label mb-1">ADMINISTRATIVE INTERFACE</div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
                        <ShieldCheck className="h-7 w-7 text-primary" />
                        COMMAND CENTER
                    </h1>
                    <p className="text-xs mt-1 text-muted-foreground">
                        High-level moderation, analytics, and system oversight.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-2 px-4 py-3 text-xs" style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)' }}>
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        ERROR: {error}
                    </div>
                )}

                {/* Dashboard Stats */}
                <div className="grid grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
                    {[
                        { label: 'PENDING REVIEW', value: loading ? '—' : pendingPrompts.length, color: 'var(--accent-yellow)' },
                        { label: 'APPROVED PROMPTS', value: loading ? '—' : stats.approvedCount, color: 'var(--primary)' },
                        { label: 'TOTAL CONTRIBUTORS', value: loading ? '—' : stats.contributorCount, color: 'var(--accent-blue)' },
                    ].map((stat, i) => (
                        <div key={i} className="px-6 py-5" style={{ background: 'var(--card)' }}>
                            <div className="term-label mb-1">{stat.label}</div>
                            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-1 gap-8">
                {/* Pending Queue */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
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
                                            {['PROMPT DETAILS', 'USE CASE', 'SUBMITTED BY', 'ACTIONS'].map(col => (
                                                <th key={col} className="px-5 py-3"><span className="term-label">{col}</span></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingPrompts.length > 0 ? (
                                            pendingPrompts.map((prompt, idx) =>
                                                renderPromptRow(prompt, idx, pendingPrompts.length, (
                                                    <>
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
                                                        <button
                                                            onClick={() => handleAction(prompt.id, "rejected")}
                                                            disabled={actionLoading !== null}
                                                            className="h-7 w-7 flex items-center justify-center transition-colors disabled:opacity-40"
                                                            style={{ border: '1px solid var(--accent-red)', color: 'var(--accent-red)' }}
                                                            title="Reject"
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-red)'; e.currentTarget.style.color = '#0d0f0e'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent-red)'; }}
                                                        >
                                                            {actionLoading === prompt.id + "rejected"
                                                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                                                : <X className="h-3.5 w-3.5" />}
                                                        </button>
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
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                                        <CheckCircle2 className="h-8 w-8" />
                                                        <span className="text-xs font-bold tracking-widest uppercase">Inbox Zero Reach</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Approved List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
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
                                            {['PROMPT DETAILS', 'USE CASE', 'AUTHOR', 'ACTIONS'].map(col => (
                                                <th key={col} className="px-5 py-3"><span className="term-label">{col}</span></th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvedPrompts.length > 0 ? (
                                            approvedPrompts.map((prompt, idx) =>
                                                renderPromptRow(prompt, idx, approvedPrompts.length, (
                                                    <>
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
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-5 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                                        <ShieldCheck className="h-8 w-8" />
                                                        <span className="text-xs font-bold tracking-widest uppercase">Database Empty</span>
                                                    </div>
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
        </section>
    );
}
