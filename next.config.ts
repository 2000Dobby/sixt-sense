import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vehicle-pictures-prod.orange.sixt.com',
      },
    ],
  },
};

export default nextConfig;
