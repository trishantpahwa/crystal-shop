"use client";

import Head from "next/head";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { useCart } from "@/providers/CartProvider";
import { useOrders } from "@/providers/OrderProvider";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { signInWithGoogle } from "@/services/login.service";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Cart() {
    const { items, subtotal, discountCode, discountAmount, total, loading, updateQuantity, removeFromCart, applyDiscountCode, refreshCart } = useCart();
    const { createOrder } = useOrders();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [signingIn, setSigningIn] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingAddress, setShippingAddress] = useState("");
    const [discountCodeInput, setDiscountCodeInput] = useState("");
    const [applyingDiscount, setApplyingDiscount] = useState(false);
    const router = useRouter();

    // Show loading while authentication is being determined
    if (authLoading) {
        return (
            <>
                <Head>
                    <title>Cart — Crystal Atelier</title>
                </Head>
                <div className="min-h-screen bg-primary-bg text-primary-text">
                    <Container className="py-16">
                        <div className="mx-auto max-w-md text-center mb-16">
                            <div className="animate-pulse">
                                <div className="h-8 bg-secondary-bg rounded mb-4"></div>
                                <div className="h-4 bg-secondary-bg rounded mb-2"></div>
                                <div className="h-10 bg-secondary-bg rounded"></div>
                            </div>
                        </div>
                        <Footer />
                    </Container>
                </div>
            </>
        );
    }

    const handleSignIn = async () => {
        setSigningIn(true);
        try {
            await signInWithGoogle();
        } catch {
            toast.error("Failed to sign in");
        } finally {
            setSigningIn(false);
        }
    };

    const handleQuantityChange = async (productId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            await updateQuantity(productId, newQuantity);
        } catch {
            toast.error("Failed to update quantity");
        }
    };

    const handleRemove = async (productId: number) => {
        try {
            await removeFromCart(productId);
            toast.success("Item removed from cart");
        } catch {
            toast.error("Failed to remove item");
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCodeInput.trim()) {
            toast.error("Please enter a discount code");
            return;
        }

        setApplyingDiscount(true);
        try {
            await applyDiscountCode(discountCodeInput.trim().toUpperCase());
            toast.success("Discount code applied!");
            setDiscountCodeInput("");
        } catch (error: any) {
            toast.error(error.message || "Failed to apply discount code");
        } finally {
            setApplyingDiscount(false);
        }
    };

    const handleRemoveDiscount = async () => {
        setApplyingDiscount(true);
        try {
            await applyDiscountCode(null);
            toast.success("Discount code removed");
        } catch (error: any) {
            toast.error(error.message || "Failed to remove discount code");
        } finally {
            setApplyingDiscount(false);
        }
    };

    const handleCheckout = async () => {
        if (!shippingAddress.trim()) {
            toast.error("Please enter a shipping address");
            return;
        }

        setCheckoutLoading(true);
        try {
            await createOrder(shippingAddress.trim());
            await refreshCart(); // Refresh cart to show it's empty
            toast.success("Order placed successfully!");
            setShowCheckout(false);
            setShippingAddress("");
            router.push("/orders"); // Redirect to orders page
        } catch (error) {
            toast.error("Failed to place order");
            console.error("Checkout error:", error);
        } finally {
            setCheckoutLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <>
                <Head>
                    <title>Cart — Crystal Atelier</title>
                </Head>
                <div className="min-h-screen bg-primary-bg text-primary-text">
                    <Header />
                    <Container className="py-16">
                        <div className="mx-auto max-w-md text-center mb-16">
                            <h1 className="text-3xl font-bold text-primary-text mb-4">Your Cart</h1>
                            <p className="text-text-muted mb-8">
                                Please sign in to view your cart and checkout.
                            </p>
                            <Button
                                onClick={handleSignIn}
                                disabled={signingIn}
                                className="w-full"
                            >
                                {signingIn ? "Signing in..." : "Sign In with Google"}
                            </Button>
                        </div>
                        <Footer />
                    </Container>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Cart — Crystal Atelier</title>
            </Head>
            <div className="min-h-screen bg-primary-bg text-primary-text">
                <Header />
                <Container className="py-16">
                    <div className="mx-auto max-w-4xl">
                        <h1 className="text-3xl font-bold text-primary-text mb-8">Your Cart</h1>

                        {items.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-text-muted text-lg mb-4">Your cart is empty</p>
                                <Button href="/" variant="outline">
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cart Items */}
                                <div className="lg:col-span-2 space-y-4">
                                    {items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex flex-col gap-4 p-4 bg-secondary-bg rounded-2xl ring-1 ring-border sm:flex-row sm:items-center"
                                        >
                                            <div className="flex gap-4 flex-1 min-w-0">
                                                <div className="relative w-20 h-20 flex-shrink-0">
                                                    <Image
                                                        src={item.product.imageSrc}
                                                        alt={item.product.imageAlt}
                                                        fill
                                                        className="object-cover rounded-lg"
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-primary-text font-semibold truncate">
                                                        {item.product.name}
                                                    </h3>
                                                    <p className="text-text-muted text-sm truncate">
                                                        {item.product.subtitle}
                                                    </p>
                                                    <p className="text-primary-text font-semibold mt-1">
                                                        ₹ {item.product.price}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                                                        disabled={loading}
                                                        className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-primary-text hover:bg-[color-mix(in srgb, var(--color-accent-bg) 120%, transparent)] disabled:opacity-50"
                                                    >
                                                        -
                                                    </button>
                                                    <span className="text-primary-text min-w-[2rem] text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                                                        disabled={loading}
                                                        className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-primary-text hover:bg-[color-mix(in srgb, var(--color-accent-bg) 120%, transparent)] disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => handleRemove(item.productId)}
                                                    disabled={loading}
                                                    className="text-text-disabled hover:text-primary-text text-sm whitespace-nowrap"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div className="lg:col-span-1">
                                    <div className="bg-secondary-bg rounded-2xl p-6 ring-1 ring-border">
                                        <h2 className="text-xl font-semibold text-primary-text mb-4">
                                            Order Summary
                                        </h2>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-text-muted">
                                                <span>Subtotal</span>
                                                <span>₹ {subtotal}</span>
                                            </div>
                                            {discountCode && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Discount ({discountCode})</span>
                                                    <span>-₹ {discountAmount}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-text-muted">
                                                <span>Shipping</span>
                                                <span>Free</span>
                                            </div>
                                        </div>

                                        {/* Discount Code Section */}
                                        <div className="mb-4">
                                            {!discountCode ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Discount code"
                                                        value={discountCodeInput}
                                                        onChange={(e) => setDiscountCodeInput(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-primary-bg border border-border rounded-lg text-primary-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-bg text-sm"
                                                        disabled={loading || applyingDiscount}
                                                    />
                                                    <Button
                                                        onClick={handleApplyDiscount}
                                                        disabled={loading || applyingDiscount || !discountCodeInput.trim()}
                                                        className="px-3 py-1 text-xs"
                                                    >
                                                        {applyingDiscount ? "..." : "Apply"}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-green-700 font-medium">{discountCode}</span>
                                                        <span className="text-green-600 text-sm">(-₹{discountAmount})</span>
                                                    </div>
                                                    <button
                                                        onClick={handleRemoveDiscount}
                                                        disabled={loading || applyingDiscount}
                                                        className="text-green-600 hover:text-green-800 text-sm underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="border-t border-border pt-4 mb-6">
                                            <div className="flex justify-between text-primary-text font-semibold text-lg">
                                                <span>Total</span>
                                                <span>₹ {total}</span>
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            disabled={loading}
                                            onClick={() => setShowCheckout(true)}
                                        >
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>

                {/* Checkout Modal */}
                {showCheckout && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-secondary-bg rounded-2xl p-6 max-w-md w-full ring-1 ring-border">
                            <h2 className="text-xl font-semibold text-primary-text mb-4">
                                Checkout
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-primary-text mb-2">
                                        Shipping Address
                                    </label>
                                    <textarea
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="Enter your full shipping address..."
                                        className="w-full px-3 py-2 bg-primary-bg border border-border rounded-lg text-primary-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-bg"
                                        rows={4}
                                        disabled={checkoutLoading}
                                    />
                                </div>

                                <div className="border-t border-border pt-4">
                                    <div className="space-y-1 mb-2">
                                        <div className="flex justify-between text-text-muted text-sm">
                                            <span>Subtotal</span>
                                            <span>₹ {subtotal}</span>
                                        </div>
                                        {discountCode && (
                                            <div className="flex justify-between text-green-600 text-sm">
                                                <span>Discount ({discountCode})</span>
                                                <span>-₹ {discountAmount}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-between text-primary-text font-semibold">
                                        <span>Total</span>
                                        <span>₹ {total}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCheckout(false)}
                                    disabled={checkoutLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleCheckout}
                                    disabled={checkoutLoading || !shippingAddress.trim()}
                                >
                                    {checkoutLoading ? "Placing Order..." : "Place Order"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                <Footer />
            </div>
        </>
    );
}