import Head from "next/head";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { useOrders } from "@/providers/OrderProvider";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { signInWithGoogle } from "@/services/login.service";
import { useState } from "react";

export default function Orders() {
    const { orders, loading } = useOrders();
    const { isAuthenticated } = useAuth();
    const [signingIn, setSigningIn] = useState(false);

    const handleSignIn = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch {
            // Error handled by service
        } finally {
            setSigningIn(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "text-yellow-600 bg-yellow-100";
            case "CONFIRMED":
                return "text-blue-600 bg-blue-100";
            case "SHIPPED":
                return "text-purple-600 bg-purple-100";
            case "DELIVERED":
                return "text-green-600 bg-green-100";
            case "CANCELLED":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    if (!isAuthenticated) {
        return (
            <>
                <Head>
                    <title>Orders — Crystal Atelier</title>
                </Head>
                <div className="min-h-screen bg-primary-bg text-primary-text">
                    <Container className="py-16">
                        <div className="mx-auto max-w-md text-center">
                            <h1 className="text-3xl font-bold text-primary-text mb-4">Your Orders</h1>
                            <p className="text-text-muted mb-8">
                                Please sign in to view your orders.
                            </p>
                            <Button
                                onClick={handleSignIn}
                                disabled={signingIn}
                                className="w-full"
                            >
                                {signingIn ? "Signing in..." : "Sign In with Google"}
                            </Button>
                        </div>
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Orders — Crystal Atelier</title>
            </Head>
            <div className="min-h-screen bg-primary-bg text-primary-text">
                <Container className="py-16">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="text-3xl font-bold text-primary-text mb-8">Your Orders</h1>

                        {loading ? (
                            <div className="text-center py-16">
                                <p className="text-text-muted">Loading orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-text-muted text-lg mb-4">You haven&apos;t placed any orders yet</p>
                                <Button href="/" variant="outline">
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-primary-text">
                                                    Order #{order.id}
                                                </h2>
                                                <p className="text-text-muted text-sm">
                                                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                        order.status
                                                    )}`}
                                                >
                                                    {order.status}
                                                </span>
                                                <p className="text-primary-text font-semibold mt-1">
                                                    ₹ {order.total}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <h3 className="text-sm font-medium text-primary-text mb-2">
                                                Shipping Address
                                            </h3>
                                            <p className="text-text-muted text-sm">
                                                {order.shippingAddress}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-primary-text mb-3">
                                                Items
                                            </h3>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex gap-3 p-3 bg-primary-bg rounded-lg"
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
                                                            <h4 className="text-primary-text font-medium truncate">
                                                                {item.product.name}
                                                            </h4>
                                                            <p className="text-text-muted text-sm truncate">
                                                                {item.product.subtitle}
                                                            </p>
                                                            <p className="text-primary-text text-sm">
                                                                Qty: {item.quantity} × ₹ {item.price}
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
                    </div>
                </Container>
            </div>
        </>
    );
}