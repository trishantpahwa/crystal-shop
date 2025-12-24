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
        <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
            <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-emerald-200">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">{description}</p>
                </div>
            </div>
        </div>
    );
}
