import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import { verifyAdminToken } from "@/config/admin-auth.config";
import { OrderStatus } from "@/generated/prisma/client";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return response.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.substring(7);
    if (!verifyAdminToken(token)) {
        return response.status(401).json({ error: "Unauthorized" });
    }

    switch (request.method) {
        case "GET":
            return GET(request, response);
        case "PUT":
            return PUT(request, response);
        default:
            response.setHeader("Allow", ["GET", "PUT"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    const { status, skip = "0", take = "50" } = request.query;

    try {
        const where: { status?: OrderStatus } = {};
        if (status && status !== "all") {
            where.status = status as OrderStatus;
        }

        const orders = await prisma.order.findMany({
            where,
            select: {
                id: true,
                userId: true,
                total: true,
                discountCode: true,
                discountAmount: true,
                status: true,
                shippingAddress: true,
                createdAt: true,
                updatedAt: true,
                items: {
                    select: {
                        id: true,
                        productId: true,
                        quantity: true,
                        price: true,
                        createdAt: true,
                        updatedAt: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                subtitle: true,
                                images: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: parseInt(skip as string),
            take: parseInt(take as string),
        });

        const transformedOrders = orders.map((order) => ({
            ...order,
            items: order.items.map((item) => ({
                ...item,
                product: {
                    ...item.product,
                    imageSrc:
                        (
                            item.product.images as {
                                src: string;
                                alt: string;
                            }[]
                        )?.[0]?.src || "",
                    imageAlt:
                        (
                            item.product.images as {
                                src: string;
                                alt: string;
                            }[]
                        )?.[0]?.alt || item.product.name,
                },
            })),
        }));

        const total = await prisma.order.count({ where });

        return response.status(200).json({
            orders: transformedOrders,
            total,
            pagination: {
                skip: parseInt(skip as string),
                take: parseInt(take as string),
            },
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function PUT(request: NextApiRequest, response: NextApiResponse) {
    const { orderId, status } = request.body;

    if (!orderId || typeof orderId !== "number") {
        return response.status(400).json({ error: "Order ID is required" });
    }

    if (
        !status ||
        !["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
            status
        )
    ) {
        return response.status(400).json({ error: "Valid status is required" });
    }

    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
            },
        });

        return response.status(200).json(order);
    } catch (error) {
        console.error("Error updating order:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
