import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      { source: "/reflection", destination: "/guidance/review", permanent: true },
      { source: "/profile", destination: "/guidance/review", permanent: true },
      { source: "/my-direction", destination: "/guidance/possibilities", permanent: true },
      { source: "/my-journey", destination: "/guidance", permanent: true },
      { source: "/my-journey/direction", destination: "/guidance/possibilities", permanent: true },
      { source: "/my-journey/direction/:slug/confirm", destination: "/guidance/direction/:slug", permanent: true },
      { source: "/my-journey/direction/:slug/routes/:pathwaySlug", destination: "/guidance/direction/:slug/routes/:pathwaySlug", permanent: true },
      { source: "/my-journey/direction/:slug/routes", destination: "/guidance/direction/:slug/routes", permanent: true },
      { source: "/my-journey/direction/:slug", destination: "/guidance/direction/:slug", permanent: true },
      { source: "/my-journey/direction/:slug/:path*", destination: "/guidance/direction/:slug", permanent: true },
      { source: "/my-journey/courses/compare", destination: "/guidance/compare", permanent: true },
      { source: "/my-journey/courses", destination: "/guidance/possibilities", permanent: true },
      { source: "/my-journey/institutions", destination: "/guidance/possibilities", permanent: true },
      { source: "/my-journey/routes", destination: "/guidance/possibilities", permanent: true },
      { source: "/my-journey/plan", destination: "/guidance/action-plan", permanent: true },
      { source: "/my-journey/practical", destination: "/guidance/action-plan", permanent: true },
      { source: "/my-journey/:path*", destination: "/guidance", permanent: true },
      { source: "/dashboard", destination: "/guidance", permanent: true },
      { source: "/action-plan", destination: "/guidance/action-plan", permanent: true },
      { source: "/saved", destination: "/guidance/saved", permanent: true },
    ];
  },
};

export default nextConfig;
