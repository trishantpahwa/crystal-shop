import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorize from "@/config/auth.config";

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
        // Setup admin authorization later on => @trishantpahwa | 2025-12-26 13:31:18
        // const token = request.headers.authorization?.split(" ")[1] ?? "";
        // const userID = authorizeAdmin(token);

        // if (!userID) {
        //     return response.status(401).json({ error: "Unauthorized" });
        // }
        const { name, subtitle, price, tag, imageSrc, imageAlt, tone } =
            request.body;

        if (!name || !price || !tag || !imageSrc || !imageAlt || !tone) {
            return response
                .status(400)
                .json({ error: "Missing required fields" });
        }

        const newProduct = await prisma.product.create({
            data: {
                name,
                subtitle,
                price,
                tag,
                imageSrc,
                imageAlt,
                tone,
            },
        });

        return response.status(201).json({ product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}
