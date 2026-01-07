import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import toast from "react-hot-toast";
import { upload as vercelUpload } from "@vercel/blob/client";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Divider } from "@/components/Divider";
import { SectionTitle } from "@/components/SectionTitle";
import { signOutAdmin } from "@/services/login.service";

type SortBy = "createdAt" | "updatedAt" | "name" | "price" | "tone" | "tag";

type Tone = "amethyst" | "rose" | "aqua" | "amber";

const TONE_OPTIONS: ReadonlyArray<Tone> = ["amethyst", "rose", "aqua", "amber"];

type Product = {
    id: number;
    name: string;
    subtitle: string;
    price: string;
    tag: string | null;
    tone: Tone;
    category: string;
    images: Array<{
        id: number;
        src: string;
        alt: string;
        order: number;
    }>;
    createdAt: string;
    updatedAt: string;
};

type ProductInput = {
    name: string;
    subtitle: string;
    price: string;
    tag: string;
    category: string;
    images: Array<{
        src: string;
        alt: string;
    }>;
    tone: Tone | "";
};

const inputClassName =
    "w-full rounded-2xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] px-4 py-2.5 text-sm text-[var(--color-primary-text)] ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)] placeholder:text-[var(--color-primary-text)]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in srgb, var(--color-emerald-accent) 30%, transparent)]";

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function buildProductsUrl(params: {
    q: string;
    tag: string;
    tone: string;
    category: string;
    sortBy: SortBy;
    order: "asc" | "desc";
    skip: number;
    take: number;
}) {
    const search = new URLSearchParams();
    if (params.q.trim()) search.set("q", params.q.trim());
    if (params.tag.trim()) search.set("tag", params.tag.trim());
    if (params.tone.trim()) search.set("tone", params.tone.trim());
    if (params.category.trim()) search.set("category", params.category.trim());
    search.set("sortBy", params.sortBy);
    search.set("order", params.order);
    search.set("skip", String(params.skip));
    search.set("take", String(params.take));
    return `/api/products?${search.toString()}`;
}

