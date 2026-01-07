import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import type { Prisma } from "@/generated/prisma/client";

type SortBy = "createdAt" | "updatedAt" | "name" | "price" | "tone";
const SORT_FIELDS: ReadonlyArray<SortBy> = [
    "createdAt",
    "updatedAt",
    "name",
    "price",
    "tone",
];

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "GET":
            return GET(request, response);
        default:
            response.setHeader("Allow", ["GET"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    const {
        tone,
        category,
        q,
        sortBy = "createdAt",
        order = "desc",
        skip = "0",
        take = "24",
        minPrice,
        maxPrice,
        minRating,
    } = request.query;

    const where: Record<string, unknown> = {};

    if (typeof tone === "string" && tone.trim()) where.tone = tone.trim();

    if (typeof category === "string" && category.trim()) {
        const validCategory = category.trim().toUpperCase();
        const validCategories = ["RINGS", "NECKLACES", "EARRINGS", "BRACELETS"];
        if (validCategories.includes(validCategory)) {
            where.category = validCategory;
        }
    }

    if (typeof q === "string" && q.trim()) {
        where.OR = [
            { name: { contains: q.trim(), mode: "insensitive" } },
            { subtitle: { contains: q.trim(), mode: "insensitive" } },
        ];
    }

    // Note: Price and rating filtering is done after fetching since price is stored as string

    const sortField: SortBy =
        typeof sortBy === "string" &&
        (SORT_FIELDS as readonly string[]).includes(sortBy)
            ? (sortBy as SortBy)
            : "createdAt";

    const sortOrder: Prisma.SortOrder = order === "asc" ? "asc" : "desc";

    const products = await prisma.product.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: Math.max(0, Number.parseInt(String(skip), 10) || 0),
        take: Math.min(
            100,
            Math.max(1, Number.parseInt(String(take), 10) || 24)
        ),
        include: {
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
    });

    // Calculate average ratings for each product
    const productsWithRatings = products.map((product) => {
        const totalReviews = product.reviews.length;
        const averageRating =
            totalReviews > 0
                ? product.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                  ) / totalReviews
                : 0;

        return {
            ...product,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
        };
    });

    // Filter by minRating after calculating ratings
    let filteredProducts = productsWithRatings;
    if (typeof minRating === "string" && minRating.trim()) {
        const min = parseFloat(minRating.trim());
        if (!isNaN(min)) {
            filteredProducts = filteredProducts.filter(
                (p) => p.averageRating >= min
            );
        }
    }

    // Filter by price range after fetching
    if (typeof minPrice === "string" && minPrice.trim()) {
        const min = parseFloat(minPrice.trim());
        if (!isNaN(min)) {
            filteredProducts = filteredProducts.filter((p) => {
                const price = parseFloat(p.price.replace("$", ""));
                return price >= min;
            });
        }
    }
    if (typeof maxPrice === "string" && maxPrice.trim()) {
        const max = parseFloat(maxPrice.trim());
        if (!isNaN(max)) {
            filteredProducts = filteredProducts.filter((p) => {
                const price = parseFloat(p.price.replace("$", ""));
                return price <= max;
            });
        }
    }

    return response.status(200).json({ products: filteredProducts });
}
