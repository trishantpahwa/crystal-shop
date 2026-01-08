import Head from "next/head";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Divider } from "@/components/Divider";
import { SectionTitle } from "@/components/SectionTitle";
import { signOutAdmin } from "@/services/login.service";

type DiscountCode = {
    id: number;
    code: string;
    description: string | null;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    isActive: boolean;
    expiresAt: string | null;
    usageLimit: number | null;
    usedCount: number;
    createdAt: string;
    updatedAt: string;
};

type DiscountCodeInput = {
    code: string;
    description: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    isActive: boolean;
    expiresAt: string;
    usageLimit: number;
};

const inputClassName =
    "w-full rounded-2xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] px-4 py-2.5 text-sm text-[var(--color-primary-text)] ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)] placeholder:text-[var(--color-primary-text)]/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in srgb, var(--color-emerald-accent) 30%, transparent)]";

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

export default function AdminDiscountsPage() {
    const router = useRouter();

    const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [createForm, setCreateForm] = useState<DiscountCodeInput>({
        code: "",
        description: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        isActive: true,
        expiresAt: "",
        usageLimit: 0,
    });

    const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (!token) {
            router.push("/admin/login");
        }
    }, [router]);

    const loadDiscountCodes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/admin/discounts", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error ?? "Failed to load discount codes");
            }
            setDiscountCodes(data.discountCodes ?? []);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Failed to load discount codes";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDiscountCodes();
    }, [loadDiscountCodes]);

    const onCreateOrUpdate = async () => {
        if (editingDiscount) {
            // Update existing discount
            try {
                const response = await fetch("/api/admin/discounts", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    body: JSON.stringify({
                        id: editingDiscount.id,
                        ...createForm,
                        expiresAt: createForm.expiresAt || null,
                        usageLimit: createForm.usageLimit || null,
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error ?? "Failed to update discount code");
                }
                toast.success("Discount code updated");
                onCancelEdit();
                loadDiscountCodes();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to update discount code");
            }
        } else {
            // Create new discount
            try {
                const response = await fetch("/api/admin/discounts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                    body: JSON.stringify({
                        ...createForm,
                        expiresAt: createForm.expiresAt || null,
                        usageLimit: createForm.usageLimit || null,
                    }),
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data?.error ?? "Failed to create discount code");
                }
                toast.success("Discount code created");
                setCreateForm({
                    code: "",
                    description: "",
                    discountType: "PERCENTAGE",
                    discountValue: 0,
                    isActive: true,
                    expiresAt: "",
                    usageLimit: 0,
                });
                loadDiscountCodes();
            } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create discount code");
            }
        }
    };

    const onStartEdit = (discount: DiscountCode) => {
        setEditingDiscount(discount);
        setCreateForm({
            code: discount.code,
            description: discount.description || "",
            discountType: discount.discountType,
            discountValue: discount.discountValue,
            isActive: discount.isActive,
            expiresAt: discount.expiresAt ? new Date(discount.expiresAt).toISOString().slice(0, 16) : "",
            usageLimit: discount.usageLimit || 0,
        });
    };

    const onCancelEdit = () => {
        setEditingDiscount(null);
        setCreateForm({
            code: "",
            description: "",
            discountType: "PERCENTAGE",
            discountValue: 0,
            isActive: true,
            expiresAt: "",
            usageLimit: 0,
        });
    };

    const onDelete = async (discount: DiscountCode) => {
        if (!window.confirm(`Delete discount code "${discount.code}"?`)) return;

        try {
            const response = await fetch(`/api/admin/discounts?id=${discount.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                },
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data?.error ?? "Failed to delete discount code");
            }
            toast.success("Discount code deleted");
            if (editingDiscount?.id === discount.id) onCancelEdit();
            loadDiscountCodes();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete discount code");
        }
    };

    const canCreate = useMemo(() => {
        return (
            createForm.code.trim() &&
            createForm.discountValue > 0
        );
    }, [createForm]);

    return (
        <>
            <Head>
                <title>Admin — Discount Codes</title>
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
                                    <Button
                                        variant="ghost"
                                        onClick={() => router.push("/admin/discounts")}
                                        className={router.pathname === "/admin/discounts" ? "bg-accent-bg" : ""}
                                    >
                                        Discounts
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
                                    eyebrow="Discount Codes"
                                    title="Discount code management"
                                    subtitle="Create, edit, and delete discount codes."
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
                                            {editingDiscount ? "Edit discount code" : "Create discount code"}
                                        </p>
                                        {editingDiscount && (
                                            <p className="mt-1 text-xs text-[var(--color-primary-text)]/55">
                                                ID: {editingDiscount.id}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        {editingDiscount && (
                                            <Button variant="secondary" type="button" onClick={onCancelEdit}>
                                                Cancel
                                            </Button>
                                        )}
                                        <Button type="button" onClick={onCreateOrUpdate} disabled={!canCreate}>
                                            {editingDiscount ? "Save" : "Create"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <input
                                        className={inputClassName}
                                        placeholder="Code (e.g., SAVE10)"
                                        value={createForm.code}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, code: e.target.value.toUpperCase() }))}
                                    />
                                    <select
                                        className={inputClassName}
                                        value={createForm.discountType}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, discountType: e.target.value as "PERCENTAGE" | "FIXED" }))}
                                    >
                                        <option value="PERCENTAGE">Percentage</option>
                                        <option value="FIXED">Fixed Amount</option>
                                    </select>
                                    <input
                                        className={inputClassName}
                                        type="number"
                                        placeholder={createForm.discountType === "PERCENTAGE" ? "Discount % (e.g., 10)" : "Discount amount (e.g., 50)"}
                                        value={createForm.discountValue}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, discountValue: Number(e.target.value) }))}
                                        min="0"
                                        step={createForm.discountType === "PERCENTAGE" ? "1" : "0.01"}
                                    />
                                    <input
                                        className={inputClassName}
                                        type="number"
                                        placeholder="Usage limit (optional)"
                                        value={createForm.usageLimit}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, usageLimit: Number(e.target.value) }))}
                                        min="0"
                                    />
                                    <input
                                        className={inputClassName}
                                        type="datetime-local"
                                        placeholder="Expires at (optional)"
                                        value={createForm.expiresAt}
                                        onChange={(e) => setCreateForm((s) => ({ ...s, expiresAt: e.target.value }))}
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={createForm.isActive}
                                            onChange={(e) => setCreateForm((s) => ({ ...s, isActive: e.target.checked }))}
                                        />
                                        <label htmlFor="isActive" className="text-sm">Active</label>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <input
                                            className={inputClassName}
                                            placeholder="Description (optional)"
                                            value={createForm.description}
                                            onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 rounded-3xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] p-5 ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)]">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <p className="text-sm font-semibold">Discount Codes</p>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" type="button" onClick={loadDiscountCodes} disabled={loading}>
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
                                                <th className="py-3 pr-4 font-medium">Code</th>
                                                <th className="py-3 pr-4 font-medium">Type</th>
                                                <th className="py-3 pr-4 font-medium">Value</th>
                                                <th className="py-3 pr-4 font-medium">Used</th>
                                                <th className="py-3 pr-4 font-medium">Limit</th>
                                                <th className="py-3 pr-4 font-medium">Expires</th>
                                                <th className="py-3 pr-4 font-medium">Active</th>
                                                <th className="py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {discountCodes.map((d) => (
                                                <tr key={d.id} className="border-t border-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)]">
                                                    <td className="py-3 pr-4">
                                                        <p className="font-medium text-[var(--color-primary-text)]">{d.code}</p>
                                                        {d.description && (
                                                            <p className="mt-0.5 text-xs text-[var(--color-primary-text)]/55">{d.description}</p>
                                                        )}
                                                    </td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{d.discountType}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">
                                                        {d.discountType === "PERCENTAGE" ? `${d.discountValue}%` : `₹${d.discountValue}`}
                                                    </td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{d.usedCount}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/80">{d.usageLimit ?? "—"}</td>
                                                    <td className="py-3 pr-4 text-[var(--color-primary-text)]/60">
                                                        {d.expiresAt ? formatDate(d.expiresAt) : "—"}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${d.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {d.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="secondary"
                                                                type="button"
                                                                onClick={() => onStartEdit(d)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button variant="ghost" type="button" onClick={() => onDelete(d)}>
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {!loading && discountCodes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="py-6 text-center text-[var(--color-primary-text)]/60">
                                                        No discount codes found.
                                                    </td>
                                                </tr>
                                            ) : null}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-xs text-[var(--color-primary-text)]/55">
                                        Showing {discountCodes.length} discount code(s)
                                    </p>
                                </div>
                            </div>
                        </Container>
                    </section>
                </main>
            </div>
        </>
    );
}