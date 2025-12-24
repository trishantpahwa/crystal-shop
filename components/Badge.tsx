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
                "inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/10",
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
