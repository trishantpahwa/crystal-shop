import type { ReactNode } from "react";

export function FeatureItem({
    title,
    description,
    icon,
}: {
    title: ReactNode;
    description: ReactNode;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-3xl bg-secondary-bg p-5 ring-1 ring-border">
            <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-accent-bg ring-1 ring-border text-emerald-accent">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-primary-text)]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-text-subtle)]">{description}</p>
                </div>
            </div>
        </div>
    );
}
