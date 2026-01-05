import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorizeAdmin from "@/config/admin-auth.config";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "PUT":
            return PUT(request, response);
        default:
            response.setHeader("Allow", ["PUT"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function PUT(request: NextApiRequest, response: NextApiResponse) {
    try {
        const token = request.headers["x-api-key"]?.toString() ?? "";
        const userID = authorizeAdmin(token);

        if (!userID) {
            return response.status(401).json({ error: "Unauthorized" });
        }
        const { name, subtitle, price, images, tone } = request.body;

        if (
            !name ||
            !price ||
            !images ||
            !Array.isArray(images) ||
            images.length === 0 ||
            !tone
        ) {
            return response
                .status(400)
                .json({ error: "Missing required fields" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                subtitle,
                price,
                tone,
                images,
            },
        });

        return response.status(201).json({ product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}
