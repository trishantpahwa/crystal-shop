// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { sign } from "jsonwebtoken";
import { exit } from "process";
import prisma from "@/config/prisma.config";

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT_SECRET and REFRESH_TOKEN_SECRET must be set");
    exit(1);
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
                /\\n/g,
                "\n"
            ),
        }),
    });
}

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    switch (request.method) {
        case "PUT":
            return await PUT(request, response);
        default:
            response.setHeader("Allow", ["PUT"]);
            return response
                .status(405)
                .end(`Method ${request.method} Not Allowed`);
    }
}

async function PUT(request: NextApiRequest, response: NextApiResponse) {
    const { token } = request.body;
    const user = await admin.auth().verifyIdToken(token);
    if (!user) {
        return response.status(401).json({ error: "Unauthorized" });
    }
    const savedUser = await prisma.user.upsert({
        where: { email: user.email! },
        update: {
            updatedAt: new Date(),
        },
        create: {
            email: user.email!,
            name: user.name || null,
            phoneNumber: user.phone_number || null,
        },
    });

    const jwt = await sign(
        {
            id: savedUser.id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
    );
    const refreshToken = await sign(
        { id: savedUser.id },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );

    return response.status(200).json({ token: jwt, refreshToken });
}
