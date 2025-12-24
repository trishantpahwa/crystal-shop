// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { PrismaClient } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { exit } from "process";

const prisma = new PrismaClient();

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

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("JWT_SECRET and REFRESH_TOKEN_SECRET must be set");
    exit(1);
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
    // Here, you would verify the token with Firebase Admin SDK
    // and fetch or create the user in your database.
    const user = await admin.auth().verifyIdToken(token);
    // Fetch or create the user in your database using Prisma
    const userRecord = await prisma.user.upsert({
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
            id: userRecord.id,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
    );
    const refreshToken = await sign(
        { id: userRecord.id },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
    );

    return response.status(200).json({ token: jwt, refreshToken });
}
