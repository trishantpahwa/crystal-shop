import Head from "next/head";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Divider } from "@/components/Divider";
import { SectionTitle } from "@/components/SectionTitle";

type OrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_OPTIONS: ReadonlyArray<OrderStatus> = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

type Order = {
    id: number;
    userId: number;
    total: string;
    status: OrderStatus;
    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        name: string | null;
        email: string;
        phoneNumber: string | null;
    };
    items: Array<{
        id: number;
        productId: number;
        quantity: number;
        price: string;
        product: {
            id: number;
            name: string;
            subtitle: string;
            imageSrc: string;
            imageAlt: string;
        };
    }>;
};

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function getStatusColor(status: OrderStatus) {
    switch (status) {
        case "PENDING":
            return "bg-yellow-100 text-yellow-800";
        case "CONFIRMED":
            return "bg-blue-100 text-blue-800";
        case "SHIPPED":
            return "bg-purple-100 text-purple-800";
        case "DELIVERED":
            return "bg-green-100 text-green-800";
        case "CANCELLED":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
}

export default function AdminOrdersPage() {
    const router = useRouter();

    const [status, setStatus] = useState<OrderStatus | "all">("all");
    const skip = 0;
    const take = 50;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (status !== "all") params.set("status", status);
            params.set("skip", String(skip));
            params.set("take", String(take));

            const response = await fetch(`/api/admin/orders?${params.toString()}`, {
                headers: {
                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data.orders);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    }, [status, skip, take]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
        setUpdatingOrderId(orderId);

        try {
            const response = await fetch("/api/admin/orders", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "",
                },
                body: JSON.stringify({ orderId, status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update order status");
            }

            const updatedOrder = await response.json();

            // Update the order in the local state
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? updatedOrder : order
                )
            );

            toast.success(`Order status updated to ${newStatus}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update order");
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const totalRevenue = useMemo(() => {
        return orders.reduce((sum, order) => {
            return sum + parseFloat(order.total.replace(/[₹,]/g, ""));
        }, 0);
    }, [orders]);

    return (
        <>
            <Head>
                <title>Admin — Orders</title>
            </Head>

            <div className="min-h-screen bg-primary-bg text-primary-text">
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

                <Container className="py-16">
                    <SectionTitle title="Order Management" />

                    <Divider />

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border">
                            <h3 className="text-lg font-semibold text-primary-text mb-2">Total Orders</h3>
                            <p className="text-3xl font-bold text-primary-text">{orders.length}</p>
                        </div>
                        <div className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border">
                            <h3 className="text-lg font-semibold text-primary-text mb-2">Total Revenue</h3>
                            <p className="text-3xl font-bold text-primary-text">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border">
                            <h3 className="text-lg font-semibold text-primary-text mb-2">Pending Orders</h3>
                            <p className="text-3xl font-bold text-primary-text">
                                {orders.filter(order => order.status === "PENDING").length}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Filter by Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as OrderStatus | "all")}
                                className="w-full rounded-2xl bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] px-4 py-2.5 text-sm text-[var(--color-primary-text)] ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in srgb, var(--color-emerald-accent) 30%, transparent)]"
                            >
                                <option value="all">All Orders</option>
                                {STATUS_OPTIONS.map((statusOption) => (
                                    <option key={statusOption} value={statusOption}>
                                        {statusOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Orders List */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-16">
                            <p className="text-text-muted">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-text-muted">No orders found</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-primary-text">
                                                Order #{order.id}
                                            </h3>
                                            <p className="text-text-muted text-sm">
                                                {formatDate(order.createdAt)}
                                            </p>
                                            <p className="text-primary-text font-medium mt-1">
                                                Customer: {order.user.name || order.user.email}
                                            </p>
                                            <p className="text-text-muted text-sm">
                                                {order.user.email}
                                                {order.user.phoneNumber && ` • ${order.user.phoneNumber}`}
                                            </p>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="text-right">
                                                <p className="text-primary-text font-semibold text-lg">
                                                    ₹{order.total}
                                                </p>
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                                                    disabled={updatingOrderId === order.id}
                                                    className="rounded-lg bg-[color-mix(in srgb, var(--color-primary-text) 5%, transparent)] px-3 py-1 text-sm text-[var(--color-primary-text)] ring-1 ring-[color-mix(in srgb, var(--color-primary-text) 10%, transparent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in srgb, var(--color-emerald-accent) 30%, transparent)] disabled:opacity-50"
                                                >
                                                    {STATUS_OPTIONS.map((statusOption) => (
                                                        <option key={statusOption} value={statusOption}>
                                                            {statusOption}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-primary-text mb-2">
                                            Shipping Address
                                        </h4>
                                        <p className="text-text-muted text-sm whitespace-pre-line">
                                            {order.shippingAddress}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-primary-text mb-3">
                                            Items ({order.items.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {order.items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-3 p-3 bg-primary-bg rounded-lg"
                                                >
                                                    <div className="relative w-12 h-12 flex-shrink-0">
                                                        <Image
                                                            src={item.product.imageSrc}
                                                            alt={item.product.imageAlt}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-primary-text font-medium truncate">
                                                            {item.product.name}
                                                        </h5>
                                                        <p className="text-text-muted text-sm truncate">
                                                            {item.product.subtitle}
                                                        </p>
                                                        <p className="text-primary-text text-sm">
                                                            Qty: {item.quantity} × ₹{item.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
}