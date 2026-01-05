import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorizeAdmin from "@/config/admin-auth.config";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    const token = request.headers["x-api-key"] as string;
    if (!authorizeAdmin(token)) {
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
        const where: { status?: string } = {};
        if (status && status !== "all") {
            where.status = status as string;
        }

        const orders = await prisma.order.findMany({
            where,
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
                    imageSrc: item.product.images?.[0]?.src || "",
                    imageAlt:
                        item.product.images?.[0]?.alt || item.product.name,
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
