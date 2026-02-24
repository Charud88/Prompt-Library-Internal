"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogIn, LogOut, User, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";

export function AuthButton() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [supabase] = useState(() => createClient());

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
            <div className="relative group">
                <div className="flex items-center gap-4 cursor-pointer p-2 hover:bg-[var(--surface-2)] transition-colors rounded-md">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground" style={{ color: 'var(--foreground-muted)' }}>
                            Logged in as
                        </span>
                        <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                            {user.email}
                        </span>
                    </div>
                    <User className="h-4 w-4" style={{ color: 'var(--foreground-muted)' }} />
                </div>

                {/* Dropdown Menu Container (Adds padding to top to act as bridge) */}
                <div
                    className="absolute right-0 top-full pt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]"
                >
                    <div className="shadow-lg overflow-hidden flex flex-col"
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.5rem',
                        }}
                    >
                        <Link
                            href="/submissions"
                            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-[var(--surface-2)] transition-colors w-full text-left"
                            style={{ color: 'var(--foreground)' }}
                        >
                            <User className="h-3.5 w-3.5" style={{ color: 'var(--foreground-muted)' }} />
                            My Submissions
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-colors w-full text-left hover:bg-red-500/10"
                            style={{ borderTop: '1px solid var(--border)', color: 'var(--accent-red)' }}
                        >
                            <LogOut className="h-3.5 w-3.5" />
                            Sign Out
                        </button>
                    </div>
                </div>
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
