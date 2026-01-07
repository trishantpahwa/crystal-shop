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
import prisma from "@/config/prisma.config";

const categories = [
    { value: "rings", label: "Rings" },
    { value: "necklaces", label: "Necklaces" },
    { value: "earrings", label: "Earrings" },
    { value: "bracelets", label: "Bracelets" },
];

export async function getServerSideProps(context: any) {
    const { category, page = "1" } = context.query;

    const where: Record<string, unknown> = {};
    const pageNum = Math.max(1, Number.parseInt(page as string, 10) || 1);
    const take = 24;
    const skip = (pageNum - 1) * take;

    if (typeof category === "string" && category.trim()) {
        const validCategory = category.trim().toUpperCase();
        const validCategories = ["RINGS", "NECKLACES", "EARRINGS", "BRACELETS"];
        if (validCategories.includes(validCategory)) {
            where.category = validCategory;
        }
    }

    const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take,
            include: {
                reviews: {
                    select: {
                        rating: true
                    }
                }
            }
        }),
        prisma.product.count({ where }),
    ]);

    // Calculate average ratings for each product
    const productsWithRatings = products.map(product => {
        const totalReviews = product.reviews.length;
        const averageRating = totalReviews > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        return {
            ...product,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews
        };
    });

    const totalPages = Math.ceil(totalCount / take);

    return {
        props: {
            products: productsWithRatings.map(p => ({
                ...p,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
            },
        },
    };
}

export default function ProductsPage({ products, pagination }: { products: Product[], pagination: { currentPage: number, totalPages: number, totalCount: number } }) {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { items } = useCart();

    const selectedCategory = (router.query.category as string) || "";

    const handleCategoryChange = (category: string) => {
        const query = category ? { category, page: "1" } : { page: "1" };
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

                            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {products.map((p: Product) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>

                            {pagination.totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newPage = Math.max(1, pagination.currentPage - 1);
                                            const query = { ...router.query, page: newPage.toString() };
                                            router.push({ pathname: "/products", query });
                                        }}
                                        disabled={pagination.currentPage === 1}
                                        className="rounded-lg bg-secondary-bg px-3 py-2 text-sm font-medium text-text-muted ring-1 ring-border transition hover:bg-accent-bg hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>

                                    <span className="text-sm text-text-muted">
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </span>

                                    <button
                                        onClick={() => {
                                            const newPage = Math.min(pagination.totalPages, pagination.currentPage + 1);
                                            const query = { ...router.query, page: newPage.toString() };
                                            router.push({ pathname: "/products", query });
                                        }}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="rounded-lg bg-secondary-bg px-3 py-2 text-sm font-medium text-text-muted ring-1 ring-border transition hover:bg-accent-bg hover:text-primary-text disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </Container>
                    </section>
                </main>
            </div>
        </>
    );
}