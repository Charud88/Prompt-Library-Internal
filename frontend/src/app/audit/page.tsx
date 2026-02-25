"use client";

import { useEffect, useState } from "react";
import { History, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { BackButton } from "@/components/shared/BackButton";

interface AuditLogEntry {
    id: string;
    prompt_id: string | null;
    actor_id: string | null;
    action: string;
    note: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
    prompt?: { title: string } | null;
    actor?: { display_name: string } | null;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuditLog = async () => {
            try {
                const res = await fetch("/api/admin/audit");
                const json = await res.json();

                if (!res.ok) {
                    setError(json.error ?? "Failed to load audit logs.");
                    return;
                }

                setLogs(json.auditLog ?? []);
            } catch (err) {
                setError("Network error. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchAuditLog();
    }, []);

    const getActorName = (log: AuditLogEntry) => {
        if (log.actor && log.actor.display_name) return log.actor.display_name;
        return "System / Unknown";
    };

    const getPromptTitle = (log: AuditLogEntry) => {
        if (log.prompt && log.prompt.title) return log.prompt.title;
        return log.prompt_id ? `Deleted Prompt (${log.prompt_id.substring(0, 8)}...)` : "N/A";
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case "approved": return "var(--primary)";
            case "rejected": return "var(--accent-red)";
            case "archived": return "var(--accent-yellow)";
            case "restored": return "var(--accent-blue)";
            case "deleted": return "var(--accent-red)";
            default: return "var(--foreground-muted)";
        }
    };

    return (
        <section
            className="max-w-4xl mx-auto p-8 rounded-3xl border animate-slide-up"
            style={{
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--surface), transparent 50%)',
                backdropFilter: 'blur(12px)'
            }}
        >
            <BackButton />

            <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="term-label mb-1">SYSTEM ACCESS</div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    AUDIT LOG
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    System-wide history of all administrative actions and moderation events.
                </p>
            </div>

            {error ? (
                <div className="flex items-center gap-2 px-4 py-3 text-xs" style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)' }}>
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    {error}
                </div>
            ) : (
                <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--primary)' }} />
                            <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Loading History...</div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                            <History className="h-10 w-10 mx-auto opacity-30" style={{ color: 'var(--foreground-muted)' }} />
                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                                NO AUDIT TRAIL FOUND
                            </div>
                            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                                There are no administrative actions recorded in the database yet.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                        {['TIMESTAMP', 'ACTION', 'PROMPT CONTEXT', 'ACTOR'].map(col => (
                                            <th key={col} className="px-5 py-3">
                                                <span className="term-label">{col}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, idx) => (
                                        <tr
                                            key={log.id}
                                            style={{ borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="font-mono text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                                                    {new Date(log.created_at).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider"
                                                    style={{
                                                        color: getActionColor(log.action),
                                                        border: `1px solid ${getActionColor(log.action)}`,
                                                        background: 'transparent'
                                                    }}
                                                >
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-xs font-medium line-clamp-2" style={{ color: 'var(--foreground)' }}>
                                                    {getPromptTitle(log)}
                                                </div>
                                                {log.note && (
                                                    <div className="text-[11px] mt-1 italic" style={{ color: 'var(--foreground-muted)' }}>
                                                        "{log.note}"
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-5 w-5 flex items-center justify-center text-[9px] font-bold uppercase"
                                                        style={{ background: 'var(--surface-3)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
                                                    >
                                                        {getActorName(log).charAt(0)}
                                                    </div>
                                                    <span className="text-[11px] font-medium" style={{ color: 'var(--foreground)' }}>
                                                        {getActorName(log)}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )
            }
        </section>
    );
}
