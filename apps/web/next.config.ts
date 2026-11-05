
import type { NextConfig } from "next";

const apiBackend = (
  process.env.API_INTERNAL_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,

  async rewrites() {
    return [
      {
        source: "/api/v1/:path*/",
        destination: `${apiBackend}/api/v1/:path*/`,
      },
      {
        source: "/api/v1/:path*",
        destination: `${apiBackend}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
