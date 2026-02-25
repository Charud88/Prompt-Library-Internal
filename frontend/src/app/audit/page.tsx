"use client";

import { useState, useEffect } from "react";
import {
    Activity,
    User,
    FileText,
    Calendar,
    Loader2,
} from "lucide-react";

interface AuditEntry {
    id: string;
    prompt_id: string | null;
    actor_id: string | null;
    action: string;
    note: string | null;
    metadata: any;
    created_at: string;
    prompt?: { title: string } | null;
    actor?: { display_name: string } | null;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/audit");
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `HTTP_Error_${res.status}`);
            }
            const data = await res.json();
            setLogs(data.auditLog || []);
        } catch (err: any) {
            console.error("Audit load error:", err.message || err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <section className="space-y-8 animate-slide-up">
            <div className="pb-6 border-b border-border">
                <div className="term-label mb-1">AUDIT_SUBSYSTEM</div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{ letterSpacing: '-0.02em' }}>
                    <Activity className="h-7 w-7 text-primary" />
                    SYSTEM LOGS
                </h1>
                <p className="text-xs mt-1 text-muted-foreground">
                    Historical record of all prompt modifications and administrative actions.
                </p>
            </div>

            <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: 'var(--primary)' }} />
                        <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Ingesting Logs...</div>
                    </div>
                ) : error ? (
                    <div className="py-20 text-center text-accent-red text-xs font-bold uppercase tracking-widest">
                        ERROR: {error}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                                    <th className="px-6 py-4"><span className="term-label">TIMESTAMP</span></th>
                                    <th className="px-6 py-4"><span className="term-label">ACTOR</span></th>
                                    <th className="px-6 py-4"><span className="term-label">ACTION</span></th>
                                    <th className="px-6 py-4"><span className="term-label">PROMPT TARGET</span></th>
                                    <th className="px-6 py-4"><span className="term-label">NOTES</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log, idx) => (
                                    <tr
                                        key={log.id}
                                        style={{ borderBottom: idx < logs.length - 1 ? '1px solid var(--border)' : 'none' }}
                                        className="transition-colors hover:bg-surface-2"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-xs font-mono opacity-60">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(log.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 opacity-40" />
                                                <span className="text-xs font-bold">{log.actor?.display_name || "SYSTEM"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border"
                                                style={{
                                                    background: log.action === 'approved' ? 'rgba(52,211,153,0.1)' :
                                                        log.action === 'rejected' ? 'rgba(248,113,113,0.1)' :
                                                            'rgba(96,165,250,0.1)',
                                                    borderColor: log.action === 'approved' ? 'rgba(52,211,153,0.3)' :
                                                        log.action === 'rejected' ? 'rgba(248,113,113,0.3)' :
                                                            'rgba(96,165,250,0.3)',
                                                    color: log.action === 'approved' ? 'var(--primary)' :
                                                        log.action === 'rejected' ? 'var(--accent-red)' :
                                                            'var(--accent-blue)'
                                                }}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[200px]">
                                                <FileText className="h-3 w-3 opacity-40 shrink-0" />
                                                <span className="text-xs truncate">{log.prompt?.title || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[10px] text-muted-foreground italic">
                                                {log.note || "No additional notes."}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}
