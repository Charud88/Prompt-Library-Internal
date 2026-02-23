"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    className?: string;
}

export function BackButton({ className }: BackButtonProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase transition-colors mb-4 ${className}`}
            style={{ color: 'var(--foreground-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground-muted)')}
        >
            <ArrowLeft className="h-3.5 w-3.5" />
            BACK
        </button>
    );
}
