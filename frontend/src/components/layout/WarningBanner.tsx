"use client";

export function WarningBanner() {
    return (
        <div
            className="px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-medium tracking-widest"
            style={{
                background: 'rgba(248, 113, 113, 0.06)',
                borderBottom: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#f87171',
            }}
        >
            <span style={{ color: 'rgba(248, 113, 113, 0.6)' }}>⚠</span>
            SECURITY REMINDER: NEVER PASTE SECRETS, CREDENTIALS, OR PII INTO PROMPTS.
        </div>
    );
}
