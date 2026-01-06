import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorizeAdmin from "@/config/admin-auth.config";
import { ProductCreateInput } from "@/generated/prisma/models";
import { ProductCategory } from "@/generated/prisma/enums";

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
      
        const { name, subtitle, price, images, tone, category } = request.body;

        if (
            !name ||
            !subtitle ||
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

        const data: ProductCreateInput = {
            name,
            subtitle,
            price,
            tone,
            images,
        };

        if (typeof category === "string" && category.trim()) {
            const cat = category.trim().toUpperCase();
            const allowed = ["RINGS", "NECKLACES", "EARRINGS", "BRACELETS"];
            if (allowed.includes(cat)) data.category = cat as ProductCategory;
        }

        const newProduct = await prisma.product.create({ data });

        return response.status(201).json({ product: newProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}
