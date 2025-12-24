import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "./Badge";

export type Product = {
    name: string;
    subtitle: string;
    price: string;
    tag?: string;
    imageSrc: string;
    imageAlt: string;
    tone: "amethyst" | "rose" | "aqua" | "amber";
};

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

const toneStyles: Record<Product["tone"], { chip: string }> = {
    amethyst: {
        chip: "text-violet-200",
    },
    rose: {
        chip: "text-rose-200",
    },
    aqua: {
        chip: "text-cyan-200",
    },
    amber: {
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
                    <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                        <div className="relative aspect-[4/3] w-full">
                            <Image
                                src={product.imageSrc}
                                alt={product.imageAlt}
                                fill
                                sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 90vw"
                                className="object-cover transition duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-slate-950/20" />
                        </div>
                    </div>
                </div>
            </div>
        </CardChrome>
    );
}
