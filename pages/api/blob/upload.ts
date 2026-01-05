import type { NextApiRequest, NextApiResponse } from "next";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== "POST") {
        response.setHeader("Allow", ["POST"]);
        return response.status(405).end(`Method ${request.method} Not Allowed`);
    }

    try {
        const body = (await new Promise<string>((resolve, reject) => {
            let data = "";
            request.on("data", (chunk) => (data += chunk));
            request.on("end", () => resolve(data));
            request.on("error", reject);
        })) as unknown as HandleUploadBody;

        const jsonBody = body ? JSON.parse(String(body)) : {};

        const jsonResponse = await handleUpload({
            request: request as any,
            body: jsonBody,
            onBeforeGenerateToken: async (
                pathname,
                clientPayload,
                multipart
            ) => {
                return {
                    tokenPayload: clientPayload,
                    allowedContentTypes: [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                    ],
                    maximumSizeInBytes: 5 * 1024 * 1024, // 5MB limit
                };
            },
            onUploadCompleted: async (payload) => {
                // Optional: Handle successful upload completion
                console.log("Upload completed:", payload);
            },
        });

        return response.status(200).json(jsonResponse);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Upload failed";
        console.error("Upload error:", error);
        return response.status(400).json({ error: message });
    }
}
