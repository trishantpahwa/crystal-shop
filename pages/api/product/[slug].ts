import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import { verifyAdminToken } from "@/config/admin-auth.config";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "GET":
            return GET(request, response);
        case "PATCH":
            return PATCH(request, response);
        case "DELETE":
            return DELETE(request, response);
        default:
            response.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    try {
        const productId = Number(request.query.slug);
        if (!productId) {
            return response.status(400).json({ error: "Invalid product id" });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return response.status(404).json({ error: "Product not found" });
        }

        return response.status(200).json({ product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}

async function PATCH(request: NextApiRequest, response: NextApiResponse) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.substring(7);
        if (!verifyAdminToken(token)) {
            return response.status(401).json({ error: "Unauthorized" });
        }

        const productId = Number(request.query.slug);
        if (!productId) {
            return response.status(400).json({ error: "Invalid product id" });
        }

        const { name, subtitle, price, images, tone, tag, category } =
            request.body ?? {};

        const data: Record<string, unknown> = {};
        if (typeof name === "string") data.name = name.trim();
        if (typeof subtitle === "string") data.subtitle = subtitle.trim();
        if (typeof price === "string") data.price = price.trim();
        if (typeof tone === "string") data.tone = tone.trim();

        if (images && Array.isArray(images)) {
            data.images = images;
        }

        if (typeof tag === "string") data.tag = tag.trim();

        if (typeof category === "string" && category.trim()) {
            const cat = category.trim().toUpperCase();
            const allowed = ["RINGS", "NECKLACES", "EARRINGS", "BRACELETS"];
            if (allowed.includes(cat)) data.category = cat;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data,
        });

        return response.status(200).json({ product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}

async function DELETE(request: NextApiRequest, response: NextApiResponse) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return response.status(401).json({ error: "Unauthorized" });
        }
        const token = authHeader.substring(7);
        if (!verifyAdminToken(token)) {
            return response.status(401).json({ error: "Unauthorized" });
        }

        const { slug } = request.query;

        const deletedProduct = await prisma.product.delete({
            where: { id: Number(slug) },
        });

        return response.status(200).json({ product: deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}
