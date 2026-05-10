import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/api/:path*",
          destination: "https://rakaascode.site/api/:path*",
        },
      ];
    }

    return [];
  },
};

export default nextConfig;
