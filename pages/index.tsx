import Head from "next/head";
import Image from "next/image";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Divider } from "@/components/Divider";
import { FeatureItem } from "@/components/FeatureItem";
import { ArrowRightIcon, SparkleIcon, StarIcon } from "@/components/Icons";
import { GemIcon, LeafIcon, ShieldIcon, TruckIcon } from "@/components/MiniIcon";
import { ProductCard, type Product } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { useState } from "react";
import { signInWithGoogle } from "@/services/login.service";

const featured: Product[] = [
  {
    name: "Amethyst Aura Ring",
    subtitle: "Faceted violet glow set in a clean, modern silhouette.",
    price: "$68",
    tag: "Bestseller",
    imageSrc: "https://mesmerizeindia.com/cdn/shop/files/GleamingHemimorphiteNaturalStoneBraceletWithMagSnap2.jpg?v=1761631765&width=1200",
    imageAlt: "Two rings with purple gemstones",
    tone: "amethyst",
  },
  {
    name: "Rose Quartz Pendant",
    subtitle: "Soft blush crystal made for everyday calm and elegance.",
    price: "$54",
    tag: "Giftable",
    imageSrc: "https://mesmerizeindia.com/cdn/shop/files/RamMicroCarvedInlayGoldTagNecklace1.jpg?v=1763531407&width=1200",
    imageAlt: "A single crystal on a white surface",
    tone: "rose",
  },
  {
    name: "Aqua Prism Studs",
    subtitle: "Bright, minimal studs that catch light from every angle.",
    price: "$42",
    tag: "New",
    imageSrc: "https://mesmerizeindia.com/cdn/shop/files/Spiritual_Rudraksh_Natural_Stone_Pyrite_Om_Bracelet_With_Magsnap2.jpg?v=1760432975&width=1200",
    imageAlt: "Amethyst earrings on a light surface",
    tone: "aqua",
  },
  {
    name: "Yada Yada Hi Dharmasya Mahabharat MicroCarved Round Kada",
    subtitle: "Warm golden tones on a refined chain you can layer.",
    price: "$76",
    imageSrc: "https://mesmerizeindia.com/cdn/shop/files/YadaYadaHiDharmasyaMahabharatMicroCarvedRoundKadaGold.jpg?v=1763374585&width=1200",
    imageAlt: "A close-up of earrings on a book",
    tone: "amber",
  },
];

