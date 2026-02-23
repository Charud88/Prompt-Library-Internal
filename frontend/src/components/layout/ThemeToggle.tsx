"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../shared/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    if (!mounted) return <div className="h-6 w-24" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }} />;

    const options = [
        { id: "light", Icon: Sun, label: "LGT" },
        { id: "system", Icon: Monitor, label: "SYS" },
        { id: "dark", Icon: Moon, label: "DRK" },
    ];

    return (
        <div
            className="flex items-center"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
        >
            {options.map(({ id, Icon, label }) => {
                const isActive = theme === id;
                return (
                    <button
                        key={id}
                        onClick={() => setTheme(id as any)}
                        className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-widest uppercase transition-colors"
                        style={{
                            color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                            background: isActive ? 'var(--primary-dim)' : 'transparent',
                            borderRight: id !== 'dark' ? '1px solid var(--border)' : 'none',
                        }}
                        title={id}
                    >
                        <Icon className="h-3 w-3" />
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
