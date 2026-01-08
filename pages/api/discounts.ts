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
        case "POST":
            return POST(request, response);
        default:
            response.setHeader("Allow", ["POST"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function POST(request: NextApiRequest, response: NextApiResponse) {
    try {
        const { code, cartTotal } = request.body;

        if (!code || typeof code !== "string") {
            return response
                .status(400)
                .json({ error: "Discount code is required" });
        }

        const discountCode = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!discountCode) {
            return response
                .status(404)
                .json({ error: "Invalid discount code" });
        }

        if (!discountCode.isActive) {
            return response
                .status(400)
                .json({ error: "Discount code is inactive" });
        }

        if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
            return response
                .status(400)
                .json({ error: "Discount code has expired" });
        }

        if (
            discountCode.usageLimit &&
            discountCode.usedCount >= discountCode.usageLimit
        ) {
            return response
                .status(400)
                .json({ error: "Discount code usage limit exceeded" });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discountCode.discountType === "PERCENTAGE") {
            discountAmount = (cartTotal * discountCode.discountValue) / 100;
        } else {
            discountAmount = Math.min(discountCode.discountValue, cartTotal);
        }

        return response.status(200).json({
            code: discountCode.code,
            discountType: discountCode.discountType,
            discountValue: discountCode.discountValue,
            discountAmount: discountAmount.toFixed(2),
            description: discountCode.description,
        });
    } catch (error) {
        console.error("Error validating discount code:", error);
        return response.status(500).json({ error: "Internal server error" });
    }
}
