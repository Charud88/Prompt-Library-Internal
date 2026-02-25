"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand.config";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Application Error:", error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-slide-up">
            <div
                className="max-w-md w-full p-8 rounded-2xl border relative overflow-hidden"
                style={{
                    borderColor: 'var(--border)',
                    background: 'color-mix(in srgb, var(--surface), transparent 50%)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                {/* Decorative background element */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1"
                    style={{ background: 'var(--accent-red)' }}
                />

                <div className="mx-auto w-16 h-16 mb-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>

                <div className="term-label mb-2 text-red-500 tracking-widest">
                    SYSTEM_FAILURE: RUNTIME_ERROR
                </div>

                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    UNEXPECTED ERROR
                </h1>

                <p className="text-sm mb-8 px-4" style={{ color: 'var(--foreground-muted)' }}>
                    {BRAND_CONFIG.app_name} encountered an unexpected problem. Our systems have logged the issue.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-transform hover:scale-105 active:scale-95 rounded-lg"
                        style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                    >
                        <RefreshCw className="h-4 w-4" />
                        TRY RECOVERY
                    </button>

                    <Link
                        href="/"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors rounded-lg"
                        style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                    >
                        <Home className="h-4 w-4" />
                        RETURN HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}
