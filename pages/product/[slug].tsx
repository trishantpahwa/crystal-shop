import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowLeftIcon, SparkleIcon, StarIcon } from "@/components/Icons";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import type { Product } from "@/generated/prisma/client";
import Link from "next/link";

export default function ProductPage() {
    const router = useRouter();
    const { slug } = router.query;
    const { addToCart, loading } = useCart();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (!slug) return;

        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/product/${slug}`);
                const data = await response.json();
                if (response.ok) {
                    setProduct(data.product);
                } else {
                    toast.error("Product not found");
                    router.push("/");
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                toast.error("Failed to load product");
                router.push("/");
            } finally {
                setLoadingProduct(false);
            }
        };

        fetchProduct();
    }, [slug, router]);

    const handleAddToCart = async () => {
        if (!product) return;
        if (!isAuthenticated) {
            toast.error("Please sign in to add to cart");
            return;
        }
        try {
            await addToCart(product.id);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add to cart");
        }
    };

    if (loadingProduct) {
        return (
            <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-primary-bg text-primary-text flex items-center justify-center">
                <p>Product not found</p>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>{product.name} — Crystal Atelier</title>
                <meta name="description" content={product.subtitle} />
            </Head>

            <div className="min-h-screen bg-primary-bg text-primary-text">
                <header className="sticky top-0 z-40 border-b border-border bg-primary-bg/70 backdrop-blur">
                    <Container>
                        <div className="flex h-16 items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link href="/" className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-bg ring-1 ring-border">
                                        <SparkleIcon className="h-5 w-5 text-emerald-accent" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-sm font-semibold tracking-tight">Crystal Atelier</p>
                                        <p className="text-xs text-text-dim">Modern crystal jewellery</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="secondary" type="button" href="/cart">
                                    Bag
                                </Button>
                            </div>
                        </div>
                    </Container>
                </header>

                <main className="pt-12 sm:pt-16">
                    <Container>
                        <div className="mb-8">
                            <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary-text">
                                <ArrowLeftIcon className="h-4 w-4" />
                                Back to home
                            </Link>
                        </div>

                        <div className="grid items-center gap-10 lg:grid-cols-2">
                            <div>
                                <div className="relative">
                                    <div className="overflow-hidden rounded-[40px] bg-secondary-bg ring-1 ring-border">
                                        <Image
                                            src={(product as any).images?.[selectedImage]?.src || ""}
                                            alt={(product as any).images?.[selectedImage]?.alt || product.name}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                                {(product as any).images?.length > 1 && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto">
                                        {(product as any).images.map((img: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 overflow-hidden rounded-lg ring-1 ${selectedImage === index ? 'ring-emerald-accent' : 'ring-border'
                                                    }`}
                                            >
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt}
                                                    width={80}
                                                    height={80}
                                                    className="w-20 h-20 object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <Badge>
                                    <SparkleIcon className="h-4 w-4 text-emerald-accent" />
                                    Hand-finished • Ethically sourced
                                </Badge>

                                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-primary-text sm:text-5xl">
                                    {product.name}
                                </h1>
                                <p className="mt-5 max-w-xl text-base leading-7 text-text-subtle">
                                    {product.subtitle}
                                </p>

                                <div className="mt-8 flex items-center gap-4">
                                    <div>
                                        <p className="text-sm text-text-disabled">Price</p>
                                        <p className="text-3xl font-semibold text-primary-text">₹ {product.price}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-disabled">Tone</p>
                                        <p className="text-lg font-semibold text-primary-text">{product.tone}</p>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Button type="button" onClick={handleAddToCart} disabled={loading}>
                                        Add to bag
                                    </Button>
                                    <Button variant="ghost" type="button">
                                        View details
                                    </Button>
                                </div>

                                <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {[
                                        { k: "4.9", v: "Avg rating" },
                                        { k: "24h", v: "Dispatch" },
                                        { k: "30d", v: "Returns" },
                                    ].map((item) => (
                                        <div
                                            key={item.v}
                                            className="rounded-3xl bg-secondary-bg p-4 ring-1 ring-border"
                                        >
                                            <p className="text-lg font-semibold text-primary-text">{item.k}</p>
                                            <p className="mt-1 text-xs text-text-disabled">{item.v}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Container>
                </main>
            </div>
        </>
    );
}