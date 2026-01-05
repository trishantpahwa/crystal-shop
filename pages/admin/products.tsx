import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { upload as vercelUpload } from "@vercel/blob/client";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Divider } from "@/components/Divider";
import { SectionTitle } from "@/components/SectionTitle";
import { useAuth } from "@/providers/AuthProvider";

type SortBy = "createdAt" | "updatedAt" | "name" | "price" | "tone" | "tag";

type Tone = "amethyst" | "rose" | "aqua" | "amber";

const TONE_OPTIONS: ReadonlyArray<Tone> = ["amethyst", "rose", "aqua", "amber"];

type Product = {
    id: number;
    name: string;
    subtitle: string;
    price: string;
    tag: string | null;
    imageSrc: string;
    imageAlt: string;
    tone: Tone;
    createdAt: string;
    updatedAt: string;
};

type ProductInput = {
    name: string;
    subtitle: string;
    price: string;
    tag: string;
    imageSrc: string;
    imageAlt: string;
    tone: Tone | "";
};

const inputClassName =
    "w-full rounded-2xl bg-white/5 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 placeholder:text-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30";

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function buildProductsUrl(params: {
    q: string;
    tag: string;
    tone: string;
    sortBy: SortBy;
    order: "asc" | "desc";
    skip: number;
    take: number;
}) {
    const search = new URLSearchParams();
    if (params.q.trim()) search.set("q", params.q.trim());
    if (params.tag.trim()) search.set("tag", params.tag.trim());
    if (params.tone.trim()) search.set("tone", params.tone.trim());
    search.set("sortBy", params.sortBy);
    search.set("order", params.order);
    search.set("skip", String(params.skip));
    search.set("take", String(params.take));
    return `/api/products?${search.toString()}`;
}

