import type { ReactNode } from "react";
import { Badge } from "./Badge";

export type Product = {
    name: string;
    subtitle: string;
    price: string;
    tag?: string;
    tone: "amethyst" | "rose" | "aqua" | "amber";
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

const toneStyles: Record<Product["tone"], { orb: string; chip: string }> = {
    amethyst: {
        orb: "from-violet-400/30 via-fuchsia-400/20 to-emerald-400/15",
        chip: "text-violet-200",
    },
    rose: {
        orb: "from-rose-400/30 via-pink-400/20 to-emerald-400/15",
        chip: "text-rose-200",
    },
    aqua: {
        orb: "from-cyan-400/30 via-sky-400/20 to-emerald-400/15",
        chip: "text-cyan-200",
    },
    amber: {
        orb: "from-amber-400/30 via-orange-400/20 to-emerald-400/15",
        chip: "text-amber-200",
    },
};

function CardChrome({ children }: { children: ReactNode }) {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/7">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
                <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-fuchsia-400/10 blur-2xl" />
            </div>
            {children}
        </div>
    );
}

export function ProductCard({ product }: { product: Product }) {
    const t = toneStyles[product.tone];

    return (
        <CardChrome>
            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">{product.name}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-white/65">{product.subtitle}</p>
                    </div>
                    {product.tag ? (
                        <Badge className={cn("shrink-0", t.chip)}>{product.tag}</Badge>
                    ) : null}
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
                    <div>
                        <p className="text-sm text-white/60">From</p>
                        <p className="text-xl font-semibold text-white">{product.price}</p>
                    </div>
                    <button
                        className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/15 active:bg-white/10"
                        type="button"
                    >
                        Add to bag
                    </button>
                </div>

                <div className="mt-6">
                    <div
                        className={cn(
                            "relative h-28 w-full overflow-hidden rounded-2xl bg-gradient-to-br",
                            t.orb
                        )}
                    >
                        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute -bottom-12 -right-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                        <div className="absolute inset-0 ring-1 ring-white/10" />
                    </div>
                </div>
            </div>
        </CardChrome>
    );
}
