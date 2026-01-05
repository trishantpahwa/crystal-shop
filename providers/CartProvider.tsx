import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthProvider";

export interface CartItem {
    id: number;
    productId: number;
    quantity: number;
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

interface CartContextType {
    items: CartItem[];
    total: string;
    loading: boolean;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (productId: number, quantity: number) => Promise<void>;
    removeFromCart: (productId: number) => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, token } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [total, setTotal] = useState("0.00");
    const [loading, setLoading] = useState(false);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setItems([]);
            setTotal("0.00");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/cart", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data.items || []);
                setTotal(data.total || "0.00");
            } else {
                console.error("Failed to fetch cart");
                setItems([]);
                setTotal("0.00");
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
            setItems([]);
            setTotal("0.00");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token]);

    const addToCart = async (productId: number, quantity = 1) => {
        if (!isAuthenticated || !token) {
            throw new Error("Please sign in to add items to cart");
        }

        setLoading(true);
        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to add item to cart");
            }

            await refreshCart();
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (!isAuthenticated || !token) {
            throw new Error("Please sign in to update cart");
        }

        setLoading(true);
        try {
            const response = await fetch("/api/cart", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId, quantity }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to update cart");
            }

            await refreshCart();
        } catch (error) {
            console.error("Error updating cart:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (productId: number) => {
        if (!isAuthenticated || !token) {
            throw new Error("Please sign in to remove items from cart");
        }

        setLoading(true);
        try {
            const response = await fetch("/api/cart", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ productId }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to remove item from cart");
            }

            await refreshCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    const value: CartContextType = {
        items,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}