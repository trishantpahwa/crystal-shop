import Link from "next/link";
import { Container } from "./Container";
import { Button } from "./Button";
import { GemIcon } from "./MiniIcon";
import { signInWithGoogle } from "@/services/login.service";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { useRouter } from "next/router";
import { useState } from "react";


function NavLink({ link, children }: { link: string; children: string }) {
    return (
        <Link
            href={link}
            className="text-sm text-text-muted transition hover:text-primary-text"
        >
            {children}
        </Link>
    );
}

export default function Header() {

    const { isAuthenticated, refresh, logout } = useAuth();
    const { items } = useCart();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");

    const _signInWithGoogle = async () => {
        const signedIn = await signInWithGoogle();
        if (signedIn) toast.success("Signed in successfully!");
        else toast.error("Sign in failed. Please try again.");
        refresh();
    };

    const _logout = async () => {
        const loggedOut = await logout();
        if (loggedOut) {
            toast.success("Logged out successfully!");
        } else {
            toast.error("Log out failed. Please try again.");
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            router.push("/products");
        }
    };

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-primary-bg/70 backdrop-blur">
            <Container>
                <div className="flex h-20 items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-bg ring-1 ring-border">
                            <GemIcon className="h-5 w-5 text-emerald-accent" />
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-semibold tracking-tight">Crystal Atelier</p>
                            <p className="text-xs text-text-dim">Modern crystal jewellery</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-7 md:flex">
                        <NavLink link="/new">New</NavLink>
                        <NavLink link="/best-sellers">Best sellers</NavLink>
                        <NavLink link="/orders">Orders</NavLink>
                        <NavLink link="/about">About</NavLink>
                    </nav>

                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearch} className="hidden sm:flex">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="rounded-l-full bg-secondary-bg px-4 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            />
                            <button
                                type="submit"
                                className="rounded-r-full bg-secondary-bg px-4 py-2 text-sm ring-1 ring-border hover:bg-accent-bg transition"
                            >
                                Search
                            </button>
                        </form>
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" type="button" href="/cart">
                                    Bag ({items.length})
                                </Button>
                                <Button variant="outline" type="button" onClick={_logout}>
                                    Log Out
                                </Button>
                            </div>
                        ) : (
                            <Button variant="secondary" type="button" onClick={_signInWithGoogle}>
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </Container>
        </header>
    );
};