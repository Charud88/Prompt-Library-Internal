"use client";

import { useParams } from "next/navigation";
import { MOCK_PROMPTS } from "@/lib/mock-data";
import { BackButton } from "@/components/shared/BackButton";
import { Copy, User, Calendar, Check, ThumbsUp, ThumbsDown, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function PromptDetailPage() {
    const { id } = useParams();
    const prompt = MOCK_PROMPTS.find(p => p.id === id);
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState<"useful" | "not-useful" | null>(null);

    if (!prompt) {
        return (
            <div className="py-20 text-center">
                <div className="term-label">ERROR 404</div>
                <p className="text-sm mt-2" style={{ color: 'var(--foreground-muted)' }}>Prompt not found.</p>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.prompt_text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const diffColor =
        prompt.difficulty === "Advanced" ? 'var(--accent-red)' :
            prompt.difficulty === "Intermediate" ? 'var(--accent-yellow)' :
                'var(--primary)';

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-slide-up">
            <div className="mb-6">
                <BackButton />
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Main column */}
                <div className="flex-1 space-y-0 w-full" style={{ border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <section
                        className="p-6 relative overflow-hidden"
                        style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}
                    >
                        <div className="absolute left-0 top-0 w-0.5 h-full" style={{ background: 'var(--primary)' }} />

                        <div className="flex flex-wrap gap-1.5 mb-4 pl-3">
                            {prompt.category.map((cat) => (
                                <span key={cat} className="term-tag term-tag-primary">{cat}</span>
                            ))}
                            <span className="term-tag">v{prompt.version}</span>
                        </div>

                        <h1
                            className="text-2xl md:text-3xl font-bold mb-3 pl-3 leading-tight"
                            style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}
                        >
                            {prompt.title}
                        </h1>

                        <p className="text-sm pl-3" style={{ color: 'var(--foreground-muted)' }}>
                            {prompt.use_case}
                        </p>
                    </section>

                    {/* Toolbar */}
                    <div
                        className="px-5 py-3 flex items-center justify-between"
                        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}
                    >
                        <span className="term-label flex items-center gap-1.5">
                            <Info className="h-3 w-3" />
                            {prompt.model_compatibility.join(", ")}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-colors"
                            style={{
                                background: copied ? 'rgba(74,222,128,0.15)' : 'var(--primary)',
                                color: copied ? 'var(--primary)' : '#0d0f0e',
                                border: copied ? '1px solid var(--primary)' : 'none',
                            }}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "COPIED!" : "COPY PROMPT"}
                        </button>
                    </div>

                    {/* Prompt Text */}
                    <section style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <pre
                            className="whitespace-pre-wrap text-xs leading-relaxed p-6 overflow-x-auto"
                            style={{ color: 'var(--foreground)', fontFamily: 'inherit' }}
                        >
                            {prompt.prompt_text}
                        </pre>
                    </section>

                    {/* Feedback */}
                    <section
                        className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        style={{ background: 'var(--card)' }}
                    >
                        <span className="term-label">WAS THIS PROMPT USEFUL?</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setFeedback("useful")}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors"
                                style={{
                                    border: `1px solid ${feedback === "useful" ? 'var(--primary)' : 'var(--border)'}`,
                                    color: feedback === "useful" ? 'var(--primary)' : 'var(--foreground-muted)',
                                    background: feedback === "useful" ? 'var(--primary-dim)' : 'transparent',
                                }}
                            >
                                <ThumbsUp className="h-3 w-3" /> YES
                            </button>
                            <button
                                onClick={() => setFeedback("not-useful")}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold tracking-widest uppercase transition-colors"
                                style={{
                                    border: `1px solid ${feedback === "not-useful" ? 'var(--accent-red)' : 'var(--border)'}`,
                                    color: feedback === "not-useful" ? 'var(--accent-red)' : 'var(--foreground-muted)',
                                    background: feedback === "not-useful" ? 'rgba(248,113,113,0.1)' : 'transparent',
                                }}
                            >
                                <ThumbsDown className="h-3 w-3" /> NO
                            </button>
                        </div>
                    </section>
                </div>

                {/* Right panel */}
                <div className="w-full lg:w-72 space-y-px">

                    {/* Author */}
                    <div className="p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="term-label mb-3">AUTHOR</div>
                        <div className="flex items-center gap-3">
                            <div
                                className="h-8 w-8 flex items-center justify-center text-xs font-bold uppercase"
                                style={{ background: 'var(--primary-dim)', color: 'var(--primary)', border: '1px solid var(--primary)' }}
                            >
                                {prompt.owner.charAt(0)}
                            </div>
                            <div>
                                <div className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>
                                    {prompt.owner}
                                </div>
                                <div className="text-[10px]" style={{ color: 'var(--foreground-muted)' }}>
                                    {prompt.role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="term-label mb-3">DIFFICULTY</div>
                        <span
                            className="text-xs font-bold tracking-widest uppercase"
                            style={{ color: diffColor }}
                        >
                            ● {prompt.difficulty}
                        </span>
                    </div>

                    {/* Metadata */}
                    <div className="p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div className="term-label mb-3">METADATA</div>
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--foreground-muted)' }}>
                            <Calendar className="h-3 w-3" />
                            {new Date(prompt.created_at).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Warning */}
                    <div
                        className="p-5"
                        style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}
                    >
                        <div className="flex items-center gap-1.5 mb-2">
                            <ShieldAlert className="h-3.5 w-3.5" style={{ color: 'var(--accent-red)' }} />
                            <span
                                className="text-[10px] font-bold tracking-widest uppercase"
                                style={{ color: 'var(--accent-red)' }}
                            >
                                Internal Use Only
                            </span>
                        </div>
                        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(248,113,113,0.7)' }}>
                            Sharing these prompts outside of Digit88's secure environments is strictly prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
