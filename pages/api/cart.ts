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
        case "PUT":
            return PUT(request, response, Number(userID));
        case "DELETE":
            return DELETE(request, response, Number(userID));
        default:
            response.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
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
    try {
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

        if (!cart) {
            return response.status(200).json({ items: [], total: 0 });
        }

        const total = cart.items.reduce((sum, item) => {
            const price = parseFloat(item.product.price.replace(/[₹,]/g, ""));
            return sum + price * item.quantity;
        }, 0);

        return response.status(200).json({
            items: cart.items,
            total: total.toFixed(2),
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function POST(
    request: NextApiRequest,
    response: NextApiResponse,
    userID: number
) {
    const { productId, quantity = 1 } = request.body;

    if (!productId || typeof productId !== "number") {
        return response.status(400).json({ error: "Product ID is required" });
    }

    if (quantity < 1) {
        return response
            .status(400)
            .json({ error: "Quantity must be at least 1" });
    }

    try {
        // Ensure user has a cart
        let cart = await prisma.cart.findUnique({
            where: { userId: userID },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: userID },
            });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return response.status(404).json({ error: "Product not found" });
        }

        // Add or update cart item
        const cartItem = await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: productId,
                },
            },
            update: {
                quantity: {
                    increment: quantity,
                },
            },
            create: {
                cartId: cart.id,
                productId: productId,
                quantity: quantity,
            },
            include: {
                product: true,
            },
        });

        return response.status(201).json(cartItem);
    } catch (error) {
        console.error("Error adding to cart:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function PUT(
    request: NextApiRequest,
    response: NextApiResponse,
    userID: number
) {
    const { productId, quantity } = request.body;

    if (!productId || typeof productId !== "number") {
        return response.status(400).json({ error: "Product ID is required" });
    }

    if (quantity < 1) {
        return response
            .status(400)
            .json({ error: "Quantity must be at least 1" });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: userID },
        });

        if (!cart) {
            return response.status(404).json({ error: "Cart not found" });
        }

        const cartItem = await prisma.cartItem.updateMany({
            where: {
                cartId: cart.id,
                productId: productId,
            },
            data: { quantity },
        });

        if (cartItem.count === 0) {
            return response
                .status(404)
                .json({ error: "Item not found in cart" });
        }

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error("Error updating cart item:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function DELETE(
    request: NextApiRequest,
    response: NextApiResponse,
    userID: number
) {
    const { productId } = request.body;

    if (!productId || typeof productId !== "number") {
        return response.status(400).json({ error: "Product ID is required" });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: userID },
        });

        if (!cart) {
            return response.status(404).json({ error: "Cart not found" });
        }

        const result = await prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                productId: productId,
            },
        });

        if (result.count === 0) {
            return response
                .status(404)
                .json({ error: "Item not found in cart" });
        }

        return response.status(200).json({ success: true });
    } catch (error) {
        console.error("Error removing from cart:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
