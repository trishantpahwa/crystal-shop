import { Container } from "./Container";
import { Divider } from "./Divider";
import { GemIcon } from "./MiniIcon";

export default function Footer() {
    return (
        <footer className="border-t border-border">
            <Container>
                <div className="py-10">
                    <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-bg ring-1 ring-border">
                                    <GemIcon className="h-5 w-5 text-emerald-accent" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Crystal Atelier</p>
                                    <p className="text-xs text-text-dim">Modern crystal jewellery</p>
                                </div>
                            </div>
                            <p className="mt-4 max-w-sm text-sm leading-6 text-text-subtle">
                                Sleek silhouettes, luminous crystals, and calm luxury.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-disabled">
                                    Shop
                                </p>
                                <div className="space-y-2">
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Rings
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Necklaces
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Earrings
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-disabled">
                                    Company
                                </p>
                                <div className="space-y-2">
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        About
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Sustainability
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Careers
                                    </a>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-disabled">
                                    Support
                                </p>
                                <div className="space-y-2">
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Shipping
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Returns
                                    </a>
                                    <a className="block text-sm text-text-muted hover:text-primary-text" href="#">
                                        Contact
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10">
                        <Divider />
                        <div className="mt-6 flex flex-col gap-3 text-xs text-text-faint sm:flex-row sm:items-center sm:justify-between">
                            <p>© {new Date().getFullYear()} Crystal Atelier. All rights reserved.</p>
                            <p className="text-text-very-faint">Crafted with Tailwind + React</p>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    )
};