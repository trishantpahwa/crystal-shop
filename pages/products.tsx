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
import type { Product } from "@/generated/prisma/client";

export default function ProductsPage() {
    const { isAuthenticated } = useAuth();
    const { items } = useCart();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const response = await fetch("/api/products");
            const data = await response.json();
            if (response.ok) setProducts(data.products);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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

                            {loading ? (
                                <div className="mt-8 text-center">
                                    <p>Loading products...</p>
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