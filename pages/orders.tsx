import Head from "next/head";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { signInWithGoogle } from "@/services/login.service";
import { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import prisma from "@/config/prisma.config";
import authorize from "@/config/auth.config";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type Order = {
    id: number;
    userId: number;
    total: string;
    status: string;
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

export default function Orders({ initialOrders = [] }: { initialOrders: Order[] }) {
    const { isAuthenticated } = useAuth();
    const [signingIn, setSigningIn] = useState(false);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(initialOrders.length > 0 ? 2 : 1); // Start from page 2 if we have initial data
    const [canLoadMore, setCanLoadMore] = useState(initialOrders.length === 3);

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

    const loadMoreOrders = useCallback(async () => {
        if (loading || !canLoadMore) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/orders?page=${page + 1}&limit=3`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(prev => page === 1 ? data : [...prev, ...data]);
                setPage(prev => prev + 1);
                setCanLoadMore(data.length === 3);
            }
        } catch (error) {
            console.error('Failed to load more orders:', error);
        } finally {
            setLoading(false);
        }
    }, [page, loading, canLoadMore]);

    useEffect(() => {
        if (isAuthenticated && orders.length === 0) {
            loadMoreOrders();
        }
    }, [isAuthenticated, loadMoreOrders, orders.length]);

    // Infinite scroll setup
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && canLoadMore && !loading) {
                    loadMoreOrders();
                }
            },
            { threshold: 1.0 }
        );

        const sentinel = document.getElementById('load-more-sentinel');
        if (sentinel) observer.observe(sentinel);

        return () => observer.disconnect();
    }, [loadMoreOrders, canLoadMore, loading]);

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
                <Header />
                <Container className="py-16">
                    <div className="mx-auto max-w-4xl mb-16">
                        <h1 className="text-3xl font-bold text-primary-text mb-8">Your Orders</h1>

                        {loading && orders.length === 0 ? (
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
                                {canLoadMore && (
                                    <div id="load-more-sentinel" className="text-center py-8">
                                        {loading ? (
                                            <p className="text-text-muted">Loading more orders...</p>
                                        ) : (
                                            <p className="text-text-muted">Scroll for more</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <Footer />
                </Container>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { req } = context;
    const token = req.cookies['token'];
    console.log(token);

    if (!token) {
        // No token, render page normally (client-side auth will handle)
        return {
            props: {
                initialOrders: [],
            },
        };
    }

    const userID = authorize(token);
    if (!userID) {
        // Invalid token, render page normally
        return {
            props: {
                initialOrders: [],
            },
        };
    }

    try {
        // Fetch initial orders for SSR
        const orders = await prisma.order.findMany({
            where: { userId: Number(userID) },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                subtitle: true,
                                images: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 3, // Initial load
        });

        // Transform the data to match the Order type
        const transformedOrders = orders.map(order => ({
            ...order,
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
            items: order.items.map(item => ({
                ...item,
                createdAt: item.createdAt.toISOString(),
                updatedAt: item.updatedAt.toISOString(),
                product: {
                    ...item.product,
                    imageSrc: Array.isArray(item.product.images) ? (item.product.images[0] as { src: string, alt: string })?.src || '' : '',
                    imageAlt: Array.isArray(item.product.images) ? (item.product.images[0] as { src: string, alt: string })?.alt || '' : '',
                },
            })),
        }));

        return {
            props: {
                initialOrders: transformedOrders,
            },
        };
    } catch (error) {
        console.error('Error fetching orders for SSR:', error);
        return {
            props: {
                initialOrders: [],
            },
        };
    }
};
