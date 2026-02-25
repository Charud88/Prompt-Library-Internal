import { FileQuestion, Home, Search } from "lucide-react";
import Link from "next/link";
import { BRAND_CONFIG } from "@/config/brand.config";

export default function NotFound() {
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
                    style={{ background: 'var(--accent-blue)' }}
                />

                <div className="mx-auto w-16 h-16 mb-6 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--accent-blue), transparent 90%)', border: '1px solid color-mix(in srgb, var(--accent-blue), transparent 80%)' }}>
                    <FileQuestion className="h-8 w-8" style={{ color: 'var(--accent-blue)' }} />
                </div>

                <div className="term-label mb-2 tracking-widest" style={{ color: 'var(--accent-blue)' }}>
                    SYSTEM_LOG: HTTP_404
                </div>

                <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    PAGE NOT FOUND
                </h1>

                <p className="text-sm mb-8 px-4" style={{ color: 'var(--foreground-muted)' }}>
                    The requested data sequence could not be located in the {BRAND_CONFIG.app_name} archives.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/browse"
                        className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-transform hover:scale-105 active:scale-95 rounded-lg"
                        style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                    >
                        <Search className="h-4 w-4" />
                        BROWSE PROMPTS
                    </Link>

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
