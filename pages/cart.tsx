import Head from "next/head";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";
import { signInWithGoogle } from "@/services/login.service";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Cart() {
    const { items, total, loading, updateQuantity, removeFromCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [signingIn, setSigningIn] = useState(false);

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

    if (!isAuthenticated) {
        return (
            <>
                <Head>
                    <title>Cart — Crystal Atelier</title>
                </Head>
                <div className="min-h-screen bg-primary-bg text-primary-text">
                    <Container className="py-16">
                        <div className="mx-auto max-w-md text-center">
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
                                            className="flex gap-4 p-4 bg-secondary-bg rounded-2xl ring-1 ring-border"
                                        >
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

                                            <div className="flex items-center gap-3">
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
                                                    className="text-text-disabled hover:text-primary-text text-sm"
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
                                                <span>₹ {total}</span>
                                            </div>
                                            <div className="flex justify-between text-text-muted">
                                                <span>Shipping</span>
                                                <span>Free</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-border pt-4 mb-6">
                                            <div className="flex justify-between text-primary-text font-semibold text-lg">
                                                <span>Total</span>
                                                <span>₹ {total}</span>
                                            </div>
                                        </div>

                                        <Button className="w-full" disabled={loading}>
                                            Proceed to Checkout
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </>
    );
}