import type { HTMLAttributes, ReactNode } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function Badge({
    children,
    className,
    ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-2 rounded-full bg-accent-bg px-3 py-1 text-xs font-medium text-[color-mix(in srgb, var(--color-primary-text) 85%, transparent)] ring-1 ring-border",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
