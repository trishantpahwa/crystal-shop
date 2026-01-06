import Head from "next/head";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowLeftIcon, SparkleIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Product } from "@/generated/prisma/client";

const categories = [
    { value: "rings", label: "Rings" },
    { value: "necklaces", label: "Necklaces" },
    { value: "earrings", label: "Earrings" },
    { value: "bracelets", label: "Bracelets" },
];

function ProductCardSkeleton() {
    return (
        <div className="group relative overflow-hidden rounded-3xl bg-secondary-bg ring-1 ring-border">
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[color-mix(in srgb, rgba(52, 211, 153, 0.4) 25%, transparent)] blur-2xl" />
                <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[color-mix(in srgb, rgba(236, 72, 153, 0.4) 25%, transparent)] blur-2xl" />
            </div>
            <div className="block">
                <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <div className="h-5 bg-gray-300 rounded animate-pulse mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                        </div>
                    </div>
                    <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
                        <div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-12 mb-1"></div>
                            <div className="h-6 bg-gray-300 rounded animate-pulse w-16"></div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                            <div className="relative aspect-[4/3] w-full bg-gray-300 animate-pulse"></div>
                        </div>
                    </div>
                </div>
                <div className="p-5 pt-0">
                    <div className="w-full h-9 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { items } = useCart();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const selectedCategory = (router.query.category as string) || "";

    const fetchProducts = async (category?: string) => {
        try {
            setLoading(true);
            const url = category
                ? `/api/products?category=${encodeURIComponent(category)}`
                : "/api/products";
            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) setProducts(data.products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category: string) => {
        const query = category ? { category } : {};
        router.push({ pathname: "/products", query }, undefined, { shallow: true });
    };

    useEffect(() => {
        fetchProducts(selectedCategory);
    }, [selectedCategory]);

    return (
        <>
            <Head>
                <title>All Products — Crystal Atelier</title>
                <meta
                    name="description"
                    content="Browse all crystal jewellery pieces at Crystal Atelier."
                />
            </Head>

            <div className="min-h-screen bg-primary-bg text-primary-text">
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
                    <div className="mx-auto h-[520px] max-w-6xl bg-gradient-to-b from-[var(--color-gradient-start)] via-[var(--color-gradient-middle)] to-[var(--color-gradient-end)] blur-2xl" />
                </div>

                <header className="sticky top-0 z-40 border-b border-border bg-primary-bg/70 backdrop-blur">
                    <Container>
                        <div className="flex h-16 items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-bg ring-1 ring-border">
                                        <SparkleIcon className="h-5 w-5 text-emerald-accent" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-sm font-semibold tracking-tight">Crystal Atelier</p>
                                        <p className="text-xs text-text-dim">Modern crystal jewellery</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="hidden rounded-full bg-secondary-bg px-4 py-2 text-sm text-text-light ring-1 ring-border transition hover:bg-accent-bg sm:inline-flex"
                                >
                                    Search
                                </button>
                                {isAuthenticated ? <Button variant="secondary" type="button" href="/cart">
                                    Bag ({items.length})
                                </Button> : <Button variant="secondary" type="button">
                                    Sign In
                                </Button>}
                            </div>
                        </div>
                    </Container>
                </header>

                <main>
                    <section className="pt-12 sm:pt-16">
                        <Container>
                            <div className="mb-8">
                                <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary-text">
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Back to home
                                </Link>
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                                <SectionTitle
                                    eyebrow="All Products"
                                    title="Every piece, every crystal"
                                    subtitle="Explore our complete collection of hand-finished crystal jewellery."
                                />
                            </div>

                            <div className="mt-8 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCategoryChange("")}
                                    className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${selectedCategory === ""
                                        ? "bg-accent-bg text-primary-text ring-border"
                                        : "bg-secondary-bg text-text-muted ring-border hover:bg-accent-bg hover:text-primary-text"
                                        }`}
                                >
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => handleCategoryChange(cat.value)}
                                        className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${selectedCategory === cat.value
                                            ? "bg-accent-bg text-primary-text ring-border"
                                            : "bg-secondary-bg text-text-muted ring-border hover:bg-accent-bg hover:text-primary-text"
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}
                                </div>
                            ) : (
                                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {products.map((p: Product) => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            )}
                        </Container>
                    </section>
                </main>
            </div>
        </>
    );
}