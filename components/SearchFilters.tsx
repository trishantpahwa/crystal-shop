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
    const [filters, setFilters] = useState(initialFilters);
    const [searchQuery, setSearchQuery] = useState(initialFilters.q || "");
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        <div className="mb-8">
            {/* Search Bar */}
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-lg bg-secondary-bg px-4 py-3 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-3"
                >
                    Filters {isOpen ? "▲" : "▼"}
                </Button>
            </div>

            {/* Advanced Filters */}
            {isOpen && (
                <div className="rounded-lg bg-secondary-bg p-6 ring-1 ring-border">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Category
                            </label>
                            <select
                                value={filters.category || ""}
                                onChange={(e) => updateFilters({ category: e.target.value })}
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Min Price
                            </label>
                            <input
                                type="number"
                                placeholder="0"
                                value={filters.minPrice || ""}
                                onChange={(e) => updateFilters({ minPrice: e.target.value })}
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
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
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            />
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Min Rating
                            </label>
                            <select
                                value={filters.minRating || ""}
                                onChange={(e) => updateFilters({ minRating: e.target.value })}
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4+ Stars</option>
                                <option value="3">3+ Stars</option>
                                <option value="2">2+ Stars</option>
                                <option value="1">1+ Stars</option>
                            </select>
                        </div>

                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy || "createdAt"}
                                onChange={(e) => updateFilters({ sortBy: e.target.value })}
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Order */}
                        <div>
                            <label className="block text-sm font-medium text-primary-text mb-2">
                                Order
                            </label>
                            <select
                                value={filters.order || "desc"}
                                onChange={(e) => updateFilters({ order: e.target.value })}
                                className="w-full rounded-lg bg-primary-bg px-3 py-2 text-sm ring-1 ring-border focus:ring-2 focus:ring-accent-border"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
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
            )}
        </div>
    );
}