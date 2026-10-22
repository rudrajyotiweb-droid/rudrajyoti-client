import type { NextConfig } from "next";
import { API_URL as API } from "./src/config";

const nextConfig: NextConfig = {
  // Server rendering with ISR: pages are cached and refreshed from the API every 30–120 s,
  // so new pujas / products / prices from the admin appear without a rebuild.
  trailingSlash: true,
  devIndicators: false,
  images: {
    // images are already WebP and served from MongoDB (GridFS) via /media
    unoptimized: true,
  },
  // Images and videos stored in the database are served by the API at /media/*.
  // Proxying keeps image URLs same-origin (no CORS, works in <Image> and the service worker).
  async rewrites() {
    return [{ source: "/media/:path*", destination: `${API}/media/:path*` }];
  },
  async headers() {
    return [
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Service-Worker-Allowed", value: "/" }] },
      { source: "/:path*", headers: [{ key: "X-Content-Type-Options", value: "nosniff" }, { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }] },
    ];
  },
};

export default nextConfig;
