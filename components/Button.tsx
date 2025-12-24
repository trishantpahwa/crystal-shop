import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    children: ReactNode;
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

export function Button({ variant = "primary", className, ...props }: Props) {
    const base =
        "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:pointer-events-none";

    const variants: Record<Variant, string> = {
        primary:
            "bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:bg-emerald-500/90",
        secondary:
            "bg-white/10 text-white ring-1 ring-white/10 hover:bg-white/15 active:bg-white/10",
        ghost:
            "bg-transparent text-white/80 hover:text-white hover:bg-white/10 active:bg-white/10",
    };

    return <button className={cn(base, variants[variant], className)} {...props} />;
}
