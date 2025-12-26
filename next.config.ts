import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    reactCompiler: true,
    reactStrictMode: true,
    images: {
        remotePatterns: [],
    },
};

export default nextConfig;

