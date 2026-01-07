import type { NextApiRequest, NextApiResponse } from "next";
import { sign } from "jsonwebtoken";
import prisma from "@/config/prisma.config";

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "GET":
            return await GET(request, response);
        default:
            response.setHeader("Allow", ["GET"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function GET(request: NextApiRequest, response: NextApiResponse) {
    const mockUserSecret = request.headers["x-mock-user-secret"];
    if (mockUserSecret !== process.env.MOCK_USER_SECRET) {
        return response.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findFirst({});
    if (!user) {
        return response.status(404).json({ error: "No users found" });
    }
    const jwt = await sign(
        {
            id: user.id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
    );
    return response.status(200).json({ token: jwt });
}