const categories = [
  { name: "Rings", desc: "Bold facets, perfect fit" },
  { name: "Necklaces", desc: "Soft glow, close to heart" },
  { name: "Earrings", desc: "Light-catching essentials" },
  { name: "Bracelets", desc: "Layer-friendly sparkle" },
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

function NavLink({ children }: { children: string }) {
  return (
    <a
      href="#"
      className="text-sm text-white/70 transition hover:text-white"
    >
      {children}
    </a>
  );
}

export default function Home() {

  const [signedIn, setSignedIn] = useState(false);

  const _signInWithGoogle = async () => {
    signInWithGoogle();
    setSignedIn(true);
  }

  return (
    <>
      <Head>
        <title>Crystal Atelier — Crystal Jewellery</title>
        <meta
          name="description"
          content="A sleek crystal jewellery shop UI built with React and Tailwind."
        />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
          <div className="mx-auto h-[520px] max-w-6xl bg-gradient-to-b from-emerald-500/10 via-fuchsia-500/10 to-transparent blur-2xl" />
        </div>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
          <Container>
            <div className="flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  <GemIcon className="h-5 w-5 text-emerald-200" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-tight">Crystal Atelier</p>
                  <p className="text-xs text-white/55">Modern crystal jewellery</p>
                </div>
              </div>

              <nav className="hidden items-center gap-7 md:flex">
                <NavLink>New</NavLink>
                <NavLink>Best sellers</NavLink>
                <NavLink>Gifts</NavLink>
                <NavLink>About</NavLink>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="hidden rounded-full bg-white/5 px-4 py-2 text-sm text-white/80 ring-1 ring-white/10 transition hover:bg-white/10 sm:inline-flex"
                >
                  Search
                </button>
                {signedIn ? <Button variant="secondary" type="button">
                  Bag (2)
                </Button> : <Button variant="secondary" type="button" onClick={_signInWithGoogle}>
                  Sign In
                </Button>}
              </div>
            </div>
          </Container>
        </header>

        <main>
          <section className="pt-12 sm:pt-16">
            <Container>
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <Badge>
                    <SparkleIcon className="h-4 w-4 text-emerald-200" />
                    Hand-finished • Ethically sourced
                  </Badge>

                  <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Crystal jewellery
                    <span className="block text-white/70">crafted to glow — day and night.</span>
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/65">
                    A calm, luxurious collection of crystal rings, pendants and earrings.
                    Minimal silhouettes. Maximum light.
                  </p>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="button" className="w-full sm:w-auto">
                      Shop featured
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      type="button"
                      className="w-full sm:w-auto"
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
                        className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"
                      >
                        <p className="text-lg font-semibold text-white">{item.k}</p>
                        <p className="mt-1 text-xs text-white/60">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -inset-6 -z-10 rounded-[48px] bg-gradient-to-br from-emerald-400/15 via-fuchsia-400/10 to-sky-400/15 blur-xl" />
                  <div className="overflow-hidden rounded-[40px] bg-white/5 ring-1 ring-white/10">
                    <div className="relative p-6 sm:p-8">
                      <div className="flex items-center justify-between">
                        <Badge className="text-emerald-200">Limited winter drop</Badge>
                        <div className="flex items-center gap-1 text-emerald-200">
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                          <StarIcon className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4">
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-400/25 via-fuchsia-400/15 to-emerald-400/15 p-6 ring-1 ring-white/10">
                          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                          <div className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
                          <p className="text-sm font-semibold">Aura Set</p>
                          <p className="mt-1 text-sm text-white/70">
                            3-piece bundle • ring + pendant + studs
                          </p>
                          <div className="mt-4 flex items-end justify-between">
                            <div>
                              <p className="text-xs text-white/60">Bundle</p>
                              <p className="text-2xl font-semibold">$132</p>
                            </div>
                            <button
                              type="button"
                              className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/10 transition hover:bg-white/15"
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
                              className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10"
                            >
                              <p className="text-xs text-white/60">{m.label}</p>
                              <p className="mt-1 text-sm font-semibold text-white">
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

          <section className="mt-14 sm:mt-20">
            <Container>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <SectionTitle
                  eyebrow="Featured"
                  title="Signature pieces, designed to shimmer"
                  subtitle="Curated crystals with modern settings — sleek enough for everyday, special enough for nights out."
                />
                <Button variant="ghost" type="button" className="self-start sm:self-auto">
                  View all
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((p) => (
                  <ProductCard key={p.name} product={p} />
                ))}
              </div>
            </Container>
          </section>

          <section className="mt-14 sm:mt-20">
            <Container>
              <div className="rounded-[40px] bg-white/5 p-6 ring-1 ring-white/10 sm:p-10">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <SectionTitle
                    eyebrow="Shop"
                    title="Browse by category"
                    subtitle="From statement rings to quiet, luminous studs — build your stack with intention."
                  />

                  <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-xl">
                    {categories.map((c, idx) => (
                      <a
                        key={c.name}
                        href="#"
                        className={cn(
                          "group rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/7",
                          idx === 0 && "sm:col-span-2"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-white">{c.name}</p>
                            <p className="mt-2 text-sm text-white/65">{c.desc}</p>
                          </div>
                          <ArrowRightIcon className="h-5 w-5 text-white/50 transition group-hover:text-white" />
                        </div>
                      </a>
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
              <div className="rounded-[40px] bg-white/5 p-6 ring-1 ring-white/10 sm:p-10">
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
                  <SectionTitle
                    eyebrow="Loved"
                    title="Real reviews, real sparkle"
                    subtitle="A few notes from customers who wear their crystals on repeat."
                  />
                  <div className="flex items-center gap-2 text-emerald-200">
                    <div className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                      <StarIcon className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-white/70">4.9 average</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                  {testimonials.map((t) => (
                    <figure
                      key={t.name}
                      className="rounded-3xl bg-slate-950/35 p-6 ring-1 ring-white/10"
                    >
                      <blockquote className="text-sm leading-6 text-white/75">
                        “{t.quote}”
                      </blockquote>
                      <figcaption className="mt-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{t.name}</p>
                          <p className="text-xs text-white/55">{t.meta}</p>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-200">
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
              <div className="rounded-[40px] bg-white/5 p-6 ring-1 ring-white/10 sm:p-10">
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
                    onSubmit={(e) => e.preventDefault()}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="sr-only" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-full bg-white/5 px-4 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none transition focus:ring-emerald-500/40"
                      />
                      <Button type="submit" className="h-11">
                        Subscribe
                      </Button>
                    </div>
                    <p className="mt-3 text-xs text-white/50">
                      No spam. Unsubscribe anytime.
                    </p>
                  </form>
                </div>
              </div>
            </Container>
          </section>
        </main>

        <footer className="border-t border-white/10">
          <Container>
            <div className="py-10">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                      <GemIcon className="h-5 w-5 text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Crystal Atelier</p>
                      <p className="text-xs text-white/55">Modern crystal jewellery</p>
                    </div>
                  </div>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
                    Sleek silhouettes, luminous crystals, and calm luxury.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Shop
                    </p>
                    <div className="space-y-2">
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Rings
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Necklaces
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Earrings
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Company
                    </p>
                    <div className="space-y-2">
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        About
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Sustainability
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Careers
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                      Support
                    </p>
                    <div className="space-y-2">
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Shipping
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Returns
                      </a>
                      <a className="block text-sm text-white/70 hover:text-white" href="#">
                        Contact
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <Divider />
                <div className="mt-6 flex flex-col gap-3 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
                  <p>© {new Date().getFullYear()} Crystal Atelier. All rights reserved.</p>
                  <p className="text-white/45">Crafted with Tailwind + React</p>
                </div>
              </div>
            </div>
          </Container>
        </footer>
      </div>
    </>
  );
}
