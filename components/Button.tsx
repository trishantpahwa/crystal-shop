import { useRouter } from "next/router";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    children: ReactNode;
    href?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function Button({ variant = "primary", className, href, ...props }: Props) {

    const router = useRouter();

    const base =
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-primary-bg)] disabled:opacity-60 disabled:pointer-events-none";

    const variants: Record<Variant, string> = {
        primary:
            "bg-[var(--color-button-primary-bg)] text-[var(--color-button-primary-text)] hover:bg-[color-mix(in srgb, var(--color-button-primary-bg) 90%, transparent)] active:bg-[color-mix(in srgb, var(--color-button-primary-bg) 90%, transparent)]",
        secondary:
            "bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] ring-1 ring-border hover:bg-[color-mix(in srgb, var(--color-button-secondary-bg) 120%, transparent)] active:bg-[var(--color-button-secondary-bg)]",
        ghost:
            "bg-transparent text-[var(--color-button-ghost-text)] hover:text-[var(--color-button-secondary-text)] hover:bg-[var(--color-button-ghost-hover)] active:bg-[var(--color-button-ghost-hover)]",
        outline:
            "bg-transparent text-[var(--color-button-outline-text)] ring-1 ring-[var(--color-button-outline-ring)] hover:bg-[var(--color-button-outline-hover)] active:bg-[color-mix(in srgb, var(--color-button-outline-hover) 120%, transparent)]",
    };

    return <button onClick={() => href ? router.push(href) : null} className={cn(base, variants[variant], className)} {...props} />;
}