export default function AdminProductPage({ initialProducts }: { initialProducts: Product[] }) {
    const router = useRouter();

    const [q, setQ] = useState("");
    const [tag, setTag] = useState("");
    const [tone, setTone] = useState<Tone | "">("");
    const [category, setCategory] = useState("");
    const [sortBy, setSortBy] = useState<SortBy>("createdAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(24);

    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<ProductInput>({
        name: "",
        subtitle: "",
        price: "",
        tag: "",
        category: "",
        images: [],
        tone: "",
    });

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        }
    }, [router]);

    const handleFiles = async (files: FileList) => {
        const fileArray = Array.from(files);
        for (const f of fileArray) {
            const url = await handleFileUpload(f);
            if (url) {
                setCreateForm((s) => ({
                    ...s,
                    images: [...s.images, { src: url, alt: f.name }]
                }));
            }
        }
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        setCreateForm((s) => {
            const images = [...s.images];
            if (direction === 'up' && index > 0) {
                [images[index - 1], images[index]] = [images[index], images[index - 1]];
            } else if (direction === 'down' && index < images.length - 1) {
                [images[index], images[index + 1]] = [images[index + 1], images[index]];
            }
            return { ...s, images };
        });
    };



    const hasPrev = skip > 0;
    const hasNext = products.length === take;

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = buildProductsUrl({ q, tag, tone, category, sortBy, order, skip, take });
            const response = await fetch(url);
            const data = await response.json();
            if (!response.ok) {
                const errorData = await data;
                throw new Error(errorData?.message ?? "Failed to load products");
            }
            setProducts((data?.products ?? []) as Product[]);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load products";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, [q, tag, tone, category, sortBy, order, skip, take]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const onCreateOrUpdate = async () => {
        if (editingProduct) {
            // Update existing product
            try {
                const response = await fetch(`/api/product/${editingProduct.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    body: JSON.stringify(createForm),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.message ?? "Failed to update product");
                }
                toast.success("Product updated");
                onCancelEdit();
                loadProducts();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to update product");
            }
        } else {
            // Create new product
            try {
                const response = await fetch("/api/product", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    body: JSON.stringify(createForm),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.message ?? "Failed to create product");
                }
                toast.success("Product created");
                setCreateForm({
                    name: "",
                    subtitle: "",
                    price: "",
                    tag: "",
                    category: "",
                    images: [],
                    tone: "",
                });
                setSkip(0);
                loadProducts();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create product");
            }
        }
    };

    const onStartEdit = (product: Product) => {
        setEditingProduct(product);
        setCreateForm({
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            tag: product.tag ?? "",
            category: product.category ? String(product.category).toLowerCase() : "",
            images: product.images.map(img => ({ src: img.src, alt: img.alt })),
            tone: product.tone,
        });
    };

    const onCancelEdit = () => {
        setEditingProduct(null);
        setCreateForm({
            name: "",
            subtitle: "",
            price: "",
            tag: "",
            category: "",
            images: [],
            tone: "",
        });
    };

    const onDelete = async (product: Product) => {

        if (!window.confirm(`Delete “${product.name}”?`)) return;

        try {
            const response = await fetch(`/api/product/${product.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message ?? "Failed to delete product");
            }
            toast.success("Product deleted");
            if (editingProduct?.id === product.id) onCancelEdit();
            loadProducts();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete product");
        }
    };

    const canCreate = useMemo(() => {
        return (
            createForm.name.trim() &&
            createForm.subtitle.trim() &&
            Number(createForm.price) &&
            createForm.images.length > 0 &&
            createForm.tone.trim()
        );
    }, [createForm]);

    const handleFileUpload = async (file: File) => {
        try {
            const pathname = `products/${Date.now()}`;
            const result = await vercelUpload(pathname, file, { handleUploadUrl: "/api/blob/upload", access: 'public' });
            return typeof result === "string" ? result : (result as { url?: string })?.url ?? "";
        } catch {
            toast.error("Image upload failed");
            return "";
        }
    };

    return (
        <>
            <Head>
                <title>Admin — Products</title>
            </Head>

            <div className="min-h-screen bg-[var(--color-primary-bg)] text-[var(--color-primary-text)]">
                <header className="border-b border-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)] bg-[var(--color-primary-bg)]/70 backdrop-blur">
                    <Container>
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <p className="text-sm font-semibold tracking-tight">Admin</p>
                                <nav className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/admin/products")}
                                        className={router.pathname === "/admin/products" ? "bg-accent-bg" : ""}
                                    >
                                        Products
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/admin/orders")}
                                        className={router.pathname === "/admin/orders" ? "bg-accent-bg" : ""}
                                    >
                                        Orders
                                    </Button>
                                </nav>
                            </div>
                            <Button variant="secondary" type="button" onClick={() => router.push("/")}>
                                Back to shop
                            </Button>
                        </div>
                    </Container>
                </header>

                <main>
                    <section className="py-10">
                        <Container>
                            <div className="flex justify-between items-start mb-6">
                                <SectionTitle
                                    eyebrow="Products"
                                    title="Product management"
                                    subtitle="Create, edit, and delete products."
                                />
                                <Button
                                    onClick={() => {
                                        signOutAdmin();
                                        router.push("/admin/login");
                                    }}
                                    variant="outline"
                                >
                                    Logout
                                </Button>
                            </div>

                            <div className="mt-8 rounded-3xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] p-5 ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)]">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {editingProduct ? "Edit product" : "Create product"}
                                        </p>
                                        {editingProduct && (
                                            <p className="mt-1 text-xs text-[var(--color-primary-text)]/55">
                                                ID: {editingProduct.id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        {editingProduct && (
                                            <Button variant="secondary" type="button" onClick={onCancelEdit}>
                                                Cancel
                                            </Button>
                                        )}
                                        <Button type="button" onClick={onCreateOrUpdate} disabled={!canCreate}>
                                            {editingProduct ? "Save" : "Create"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <input
                                        className={inputClassName}
                                        placeholder="Name"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))}
                                    />
                                    <input
                                        className={inputClassName}
                                        placeholder="Price (string)"
                                        value={createForm.price}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, price: e.target.value }))}
                                    />
                                    <input
                                        className={inputClassName}
                                        placeholder="Subtitle"
                                        value={createForm.subtitle}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, subtitle: e.target.value }))}
                                    />
                                    <select
                                        className={inputClassName}
                                        value={createForm.tone}
                                        onChange={(e) =>
                                            setCreateForm((s) => ({ ...s, tone: e.target.value as Tone | "" }))
                                        }
                                    >
                                        <option value="">Select tone</option>
                                        {TONE_OPTIONS.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        className={inputClassName}
                                        placeholder="Tag (optional)"
                                        value={createForm.tag}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, tag: e.target.value }))}
                                    />
                                    <select
                                        className={inputClassName}
                                        value={createForm.category}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, category: e.target.value }))}
                                    >
                                        <option value="">Select category</option>
                                        <option value="rings">Rings</option>
                                        <option value="necklaces">Necklaces</option>
                                        <option value="earrings">Earrings</option>
                                        <option value="bracelets">Bracelets</option>
                                    </select>
                                    <div className="sm:col-span-2">
                                        <p className="text-xs text-[color-mix(in srgb, var(--color-primary-text) 60%, transparent)] mb-2">Images</p>
                                        <div className="space-y-2">
                                            {createForm.images.map((img, index) => (
                                                <div key={index} className="flex items-center gap-3 p-2 bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] rounded-lg">
                                                    <Image src={img.src} alt={img.alt} width={64} height={64} className="w-16 h-16 object-cover rounded" />
                                                    <input
                                                        className={inputClassName + " flex-1"}
                                                        placeholder="Image alt"
                                                        value={img.alt}
                                                        onChange={(e) => setCreateForm((s) => ({
                                                            ...s,
                                                            images: s.images.map((i, idx) => idx === index ? { ...i, alt: e.target.value } : i)
                                                        }))}
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'up')}
                                                            disabled={index === 0}
                                                            className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                                                        >
                                                            ↑
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(index, 'down')}
                                                            disabled={index === createForm.images.length - 1}
                                                            className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50"
                                                        >
                                                            ↓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCreateForm((s) => ({
                                                                ...s,
                                                                images: s.images.filter((_, idx) => idx !== index)
                                                            }))}
                                                            className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <div
                                                className="border-2 border-dashed border-[color-mix(in srgb, var(--color-primary-text) 20%, transparent)] rounded-lg p-4 text-center cursor-pointer hover:border-[color-mix(in srgb, var(--color-primary-text) 40%, transparent)] transition-colors"
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    handleFiles(e.dataTransfer.files);
                                                }}
                                            >
                                                <p className="text-sm text-[color-mix(in srgb, var(--color-primary-text) 60%, transparent)]">
                                                    Drop images here or click to select
                                                </p>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={(e) => handleFiles(e.target.files!)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-3xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] p-5 ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)]">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <p className="text-sm font-semibold">Products</p>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            className={inputClassName}
                                            placeholder="Search (name or subtitle)"
                                            value={q}
                                            onChange={(e) => {
                                                setQ(e.target.value);
                                                setSkip(0);
                                            }}
                                        />
                                        <input
                                            className={inputClassName}
                                            placeholder="Filter tag"
                                            value={tag}
                                            onChange={(e) => {
                                                setTag(e.target.value);
                                                setSkip(0);
                                            }}
                                        />
                                        <select
                                            className={inputClassName}
                                            value={tone}
                                            onChange={(e) => {
                                                setTone(e.target.value as Tone | "");
                                                setSkip(0);
                                            }}
                                        >
                                            <option value="">All tones</option>
                                            {TONE_OPTIONS.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                        <select
                                            className={inputClassName}
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); setSkip(0); }}
                                        >
                                            <option value="">All categories</option>
                                            <option value="rings">Rings</option>
                                            <option value="necklaces">Necklaces</option>
                                            <option value="earrings">Earrings</option>
                                            <option value="bracelets">Bracelets</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <select
                                            className={inputClassName}
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                                        >
                                            <option value="createdAt">Sort: createdAt</option>
                                            <option value="updatedAt">Sort: updatedAt</option>
                                            <option value="name">Sort: name</option>
                                            <option value="price">Sort: price</option>
                                            <option value="tone">Sort: tone</option>
                                            <option value="tag">Sort: tag</option>
                                        </select>

                                        <select
                                            className={inputClassName}
                                            value={category}
                                            onChange={(e) => { setCategory(e.target.value); setSkip(0); }}
                                        >
                                            <option value="">All categories</option>
                                            <option value="rings">Rings</option>
                                            <option value="necklaces">Necklaces</option>
                                            <option value="earrings">Earrings</option>
                                            <option value="bracelets">Bracelets</option>
                                        </select>

                                        <select
                                            className={inputClassName}
                                            value={order}
                                            onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
                                        >
                                            <option value="desc">Order: desc</option>
                                            <option value="asc">Order: asc</option>
                                        </select>

                                        <select
                                            className={inputClassName}
                                            value={take}
                                            onChange={(e) => {
                                                setTake(Number(e.target.value));
                                                setSkip(0);
                                            }}
                                        >
                                            <option value={12}>12 / page</option>
                                            <option value={24}>24 / page</option>
                                            <option value={48}>48 / page</option>
                                        </select>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button variant="secondary" type="button" onClick={loadProducts} disabled={loading}
                                        >
                                            Refresh
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <Divider />
                                </div>

                                {error ? (
                                    <p className="mt-4 text-sm text-[var(--color-primary-text)]/70">{error}</p>
                                ) : null}

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full min-w-[860px] text-left text-sm">
                                        <thead className="text-[var(--color-primary-text)]/70">
                                            <tr>
                                                <th className="py-3 pr-4 font-medium">Name</th>
                                                <th className="py-3 pr-4 font-medium">Price</th>
                                                <th className="py-3 pr-4 font-medium">Tone</th>
                                                <th className="py-3 pr-4 font-medium">Category</th>
                                                <th className="py-3 pr-4 font-medium">Tag</th>
                                                <th className="py-3 pr-4 font-medium">Updated</th>
                                                <th className="py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p) => (
                                                <tr key={p.id} className="border-t border-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)]">
                                                    <td className="py-3 pr-4">
                                                        <p className="font-medium text-[var(--color-primary-text)]">{p.name}</p>
                                                        <p className="mt-0.5 text-xs text-[var(--color-primary-text)]/55">{p.subtitle}</p>
                                                    </td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{p.price}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{p.tone}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{p.category ?? "—"}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{p.tag ?? "—"}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/60">{formatDate(p.updatedAt)}</td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                type="button"
                                                                onClick={() => onStartEdit(p)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button variant="ghost" type="button" onClick={() => onDelete(p)}>
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {!loading && products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="py-6 text-center text-[var(--color-primary-text)]/60">
                                                        No products found.
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-xs text-[var(--color-primary-text)]/55">
                                        Showing {products.length} item(s)
                                    </p>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => setSkip((s) => Math.max(0, s - take))}
                                            disabled={!hasPrev || loading}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            type="button"
                                            onClick={() => setSkip((s) => s + take)}
                                            disabled={!hasNext || loading}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>


                        </Container>
                    </section>
                </main>
            </div>
        </>
    );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const { req } = context;
    const token = req.cookies['admin-token']; // Assuming token is stored in cookie

    if (!token) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    // Verify token
    const { verifyAdminToken } = await import('@/config/admin-auth.config');
    if (!verifyAdminToken(token)) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        };
    }

    // Optionally fetch initial products
    const prisma = (await import('@/config/prisma.config')).default;
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        take: 24,
    });

    return {
        props: {
            initialProducts: products.map(p => ({
                ...p,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
            })),
        },
    };
}