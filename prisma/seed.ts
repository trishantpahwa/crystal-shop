import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { put } from "@vercel/blob";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const stockImagesDir = path.join(process.cwd(), "stock-images");

    if (!fs.existsSync(stockImagesDir)) {
        console.log("No stock-images directory found.");
        return;
    }

    const items = fs.readdirSync(stockImagesDir);

    for (const item of items) {
        const itemPath = path.join(stockImagesDir, item);
        // Skip .DS_Store and other non-directories
        if (!fs.statSync(itemPath).isDirectory()) continue;

        // Look for json file with same name as folder
        const jsonPath = path.join(itemPath, `${item}.json`);
        if (fs.existsSync(jsonPath)) {
            console.log(`Processing ${item}...`);
            const productData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

            // Handle images
            const processedImages = [];
            if (Array.isArray(productData.images)) {
                for (const imagePath of productData.images) {
                    const absoluteImagePath = path.resolve(itemPath, imagePath);
                    console.log(`Looking for image at: ${absoluteImagePath}`);

                    if (fs.existsSync(absoluteImagePath)) {
                        const imageName = path.basename(absoluteImagePath);
                        const pathname = `products/${item}/${imageName}`;

                        console.log(`Uploading ${pathname} to Vercel Blob...`);
                        try {
                            const fileBuffer =
                                fs.readFileSync(absoluteImagePath);
                            const blob = await put(pathname, fileBuffer, {
                                access: "public",
                            });
                            console.log(`Uploaded to ${blob.url}`);

                            processedImages.push({
                                src: blob.url,
                                alt: productData.name || item,
                            });
                        } catch (err) {
                            console.error(`Error uploading file: ${err}`);
                        }
                    } else {
                        console.warn(`Image not found: ${absoluteImagePath}`);
                    }
                }
            }

            // Determine tone
            // Valid tones: "amethyst" | "rose" | "aqua" | "amber"
            let tone = "aqua";
            const lowerName = (productData.name || "").toLowerCase();
            if (lowerName.includes("amethyst")) tone = "amethyst";
            else if (lowerName.includes("rose")) tone = "rose";
            else if (lowerName.includes("amber")) tone = "amber";
            else if (lowerName.includes("aqua") || lowerName.includes("blue"))
                tone = "aqua";

            // Check if product already exists
            const existing = await prisma.product.findFirst({
                where: { name: productData.name },
            });

            if (existing) {
                console.log(`Updating existing product: ${productData.name}`);
                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        subtitle: productData.subtitle || "",
                        price: productData.price || "0",
                        tone: tone,
                        images: processedImages,
                    },
                });
            } else {
                console.log(`Creating product: ${productData.name}`);
                await prisma.product.create({
                    data: {
                        name: productData.name,
                        subtitle: productData.subtitle || "",
                        price: productData.price || "0",
                        tone: tone,
                        images: processedImages,
                    },
                });
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

