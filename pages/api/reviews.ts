import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorize from "@/config/auth.config";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    switch (req.method) {
        case "GET":
            return GET(req, res);
        case "POST":
            const token = req.headers.authorization?.split(" ")[1] ?? "";
            const userID = await authorize(token);
            if (!userID) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            return POST(req, res, Number(userID));
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
    const { productId } = req.query;

    if (!productId || typeof productId !== "string") {
        return res.status(400).json({ error: "Product ID is required" });
    }

    try {
        const reviews = await prisma.review.findMany({
            where: { productId: parseInt(productId) },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate average rating
        const totalReviews = reviews.length;
        const averageRating =
            totalReviews > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                  totalReviews
                : 0;

        return res.status(200).json({
            reviews,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return res.status(500).json({ error: "Failed to fetch reviews" });
    }
}

async function POST(req: NextApiRequest, res: NextApiResponse, userID: number) {
    const { productId, rating, comment } = req.body;

    if (!productId || typeof rating !== "number" || rating < 1 || rating > 5) {
        return res
            .status(400)
            .json({ error: "Valid product ID and rating (1-5) are required" });
    }

    try {
        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) },
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Check if user has purchased this product
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId: parseInt(productId),
                order: {
                    userId: userID,
                    status: {
                        in: ["DELIVERED"], // Allow reviews for completed orders
                    },
                },
            },
        });

        if (!hasPurchased) {
            return res.status(403).json({
                error: "You can only review products you have purchased",
            });
        }

        // Check if user has already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId: userID,
                    productId: parseInt(productId),
                },
            },
        });

        if (existingReview) {
            return res
                .status(400)
                .json({ error: "You have already reviewed this product" });
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                userId: userID,
                productId: parseInt(productId),
                rating,
                comment: comment?.trim() || null,
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        return res.status(201).json(review);
    } catch (error) {
        console.error("Error creating review:", error);
        return res.status(500).json({ error: "Failed to create review" });
    }
}
