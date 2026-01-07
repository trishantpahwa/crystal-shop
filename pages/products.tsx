import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowLeftIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Product } from "@/generated/prisma/client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";

export default function ProductsPage() {
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 }); // Might need a fix => @trishantpahwa | 2026-01-08 01:14:46
    const [filters, setFilters] = useState({
        q: router.query.q as string || "",
        category: router.query.category as string || "",
        minPrice: router.query.minPrice as string || "",
        maxPrice: router.query.maxPrice as string || "",
        minRating: router.query.minRating as string || "",
        sortBy: router.query.sortBy as string || "createdAt",
        order: router.query.order as string || "desc",
        page: router.query.page as string || "1",
    });

    const fetchProducts = useCallback(async (currentFilters: typeof filters) => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) query.set(key, value);
            });

            const response = await fetch(`/api/products?${query.toString()}`);
            const data = await response.json();
            setProducts(data.products);
            // For simplicity, assume all products fit in one page for now
            setPagination({ currentPage: 1, totalPages: 1, totalCount: data.products.length });
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts(filters);
    }, [filters, fetchProducts]);

    const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
        const updated = { ...filters, ...newFilters, page: "1" };
        setFilters(updated);
        // Update URL
        const query = { ...router.query };
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key as keyof typeof newFilters]) {
                query[key] = newFilters[key as keyof typeof newFilters];
            } else {
                delete query[key];
            }
        });
        query.page = "1";
        router.push({ pathname: "/products", query }, undefined, { shallow: true });
    };

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

                <Header />

                <main>
                    <section className="pt-12 sm:pt-16 mb-16">
                        <Container>
                            <div className="mb-8">
                                <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary-text">
                                    <ArrowLeftIcon className="h-4 w-4" />
                                    Back to home
                                </Link>
                            </div>

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between my-4">
                                <SectionTitle
                                    eyebrow="All Products"
                                    title="Every piece, every crystal"
                                    subtitle="Explore our complete collection of hand-finished crystal jewellery."
                                />
                            </div>

                            <div className="mt-2">
                                <SearchFilters
                                    onFiltersChange={handleFiltersChange}
                                    initialFilters={filters}
                                />
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-text-muted">Loading products...</div>
                                </div>
                            ) : (
                                <>
                                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        {products.map((p: Product) => (
                                            <ProductCard key={p.id} product={p} />
                                        ))}
                                    </div>

                                    {products.length === 0 && (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="text-center">
                                                <p className="text-text-muted mb-4">No products found matching your criteria.</p>
                                                <Button variant="outline" onClick={() => handleFiltersChange({})}>
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </Container>
                    </section>
                    <Footer />
                </main>
            </div>
        </>
    );
}