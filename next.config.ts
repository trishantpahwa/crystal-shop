import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fsf9umggvnxrvhxt.public.blob.vercel-storage.com",
            },
        ],
    },
};

export default nextConfig;

