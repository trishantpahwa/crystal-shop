import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/config/prisma.config";
import type { Prisma } from "@prisma/client";

type SortBy = "createdAt" | "updatedAt" | "name" | "price" | "tone" | "tag";
const SORT_FIELDS: ReadonlyArray<SortBy> = [
    "createdAt",
    "updatedAt",
    "name",
    "price",
    "tone",
    "tag",
];

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "GET":
            return GET(request, response);
        default:
            response.setHeader("Allow", ["GET"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    const {
        tag,
        tone,
        q,
        sortBy = "createdAt",
        order = "desc",
        skip = "0",
        take = "24",
    } = request.query;

    const where: any = {};

    if (typeof tag === "string" && tag.trim()) where.tag = tag.trim();
    if (typeof tone === "string" && tone.trim()) where.tone = tone.trim();

    if (typeof q === "string" && q.trim()) {
        where.OR = [
            { name: { contains: q.trim(), mode: "insensitive" } },
            { subtitle: { contains: q.trim(), mode: "insensitive" } },
        ];
    }

    const sortField: SortBy =
        typeof sortBy === "string" &&
        (SORT_FIELDS as readonly string[]).includes(sortBy)
            ? (sortBy as SortBy)
            : "createdAt";

    const sortOrder: Prisma.SortOrder = order === "asc" ? "asc" : "desc";

    const products = await prisma.product.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: Math.max(0, Number.parseInt(String(skip), 10) || 0),
        take: Math.min(
            100,
            Math.max(1, Number.parseInt(String(take), 10) || 24)
        ),
    });

    return response.status(200).json({ products });
}
