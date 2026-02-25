"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useAnimationFrame
} from "framer-motion";

export const InfiniteGrid = ({ className }: { className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    const gridOffsetX = useMotionValue(0);
    const gridOffsetY = useMotionValue(0);

    // Reduced speed as requested (0.15)
    const speedX = 0.15;
    const speedY = 0.15;

    useAnimationFrame(() => {
        const currentX = gridOffsetX.get();
        const currentY = gridOffsetY.get();
        gridOffsetX.set((currentX + speedX) % 40);
        gridOffsetY.set((currentY + speedY) % 40);
    });

    const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "absolute inset-0 z-0 overflow-hidden pointer-events-auto",
                className
            )}
        >
            {/* Base faint grid layer */}
            <div className="absolute inset-0 z-0 opacity-[0.05] dark:opacity-[0.08]">
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </div>

            {/* Active grid layer (follows mouse) */}
            <motion.div
                className="absolute inset-0 z-0 opacity-[0.2] dark:opacity-[0.3]"
                style={{
                    maskImage,
                    WebkitMaskImage: maskImage,
                    color: 'var(--primary)'
                }}
            >
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </motion.div>

            {/* Glow Effects */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute right-[-10%] top-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[100px]" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[80px]" />
            </div>
        </div>
    );
};

const GridPattern = ({ offsetX, offsetY }: { offsetX: any, offsetY: any }) => {
    return (
        <svg className="w-full h-full">
            <defs>
                <motion.pattern
                    id="infinite-grid-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                    x={offsetX}
                    y={offsetY}
                >
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </motion.pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#infinite-grid-pattern)" />
        </svg>
    );
};
