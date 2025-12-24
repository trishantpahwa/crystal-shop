// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

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
    const { token } = request.body;
    // Here, you would verify the token with Firebase Admin SDK
    // and fetch or create the user in your database.
    const user = await admin.auth().verifyIdToken(token);
    console.log(user);
    return response.status(200).json({ name: "John Doe" });
}
