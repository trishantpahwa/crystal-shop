import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { GetStaticPropsContext } from "next";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { ArrowLeftIcon, SparkleIcon } from "@/components/Icons";
import { ShareButtons } from "@/components/ShareButtons";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import type { Product, Review } from "@/generated/prisma/client";
import Link from "next/link";
import prisma from "@/config/prisma.config";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

type ReviewWithUser = Review & { user: { name: string | null } };

function ProductPage({ product, averageRating, totalReviews, reviews }: { product: Product | null; averageRating: number; totalReviews: number; reviews: ReviewWithUser[] }) {

    const { addToCart, loading } = useCart();
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    const [selectedImage, setSelectedImage] = useState(0);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [checkingPurchase, setCheckingPurchase] = useState(false);

    const checkPurchaseStatus = useCallback(async () => {
        if (!product) return;

        setCheckingPurchase(true);
        try {
            const response = await fetch(`/api/orders?productId=${product.id}`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setHasPurchased(data.hasPurchased || false);
            }
        } catch (error) {
            console.error("Error checking purchase status:", error);
        } finally {
            setCheckingPurchase(false);
        }
    }, [product]);

    useEffect(() => {
        if (isAuthenticated && product) {
            checkPurchaseStatus();
        }
    }, [isAuthenticated, product, checkPurchaseStatus]);

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

    const handleSubmitReview = async () => {
        if (!product || !isAuthenticated) return;

        setSubmittingReview(true);
        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    productId: product.id,
                    rating: reviewRating,
                    comment: reviewComment.trim() || undefined,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to submit review");
            }

            toast.success("Review submitted successfully!");
            setShowReviewForm(false);
            setReviewComment("");
            setReviewRating(5);
            // Refresh the page to show the new review
            window.location.reload();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

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
                <meta property="og:title" content={`${product.name} — Crystal Atelier`} />
                <meta property="og:description" content={product.subtitle} />
                <meta property="og:image" content={((product as Product).images as { src: string; alt: string }[])?.[0]?.src} />
                <meta property="og:url" content={`/product/${product.id}`} />
                <meta property="og:type" content="product" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${product.name} — Crystal Atelier`} />
                <meta name="twitter:description" content={product.subtitle} />
                <meta name="twitter:image" content={((product as Product).images as { src: string; alt: string }[])?.[0]?.src} />
            </Head>

            <div className="min-h-screen bg-primary-bg text-primary-text">
                <Header />

                <main className="pt-12 sm:pt-16">
                    <Container className="mb-16">
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
                                            src={((product as Product).images as { src: string; alt: string }[])?.[selectedImage]?.src || ""}
                                            alt={((product as Product).images as { src: string; alt: string }[])?.[selectedImage]?.alt || product.name}
                                            width={500}
                                            height={500}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                </div>
                                {((product as Product).images as { src: string; alt: string }[])?.length > 1 && (
                                    <div className="mt-4 flex gap-2 overflow-x-auto">
                                        {((product as Product).images as { src: string; alt: string }[]).map((img: { src: string; alt: string }, index: number) => (
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

                                <div className="mt-6">
                                    <ShareButtons
                                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}${router.asPath}`}
                                        title={`${product.name} - Crystal Atelier`}
                                        description={product.subtitle}
                                        image={((product as Product).images as { src: string; alt: string }[])?.[0]?.src}
                                    />
                                </div>

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
                                        { k: averageRating > 0 ? `${averageRating.toString()}/5` : "No ratings", v: "Avg rating" },
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

                        {/* Reviews Section */}
                        <div className="mt-16 border-t border-border pt-16">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-primary-text">
                                    Customer Reviews ({totalReviews ?? 0})
                                </h2>
                                {isAuthenticated && hasPurchased && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        Write a Review
                                    </Button>
                                )}
                                {isAuthenticated && !hasPurchased && !checkingPurchase && (
                                    <div className="text-sm text-text-muted">
                                        Purchase this product to leave a review
                                    </div>
                                )}
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <div className="mt-8 rounded-2xl bg-secondary-bg p-6 ring-1 ring-border">
                                    <h3 className="text-lg font-semibold text-primary-text mb-4">Write Your Review</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary-text mb-2">
                                                Rating
                                            </label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewRating(star)}
                                                        className={`text-2xl ${star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                                                            }`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-primary-text mb-2">
                                                Comment (optional)
                                            </label>
                                            <textarea
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-primary-text ring-1 ring-border focus:ring-2 focus:ring-emerald-accent"
                                                rows={4}
                                                placeholder="Share your thoughts about this product..."
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleSubmitReview}
                                                disabled={submittingReview}
                                            >
                                                {submittingReview ? "Submitting..." : "Submit Review"}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowReviewForm(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            <div className="mt-8 space-y-6">
                                {reviews && reviews.length > 0 ? (
                                    reviews.map((review: ReviewWithUser) => (
                                        <div key={review.id} className="rounded-2xl bg-secondary-bg p-6 ring-1 ring-border">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="text-sm font-medium text-primary-text">
                                                        {review.user.name || "Anonymous"}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <span
                                                                key={star}
                                                                className={`text-sm ${star <= review.rating ? "text-yellow-400" : "text-gray-300"
                                                                    }`}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-text-disabled">
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-3 text-primary-text">{review.comment}</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-text-muted">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        </div>
                    </Container>
                    <Footer />
                </main>
            </div>
        </>
    );
}

export async function getStaticPaths() {
    const products = await prisma.product.findMany({
        select: { id: true },
    });

    const paths = products.map((product: { id: number }) => ({
        params: { slug: product.id.toString() },
    }));

    return {
        paths,
        fallback: 'blocking', // or 'true' for ISR
    };
}

export async function getStaticProps(context: GetStaticPropsContext) {
    if (!context.params || typeof context.params.slug !== 'string') {
        return {
            notFound: true,
        };
    }

    const slug = context.params.slug;
    const productId = Number(slug);

    if (!productId) {
        return {
            notFound: true,
        };
    }

    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            reviews: {
                include: {
                    user: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    if (!product) {
        return {
            notFound: true,
        };
    }

    // Calculate average rating
    const totalReviews = product.reviews.length;
    const averageRating = totalReviews > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

    // Exclude reviews from product to avoid serializing Date objects
    const { reviews, ...productWithoutReviews } = product;

    return {
        props: {
            product: {
                ...productWithoutReviews,
                createdAt: product.createdAt.toISOString(),
                updatedAt: product.updatedAt.toISOString(),
            },
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
            reviews: reviews.map(review => ({
                ...review,
                createdAt: review.createdAt.toISOString(),
                updatedAt: review.updatedAt.toISOString(),
            })),
        },
        revalidate: 60, // Revalidate every minute
    }
}

export default ProductPage;