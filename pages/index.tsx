import Head from "next/head";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FeatureItem } from "@/components/FeatureItem";
import { ArrowRightIcon, SparkleIcon, StarIcon } from "@/components/Icons";
import { GemIcon, LeafIcon, ShieldIcon, TruckIcon } from "@/components/MiniIcon";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import type { Product } from "@/generated/prisma/client";
import prisma from "@/config/prisma.config";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const categories = [
  { name: "Rings", desc: "Bold facets, perfect fit", slug: "rings" },
  { name: "Necklaces", desc: "Soft glow, close to heart", slug: "necklaces" },
  { name: "Earrings", desc: "Light-catching essentials", slug: "earrings" },
  { name: "Bracelets", desc: "Layer-friendly sparkle", slug: "bracelets" },
];

const testimonials = [
  {
    quote:
      "The finish is stunning in real life — it looks like a tiny galaxy on my hand.",
    name: "Aanya",
    meta: "Amethyst Aura Ring",
  },
  {
    quote:
      "Packaging was immaculate and the pendant feels so premium. Perfect gift.",
    name: "Rohan",
    meta: "Rose Quartz Pendant",
  },
  {
    quote:
      "Fast shipping, beautiful shine, and the piece layers flawlessly with my basics.",
    name: "Meera",
    meta: "Amber Sun Chain",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export async function getStaticProps() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      reviews: {
        select: {
          rating: true
        }
      }
    }
  });

  // Calculate average ratings for each product
  const productsWithRatings = products.map(product => {
    const totalReviews = product.reviews.length;
    const averageRating = totalReviews > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    return {
      ...product,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    };
  });

  return {
    props: {
      products: productsWithRatings.map(p => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    },
    revalidate: 60, // Revalidate every minute
  };
}

