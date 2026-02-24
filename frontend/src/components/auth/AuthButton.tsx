"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function AuthButton() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        // Check current session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        getSession();

        // Listen for changes (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // This tells Google where to send the user back to
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload(); // Refresh to update bouncer (middleware) status
    };

    if (loading) {
        return (
            <div className="p-2 opacity-50">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" style={{ color: 'var(--foreground-muted)' }}>
                        Logged in as
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                        {user.email}
                    </span>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 p-2 hover:bg-red-500/10 transition-colors group"
                    title="Sign Out"
                >
                    <LogOut className="h-4 w-4" style={{ color: 'var(--foreground-muted)' }} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-1.5 transition-all"
            style={{
                border: '1px solid var(--border)',
                background: 'var(--surface-1)',
                color: 'var(--foreground)'
            }}
        >
            <LogIn className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Login</span>
        </button>
    );
}
