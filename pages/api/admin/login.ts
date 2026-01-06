import type { NextApiRequest, NextApiResponse } from "next";
import { generateAdminToken } from "@/config/admin-auth.config";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { username, password } = req.body;

    if (
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = generateAdminToken(username);
        return res.status(200).json({ token });
    } else {
        return res.status(401).json({ error: "Invalid credentials" });
    }
}
