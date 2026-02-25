import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-muted/50",
                className
            )}
            style={{ background: 'var(--muted)', opacity: 0.5 }}
            {...props}
        />
    );
}

export function PromptCardSkeleton() {
    return (
        <div
            className="p-6 rounded-xl border border-border space-y-4"
            style={{ background: 'var(--surface)' }}
        >
            <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
        </div>
    );
}
