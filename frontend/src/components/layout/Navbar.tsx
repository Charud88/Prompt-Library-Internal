"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand.config";
import { NAV_ITEMS, ADMIN_ITEMS } from "@/config/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const allItems = [...NAV_ITEMS, ...ADMIN_ITEMS];

    return (
        <nav
            className="h-12 sticky top-0 z-[60] px-4 md:px-6 flex items-center justify-between"
            style={{
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span
                        className="text-sm font-bold tracking-widest uppercase cursor-blink"
                        style={{ color: 'var(--primary)' }}
                    >
                        {BRAND_CONFIG.logo.text}
                    </span>
                    <span style={{ color: 'var(--border-light)' }}>/</span>
                    <span
                        className="text-xs font-medium tracking-widest uppercase hidden sm:inline"
                        style={{ color: 'var(--foreground-muted)' }}
                    >
                        {BRAND_CONFIG.app_name}
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden lg:flex items-center gap-1">
                    {allItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors"
                                style={{
                                    color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                                    background: isActive ? 'var(--primary-dim)' : 'transparent',
                                    borderBottom: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                                }}
                            >
                                <item.icon className="h-3 w-3" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Right: Search, Theme, Avatar */}
            <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                    <Search className="h-3 w-3" style={{ color: 'var(--foreground-muted)' }} />
                    <input
                        type="text"
                        placeholder="SEARCH..."
                        className="bg-transparent outline-none w-36 text-xs tracking-widest uppercase placeholder:tracking-widest"
                        style={{ color: 'var(--foreground)', caretColor: 'var(--primary)' }}
                    />
                </div>

                <ThemeToggle />

                <div
                    className="h-6 w-6 flex items-center justify-center cursor-pointer"
                    style={{ color: 'var(--foreground-muted)' }}
                >
                    <User className="h-4 w-4" />
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-1"
                    style={{ color: 'var(--foreground-muted)' }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-12 left-0 w-full lg:hidden z-50 p-2 space-y-0.5"
                        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
                    >
                        {allItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-widest transition-colors"
                                    style={{
                                        color: isActive ? 'var(--primary)' : 'var(--foreground-muted)',
                                        background: isActive ? 'var(--primary-dim)' : 'transparent',
                                    }}
                                >
                                    <item.icon className="h-3 w-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
