"use client";

export function WarningBanner() {
    return (
        <div
            className="px-4 py-1.5 flex items-center justify-center gap-2 text-xs font-medium tracking-widest"
            style={{
                background: 'rgba(251, 191, 36, 0.06)',
                borderBottom: '1px solid rgba(251, 191, 36, 0.2)',
                color: '#fbbf24',
            }}
        >
            <span style={{ color: 'rgba(251, 191, 36, 0.5)' }}>⚠</span>
            SECURITY REMINDER: NEVER PASTE SECRETS, CREDENTIALS, OR PII INTO PROMPTS.
        </div>
    );
}
