import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    reactStrictMode: true,
    images: {
        remotePatterns: [{ protocol: "https", hostname: "mesmerizeindia.com" }],
    },
};

export default nextConfig;

