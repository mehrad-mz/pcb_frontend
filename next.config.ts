import type { NextConfig } from "next";

const djangoOrigin =
  process.env.DJANGO_API_ORIGIN || "http://localhost:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${djangoOrigin}/api/:path*` },
      { source: "/media/:path*", destination: `${djangoOrigin}/media/:path*` },
    ];
  },
};

export default nextConfig;
