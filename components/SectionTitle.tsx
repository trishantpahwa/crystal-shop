import type { ReactNode } from "react";

export function SectionTitle({
    eyebrow,
    title,
    subtitle,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    subtitle?: ReactNode;
}) {
    return (
        <div className="max-w-2xl">
            {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                    {eyebrow}
                </p>
            ) : null}
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {title}
            </h2>
            {subtitle ? (
                <p className="mt-3 text-sm leading-6 text-white/65">{subtitle}</p>
            ) : null}
        </div>
    );
}
