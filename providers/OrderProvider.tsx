import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthProvider";

export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: string;
    product: {
        id: number;
        name: string;
        subtitle: string;
        price: string;
        imageSrc: string;
        imageAlt: string;
        tone: string;
    };
}

export interface Order {
    id: number;
    userId: number;
    total: string;
    status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
}

interface OrderContextType {
    orders: Order[];
    loading: boolean;
    createOrder: (shippingAddress: string) => Promise<Order>;
    refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshOrders = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setOrders([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/orders", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            } else {
                console.error("Failed to fetch orders");
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    const createOrder = async (shippingAddress: string): Promise<Order> => {
        if (!isAuthenticated || !token) {
            throw new Error("Please sign in to place an order");
        }

        setLoading(true);
        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ shippingAddress }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create order");
            }

            const newOrder = await response.json();
            await refreshOrders(); // Refresh orders list
            return newOrder;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshOrders();
    }, [refreshOrders]);

    const value: OrderContextType = {
        orders,
        loading,
        createOrder,
        refreshOrders,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error("useOrders must be used within an OrderProvider");
    }
    return context;
}