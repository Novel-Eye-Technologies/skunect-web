import type { NextConfig } from "next";

const isExport = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isExport && { output: "export" }),
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  reactCompiler: false,
};

export default nextConfig;
