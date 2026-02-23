"use client";

import { useState } from "react";
import { Category, Difficulty } from "@/lib/mock-data";
import { BackButton } from "@/components/shared/BackButton";
import { Save, Send, AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES: Category[] = [
    "Engineering", "QA / Testing", "Product", "Design / UX",
    "Marketing", "Sales", "Customer Support", "HR / Internal Ops", "Leadership / Strategy"
];

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    outline: 'none',
    width: '100%',
    padding: '8px 12px',
    fontSize: '12px',
    fontFamily: 'inherit',
};

const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    color: 'var(--foreground-muted)',
    marginBottom: '6px',
};

export default function SubmitPromptPage() {
    const [formData, setFormData] = useState({
        title: "",
        category: [] as Category[],
        role: "",
        use_case: "",
        prompt_text: "",
        model_compatibility: "",
        difficulty: "Beginner" as Difficulty,
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCategoryToggle = (cat: Category) => {
        setFormData(prev => ({
            ...prev,
            category: prev.category.includes(cat)
                ? prev.category.filter(c => c !== cat)
                : [...prev.category, cat]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.title || !formData.prompt_text || formData.category.length === 0) {
            setError("REQUIRED FIELDS: Title, Category, Prompt Text");
            return;
        }

        console.log("Submitting prompt:", formData);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-6" style={{ color: 'var(--primary)' }} />
                <div className="term-label mb-2">STATUS: PENDING REVIEW</div>
                <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    PROMPT SUBMITTED
                </h2>
                <p className="text-sm mb-10" style={{ color: 'var(--foreground-muted)' }}>
                    Your prompt has been saved as a Draft and sent to the administrators for review.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        onClick={() => setSubmitted(false)}
                        className="px-5 py-2 text-xs font-semibold tracking-widest uppercase transition-colors"
                        style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                    >
                        SUBMIT ANOTHER
                    </button>
                    <a
                        href="/"
                        className="px-5 py-2 text-xs font-bold tracking-widest uppercase"
                        style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                    >
                        RETURN HOME
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <BackButton />

            <div className="mb-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="term-label mb-1">PROMPT LIBRARY</div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                    SUBMIT PROMPT
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                    Share your most effective AI prompts with the Digit88 team.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-0">
                {error && (
                    <div
                        className="flex items-center gap-2 px-4 py-3 mb-4 text-xs font-medium tracking-wide"
                        style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)' }}
                    >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {error}
                    </div>
                )}

                <div style={{ border: '1px solid var(--border)', background: 'var(--card)' }}>

                    {/* Title */}
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <label style={labelStyle}>Prompt Title *</label>
                        <input
                            type="text"
                            placeholder="e.g., Unit Test Generator for Jest"
                            style={inputStyle}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Categories */}
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <label style={labelStyle}>Categories * (select at least one)</label>
                        <div className="flex flex-wrap gap-1.5">
                            {CATEGORIES.map(cat => {
                                const isSelected = formData.category.includes(cat);
                                return (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategoryToggle(cat)}
                                        className="px-2 py-1 text-[10px] font-semibold tracking-widest uppercase transition-colors"
                                        style={{
                                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                                            color: isSelected ? 'var(--primary)' : 'var(--foreground-muted)',
                                            background: isSelected ? 'var(--primary-dim)' : 'transparent',
                                        }}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Role + Difficulty */}
                    <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="p-5" style={{ borderRight: '1px solid var(--border)' }}>
                            <label style={labelStyle}>Ideal Role</label>
                            <input
                                type="text"
                                placeholder="e.g., Senior QA Engineer"
                                style={inputStyle}
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="p-5">
                            <label style={labelStyle}>Difficulty</label>
                            <select
                                style={{ ...inputStyle, cursor: 'pointer' }}
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                            >
                                {DIFFICULTIES.map(diff => (
                                    <option key={diff} value={diff} style={{ background: 'var(--surface-2)' }}>{diff}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Use Case */}
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <label style={labelStyle}>Use Case / Context</label>
                        <textarea
                            placeholder="When should someone use this prompt? What problem does it solve?"
                            rows={3}
                            style={{ ...inputStyle, resize: 'none' }}
                            value={formData.use_case}
                            onChange={e => setFormData({ ...formData, use_case: e.target.value })}
                        />
                    </div>

                    {/* Prompt Text */}
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <label style={labelStyle}>Prompt Text *</label>
                        <textarea
                            placeholder="Paste your prompt here. Be clear and specific."
                            rows={8}
                            style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.7' }}
                            value={formData.prompt_text}
                            onChange={e => setFormData({ ...formData, prompt_text: e.target.value })}
                        />
                    </div>

                    {/* Model Compatibility */}
                    <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                        <label style={labelStyle}>Model Compatibility</label>
                        <input
                            type="text"
                            placeholder="e.g., GPT-4, Claude 3.5 (comma separated)"
                            style={inputStyle}
                            value={formData.model_compatibility}
                            onChange={e => setFormData({ ...formData, model_compatibility: e.target.value })}
                        />
                    </div>

                    {/* Actions */}
                    <div className="p-5 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors"
                            style={{ border: '1px solid var(--border)', color: 'var(--foreground-muted)' }}
                        >
                            <Save className="h-3.5 w-3.5" />
                            SAVE DRAFT
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold tracking-widest uppercase"
                            style={{ background: 'var(--primary)', color: '#0d0f0e' }}
                        >
                            <Send className="h-3.5 w-3.5" />
                            SUBMIT FOR REVIEW
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
