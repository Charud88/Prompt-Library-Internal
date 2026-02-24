"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { PromptCard } from "@/components/shared/PromptCard";
import { Loader2, FileText } from "lucide-react";

export default function MySubmissionsPage() {
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const supabase = createClient();
                // Adblocker/Brave browser fallback: 
                // If the auth cookie request is blocked and hangs, force resolve after 3s
                const fetchSession = async () => {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        setLoading(false);
                        return;
                    }
                    setUser(session.user);

                    const { data, error } = await supabase
                        .from("prompts")
                        .select("*")
                        .eq("owner_id", session.user.id)
                        .order("created_at", { ascending: false });

                    if (!error && data) {
                        setPrompts(data);
                    }
                    setLoading(false);
                };

                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Auth request timed out (Adblocker likely)")), 3000)
                );

                await Promise.race([fetchSession(), timeout]);
            } catch (err) {
                console.warn(err);
                // Fail gracefully so the UI doesn't freeze
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--primary)" }} />
                <div className="text-[10px] font-bold tracking-widest uppercase opacity-50">Loading Submissions...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="py-20 text-center">
                <h1 className="text-2xl font-bold mb-4" style={{ color: "var(--foreground)" }}>Sign In Required</h1>
                <p style={{ color: "var(--foreground-muted)" }}>You must be logged in to view your submissions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-slide-up max-w-7xl mx-auto pb-20">
            <div className="pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <div className="term-label mb-1">YOUR CONTRIBUTIONS</div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--foreground)", letterSpacing: "-0.02em" }}>
                    MY SUBMISSIONS
                </h1>
                <p className="text-xs mt-1" style={{ color: "var(--foreground-muted)" }}>
                    Track the status of prompts you have submitted to the library.
                </p>
            </div>

            {prompts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {prompts.map((prompt) => (
                        <div key={prompt.id}>
                            <PromptCard prompt={prompt} showStatus={true} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                    <FileText className="h-8 w-8 mx-auto mb-4" style={{ color: 'var(--foreground-muted)' }} />
                    <h3 className="text-sm font-bold mb-1 uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>
                        NO SUBMISSIONS YET
                    </h3>
                    <p className="text-xs tracking-wide" style={{ color: 'var(--foreground-muted)' }}>
                        When you submit a new prompt, it will appear here.
                    </p>
                </div>
            )}
        </div>
    );
}
