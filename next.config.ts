import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vehicle-pictures-prod.orange.sixt.com',
      },
      {
        protocol: 'https',
        hostname: 'www.sixt.com',
      },
    ],
  },
};

export default nextConfig;