function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Home({ products }: { products: Product[] }) {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // For now, just show success
    toast.success("Subscribed successfully!");
    setEmail("");
  };

  return (
    <>
      <Head>
        <title>Crystal Atelier — Crystal Jewellery</title>
        <meta
          name="description"
          content="A sleek crystal jewellery shop UI built with React and Tailwind."
        />
      </Head>

      <div className="min-h-screen bg-primary-bg text-primary-text">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
          <div className="mx-auto h-[520px] max-w-6xl bg-gradient-to-b from-[var(--color-gradient-start)] via-[var(--color-gradient-middle)] to-[var(--color-gradient-end)] blur-2xl" />
        </div>

        <Header />

        <main>
          <section className="pt-12 sm:pt-16">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <Badge>
                    <SparkleIcon className="h-4 w-4 text-emerald-accent" />
                    Hand-finished • Ethically sourced
                  </Badge>

                  <h1 className="mt-6 text-4xl font-semibold tracking-tight text-primary-text sm:text-5xl">
                    Crystal jewellery
                    <span className="block text-text-muted">crafted to glow — day and night.</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-text-subtle">
                    A calm, luxurious collection of crystal rings, pendants and earrings.
                    Minimal silhouettes. Maximum light.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="button" onClick={() => scrollToSection("featured")}>
                      Shop featured
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => scrollToSection("categories")}
                    >
                      Explore categories
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

                <div className="relative">
                  <div className="absolute -inset-6 -z-10 rounded-[48px] bg-gradient-to-br from-[var(--color-gradient-hero-start)] via-[var(--color-gradient-hero-middle)] to-[var(--color-gradient-hero-end)] blur-xl" />
                  <div className="overflow-hidden rounded-[40px] bg-secondary-bg ring-1 ring-border">
                    <div className="relative p-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <Badge className="text-emerald-accent">Limited winter drop</Badge>
                        <div className="flex items-center gap-1 text-emerald-accent">
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-400/25 via-fuchsia-400/15 to-emerald-400/15 p-6 ring-1 ring-border">
                          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent-bg blur-2xl" />
                          <div className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-accent-bg blur-2xl" />
                          <p className="text-sm font-semibold">Aura Set</p>
                          <p className="mt-1 text-sm text-text-muted">
                            3-piece bundle • ring + pendant + studs
                          </p>
                          <div className="mt-4 flex items-end justify-between">
                            <div>
                              <p className="text-xs text-text-disabled">Bundle</p>
                              <p className="text-2xl font-semibold">₹ 132</p>
                            </div>
                            <button
                              type="button"
                              className="rounded-full bg-accent-bg px-4 py-2 text-sm font-medium text-primary-text ring-1 ring-border transition hover:bg-[color-mix(in srgb, var(--color-accent-bg) 115%, transparent)]"
                            >
                              View set
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Crystal",
                              value: "Natural",
                            },
                            {
                              label: "Finish",
                              value: "High-polish",
                            },
                            {
                              label: "Metal",
                              value: "925 silver",
                            },
                            {
                              label: "Packaging",
                              value: "Gift-ready",
                            },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="rounded-3xl bg-secondary-bg p-4 ring-1 ring-border"
                            >
                              <p className="text-xs text-text-disabled">{m.label}</p>
                              <p className="mt-1 text-sm font-semibold text-primary-text">
                                {m.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          <section className="mt-14 sm:mt-20" id="featured">
            <Container>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <SectionTitle
                  eyebrow="Featured"
                  title="Signature pieces, designed to shimmer"
                  subtitle="Curated crystals with modern settings — sleek enough for everyday, special enough for nights out."
                />
                <Button variant="ghost" type="button" href="/products" className="self-start sm:self-auto">
                  View all
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {products.slice(0, 8).map((p: Product) => (
                  <ProductCard key={p.name} product={p} />
                ))}
              </div>
            </Container>
          </section>

          <section className="mt-14 sm:mt-20">
            <Container>
              <div className="rounded-[40px] bg-secondary-bg p-6 ring-1 ring-border sm:p-10" id="categories">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <SectionTitle
                    eyebrow="Shop"
                    title="Browse by category"
                    subtitle="From statement rings to quiet, luminous studs — build your stack with intention."
                  />

                  <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
                    {categories.map((c, idx) => (
                      <Link
                        key={c.name}
                        href={`/products?category=${c.slug}`}
                        className={cn(
                          "group rounded-3xl bg-secondary-bg p-5 ring-1 ring-border transition hover:bg-[color-mix(in srgb, var(--color-secondary-bg) 140%, transparent)]",
                          idx === 0 && "sm:col-span-2"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-primary-text">{c.name}</p>
                            <p className="mt-2 text-sm text-text-subtle">{c.desc}</p>
                          </div>
                          <ArrowRightIcon className="h-5 w-5 text-text-faint transition group-hover:text-primary-text" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>

          <section className="mt-14 sm:mt-20">
            <Container>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                <div className="lg:col-span-5">
                  <SectionTitle
                    eyebrow="Promise"
                    title="Luxury feel, thoughtful details"
                    subtitle="We focus on the little things: clean finishing, secure settings, and a calm unboxing moment."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
                  <FeatureItem
                    title="Authentic crystals"
                    description="Natural stones selected for clarity, tone, and character."
                    icon={<GemIcon className="h-5 w-5" />}
                  />
                  <FeatureItem
                    title="Secure & hypoallergenic"
                    description="Comfort-first metals and sturdy settings for daily wear."
                    icon={<ShieldIcon className="h-5 w-5" />}
                  />
                  <FeatureItem
                    title="Fast dispatch"
                    description="Packed with care and shipped quickly — updates included."
                    icon={<TruckIcon className="h-5 w-5" />}
                  />
                  <FeatureItem
                    title="Low-waste packaging"
                    description="Minimal, beautiful packaging designed to be kept."
                    icon={<LeafIcon className="h-5 w-5" />}
                  />
                </div>
              </div>
            </Container>
          </section>

          <section className="mt-14 sm:mt-20">
            <Container>
              <div className="rounded-[40px] bg-secondary-bg p-6 ring-1 ring-border sm:p-10">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <SectionTitle
                    eyebrow="Loved"
                    title="Real reviews, real sparkle"
                    subtitle="A few notes from customers who wear their crystals on repeat."
                  />
                  <div className="flex items-center gap-2 text-emerald-accent">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-text-muted">4.9 average</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {testimonials.map((t) => (
                    <figure
                      key={t.name}
                      className="rounded-3xl bg-primary-bg/35 p-6 ring-1 ring-border"
                    >
                      <blockquote className="text-sm leading-6 text-[color-mix(in srgb, var(--color-primary-text) 75%, transparent)]">
                        “{t.quote}”
                      </blockquote>
                      <figcaption className="mt-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-primary-text">{t.name}</p>
                          <p className="text-xs text-text-dim">{t.meta}</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-accent">
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </Container>
          </section>

          <section className="mt-14 pb-16 sm:mt-20 sm:pb-24">
            <Container>
              <div className="rounded-[40px] bg-secondary-bg p-6 ring-1 ring-border sm:p-10">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <SectionTitle
                      eyebrow="Newsletter"
                      title="Get first access to new drops"
                      subtitle="Monthly updates — new pieces, styling ideas, and early-bird bundles."
                    />
                  </div>

                  <form
                    className="w-full max-w-xl"
                    onSubmit={handleNewsletterSubmit}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="sr-only" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-full bg-secondary-bg px-4 text-sm text-primary-text placeholder:text-[color-mix(in srgb, var(--color-primary-text) 40%, transparent)] ring-1 ring-border outline-none transition focus:ring-emerald-500/40"
                      />
                      <Button type="submit" className="h-11">
                        Subscribe
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-text-faint">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </div>
              </div>
            </Container>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
