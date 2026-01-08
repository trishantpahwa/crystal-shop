import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import { verifyAdminToken } from "@/config/admin-auth.config";
import { DiscountType } from "@/generated/prisma/client";

type DiscountCodeInput = {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    isActive?: boolean;
    expiresAt?: string;
    usageLimit?: number;
};

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
        case "POST":
            return POST(request, response);
        case "PUT":
            return PUT(request, response);
        case "DELETE":
            return DELETE(request, response);
        default:
            response.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    try {
        const { skip = "0", take = "50", active } = request.query;

        const where: Record<string, unknown> = {};
        if (active === "true") {
            where.isActive = true;
            where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
        }

        const discountCodes = await prisma.discountCode.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: Number(skip),
            take: Number(take),
        });

        const total = await prisma.discountCode.count({ where });

        return response.status(200).json({ discountCodes, total });
    } catch (error) {
        console.error("Error fetching discount codes:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function POST(request: NextApiRequest, response: NextApiResponse) {
    try {
        const body: DiscountCodeInput = request.body;

        if (
            !body.code ||
            !body.discountType ||
            typeof body.discountValue !== "number"
        ) {
            return response
                .status(400)
                .json({ error: "Missing required fields" });
        }

        const discountCode = await prisma.discountCode.create({
            data: {
                code: body.code.toUpperCase(),
                description: body.description,
                discountType: body.discountType,
                discountValue: body.discountValue,
                isActive: body.isActive ?? true,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                usageLimit: body.usageLimit,
            },
        });

        return response.status(201).json(discountCode);
    } catch (error: any) {
        if (error.code === "P2002") {
            return response
                .status(409)
                .json({ error: "Discount code already exists" });
        }
        console.error("Error creating discount code:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function PUT(request: NextApiRequest, response: NextApiResponse) {
    try {
        const { id, ...updates }: { id: number } & Partial<DiscountCodeInput> =
            request.body;

        if (!id) {
            return response.status(400).json({ error: "ID is required" });
        }

        const discountCode = await prisma.discountCode.update({
            where: { id },
            data: {
                ...(updates.code && { code: updates.code.toUpperCase() }),
                ...(updates.description !== undefined && {
                    description: updates.description,
                }),
                ...(updates.discountType && {
                    discountType: updates.discountType,
                }),
                ...(typeof updates.discountValue === "number" && {
                    discountValue: updates.discountValue,
                }),
                ...(typeof updates.isActive === "boolean" && {
                    isActive: updates.isActive,
                }),
                ...(updates.expiresAt !== undefined && {
                    expiresAt: updates.expiresAt
                        ? new Date(updates.expiresAt)
                        : null,
                }),
                ...(typeof updates.usageLimit === "number" && {
                    usageLimit: updates.usageLimit,
                }),
            },
        });

        return response.status(200).json(discountCode);
    } catch (error: any) {
        if (error.code === "P2025") {
            return response
                .status(404)
                .json({ error: "Discount code not found" });
        }
        if (error.code === "P2002") {
            return response
                .status(409)
                .json({ error: "Discount code already exists" });
        }
        console.error("Error updating discount code:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}

async function DELETE(request: NextApiRequest, response: NextApiResponse) {
    try {
        const { id } = request.query;

        if (!id || typeof id !== "string") {
            return response.status(400).json({ error: "ID is required" });
        }

        await prisma.discountCode.delete({
            where: { id: Number(id) },
        });

        return response.status(204).end();
    } catch (error: any) {
        if (error.code === "P2025") {
            return response
                .status(404)
                .json({ error: "Discount code not found" });
        }
        console.error("Error deleting discount code:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
