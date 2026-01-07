import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorize from "@/config/auth.config";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    const token = request.headers.authorization?.split(" ")[1] ?? "";
    const userID = await authorize(token);
    if (!userID) {
        return response.status(401).json({ error: "Unauthorized" });
    }

    switch (request.method) {
        case "GET":
            return GET(request, response, Number(userID));
        case "POST":
            return POST(request, response, Number(userID));
        default:
            response.setHeader("Allow", ["GET", "POST"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(
    request: NextApiRequest,
    response: NextApiResponse,
    userID: number
) {
    const { productId } = request.query;

    // If productId is provided, check if user has purchased that product
    if (productId) {
        try {
            const hasPurchased = await prisma.orderItem.findFirst({
                where: {
                    productId: parseInt(productId as string),
                    order: {
                        userId: userID,
                        status: {
                            in: ["DELIVERED"],
                        },
                    },
                },
            });

            return response.status(200).json({
                hasPurchased: !!hasPurchased,
            });
        } catch (error) {
            console.error("Error checking purchase status:", error);
            return response
                .status(500)
                .json({ error: "Failed to check purchase status" });
        }
    }

    // Otherwise, return user's orders as before
    try {
        const page = Math.max(1, Number(request.query.page) || 1);
        const limit = Math.min(
            50,
            Math.max(1, Number(request.query.limit) || 10)
        );
        const skip = (page - 1) * limit;

        const orders = await prisma.order.findMany({
            where: { userId: userID },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        return response.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function POST(
    request: NextApiRequest,
    response: NextApiResponse,
    userID: number
) {
    const { shippingAddress } = request.body;

    if (!shippingAddress || typeof shippingAddress !== "string") {
        return response
            .status(400)
            .json({ error: "Shipping address is required" });
    }

    try {
        // Get user's cart with items
        const cart = await prisma.cart.findUnique({
            where: { userId: userID },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return response.status(400).json({ error: "Cart is empty" });
        }

        // Calculate total
        const total = cart.items.reduce((sum, item) => {
            const price = parseFloat(item.product.price.replace(/[₹,]/g, ""));
            return sum + price * item.quantity;
        }, 0);

        // Create order in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Create the order
            const newOrder = await tx.order.create({
                data: {
                    userId: userID,
                    total: total.toFixed(2),
                    shippingAddress,
                },
            });

            // Create order items
            await tx.orderItem.createMany({
                data: cart.items.map((item) => ({
                    orderId: newOrder.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
            });

            // Clear the cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            // Return the order with items
            return tx.order.findUnique({
                where: { id: newOrder.id },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                },
            });
        });

        return response.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
