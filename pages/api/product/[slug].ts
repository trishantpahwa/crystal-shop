import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import authorizeAdmin from "@/config/admin-auth.config";

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
            include: {
                images: {
                    orderBy: { order: "asc" },
                },
            },
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
        const token = request.headers["x-api-key"]?.toString() ?? "";
        const userID = authorizeAdmin(token);

        if (!userID) {
            return response.status(401).json({ error: "Unauthorized" });
        }

        const productId = Number(request.query.slug);
        if (!productId) {
            return response.status(400).json({ error: "Invalid product id" });
        }

        const { name, subtitle, price, images, tone } = request.body ?? {};

        const data: any = {};
        if (typeof name === "string") data.name = name.trim();
        if (typeof subtitle === "string") data.subtitle = subtitle.trim();
        if (typeof price === "string") data.price = price.trim();
        if (typeof tone === "string") data.tone = tone.trim();

        if (images && Array.isArray(images)) {
            // Delete existing images and create new ones
            await prisma.productImage.deleteMany({
                where: { productId },
            });
            data.images = {
                create: images.map(
                    (img: { src: string; alt: string }, index: number) => ({
                        src: img.src,
                        alt: img.alt,
                        order: index,
                    })
                ),
            };
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data,
            include: {
                images: {
                    orderBy: { order: "asc" },
                },
            },
        });

        return response.status(200).json({ product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        return response.status(500).json({ error: "Internal Server Error" });
    }
}

async function DELETE(request: NextApiRequest, response: NextApiResponse) {
    try {
        const token = request.headers["x-api-key"]?.toString() ?? "";
        const userID = authorizeAdmin(token);

        if (!userID) {
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
