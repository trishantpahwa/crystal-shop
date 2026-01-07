import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";

interface SearchFiltersProps {
    onFiltersChange: (filters: {
        q?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
        sortBy?: string;
        order?: string;
    }) => void;
    initialFilters?: {
        q?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        minRating?: string;
        sortBy?: string;
        order?: string;
    };
}

const categories = [
    { value: "", label: "All Categories" },
    { value: "rings", label: "Rings" },
    { value: "necklaces", label: "Necklaces" },
    { value: "earrings", label: "Earrings" },
    { value: "bracelets", label: "Bracelets" },
];

const sortOptions = [
    { value: "createdAt", label: "Newest" },
    { value: "price", label: "Price" },
    { value: "name", label: "Name" },
    { value: "tone", label: "Brand" },
];

export default function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [filters, setFilters] = useState(initialFilters);
    const [searchQuery, setSearchQuery] = useState(initialFilters.q || "");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFiltersChange(updated);
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for 3 seconds
        searchTimeoutRef.current = setTimeout(() => {
            updateFilters({ q: value });
        }, 500);
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const closeMobileSidebar = () => {
        setIsOpen(false);
    };

    const clearFilters = () => {
        const cleared = {};
        setFilters(cleared);
        setSearchQuery("");
        onFiltersChange(cleared);

        // Clear any pending search timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sticky Sidebar */}
            <div
                className={`
                    ${isMobile
                        ? 'fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden'
                        : 'sticky top-28 h-fit w-80 flex-shrink-0'
                    }
                    ${isMobile && !isOpen ? 'translate-x-full' : 'translate-x-0'}
                `}
            >
                <div className="bg-primary-bg border border-border rounded-lg p-6 h-full overflow-y-auto">
                    {/* Mobile Close Button */}
                    {isMobile && (
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-primary-text">Filters</h3>
                            <button
                                onClick={closeMobileSidebar}
                                className="p-2 hover:bg-secondary-bg rounded-lg transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-primary-text mb-2">
                            Search Products
                        </label>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full rounded-lg bg-secondary-bg px-4 py-3 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                        />
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Category
                            </label>
                            <select
                                value={filters.category || ""}
                                onChange={(e) => updateFilters({ category: e.target.value })}
                                className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-primary-text mb-2">
                                    Min Price
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.minPrice || ""}
                                    onChange={(e) => updateFilters({ minPrice: e.target.value })}
                                    className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 -moz-appearance:textfield"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary-text mb-2">
                                    Max Price
                                </label>
                                <input
                                    type="number"
                                    placeholder="1000"
                                    value={filters.maxPrice || ""}
                                    onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                                    className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0 -moz-appearance:textfield"
                                />
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Min Rating
                            </label>
                            <select
                                value={filters.minRating || ""}
                                onChange={(e) => updateFilters({ minRating: e.target.value })}
                                className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                                <option value="1">1+ Stars</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-primary-text mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy || "createdAt"}
                                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                                    className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                                >
                                    {sortOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-primary-text mb-2">
                                    Order
                                </label>
                                <select
                                    value={filters.order || "desc"}
                                    onChange={(e) => updateFilters({ order: e.target.value })}
                                    className="w-full rounded-lg bg-secondary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                                >
                                    <option value="desc">Descending</option>
                                    <option value="asc">Ascending</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="pt-4">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="w-full"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Button */}
            {isMobile && !isOpen && (
                <div className="fixed bottom-4 right-4 z-30 md:hidden">
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-3 shadow-lg"
                    >
                        Filters
                    </Button>
                </div>
            )}
        </>
    );
}