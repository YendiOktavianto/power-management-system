import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      { source: "/t/:org", destination: "/" },
      { source: "/t/:org/admin", destination: "/admin" },
      { source: "/t/:org/admin/:path*", destination: "/admin/:path*" },
      { source: "/t/:org/dashboard", destination: "/dashboard" },
      { source: "/t/:org/power-monitoring/:path*", destination: "/power-monitoring/:path*" },
      { source: "/t/:org/site-monitoring/:path*", destination: "/site-monitoring/:path*" },
      { source: "/t/:org/user-info/:path*", destination: "/user-info/:path*" },
      { source: "/t/:org/general-info/:path*", destination: "/general-info/:path*" },
      { source: "/t/:org/report/:path*", destination: "/report/:path*" },
      { source: "/t/:org/login", destination: "/login" },
      { source: "/t/:org/register", destination: "/register" },
      { source: "/t/:org/:path*", destination: "/:path*" },
    ];
  },
};
export default nextConfig;