export default function AdminProductPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading, token } = useAuth();

    const [q, setQ] = useState("");
    const [tag, setTag] = useState("");
    const [tone, setTone] = useState<Tone | "">("");
    const [sortBy, setSortBy] = useState<SortBy>("createdAt");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [skip, setSkip] = useState(0);
    const [take, setTake] = useState(24);

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<ProductInput>({
        name: "",
        subtitle: "",
        price: "",
        tag: "",
        imageSrc: "",
        imageAlt: "",
        tone: "",
    });

    const [editing, setEditing] = useState<Product | null>(null);
    const [editForm, setEditForm] = useState<ProductInput>({
        name: "",
        subtitle: "",
        price: "",
        tag: "",
        imageSrc: "",
        imageAlt: "",
        tone: "",
    });

    const hasPrev = skip > 0;
    const hasNext = products.length === take;

    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = buildProductsUrl({ q, tag, tone, sortBy, order, skip, take });
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
    }, [q, tag, tone, sortBy, order, skip, take]);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) return;
        loadProducts();
    }, [authLoading, isAuthenticated, loadProducts]);

    const onCreate = async () => {
        if (!token) {
            toast.error("Unauthorized");
            return;
        }

        try {
            const response = await fetch("/api/product", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "" // Temporary fix for authentication => @trishantpahwa | 2026-01-05 15:24:58
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
                imageSrc: "",
                imageAlt: "",
                tone: "",
            });
            setSkip(0);
            loadProducts();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to create product");
        }
    };

    const onStartEdit = (product: Product) => {
        setEditing(product);
        setEditForm({
            name: product.name,
            subtitle: product.subtitle,
            price: product.price,
            tag: product.tag ?? "",
            imageSrc: product.imageSrc,
            imageAlt: product.imageAlt,
            tone: product.tone,
        });
    };

    const onCancelEdit = () => {
        setEditing(null);
    };

    const onSaveEdit = async () => {
        if (!editing) return;
        if (!token) {
            toast.error("Unauthorized");
            return;
        }

        try {
            const response = await fetch(`/api/product/${editing.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "" // Temporary fix for authentication => @trishantpahwa | 2026-01-05 15:04:54
                },
                body: JSON.stringify(editForm),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message ?? "Failed to update product");
            }
            toast.success("Product updated");
            setEditing(null);
            loadProducts();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update product");
        }
    };

    const onDelete = async (product: Product) => {
        if (!token) {
            toast.error("Unauthorized");
            return;
        }

        if (!window.confirm(`Delete “${product.name}”?`)) return;

        try {
            const response = await fetch(`/api/product/${product.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "" // Temporary fix for authentication => @trishantpahwa | 2026-01-05 15:25:13
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.message ?? "Failed to delete product");
            }
            toast.success("Product deleted");
            if (editing?.id === product.id) setEditing(null);
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
            createForm.imageSrc.trim() &&
            createForm.imageAlt.trim() &&
            createForm.tone.trim()
        );
    }, [createForm]);

    const handleFileUpload = async (file: File) => {
        try {
            const pathname = `products/${Date.now()}`;
            const result = await vercelUpload(pathname, file, { handleUploadUrl: "/api/blob/upload", access: 'public' });
            return typeof result === "string" ? result : (result as any)?.url ?? "";
        } catch (e) {
            toast.error("Image upload failed");
            return "";
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <Container>
                    <div className="py-10">
                        <SectionTitle title="Admin — Products" subtitle="Loading…" />
                    </div>
                </Container>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-950 text-white">
                <Container>
                    <div className="py-10">
                        <SectionTitle
                            title="Admin — Products"
                            subtitle="You need to be signed in to manage products."
                        />
                        <div className="mt-6 flex gap-3">
                            <Button variant="secondary" type="button" onClick={() => router.push("/")}
                            >
                                Go to home
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Admin — Products</title>
            </Head>

            <div className="min-h-screen bg-slate-950 text-white">
                <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur">
                    <Container>
                        <div className="flex h-16 items-center justify-between">
                            <p className="text-sm font-semibold tracking-tight">Admin</p>
                            <Button variant="secondary" type="button" onClick={() => router.push("/")}
                            >
                                Back to shop
                            </Button>
                        </div>
                    </Container>
                </header>

                <main>
                    <section className="py-10">
                        <Container>
                            <SectionTitle
                                eyebrow="Products"
                                title="Product management"
                                subtitle="Create, edit, and delete products."
                            />

                            <div className="mt-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-sm font-semibold">Create product</p>
                                    <Button type="button" onClick={onCreate} disabled={!canCreate}>
                                        Create
                                    </Button>
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
                                        value={`₹ ${createForm.price}`}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, price: e.target.value.split("₹ ")[1] }))}
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
                                    <input
                                        className={inputClassName}
                                        placeholder="Image alt"
                                        value={createForm.imageAlt}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, imageAlt: e.target.value }))}
                                    />
                                    <input
                                        className={inputClassName + " sm:col-span-2"}
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const f = e.target.files?.[0];
                                            if (!f) return;
                                            const url = await handleFileUpload(f);
                                            if (url) setCreateForm((s) => ({ ...s, imageSrc: url }));
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
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
                                    <p className="mt-4 text-sm text-white/70">{error}</p>
                                ) : null}

                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full min-w-[860px] text-left text-sm">
                                        <thead className="text-white/70">
                                            <tr>
                                                <th className="py-3 pr-4 font-medium">Name</th>
                                                <th className="py-3 pr-4 font-medium">Price</th>
                                                <th className="py-3 pr-4 font-medium">Tone</th>
                                                <th className="py-3 pr-4 font-medium">Tag</th>
                                                <th className="py-3 pr-4 font-medium">Updated</th>
                                                <th className="py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((p) => (
                                                <tr key={p.id} className="border-t border-white/10">
                                                    <td className="py-3 pr-4">
                                                        <p className="font-medium text-white">{p.name}</p>
                                                        <p className="mt-0.5 text-xs text-white/55">{p.subtitle}</p>
                                                    </td>
                                                    <td className="py-3 pr-4 text-white/80">{p.price}</td>
                                                    <td className="py-3 pr-4 text-white/80">{p.tone}</td>
                                                    <td className="py-3 pr-4 text-white/80">{p.tag ?? "—"}</td>
                                                    <td className="py-3 pr-4 text-white/60">{formatDate(p.updatedAt)}</td>
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
                                                    <td colSpan={6} className="py-6 text-center text-white/60">
                                                        No products found.
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-xs text-white/55">
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

                            {editing ? (
                                <div className="mt-8 rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">Edit product</p>
                                            <p className="mt-1 text-xs text-white/55">ID: {editing.id}</p>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button variant="secondary" type="button" onClick={onCancelEdit}>
                                                Cancel
                                            </Button>
                                            <Button type="button" onClick={onSaveEdit}>
                                                Save
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                        <input
                                            className={inputClassName}
                                            placeholder="Name"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))}
                                        />
                                        <input
                                            className={inputClassName}
                                            placeholder="Price (string)"
                                            value={editForm.price}
                                            onChange={(e) => setEditForm((s) => ({ ...s, price: e.target.value }))}
                                        />
                                        <input
                                            className={inputClassName}
                                            placeholder="Subtitle"
                                            value={editForm.subtitle}
                                            onChange={(e) => setEditForm((s) => ({ ...s, subtitle: e.target.value }))}
                                        />
                                        <select
                                            className={inputClassName}
                                            value={editForm.tone}
                                            onChange={(e) =>
                                                setEditForm((s) => ({ ...s, tone: e.target.value as Tone | "" }))
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
                                            value={editForm.tag}
                                            onChange={(e) => setEditForm((s) => ({ ...s, tag: e.target.value }))}
                                        />
                                        <input
                                            className={inputClassName}
                                            placeholder="Image alt"
                                            value={editForm.imageAlt}
                                            onChange={(e) => setEditForm((s) => ({ ...s, imageAlt: e.target.value }))}
                                        />
                                        <input
                                            className={inputClassName + " sm:col-span-2"}
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const f = e.target.files?.[0];
                                                if (!f) return;
                                                const url = await handleFileUpload(f);
                                                if (url) setEditForm((s) => ({ ...s, imageSrc: url }));
                                            }}
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </Container>
                    </section>
                </main>
            </div>
        </>
    );
}